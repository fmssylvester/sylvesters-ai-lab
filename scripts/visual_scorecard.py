#!/usr/bin/env python3
"""
Visual Scorecard — compares reference videos against ours using frame-level Gemini analysis.

Workflow:
  1. Extract key frames from reference video (1 every N seconds)
  2. Analyze each frame for: color palette, contrast, text density, empty space, motion cues
  3. Aggregate into a "visual profile" JSON scorecard
  4. Do the same for our video
  5. Output gap report with specific metrics

Usage:
  python3 scripts/visual_scorecard.py --reference <ref_video> --ours <our_video> [--interval 3] [--output visual_scorecard.json]
  python3 scripts/visual_scorecard.py --reference <ref_video> --interval 3  # reference-only profile
"""

import subprocess
import tempfile
import json
import sys
import os
import glob
import time
from pathlib import Path

# ── Gemini config ──
MODELS = ["gemini-2.5-flash-lite", "gemini-2.0-flash", "gemini-2.5-flash", "gemini-2.5-pro"]

FRAME_ANALYSIS_PROMPT = """Analyze this motion graphics frame. List each attribute on its own line as "key: value". Attributes:
colors (3 hex codes), brightness (0-100), contrast (low/medium/high), text_area_percent (0-100), empty_space_percent (0-100), text_position (top/center/bottom), text_size (small/medium/large/huge), font_style (sans/serif/mono), glow (yes/no), gradient (yes/no), complexity (1-10), professional (1-10), distinctiveness (1-10), readability (1-10), mood (energetic/calm/technical/dramatic/playful/elegant)"""

AGGREGATION_PROMPT = """You are analyzing {frame_count} key frames from a motion graphics video (duration: {duration}s).

Here are the per-frame analysis results:
{frame_analyses}

Aggregate these into a SINGLE JSON profile. For numeric fields, use the average. For "has_*" fields, use the percentage of frames where true. For string fields, use the most common value.

Return a JSON object with these keys:
{
  "video_name": "{video_name}",
  "duration_seconds": {duration},
  "frames_analyzed": {frame_count},
  "color_profile": {
    "dominant_colors": ["most common colors across frames"],
    "avg_background_brightness": 0-100,
    "avg_contrast_ratio": "low" | "medium" | "high"
  },
  "text_profile": {
    "avg_text_area_percent": 0-100,
    "avg_empty_space_percent": 0-100,
    "typical_text_position": "top" | "center" | "bottom" | "distributed",
    "typical_text_size": "small" | "medium" | "large" | "huge",
    "typical_font_style": "sans-serif" | "serif" | "mono" | "mixed",
    "avg_text_readability": 1-10
  },
  "effects_profile": {
    "has_motion_blur_percent": 0-100,
    "has_depth_of_field_percent": 0-100,
    "has_glow_effects_percent": 0-100,
    "has_grid_pattern_percent": 0-100,
    "has_gradient_background_percent": 0-100,
    "has_noise_texture_percent": 0-100
  },
  "quality_profile": {
    "avg_visual_complexity": 1-10,
    "avg_professional_feel": 1-10,
    "avg_distinctiveness": 1-10,
    "avg_text_readability": 1-10,
    "avg_motion_energy": "low" | "medium" | "high",
    "typical_composition_balance": "left-heavy" | "right-heavy" | "centered" | "balanced",
    "avg_empty_space_ratio": 0-100,
    "avg_elements_count": 1-20,
    "typical_mood": "energetic" | "calm" | "technical" | "dramatic" | "playful" | "elegant"
  }
}

Return ONLY the JSON object. No explanation, no markdown."""

