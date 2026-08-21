#!/usr/bin/env python3
"""quick_3d_check.py — one-off: rate the S7 3D probe frames like an art director."""
import json, subprocess, sys
from pathlib import Path
sys.path.insert(0, "/data/data/com.termux/files/home/ai-lab-internal")
import visual_qa as vq

SRC = Path("/data/data/com.termux/files/usr/tmp/gh-art/avatar-90s.mp4")
OUT = Path("/tmp/opencode/s7qa"); OUT.mkdir(exist_ok=True)

for f in OUT.glob("*.jpg"):
    f.unlink()
subprocess.run(["ffmpeg", "-v", "error", "-i", str(SRC),
                "-vf", "select='eq(n,20)+eq(n,120)+eq(n,240)+eq(n,400)'",
                "-vsync", "vfr", "-q:v", "3", str(OUT / "s7_%02d.jpg")], check=True)
frames = sorted(OUT.glob("*.jpg"))
vq.log(f"qa frames: {[f.name for f in frames]}")

PROMPT = """These are 4 frames (in time order) of a 3D SaaS explainer scene: the
'n8n pipeline' — five rounded glass panels on a brass rail over a dark navy
grid floor, with a glowing packet traveling the line, Playfair Display headline
overlay 'the build: 4 stages', and Inter captions.

As a senior 3D motion-graphics art director, review the RENDERED frames:
1. Is this premium 'Linear/Stripe-style' 3D SaaS quality? What's missing?
2. Materials/lighting/reflections: do the glass panels look premium or flat?
3. Composition/balance: framing, spacing, camera depth, focal point.
4. Typography over 3D: does the Playfair headline sit well with the 3D world?
5. Any technical artifacts (aliasing, noise, seams, blank regions, pop-in)?
6. How does this compare to the 2D glassmorphism version of the same scene?

Give: raw score 0-100, three biggest problems, three concrete fixes.
Plain text, concise, no JSON."""

r = vq._call_openrouter("google/gemma-3-27b-it", frames, "You are a senior 3D motion-graphics art director.", PROMPT)
print(r)