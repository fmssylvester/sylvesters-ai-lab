#!/usr/bin/env python3
"""
Design Pattern Extractor — analyzes motion graphics and outputs actionable design rules.

Unlike visual scoring (which gives useless numeric scores), this extracts:
- Exact color palettes and how they're used
- Typography hierarchy and sizing rules
- Scene timing and pacing patterns
- Transition vocabulary
- Composition templates
- Reusable guidelines you can apply directly

Usage:
  python3 scripts/pattern_extractor.py <video_path> [--name "fireship"] [--output patterns.json]
  python3 scripts/pattern_extractor.py <video_path> --compare <video2_path>
"""

import subprocess
import tempfile
import json
import sys
import os
import glob
import time
from pathlib import Path

VISION_SCRIPT = os.path.join(os.path.dirname(__file__), "vision.py")

# ── Scene-level analysis prompt (per frame) ──
SCENE_PROMPT = """Describe this motion graphics frame as a designer would. Be specific and factual:

TEXT:
- Exact words on screen
- Font treatment: color, approximate size (small/medium/large/huge relative to frame), weight (light/regular/bold/black)
- Position: top/center/bottom, centered/left/right aligned

BACKGROUND:
- Colors (hex codes if visible)
- Treatment: solid/gradient/image/pattern
- Gradient direction if applicable

COMPOSITION:
- How many distinct visual elements
- What draws the eye first
- Negative space: generous/moderate/minimal
- Visual hierarchy: what's dominant, what's secondary

COLORS:
- List every distinct color used (text, background, accents)
- Note which colors are dominant vs accent

Keep it to 6-8 lines max. No fluff."""

# ── Pattern extraction prompt (aggregates all scenes) ──
PATTERN_PROMPT = """You are a motion design analyst. You've been given frame-by-frame descriptions from a professional motion graphics video. Extract the DESIGN SYSTEM — the reusable patterns and rules.

Here are the frame descriptions:
{frames}

Extract these specific patterns as a JSON object:

{{
  "color_system": {{
    "background_palette": ["exact hex colors used for backgrounds"],
    "text_colors": ["exact colors used for text"],
    "accent_colors": ["exact colors used for accents/highlights"],
    "color_rule": "how colors are assigned (e.g. 'one accent per scene, white text on dark bg')"
  }},
  "typography_system": {{
    "font_style": "sans/serif/mono/mixed",
    "hero_text_size": "approximate px range or description",
    "hero_text_weight": "bold/black/etc",
    "secondary_text_size": "smaller text size description",
    "label_text_size": "smallest text size description",
    "text_positioning": "where text appears consistently",
    "word_count_per_screen": "how many words typically appear at once",
    "text_treatment_rule": "the specific rule for how text is handled"
  }},
  "timing_system": {{
    "avg_scene_duration_seconds": "number",
    "shortest_scene_seconds": "number",
    "longest_scene_seconds": "number",
    "pacing": "fast/moderate/deliberate — how quickly scenes change",
    "text_stay_time_rule": "how long text stays readable before changing"
  }},
  "composition_system": {{
    "layout_template": "the dominant layout pattern (e.g. 'single centered element', 'split screen', 'text over image')",
    "negative_space_rule": "how much breathing room",
    "visual_hierarchy": "what's always dominant",
    "elements_per_screen": "typical number of elements"
  }},
  "transition_system": {{
    "primary_transition": "most common transition type",
    "transition_vocabulary": ["list all transition types used"],
    "transition_pacing": "fast cuts / smooth blends / mixed"
  }},
  "visual_motifs": {{
    "recurring_elements": ["elements that appear across multiple scenes"],
    "signature_treatments": ["unique visual treatments that define the style"],
    "avoid_patterns": ["things this video deliberately avoids"]
  }},
  "actionable_rules": [
    "Rule 1: Specific, implementable instruction",
    "Rule 2: ...",
    "Rule 3: ..."
  ]
}}

Be SPECIFIC. "White text on dark background" not "good contrast". "Exactly 3-7 words per screen" not "concise text". "Hard cuts every 2-4 seconds" not "fast pacing".
Return ONLY the JSON object."""

# ── Comparison prompt ──
COMPARE_PROMPT = """Compare these two design systems and extract the DIFFERENCE — why one looks professional and the other doesn't.

VIDEO A (professional reference):
{profile_a}

VIDEO B (ours to improve):
{profile_b}

Return a JSON object:
{{
  "why_a_works": ["specific reasons with examples from the data"],
  "why_b_falls_short": ["specific gaps with exact numbers"],
  "copy_these_patterns": ["exact patterns to steal from A, with implementation details"],
  "fix_these_patterns": ["exact things to change in B, with before→after"],
  "priority_actions": [
    {{"action": "specific thing to do", "before": "what B currently does", "after": "what it should do", "impact": "why this matters"}}
  ]
}}

Return ONLY the JSON object."""


