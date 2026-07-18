"""Step 1.5 — Automatic voiceover via Edge TTS (free, no key).

Generates a single narrated MP3 from the Gemini script.json using Microsoft's
free Edge online TTS (voice en-US-GuyNeural by default). This runs automatically
before the Remotion render, so the video gets a real voiceover without you
having to upload one. Set VOICEOVER_MODE=manual in config/.env to instead pause
and wait for a kikivoice.ai upload.
"""

from __future__ import annotations

import asyncio
from pathlib import Path

import config


def _script_text(script: dict) -> str:
    parts = []
    if script.get("hook"):
        parts.append(script["hook"])
    for s in script.get("sections", []):
        if s.get("voiceover"):
            parts.append(s["voiceover"])
    if script.get("cta"):
        parts.append(script["cta"])
    # Double newlines give Edge TTS natural paragraph pauses.
    return "\n\n".join(parts)


async def _synthesize(text: str, voice: str, out_path: Path) -> None:
    import edge_tts
    communicate = edge_tts.Communicate(text, voice)
    await communicate.save(str(out_path))


def generate_voiceover(script: dict, out_path: Path,
                       voice: str | None = None) -> Path:
    voice = voice or config.TTS_VOICE
    out_path.parent.mkdir(parents=True, exist_ok=True)
    text = _script_text(script)
    if not text.strip():
        raise RuntimeError("Script has no narratable text (hook/sections/cta empty).")
    print(f"[voiceover] Synthesizing with Edge TTS voice '{voice}' -> {out_path.name}")
    asyncio.run(_synthesize(text, voice, out_path))
    print(f"[voiceover] Done ({out_path.stat().st_size} bytes)")
    return out_path


if __name__ == "__main__":
    import json
    import sys
    slug = sys.argv[1] if len(sys.argv) > 1 else "test"
    ws = config.WORKSPACE / slug
    data = json.loads((ws / config.SCRIPT_JSON_REL).read_text(encoding="utf-8"))
    generate_voiceover(data, ws / config.VOICEOVER_FILENAME)
