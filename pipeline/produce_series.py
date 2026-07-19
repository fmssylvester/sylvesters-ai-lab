"""Produce the full multi-part series locally: research + grounded scripts.

Per part we:
  1. reuse the umbrella YouTube first-hand research (saved API calls),
  2. run Tavily web research (per-part angle),
  3. synthesize the raw web results into grounded guidance via Gemini,
  4. generate a research-grounded script with tool-agnostic guardrails.

CI (render.yml) reuses the committed script.json because pipeline.py is
idempotent (it loads an existing script.json instead of regenerating).

Usage:
    python3 pipeline/produce_series.py            # all 6 parts
    python3 pipeline/produce_series.py 1          # only part 1
    python3 pipeline/produce_series.py 1 4        # parts 1 and 4
"""

from __future__ import annotations

import json
import shutil
import sys
from pathlib import Path

import config
import script_generator
import tavily_research

UMBRELLA = "mastering-ai-image-to-video-prompting-for-beginners"

AGNOSTIC = (
    "Stay tool-agnostic: refer to 'your tool' or 'most image-to-video tools'. "
    "Do NOT compare specific model features or produce model shootouts. "
    "Teach a transferable method, not tool tiers. "
    "Do NOT invent resources, fake URLs, or call external sites 'our blog'/'our "
    "newsletter'. Only list links that appear in the FIRST-HAND RESEARCH sources, "
    "and attribute them accurately. If no suitable source exists, omit the Resources section."
)


def _slug(topic: str) -> str:
    return "".join(c if c.isalnum() else "-" for c in topic.lower()).strip("-")


PARTS = [
    {
        "topic": "AI video motion first secret",
        "queries": [
            "why motion-first matters in AI image to video prompting",
            "AI image to video prompting common beginner mistakes",
            "Runway official guide prompting motion image to video",
        ],
        "extra": AGNOSTIC + " Lead with the counterintuitive truth that prompting for "
        "image-to-video is about describing MOTION and camera, not just the picture. "
        "Reference that leading tools' own official guides say to focus on motion.",
    },
    {
        "topic": "AI video prompt anatomy template",
        "queries": [
            "best AI image to video prompt structure anatomy",
            "AI video prompt template subject scene camera lighting",
            "fill in the blanks image to video prompt formula",
        ],
        "extra": AGNOSTIC + " Teach a reusable fill-in-the-blanks prompt template "
        "(subject + scene + camera movement + pacing + atmosphere + negative "
        "constraints). Give one copy-paste example the viewer can adapt.",
    },
    {
        "topic": "AI video camera movement lexicon",
        "queries": [
            "camera movement vocabulary for AI video prompts",
            "dolly pan zoom tracking orbit parallax AI video meaning",
            "how to describe camera moves in image to video prompts",
        ],
        "extra": AGNOSTIC + " Teach a concrete movement vocabulary (dolly, pan, zoom, "
        "tracking, orbit, parallax, handheld, crane) with when to use each. "
        "Keep it tool-agnostic.",
    },
    {
        "topic": "AI video find any tool guide",
        "queries": [
            "how to find your AI video tool official prompt guide documentation",
            "where to find image to video prompting docs for tools",
            "official prompting guide Runway LTX Kling image to video",
        ],
        "extra": AGNOSTIC + " Name at most TWO real tools ONLY as live demonstrations "
        "of how to locate their official prompt guide (steps: open docs site -> "
        "find the prompting page -> read the examples). Do NOT rate or compare "
        "models. The lesson is the method to find ANY tool's guide.",
    },
    {
        "topic": "AI video prompt iteration method",
        "queries": [
            "how to iterate AI image to video prompts step by step",
            "change one variable prompt iteration method",
            "why my AI video looks bad and how to fix by iterating",
        ],
        "extra": AGNOSTIC + " Teach the change-one-variable iteration loop. Emphasize "
        "the human reasoning step (decide what to change and why), not brute force.",
    },
    {
        "topic": "AI video fix ugly output",
        "queries": [
            "fixing ugly AI image to video results negative prompts",
            "source image preparation for better AI video",
            "negative prompts and image prep image to video best practices",
        ],
        "extra": AGNOSTIC + " Cover negative prompts and source-image preparation as "
        "the two main levers for fixing ugly output. Use real practitioner advice.",
    },
]


def produce(part: dict) -> str:
    slug = _slug(part["topic"])
    ws = config.WORKSPACE / slug
    ws.mkdir(parents=True, exist_ok=True)

    # 1) Reuse umbrella YouTube first-hand research (broad niche stats).
    umbrella = config.WORKSPACE / UMBRELLA / config.RESEARCH_JSON_REL
    if umbrella.exists() and not (ws / config.RESEARCH_JSON_REL).exists():
        shutil.copy(umbrella, ws / config.RESEARCH_JSON_REL)

    # 2) Web research (Tavily) -> raw web_research.json.
    try:
        raw = tavily_research.research(part["topic"], queries=part["queries"], per=6)
    except Exception as e:
        print(f"[produce] tavily failed for {part['topic']}: {e}")
        raw = {}

    # 3) Synthesize raw results into grounded guidance.
    try:
        script_generator.synthesize_web_research(raw, ws)
    except Exception as e:
        print(f"[produce] synthesis failed for {part['topic']}: {e}")

    # 4) Grounded script.
    brief = script_generator.load_research_brief(ws)
    script = script_generator.generate_script(
        part["topic"], ws, brief, extra_instruction=part["extra"]
    )
    n = len(script.get("sections", []))
    words = sum(len(s.get("voiceover", "").split()) for s in script.get("sections", []))
    print(f"[produce] DONE  {part['topic']} -> {slug}  (sections={n}, ~{words} words)")
    return slug


if __name__ == "__main__":
    picks = {int(a) for a in sys.argv[1:] if a.isdigit()}
    chosen = [p for i, p in enumerate(PARTS, 1) if (not picks or i in picks)]
    print(f"Producing {len(chosen)} part(s): " + ", ".join(p["topic"] for p in chosen))
    slugs: list[str] = []
    for p in chosen:
        try:
            slugs.append(produce(p))
        except Exception as exc:
            print(f"[produce] FAILED part '{p['topic']}': {exc}")
    print("\nSlugs produced:")
    for s in slugs:
        print(" -", s)