GAP_REPORT_PROMPT = """Compare these two visual profiles and generate a gap report.

REFERENCE VIDEO (the standard):
{reference_profile}

OUR VIDEO (to improve):
{our_profile}

Generate a JSON gap report with:
{
  "summary": "one sentence overview",
  "overall_gap_score": 1-10,
  "gaps": [
    {
      "attribute": "attribute name",
      "reference_value": value,
      "our_value": value,
      "gap": "what's different",
      "priority": "critical" | "important" | "nice-to-have",
      "fix_suggestion": "specific actionable fix"
    }
  ],
  "strengths": [
    {
      "attribute": "attribute name",
      "our_value": value,
      "reference_value": value,
      "note": "where we match or exceed"
    }
  ],
  "action_plan": [
    {
      "step": 1,
      "action": "specific thing to do",
      "files_to_modify": ["file paths"],
      "expected_impact": "what this fixes"
    }
  ]
}

Return ONLY the JSON object. No explanation, no markdown."""


def extract_frames(video_path, interval_seconds=3):
    """Extract 1 frame every N seconds from a video. Adapts for short videos."""
    tmpdir = tempfile.mkdtemp(prefix="scorecard_")

    # Get video duration
    probe_cmd = ["ffprobe", "-v", "quiet", "-print_format", "json", "-show_format", video_path]
    result = subprocess.run(probe_cmd, capture_output=True, text=True)
    try:
        duration = float(json.loads(result.stdout)["format"]["duration"])
    except:
        duration = 10.0

    # Adapt interval for short videos (ensure at least 1 frame)
    if duration < interval_seconds:
        interval_seconds = max(1, duration / 2)

    # Extract frames
    cmd = [
        "ffmpeg", "-y", "-i", video_path,
        "-vf", f"fps=1/{interval_seconds}",
        "-q:v", "2",
        os.path.join(tmpdir, "frame_%03d.jpg")
    ]
    subprocess.run(cmd, capture_output=True)

    frames = sorted(glob.glob(os.path.join(tmpdir, "frame_*.jpg")))
    return frames, duration, tmpdir


def analyze_frame(frame_path, max_retries=3):
    """Analyze a single frame using vision.py backends."""
    vision_script = os.path.join(os.path.dirname(__file__), "vision.py")
    for attempt in range(max_retries):
        try:
            result = subprocess.run(
                ["python3", vision_script, FRAME_ANALYSIS_PROMPT, frame_path],
                capture_output=True, text=True, timeout=60,
                env={**os.environ, "VISION_BACKEND": "nvidia"}
            )
            text = result.stdout.strip()
            if text and not text.startswith("All vision"):
                # Strip [backend] prefix
                if text.startswith("["):
                    text = text.split("]", 1)[1].strip()
                # Parse key:value format into dict
                parsed = {}
                for line in text.split("\n"):
                    line = line.strip().lstrip("- *")
                    if ":" in line:
                        k, v = line.split(":", 1)
                        parsed[k.strip()] = v.strip()
                if parsed:
                    return parsed
        except Exception as e:
            time.sleep(2)
    return None


def _call_openrouter(prompt, max_retries=3):
    """Call NVIDIA API for text generation."""
    import urllib.request
    key = os.environ.get("NVIDIA_API_KEY")
    if not key:
        return None
    url = "https://integrate.api.nvidia.com/v1/chat/completions"
    headers = {"Content-Type": "application/json", "Authorization": f"Bearer {key}"}
    model = "meta/llama-3.2-11b-vision-instruct"
    
    # Force JSON output by wrapping prompt
    json_prompt = f"""{prompt}

IMPORTANT: Output ONLY a valid JSON object. No explanation, no code, no markdown. Start with {{ and end with }}."""
    
    payload = {
        "model": model,
        "messages": [{"role": "user", "content": json_prompt}],
        "max_tokens": 4096,
        "temperature": 0.1,
    }
    req = urllib.request.Request(url, data=json.dumps(payload).encode(), headers=headers)
    for attempt in range(max_retries):
        try:
            with urllib.request.urlopen(req, timeout=60) as resp:
                data = json.loads(resp.read())
            text = data["choices"][0]["message"]["content"]
            # Try to extract JSON from response
            if "{" in text:
                start = text.index("{")
                end = text.rindex("}") + 1
                return text[start:end]
            return text
        except Exception as e:
            time.sleep(3 * (attempt + 1))
    return None


