#!/usr/bin/env python3
"""critique_pass.py — one-shot design critique of the AvatarNarration90s render.

Sends the SAME extracted frames to BOTH vision models with a custom prompt built
around the client's three review points (color composition, font style, text
density vs graphics). Reuses visual_qa.py's extraction + OpenRouter plumbing.
"""
import json
import sys
from pathlib import Path

QA_DIR = Path("/data/data/com.termux/files/home/ai-lab-internal")
sys.path.insert(0, str(QA_DIR))
import visual_qa as vq

FRAMES_DIR = Path("/data/data/com.termux/files/usr/tmp/visual_qa/fresh")

CLIENT_POINTS = """
THE CLIENT'S REVIEW (treat these as authoritative design requirements — verify
each against the actual frames and answer honestly, do not be sycophantic):

1. COLOR COMPOSITION: The client disagrees with the current color composition.
   Evaluate: palette balance, hue relationships, contrast, saturation levels,
   where color draws the eye, whether any color fights another, temperature.
   Then suggest a concrete alternative composition (which hues, where, and why
   it would improve hierarchy or mood).

2. FONT STYLE: The client disagrees with the font style. Evaluate: the typeface
   character, weight choices, case, letter-spacing, how the type sits against
   the backgrounds, pairing of hero vs body type. Then suggest a concrete
   alternative direction (which kind of typeface, weight/size system, and why).

3. TEXT DENSITY vs GRAPHICS: The client says there is TOO MUCH TEXT on screen
   and it COMPETES WITH the graphics. Evaluate: per-frame text-to-graphics
   balance, word count per frame, whether any element on screen is redundant
   text, whether graphics get visually buried by copy. Then propose which text
   should be cut/moved/de-emphasized on each frame and how the graphics could
   carry more of the storytelling load.

For EACH of the three points give: an honest verdict (agree/disagree/partial
with evidence from specific frames), what is actually wrong, and a concrete
fix direction. The client's verdict wins — you are checking their read against
the footage, not defending the current cut.
"""

SYSTEM_BASE = """You are a senior motion-graphics art director reviewing RENDERED
FRAMES of a 90-second explainer video (n8n / AI automation theme, dark bg,
glassmorphic cards, cyan/gold accents). You judge visual quality and direction.

PROJECT DESIGN DIRECTION:
{DESIGN_DIRECTION}

Respond with ONLY a valid JSON object, no markdown fences:
{{
  "point1_color": {{"verdict": "agree|partial|disagree", "evidence": "frames/observations", "problem": "", "fix": "concrete alternative direction"}},
  "point2_font": {{"verdict": "agree|partial|disagree", "evidence": "", "problem": "", "fix": "concrete alternative direction"}},
  "point3_text_vs_graphics": {{"verdict": "agree|partial|disagree", "evidence": "per-frame text count and balance", "problem": "", "fix": "what to cut/move/de-emphasize, what graphics should carry"}},
  "overall_score": 0-100,
  "prioritized_changes": ["ordered list of the top changes to make"]
}}
Be specific, cite frames, and do not hedge."""

USER_PROMPT = (
    "These are 8 representative frames in time order from the rendered video. "
    "Apply your art-director review.\n\n" + CLIENT_POINTS
)


def main():
    frames = sorted(FRAMES_DIR.glob("frame_*.jpg"))
    if not frames:
        vq.log(f"no frames in {FRAMES_DIR}")
        sys.exit(2)
    vq.log(f"critique pass: {len(frames)} frames from iteration_003")

    results = {}
    if vq.ENABLE_GEMMA:
        try:
            raw = vq._call_openrouter(vq.MODEL_GEMMA, frames,
                                      SYSTEM_BASE.format(DESIGN_DIRECTION=vq.DESIGN_DIRECTION),
                                      USER_PROMPT)
            results["gemma"] = {"raw": raw, "parsed": vq.extract_json(raw)}
            vq.log(f"gemma raw[:200]: {raw[:200]!r}")
        except Exception as e:
            results["gemma"] = {"error": str(e)}
    if vq.ENABLE_NEMOTRON:
        try:
            raw = vq._call_openrouter(vq.MODEL_NEMOTRON, frames,
                                      SYSTEM_BASE.format(DESIGN_DIRECTION=vq.DESIGN_DIRECTION),
                                      USER_PROMPT)
            results["nemotron"] = {"raw": raw, "parsed": vq.extract_json(raw)}
            vq.log(f"nemotron raw[:200]: {raw[:200]!r}")
        except Exception as e:
            results["nemotron"] = {"error": str(e)}

    print(json.dumps(results, indent=2, ensure_ascii=False))
    return 0


if __name__ == "__main__":
    sys.exit(main())
