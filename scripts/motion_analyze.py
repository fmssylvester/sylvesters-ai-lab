#!/usr/bin/env python3
"""
Multi-frame video analysis — extracts key frames and analyzes them together.
This gives temporal context that single-frame analysis misses.

Usage:
  python3 scripts/video_analyze.py <video_path> [--frames N] [--question "question"]
  python3 scripts/video_analyze.py --compare <video1> <video2> --reference <ref_video>
"""

import subprocess
import tempfile
import sys
import os
import glob
import json

VISION_SCRIPT = os.path.join(os.path.dirname(__file__), "vision.py")

# ── Motion Design Scoring Rubric ──
RUBRIC = """
MOTION DESIGN SCORING RUBRIC (rate each 1-10):

1. TIMING & PACING
   - Is the animation speed appropriate? (not too fast, not too slow)
   - Are there clear moments of rest/pause?
   - Does text stay readable long enough after settling? (minimum 0.5s)

2. EASING & FEEL
   - Does motion feel natural/physical? (not robotic/linear)
   - Are spring bounces intentional? (not random/accidental)
   - Does acceleration/deceleration feel smooth?

3. VISUAL HIERARCHY
   - Is one element clearly dominant?
   - Does the eye flow naturally through the composition?
   - Are supporting elements properly subordinated?

4. BACKGROUND & DEPTH
   - Does the background complement the text? (not compete)
   - Is there visual depth? (layers, scale differentiation, blur)
   - Are backgrounds purposeful? (not just "dark gradient")

5. TEXT AS HERO
   - Is text large enough to read on mobile?
   - Are there fewer words with more impact?
   - Is font weight/style appropriate for the message?

6. COHESION
   - Do all elements feel like they belong together?
   - Is the color palette consistent?
   - Does the overall piece feel complete/polished?

7. DISTINCTIVENESS
   - Does this look different from generic templates?
   - Is there a clear visual identity/brand feel?
   - Would you remember this after seeing it once?
"""

ANALYSIS_PROMPT = """Analyze these {frame_count} key frames from a motion graphics video.

{rubric}

For each criterion, give a score 1-10 and a brief explanation.

Then give an OVERALL score and the TOP 3 things that make this video stand out (or not).

IMPORTANT: Be honest. If something looks generic, say so. If something is excellent, explain why."""


def extract_key_frames(video_path, num_frames=8):
    """Extract evenly-spaced key frames from a video."""
    tmpdir = tempfile.mkdtemp(prefix="vmanalyze_")

    # Get video duration
    probe_cmd = [
        "ffprobe", "-v", "quiet", "-print_format", "json",
        "-show_format", video_path
    ]
    result = subprocess.run(probe_cmd, capture_output=True, text=True)
    try:
        duration = float(json.loads(result.stdout)["format"]["duration"])
    except:
        duration = 3.0

    # Extract frames at even intervals
    interval = duration / (num_frames + 1)
    for i in range(num_frames):
        timestamp = interval * (i + 1)
        out_path = os.path.join(tmpdir, f"frame_{i+1:02d}.jpg")
        cmd = [
            "ffmpeg", "-y", "-ss", str(timestamp), "-i", video_path,
            "-vframes", "1", "-q:v", "2", out_path
        ]
        subprocess.run(cmd, capture_output=True)

    return sorted(glob.glob(os.path.join(tmpdir, "*.jpg"))), duration


def analyze_frames(frame_paths, question, backend=None):
    """Analyze multiple frames together."""
    # Build multi-image command
    cmd = [
        "python3", VISION_SCRIPT, question
    ] + frame_paths

    env = os.environ.copy()
    if backend:
        env["VISION_BACKEND"] = backend

    result = subprocess.run(cmd, capture_output=True, text=True, env=env)
    return result.stdout.strip()


def analyze_video(video_path, question=None, frames=8, backend=None):
    """Full video analysis pipeline."""
    frame_paths, duration = extract_key_frames(video_path, frames)

    if not frame_paths:
        return "Failed to extract frames from video."

    prompt = question or ANALYSIS_PROMPT.format(
        frame_count=len(frame_paths),
        rubric=RUBRIC
    )

    analysis = analyze_frames(frame_paths, prompt, backend)

    # Cleanup
    for f in frame_paths:
        os.remove(f)
    os.rmdir(os.path.dirname(frame_paths[0]) if frame_paths else "")

    return f"Duration: {duration:.1f}s | Frames analyzed: {len(frame_paths)}\n\n{analysis}"


def compare_videos(video1, video2, reference=None, frames=6):
    """Compare two videos against each other (and optionally a reference)."""
    # Extract frames from all videos
    frames1, dur1 = extract_key_frames(video1, frames)
    frames2, dur2 = extract_key_frames(video2, frames)
    frames_ref = []
    dur_ref = 0
    if reference:
        frames_ref, dur_ref = extract_key_frames(reference, frames)

    prompt = f"""Compare these motion graphics videos.

VIDEO A ({dur1:.1f}s) — first {len(frames1)} frames
VIDEO B ({dur2:.1f}s) — next {len(frames2)} frames"""

    if frames_ref:
        prompt += f"\nREFERENCE ({dur_ref:.1f}s) — last {len(frames_ref)} frames"

    prompt += """

For each video, evaluate:
1. Which has better text readability?
2. Which has more professional feel?
3. Which has better background design?
4. Which has more interesting animation?
5. Which matches the reference better (if provided)?

Give a clear WINNER with reasoning. Be specific about what works and what doesn't."""

    all_frames = frames1 + frames2 + frames_ref
    result = analyze_frames(all_frames, prompt)

    # Cleanup
    for f in all_frames:
        os.remove(f)
    for d in [os.path.dirname(f) for f in all_frames if f]:
        try:
            os.rmdir(d)
        except:
            pass

    return result


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(ANALYSIS_PROMPT.format(frame_count="N", rubric=RUBRIC))
        sys.exit(0)

    if sys.argv[1] == "--compare" and len(sys.argv) >= 4:
        ref = None
        if "--reference" in sys.argv:
            ref_idx = sys.argv.index("--reference") + 1
            ref = sys.argv[ref_idx] if ref_idx < len(sys.argv) else None
        print(compare_videos(sys.argv[2], sys.argv[3], ref))
    else:
        video_path = sys.argv[1]
        question = None
        frames = 8
        backend = None
        if "--question" in sys.argv:
            qi = sys.argv.index("--question") + 1
            question = sys.argv[qi] if qi < len(sys.argv) else None
        if "--frames" in sys.argv:
            fi = sys.argv.index("--frames") + 1
            frames = int(sys.argv[fi]) if fi < len(sys.argv) else 8
        if "--backend" in sys.argv:
            bi = sys.argv.index("--backend") + 1
            backend = sys.argv[bi] if bi < len(sys.argv) else None
        print(analyze_video(video_path, question, frames, backend))
