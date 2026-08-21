---
description: Dual-vision QA on a rendered image or video (Gemma + Nemotron consensus)
agent: build
mode: primary
---
Run visual QA on the rendered output. Target may be an image (png/jpg/webp) or video (mp4/mov/webm). Frames are extracted evenly across the video, sent to both vision models, and a consensus report is produced.

Usage: /visual-inspect path/to/render.mp4 [--frames N] [--only gemma|nemotron]

<python3 visual_qa.py "$ARGUMENTS" --report></p>
