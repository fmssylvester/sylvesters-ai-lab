"""Step 5 — B-roll descriptor.

For each section, asks Gemini to describe the on-screen MOTION GRAPHICS action
(not the narration text). This becomes the brief the cinematic Episode scene
follows. Writes `workspace/<topic>/broll_descriptions.json` and returns a list
(aligned to sections) of description strings, which the pipeline wires into
episodeRuntime.json so the composition receives them.
"""

from __future__ import annotations

import json
from pathlib import Path

import config
from script_generator import _parse_json

try:
    from dotenv import load_dotenv

    load_dotenv(config.PIPELINE_DIR / ".env")
except Exception:
    pass

SYSTEM_PROMPT = """You are the motion director for "Sylvester's AI Lab", a premium cinematic \
AI-explainer YouTube channel. Given a script section, describe ONLY what should happen visually \
on screen as motion graphics — the actual animation/action, never the spoken words.

Be concrete and cinematic: camera moves, transitions, UI elements appearing, data/stats animating,
logos revealing, charts drawing, comparisons sliding in. One to three sentences.

Return ONLY valid minified JSON (no markdown fences):
{"description": "..."}
"""


def _describe_one(client, section: dict, idx: int) -> str:
    from google.genai import types

    heading = section.get("heading", "")
    voiceover = section.get("voiceover", "")
    user_prompt = (
        f"Section {idx + 1} heading: {heading}\n"
        f"Narration (do NOT describe this text — describe the visuals that accompany it):\n"
        f"{voiceover}\n\n"
        "Describe the on-screen motion graphics action for this section."
    )
    resp = config.gemini_generate(
        client,
        config.GEMINI_MODEL,
        user_prompt,
        types.GenerateContentConfig(
            system_instruction=SYSTEM_PROMPT,
            response_mime_type="application/json",
            max_output_tokens=512,
        ),
    )
    obj = _parse_json(resp.text)
    return (obj.get("description") or "").strip()


def describe_sections(script: dict, workspace: Path) -> list[str]:
    """Describe every section; write broll_descriptions.json; return descriptions."""
    config.require("GEMINI_API_KEY")
    from google import genai

    client = genai.Client(api_key=config.GEMINI_API_KEY)
    sections = script.get("sections", [])
    descriptions: list[str] = []

    for i, s in enumerate(sections):
        print(f"[broll] section {i + 1}/{len(sections)}: {s.get('heading', '')[:50]}")
        try:
            desc = _describe_one(client, s, i)
        except Exception as exc:
            print(f"[broll] fallback for section {i + 1}: {exc}")
            desc = "Cinematic lower-third with the spoken line; subtle camera push-in."
        descriptions.append(desc)

    workspace.mkdir(parents=True, exist_ok=True)
    out = workspace / "broll_descriptions.json"
    payload = [
        {"heading": s.get("heading", ""), "description": d}
        for s, d in zip(sections, descriptions)
    ]
    out.write_text(json.dumps(payload, indent=2, ensure_ascii=False), encoding="utf-8")
    print(f"[broll] wrote {out}")
    return descriptions


if __name__ == "__main__":
    import sys

    ws = config.WORKSPACE / (sys.argv[1] if len(sys.argv) > 1 else "test")
    data = json.loads((ws / config.SCRIPT_JSON_REL).read_text(encoding="utf-8"))
    for d in describe_sections(data, ws):
        print("-", d)