def aggregate_frame_analyses(frame_analyses, video_name, duration):
    """Aggregate per-frame analyses into a single profile using OpenRouter."""
    # Chunk if too many frames (free tier token limits)
    chunk_size = 10
    chunks = [frame_analyses[i:i+chunk_size] for i in range(0, len(frame_analyses), chunk_size)]
    
    partial_profiles = []
    for ci, chunk in enumerate(chunks):
        prompt = f"""Analyze {len(chunk)} motion graphics frames from "{video_name}" and return ONE averaged JSON profile.

{json.dumps(chunk, indent=2)}

Return JSON with: dominant_colors (top 3), avg_background_brightness, avg_contrast_ratio, avg_text_area_percent, avg_empty_space_percent, typical_text_position, typical_text_size, typical_font_style, avg_text_readability (1-10), has_motion_blur_percent, has_depth_of_field_percent, has_glow_effects_percent, has_gradient_background_percent, has_noise_texture_percent, avg_visual_complexity (1-10), avg_professional_feel (1-10), avg_distinctiveness (1-10), avg_motion_energy, typical_composition_balance, typical_mood.
Return ONLY raw JSON."""
        text = _call_openrouter(prompt)
        if text:
            try:
                if text.startswith("```"):
                    text = text.split("\n", 1)[1]
                    text = text.rsplit("```", 1)[0]
                partial_profiles.append(json.loads(text))
            except:
                pass
        time.sleep(2)
    
    if not partial_profiles:
        return None
    
    # Final merge across chunks
    prompt = f"""Merge these {len(partial_profiles)} partial frame-analysis profiles into ONE final profile for "{video_name}" ({duration:.1f}s, {len(frame_analyses)} frames).

{json.dumps(partial_profiles, indent=2)}

Average all numeric fields, use most common for strings, merge color lists. Return the same JSON structure with: video_name, duration_seconds, frames_analyzed, color_profile, text_profile, effects_profile, quality_profile.
Return ONLY raw JSON."""
    text = _call_openrouter(prompt)
    if text:
        try:
            if text.startswith("```"):
                text = text.split("\n", 1)[1]
                text = text.rsplit("```", 1)[0]
            return json.loads(text)
        except:
            pass
    return None


def generate_gap_report(reference_profile, our_profile):
    """Generate gap report comparing reference vs our video."""
    prompt = f"""Compare these two visual profiles and generate a gap report.

REFERENCE VIDEO:
{json.dumps(reference_profile, indent=2)}

OUR VIDEO:
{json.dumps(our_profile, indent=2)}

Generate a JSON gap report with:
- summary: one sentence overview
- overall_gap_score: 1-10
- gaps: list of objects with attribute, reference_value, our_value, gap, priority (critical/important/nice-to-have), fix_suggestion
- strengths: list of objects with attribute, our_value, reference_value, note
- action_plan: list of objects with step number, action, files_to_modify, expected_impact

Return ONLY raw JSON. No explanation, no markdown."""
    text = _call_openrouter(prompt)
    if text:
        if text.startswith("```"):
            text = text.split("\n", 1)[1]
            text = text.rsplit("```", 1)[0]
        try:
            return json.loads(text)
        except:
            pass
    return None


