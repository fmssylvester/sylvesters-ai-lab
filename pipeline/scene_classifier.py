"""Step 3 — Scene intent classifier.

For each section in script.json, asks Gemini to decide how the section should
be visualized as motion graphics. Writes the plan to
`workspace/<topic>/scene_plan.json` and returns a list (aligned to sections) of
    {"visual_treatment", "mood", "suggested_components"}.

The Episode composition consumes this via episodeRuntime.json so each section
can pick its visual language instead of a one-size-fits-all card.
"""

from __future__ import annotations

import json
import re
from pathlib import Path

import config
from script_generator import _parse_json

try:
    from dotenv import load_dotenv

    load_dotenv(config.PIPELINE_DIR / ".env")
except Exception:
    pass

# Curated list of components in our library. Gemini may only suggest from these.
COMPONENT_LIBRARY = [
    "GlowText",
    "GlassPanel",
    "GlassPoster",
    "GamifiedBanner",
    "DataFlowDashboard",
    "PromptInputBar",
    "VoiceBanner",
    "OtpSheet",
    "SwipeCard",
    "FrostedPoster",
    "AppNavMenu",
    "AgentWorkflow",
    "ToolGrid",
    "BeforeAfter",
    "ProblemSolution",
    "StepTimeline",
    "AgentActivityStream",
    "CtaEndCard",
    "LogoReveal",
    "BrowserWindow",
    "BrowserScene",
    "CollectorScene",
    "CollectorCinematic",
    "ToolOverloadScene",
]

VISUAL_TREATMENTS = [
    "data_visualization",
    "browser_demo",
    "comparison_reveal",
    "text_statement",
    "tool_showcase",
    "list_reveal",
    "chart_animation",
]
MOODS = ["dramatic", "energetic", "calm", "urgent"]

SYSTEM_PROMPT = """You are the creative director for "Sylvester's AI Lab", a premium cinematic \
AI-explainer YouTube channel. For a given script section, decide how it should be visualized as \
motion graphics.

Return ONLY valid minified JSON (no markdown fences) with exactly these keys:
{{
  "visual_treatment": one of [{treatments}],
  "mood": one of [{moods}],
  "suggested_components": [component names from the library that best fit this section]
}}

Only suggest components from this library:
{library}
"""


def _classify_one(client, section: dict, idx: int) -> dict:
    from google.genai import types

    heading = section.get("heading", "")
    voiceover = section.get("voiceover", "")
    user_prompt = (
        f"Section {idx + 1} heading: {heading}\n"
        f"Narration:\n{voiceover}\n\n"
        "Classify this section's visual treatment, mood, and suggested components."
    )
    resp = client.models.generate_content(
        model=config.GEMINI_MODEL,
        contents=user_prompt,
        config=types.GenerateContentConfig(
            system_instruction=SYSTEM_PROMPT.format(
                treatments=", ".join(VISUAL_TREATMENTS),
                moods=", ".join(MOODS),
                library=", ".join(COMPONENT_LIBRARY),
            ),
            response_mime_type="application/json",
            max_output_tokens=1024,
        ),
    )
    return _parse_json(resp.text)


def classify_sections(script: dict, workspace: Path) -> list[dict]:
    """Classify every section; write scene_plan.json; return the plan list."""
    config.require("GEMINI_API_KEY")
    from google import genai

    client = genai.Client(api_key=config.GEMINI_API_KEY)
    sections = script.get("sections", [])
    plan: list[dict] = []

    for i, s in enumerate(sections):
        print(
            f"[scene_classifier] section {i + 1}/{len(sections)}: "
            f"{s.get('heading', '')[:50]}"
        )
        try:
            obj = _classify_one(client, s, i)
        except Exception as exc:  # never let classification kill the pipeline
            print(f"[scene_classifier] fallback for section {i + 1}: {exc}")
            obj = {
                "visual_treatment": "text_statement",
                "mood": "calm",
                "suggested_components": ["GlowText", "GlassPanel"],
            }

        obj["visual_treatment"] = obj.get("visual_treatment", "text_statement")
        obj["mood"] = obj.get("mood", "calm")
        comps = obj.get("suggested_components", []) or []
        known = [c for c in comps if c in COMPONENT_LIBRARY] or ["GlowText", "GlassPanel"]
        obj["suggested_components"] = known
        plan.append(obj)

    workspace.mkdir(parents=True, exist_ok=True)
    out = workspace / "scene_plan.json"
    out.write_text(json.dumps(plan, indent=2, ensure_ascii=False), encoding="utf-8")
    print(f"[scene_classifier] wrote {out}")
    return plan


if __name__ == "__main__":
    import sys

    ws = config.WORKSPACE / (sys.argv[1] if len(sys.argv) > 1 else "test")
    data = json.loads((ws / config.SCRIPT_JSON_REL).read_text(encoding="utf-8"))
    print(json.dumps(classify_sections(data, ws), indent=2))
