"""Step 1 — Script generator.

Uses Google Gemini (free tier via AI Studio) to write a YouTube video script
for a given topic, tailored to the "Sylvester's AI Lab" channel voice (reviews
/ explains AI tools). The result is saved as both a Markdown file and a JSON
file that the Remotion scene can read to drive on-screen text.

Free tier: Gemini 2.5 Flash is free for a generous quota via a Google AI Studio
API key. Get one at https://aistudio.google.com/apikey and set GEMINI_API_KEY.
"""

from __future__ import annotations

import json
import re
import sys
from pathlib import Path

import config

try:
    from dotenv import load_dotenv
    load_dotenv(config.PIPELINE_DIR / ".env")
except Exception:
    pass

SYSTEM_PROMPT = """You are the head scriptwriter for "Sylvester's AI Lab", a \
YouTube channel that reviews and explains AI tools in a clear, energetic, and \
trustworthy way.

For every video you write:
- A hook in the first 5 seconds that promises a concrete payoff.
- A tight problem -> tool -> demo -> verdict structure.
- Plain language, no hype, no fluff. Call out real limitations.
- A clear recommendation (use it / skip it / use with caution).
- A natural subscribe & like call to action near the end.

Return ONLY a JSON object with these exact keys:
{
  "title": "SEO-friendly YouTube title (<= 70 chars)",
  "description": "YouTube description with timestamps and links (markdown)",
  "tags": ["array", "of", "seo", "tags"],
  "hook": "The opening line spoken by the narrator.",
  "sections": [
    {"heading": "...", "voiceover": "..."},
    ...
  ],
  "cta": "Closing call to action line."
}
The "sections" array is the spine of the video; each "voiceover" is narration \
that will be read aloud. Keep total spoken words between 900 and 1400.
"""


def _research_block(brief: dict | None) -> str:
    """Render first-hand research (YouTube + web) into a grounding context block."""
    if not brief:
        return ""
    lines = ["\n\nFIRST-HAND RESEARCH (use this to ground the script):"]

    tools = brief.get("tool_mentions") or []
    if tools:
        lines.append(
            "- Tools already dominating this space (cover/compare these): "
            + ", ".join(f"{t['tool']} ({t['mentions']})" for t in tools[:8])
        )
    phrases = brief.get("common_phrases") or []
    if phrases:
        lines.append(
            "- Recurring angles competitors use: "
            + ", ".join(f"'{p['phrase']}'" for p in phrases[:8])
        )
    tops = brief.get("top_videos") or []
    if tops:
        lines.append("- Top existing videos (note what they do, then do it better / fill gaps):")
        for v in tops[:5]:
            lines.append(f"    * {v['views']:,} views — {v['title']} ({v['channel']})")

    results = brief.get("results") or []
    if results:
        lines.append("- Notable web sources (ground claims; prefer official docs):")
        for r in results[:8]:
            title = r.get("title", "")
            url = r.get("url", "")
            snippet = (r.get("content") or "")[:220]
            lines.append(f"    * {title} — {url}")
            if snippet:
                lines.append(f"      {snippet}")
    # Optional synthesized fields (added by synthesize_web_research, if present)
    summary = brief.get("summary")
    if summary:
        lines.append(f"- Web research summary: {summary}")
    findings = brief.get("key_findings") or []
    if findings:
        lines.append("- Key web findings:")
        for f in findings[:8]:
            lines.append(f"    * {f}")
    mistakes = brief.get("mistakes_to_avoid") or []
    if mistakes:
        lines.append("- Common beginner mistakes to explicitly address/avoid:")
        for m in mistakes[:8]:
            lines.append(f"    * {m}")
    xtips = brief.get("x_tips") or []
    if xtips:
        lines.append("- Practitioner tips (X/Reddit) worth weaving in:")
        for t in xtips[:6]:
            lines.append(f"    * {t}")
    sources = brief.get("sources") or []
    if sources:
        lines.append("- Curated authoritative sources:")
        for s in sources[:6]:
            lines.append(f"    * {s.get('title', '')} — {s.get('url', '')}")

    lines.append(
        "- Strategic gap: generic 'prompt engineering' content dominates; dedicated "
        "image-to-video prompting is under-served — lean into that angle."
    )
    lines.append(
        "Weave the named tools, findings, and the gap into the script so it feels current and specific."
    )
    return "\n".join(lines)


def load_research_brief(workspace: Path) -> dict | None:
    """Merge YouTube research.json + web web_research.json into one brief.

    YouTube fields win on key collision (tool_mentions etc. are YouTube-specific).
    Returns None when neither file exists.
    """
    youtube: dict = {}
    web: dict = {}
    ry = workspace / config.RESEARCH_JSON_REL
    if ry.exists():
        try:
            youtube = json.loads(ry.read_text(encoding="utf-8"))
        except Exception as e:
            print(f"[script] could not read {ry}: {e}")
    rw = workspace / "web_research.json"
    if rw.exists():
        try:
            web = json.loads(rw.read_text(encoding="utf-8"))
        except Exception as e:
            print(f"[script] could not read {rw}: {e}")
    if not youtube and not web:
        return None
    return {**web, **youtube}