def run_pipeline(video_path, video_name, interval=3):
    """Full pipeline: extract → analyze → aggregate → profile."""
    print(f"\n{'='*60}")
    print(f"PROCESSING: {video_name}")
    print(f"{'='*60}")

    # Step 1: Extract frames
    print(f"\n[1/3] Extracting frames (1 every {interval}s)...")
    frames, duration, tmpdir = extract_frames(video_path, interval)
    print(f"  Duration: {duration:.1f}s | Frames extracted: {len(frames)}")

    if not frames:
        print("  ERROR: No frames extracted")
        return None

    # Step 2: Analyze each frame via vision.py
    print(f"\n[2/3] Analyzing {len(frames)} frames...")

    frame_analyses = []
    for i, frame_path in enumerate(frames):
        print(f"  Frame {i+1}/{len(frames)}: {os.path.basename(frame_path)}...", end=" ", flush=True)
        analysis = analyze_frame(frame_path)
        if analysis:
            analysis["frame_index"] = i
            analysis["timestamp_seconds"] = round(i * interval, 1)
            frame_analyses.append(analysis)
            print("OK")
        else:
            print("FAILED")
        time.sleep(1)

    print(f"  Successfully analyzed: {len(frame_analyses)}/{len(frames)} frames")

    if not frame_analyses:
        print("  ERROR: No frames analyzed successfully")
        return None

    # Step 3: Aggregate into profile
    print(f"\n[3/3] Aggregating into visual profile...")
    profile = aggregate_frame_analyses(frame_analyses, video_name, duration)

    if not profile:
        print("  ERROR: Aggregation failed")
        return None

    # Add raw frame data
    profile["raw_frame_analyses"] = frame_analyses

    # Cleanup
    import shutil
    shutil.rmtree(tmpdir, ignore_errors=True)

    print(f"  Profile complete: {video_name}")
    return profile


def main():
    import argparse
    parser = argparse.ArgumentParser(description="Visual Scorecard — compare video aesthetics")
    parser.add_argument("--reference", required=True, help="Path to reference video")
    parser.add_argument("--ours", help="Path to our video (optional, for gap report)")
    parser.add_argument("--interval", type=int, default=3, help="Frame extraction interval in seconds (default: 3)")
    parser.add_argument("--output", default="visual_scorecard.json", help="Output JSON file")
    parser.add_argument("--ref-name", default="reference", help="Name for reference video")
    parser.add_argument("--our-name", default="ours", help="Name for our video")
    args = parser.parse_args()

    if not os.path.exists(args.reference):
        print(f"Error: Reference video not found: {args.reference}")
        sys.exit(1)

    if args.ours and not os.path.exists(args.ours):
        print(f"Error: Our video not found: {args.ours}")
        sys.exit(1)

    # Process reference video
    ref_profile = run_pipeline(args.reference, args.ref_name, args.interval)
    if not ref_profile:
        print("Failed to process reference video")
        sys.exit(1)

    result = {"reference": ref_profile}

    # Process our video and generate gap report if provided
    if args.ours:
        our_profile = run_pipeline(args.ours, args.our_name, args.interval)
        if our_profile:
            result["ours"] = our_profile

            print(f"\n{'='*60}")
            print("GENERATING GAP REPORT")
            print(f"{'='*60}")
            gap_report = generate_gap_report(ref_profile, our_profile)
            if gap_report:
                result["gap_report"] = gap_report
                print("  Gap report generated")
            else:
                print("  WARNING: Gap report generation failed")

    # Save scorecard
    output_path = args.output
    with open(output_path, "w") as f:
        json.dump(result, f, indent=2)

    print(f"\n{'='*60}")
    print(f"SCORECARD SAVED: {output_path}")
    print(f"{'='*60}")

    # Print summary
    if "gap_report" in result:
        report = result["gap_report"]
        print(f"\nOverall gap score: {report.get('overall_gap_score', 'N/A')}/10")
        print(f"Summary: {report.get('summary', 'N/A')}")
        print(f"\nTop gaps:")
        for gap in report.get("gaps", [])[:5]:
            print(f"  [{gap.get('priority', '?')}] {gap.get('attribute', '?')}: {gap.get('gap', '?')}")
        print(f"\nAction plan:")
        for step in report.get("action_plan", [])[:5]:
            print(f"  {step.get('step', '?')}. {step.get('action', '?')}")


if __name__ == "__main__":
    main()