def detect_scenes(video_path):
    """Detect scene changes using ffmpeg scdet filter."""
    tmpdir = tempfile.mkdtemp(prefix="patterns_")

    # Get duration
    probe_cmd = ["ffprobe", "-v", "quiet", "-print_format", "json", "-show_format", video_path]
    result = subprocess.run(probe_cmd, capture_output=True, text=True)
    try:
        duration = float(json.loads(result.stdout)["format"]["duration"])
    except:
        duration = 10.0

    # Detect scene changes
    cmd = [
        "ffmpeg", "-i", video_path,
        "-vf", "scdet=threshold=0.3",
        "-f", "null", "-"
    ]
    result = subprocess.run(cmd, capture_output=True, text=True)

    # Parse scene change timestamps from stderr
    scene_times = [0.0]
    for line in result.stderr.split("\n"):
        if "scene:" in line.lower():
            try:
                # Extract timestamp from line like "[Parsed_scdet_0 @ 0x...] ts:12.345"
                parts = line.split("ts:")
                if len(parts) > 1:
                    ts = float(parts[1].split()[0])
                    scene_times.append(ts)
            except:
                pass

    # If no scene changes detected, extract at regular intervals
    if len(scene_times) <= 1:
        interval = min(3, duration / 5)
        scene_times = [i * interval for i in range(int(duration / interval) + 1)]

    # Ensure we don't exceed duration
    scene_times = [t for t in scene_times if t < duration]
    if not scene_times:
        scene_times = [0.0]

    return scene_times, duration, tmpdir


def extract_scene_frames(video_path, scene_times, tmpdir):
    """Extract one frame from each scene."""
    frames = []
    for i, ts in enumerate(scene_times):
        out_path = os.path.join(tmpdir, f"scene_{i:03d}.jpg")
        cmd = [
            "ffmpeg", "-y", "-ss", str(ts), "-i", video_path,
            "-vframes", "1", "-q:v", "2", out_path
        ]
        subprocess.run(cmd, capture_output=True)
        if os.path.exists(out_path):
            frames.append({"index": i, "timestamp": ts, "path": out_path})
    return frames


def analyze_scene(frame_path):
    """Analyze a single scene using vision.py."""
    for attempt in range(3):
        try:
            result = subprocess.run(
                ["python3", VISION_SCRIPT, SCENE_PROMPT, frame_path],
                capture_output=True, text=True, timeout=60,
                env={**os.environ, "VISION_BACKEND": "nvidia"}
            )
            text = result.stdout.strip()
            if text and not text.startswith("All vision"):
                if text.startswith("["):
                    text = text.split("]", 1)[1].strip()
                return text
        except:
            time.sleep(2)
    return None


def extract_patterns(frame_analyses, video_name):
    """Use LLM to extract design patterns from frame analyses."""
    key = os.environ.get("NVIDIA_API_KEY")
    if not key:
        return None

    # Build the frame descriptions
    frames_text = ""
    for fa in frame_analyses:
        frames_text += f"\n--- Scene at {fa['timestamp']:.1f}s ---\n{fa['analysis']}\n"

    prompt = PATTERN_PROMPT.format(frames=frames_text)

    # Call NVIDIA
    import urllib.request
    json_prompt = f"""{prompt}

IMPORTANT: Output ONLY a valid JSON object. Start with {{ and end with }}."""

    payload = {
        "model": "meta/llama-3.2-11b-vision-instruct",
        "messages": [{"role": "user", "content": json_prompt}],
        "max_tokens": 4096,
        "temperature": 0.1,
    }
    req = urllib.request.Request(
        "https://integrate.api.nvidia.com/v1/chat/completions",
        data=json.dumps(payload).encode(),
        headers={"Content-Type": "application/json", "Authorization": f"Bearer {key}"}
    )

    for attempt in range(3):
        try:
            with urllib.request.urlopen(req, timeout=120) as resp:
                data = json.loads(resp.read())
            text = data["choices"][0]["message"]["content"]
            # Extract JSON
            if "{" in text:
                start = text.index("{")
                end = text.rindex("}") + 1
                return json.loads(text[start:end])
            return None
        except Exception as e:
            time.sleep(5 * (attempt + 1))
    return None