def synthesize_web_research(raw: dict, workspace: Path) -> dict:
    """Distill raw Tavily results into grounded guidance via Gemini.

    Writes the enriched brief (raw results + summary/key_findings/
    mistakes_to_avoid/x_tips/sources) back to web_research.json so the
    script generator and CI reuse it.
    """
    config.require("GEMINI_API_KEY")
    from google import genai
    from google.genai import types

    client = genai.Client(api_key=config.GEMINI_API_KEY)
    ctx = []
    for r in (raw.get("results") or [])[:14]:
        ctx.append(f"- {r.get('title', '')} ({r.get('url', '')}): {(r.get('content') or '')[:400]}")
    user = (
        "You are a research synthesizer for 'Sylvester's AI Lab', a channel teaching "
        "AI video creation. Distill these web research results about AI image-to-video "
        "prompting into structured guidance a scriptwriter can use.\n\n"
        + "\n".join(ctx)
        + "\n\nReturn ONLY valid minified JSON (no markdown fences):\n"
        '{"summary":"1-2 sentence gist","key_findings":["..."],'
        '"mistakes_to_avoid":["..."],"x_tips":["..."],'
        '"sources":[{"title":"...","url":"..."}]}'
    )
    try:
        resp = client.models.generate_content(
            model=config.GEMINI_MODEL,
            contents=user,
            config=types.GenerateContentConfig(
                system_instruction="Be precise, cite the source material, avoid hype.",
                response_mime_type="application/json",
                max_output_tokens=2048,
            ),
        )
        obj = _parse_json(resp.text)
    except Exception as exc:
        print(f"[script] web synthesis failed ({exc}); keeping raw results")
        obj = {}
    out = {**raw, **obj}
    workspace.mkdir(parents=True, exist_ok=True)
    (workspace / "web_research.json").write_text(
        json.dumps(out, indent=2, ensure_ascii=False), encoding="utf-8"
    )
    print(f"[script] wrote synthesized web brief -> {workspace / 'web_research.json'}")
    return out


def generate_script(
    topic: str,
    workspace: Path,
    research: dict | None = None,
    extra_instruction: str | None = None,
) -> dict:
    config.require("GEMINI_API_KEY")

    from google import genai
    from google.genai import types

    client = genai.Client(api_key=config.GEMINI_API_KEY)

    user_prompt = (
        f"Write a YouTube script for the topic: \"{topic}\". "
        "Make it feel like a fresh Sylvester's AI Lab episode."
        + _research_block(research)
        + (
            "\n\nHARD CONSTRAINTS (follow exactly):\n" + extra_instruction
            if extra_instruction
            else ""
        )
    )

    print(f"[script] Asking Gemini ({config.GEMINI_MODEL}) for: {topic}"
          + (" (with YouTube research brief)" if research else ""))

    strict = (
        "\n\nIMPORTANT: Output ONLY valid minified JSON. No markdown fences, no "
        "comments, no trailing commas, and never put real line breaks inside "
        "string values (use spaces). Every string must be on a single line."
    )

    last_err = None
    for attempt in range(3):
        try:
            resp = client.models.generate_content(
                model=config.GEMINI_MODEL,
                contents=user_prompt,
                config=types.GenerateContentConfig(
                    system_instruction=SYSTEM_PROMPT + (strict if attempt else ""),
                    response_mime_type="application/json",
                    max_output_tokens=8192,
                ),
            )
            data = _parse_json(resp.text)
            break
        except json.JSONDecodeError as e:
            last_err = e
            print(f"[script] JSON parse failed (attempt {attempt + 1}/3), retrying...")
    else:
        raise RuntimeError(f"Could not parse script JSON from Gemini: {last_err}")

    workspace.mkdir(parents=True, exist_ok=True)
    (workspace / "script.md").write_text(_to_markdown(data), encoding="utf-8")
    (workspace / config.SCRIPT_JSON_REL).write_text(
        json.dumps(data, indent=2, ensure_ascii=False), encoding="utf-8"
    )
    print(f"[script] Saved to {workspace / 'script.md'}")
    return data


def _parse_json(text: str) -> dict:
    """Tolerant JSON parse: strip markdown fences and fix trailing commas."""
    text = (text or "").strip()
    if text.startswith("```"):
        text = re.sub(r"^```[a-zA-Z]*", "", text).strip()
        if text.endswith("```"):
            text = text[:-3].strip()
    start, end = text.find("{"), text.rfind("}")
    if start != -1 and end > start:
        text = text[start:end + 1]
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        # Repair common model slip-ups (trailing commas before } or ]).
        cleaned = re.sub(r",\s*([}\]])", r"\1", text)
        return json.loads(cleaned)


def _to_markdown(data: dict) -> str:
    lines = [
        f"# {data.get('title', '')}",
        "",
        data.get("description", ""),
        "",
        "## Sections",
        "",
    ]
    for i, s in enumerate(data.get("sections", []), 1):
        lines.append(f"### {i}. {s.get('heading', '')}")
        lines.append("")
        lines.append(s.get("voiceover", ""))
        lines.append("")
    lines.append(f"**CTA:** {data.get('cta', '')}")
    return "\n".join(lines)


def _slug(topic: str) -> str:
    return "".join(c if c.isalnum() else "-" for c in topic.lower()).strip("-")


if __name__ == "__main__":
    topic = sys.argv[1] if len(sys.argv) > 1 else input("Topic: ")
    ws = config.WORKSPACE / _slug(topic)
    ws.mkdir(parents=True, exist_ok=True)
    research = load_research_brief(ws)
    if research:
        print(f"[script] Loaded merged research brief -> {ws}")
    generate_script(topic, ws, research)
