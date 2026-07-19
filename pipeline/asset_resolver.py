"""Step 4 — Asset resolver.

Scans the brand-logo library (`assets/01_LOGOS`) and fuzzy-matches tool/brand
mentions found in each script section to the closest logo asset. The resolved
paths are attached to each section so the Episode composition can place real
brand marks instead of generic graphics.

Output: a list (aligned to `script["sections"]`) of
    [{"name": "openai", "path": "01_LOGOS/AI/openai.svg"}, ...]
which the pipeline writes into episodeRuntime.json under each section.
"""

from __future__ import annotations

import re
from pathlib import Path

import config

LOGO_ROOT = config.PROJECT_ROOT / "assets" / "01_LOGOS"

# Mention -> index key (logo file stem). Lets common ways of naming a tool
# resolve to the right asset (e.g. "chatgpt" -> openai.svg).
ALIASES = {
    "chatgpt": "openai",
    "gpt": "openai",
    "gpt-5": "openai",
    "gpt5": "openai",
    "openai": "openai",
    "claude": "claude_ai",
    "anthropic": "anthropic",
    "gemini": "googlegemini",
    "google": "googlegemini",
    "perplexity": "perplexity",
    "midjourney": "midjourney_com",
    "huggingface": "huggingface_co",
    "hugging face": "huggingface_co",
    "figma": "figma",
    "notion": "notion",
    "github": "github",
    "vercel": "vercel",
    "canva": "canva",
    "zapier": "zapier",
    "n8n": "n8n",
    "make": "make",
}

_INDEX: dict[str, str] | None = None


def build_index() -> dict[str, str]:
    """Map normalized logo name -> asset path relative to the Remotion public dir.

    Remotion's publicDir is `assets/`, so staticFile() expects paths like
    `01_LOGOS/AI/openai.svg` (no leading `assets/`).
    """
    idx: dict[str, str] = {}
    if not LOGO_ROOT.exists():
        print(f"[asset_resolver] logo root missing: {LOGO_ROOT}")
        return idx
    base = config.PROJECT_ROOT / "assets"
    for p in sorted(LOGO_ROOT.rglob("*")):
        if p.suffix.lower() in (".svg", ".png", ".jpg", ".jpeg"):
            stem = p.stem.lower()
            rel = str(p.relative_to(base)).replace("\\", "/")
            idx[stem] = rel
    print(f"[asset_resolver] indexed {len(idx)} logo assets")
    return idx


def _index() -> dict[str, str]:
    global _INDEX
    if _INDEX is None:
        _INDEX = build_index()
    return _INDEX


def resolve(tool_name: str) -> str | None:
    """Fuzzy-match a tool/brand name to the closest logo asset path (or None)."""
    idx = _index()
    if not idx:
        return None
    key = (tool_name or "").strip().lower()

    if key in ALIASES and ALIASES[key] in idx:
        return idx[ALIASES[key]]
    if key in idx:
        return idx[key]

    import difflib

    cand = difflib.get_close_matches(key, idx.keys(), n=1, cutoff=0.6)
    return idx[cand[0]] if cand else None


def resolve_sections(script: dict) -> list[list[dict]]:
    """Return a list (aligned to sections) of resolved asset dicts per section."""
    sections = script.get("sections", [])
    out: list[list[dict]] = []
    for s in sections:
        text = (s.get("heading", "") + " " + s.get("voiceover", "")).lower()
        found: list[dict] = []
        seen: set[str] = set()
        for alias in ALIASES:
            if re.search(r"(?<![a-z0-9])" + re.escape(alias) + r"(?![a-z0-9])", text):
                path = resolve(alias)
                if path and path not in seen:
                    found.append({"name": alias, "path": path})
                    seen.add(path)
        out.append(found)
    return out


if __name__ == "__main__":
    import json
    import sys

    ws = config.WORKSPACE / (sys.argv[1] if len(sys.argv) > 1 else "test")
    data = json.loads((ws / config.SCRIPT_JSON_REL).read_text(encoding="utf-8"))
    res = resolve_sections(data)
    for i, (sec, assets) in enumerate(zip(data.get("sections", []), res)):
        print(f"Section {i + 1}: {sec.get('heading', '')[:40]} -> {[a['name'] for a in assets]}")