def run_extraction(video_path, video_name):
    """Full extraction pipeline."""
    print(f"\n{'='*60}")
    print(f"EXTRACTING PATTERNS: {video_name}")
    print(f"{'='*60}")

    # Step 1: Detect scenes
    print("\n[1/4] Detecting scenes...")
    scene_times, duration, tmpdir = detect_scenes(video_path)
    print(f"  Duration: {duration:.1f}s | Scenes detected: {len(scene_times)}")

    # Step 2: Extract frames
    print("\n[2/4] Extracting scene frames...")
    frames = extract_scene_frames(video_path, scene_times, tmpdir)
    print(f"  Frames extracted: {len(frames)}")

    # Step 3: Analyze each scene
    print(f"\n[3/4] Analyzing {len(frames)} scenes...")
    frame_analyses = []
    for i, frame in enumerate(frames):
        print(f"  Scene {i+1}/{len(frames)} ({frame['timestamp']:.1f}s)...", end=" ", flush=True)
        analysis = analyze_scene(frame["path"])
        if analysis:
            frame_analyses.append({
                "index": frame["index"],
                "timestamp": frame["timestamp"],
                "analysis": analysis
            })
            print("OK")
        else:
            print("FAILED")
        time.sleep(1)

    print(f"  Successfully analyzed: {len(frame_analyses)}/{len(frames)}")

    if not frame_analyses:
        print("  ERROR: No scenes analyzed")
        return None

    # Step 4: Extract patterns
    print("\n[4/4] Extracting design patterns...")
    patterns = extract_patterns(frame_analyses, video_name)

    if patterns:
        patterns["video_name"] = video_name
        patterns["duration_seconds"] = duration
        patterns["scenes_analyzed"] = len(frame_analyses)
        patterns["raw_analyses"] = frame_analyses
        print("  Patterns extracted!")
    else:
        print("  ERROR: Pattern extraction failed")
        return None

    # Cleanup
    import shutil
    shutil.rmtree(tmpdir, ignore_errors=True)

    return patterns


def main():
    import argparse
    parser = argparse.ArgumentParser(description="Design Pattern Extractor")
    parser.add_argument("video", help="Path to video file")
    parser.add_argument("--name", default="video", help="Name for this video")
    parser.add_argument("--output", default="patterns.json", help="Output JSON file")
    parser.add_argument("--compare", help="Second video to compare against")
    parser.add_argument("--compare-name", default="ours", help="Name for second video")
    args = parser.parse_args()

    if not os.path.exists(args.video):
        print(f"Error: Video not found: {args.video}")
        sys.exit(1)

    # Extract patterns from main video
    patterns = run_extraction(args.video, args.name)
    if not patterns:
        sys.exit(1)

    result = {"reference": patterns}

    # Compare if second video provided
    if args.compare and os.path.exists(args.compare):
        patterns_b = run_extraction(args.compare, args.compare_name)
        if patterns_b:
            result["ours"] = patterns_b

            print(f"\n{'='*60}")
            print("COMPARING DESIGN SYSTEMS")
            print(f"{'='*60}")

            key = os.environ.get("NVIDIA_API_KEY")
            if key:
                import urllib.request
                prompt = COMPARE_PROMPT.format(
                    profile_a=json.dumps(patterns, indent=2),
                    profile_b=json.dumps(patterns_b, indent=2)
                )
                payload = {
                    "model": "meta/llama-3.2-11b-vision-instruct",
                    "messages": [{"role": "user", "content": f"{prompt}\n\nIMPORTANT: Output ONLY valid JSON. Start with {{ and end with }}."}],
                    "max_tokens": 4096,
                    "temperature": 0.1,
                }
                req = urllib.request.Request(
                    "https://integrate.api.nvidia.com/v1/chat/completions",
                    data=json.dumps(payload).encode(),
                    headers={"Content-Type": "application/json", "Authorization": f"Bearer {key}"}
                )
                try:
                    with urllib.request.urlopen(req, timeout=120) as resp:
                        data = json.loads(resp.read())
                    text = data["choices"][0]["message"]["content"]
                    if "{" in text:
                        start = text.index("{")
                        end = text.rindex("}") + 1
                        result["comparison"] = json.loads(text[start:end])
                        print("  Comparison complete!")
                except Exception as e:
                    print(f"  Comparison failed: {e}")

    # Save
    with open(args.output, "w") as f:
        json.dump(result, f, indent=2)

    print(f"\n{'='*60}")
    print(f"SAVED: {args.output}")
    print(f"{'='*60}")

    # Print summary
    if "reference" in patterns:
        rules = patterns.get("actionable_rules", [])
        if rules:
            print(f"\nActionable rules from {args.name}:")
            for i, rule in enumerate(rules, 1):
                print(f"  {i}. {rule}")


if __name__ == "__main__":
    main()
