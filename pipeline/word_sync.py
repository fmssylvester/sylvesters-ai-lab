"""Word-level timestamp alignment using WhisperX.

Produces word-level timings for a voiceover so the cinematic episode can
drive per-word kinetic typography (BRAIN.md: "Text is never the hero —
every sentence must earn its visuals").

Usage:
    python3 word_sync.py <voiceover_audio.mp3> [output.json]

Output (JSON array):
    [
      {"word": "hello", "start": 0.0, "end": 0.3},
      {"word": "world", "start": 0.35, "end": 0.6}
    ]

If no output path is given, writes "<audio>.words.json" next to the audio.
Model size and device can be overridden via env: WHISPER_MODEL (default
"base"), WHISPER_DEVICE (default "cuda" if available else "cpu"),
WHISPER_COMPUTE (default "int8" on cpu, "float16" on cuda).
"""
from __future__ import annotations

import json
import os
import sys
from pathlib import Path


def sync_words(
    audio_path: str,
    model_size: str | None = None,
    device: str | None = None,
    compute_type: str | None = None,
) -> list[dict]:
    # Lazy imports so this module can be imported/syntax-checked without
    # whisperx (and its heavy torch dependency) present.
    import whisperx

    model_size = model_size or os.getenv("WHISPER_MODEL", "base")
    if device is None:
        try:
            import torch

            device = "cuda" if torch.cuda.is_available() else "cpu"
        except Exception:
            device = "cpu"
    if compute_type is None:
        compute_type = "float16" if device == "cuda" else "int8"

    print(f"[word_sync] loading whisperx model '{model_size}' ({device}/{compute_type})")
    model = whisperx.load_model(model_size, device, compute_type=compute_type)
    audio = whisperx.load_audio(audio_path)

    print("[word_sync] transcribing…")
    result = model.transcribe(audio, batch_size=16)
    language = result.get("language") or "en"
    print(f"[word_sync] detected language: {language}")

    print("[word_sync] aligning word-level timestamps…")
    align_model, metadata = whisperx.load_align_model(
        language_code=language, device=device
    )
    aligned = whisperx.align(
        result["segments"],
        align_model,
        metadata,
        audio,
        device,
        return_char_alignments=False,
    )

    words: list[dict] = []
    for seg in aligned.get("segments", []):
        for w in seg.get("words", []):
            if w.get("start") is None or w.get("end") is None:
                # WhisperX marks unaligned words with start/end = None.
                continue
            words.append(
                {
                    "word": str(w["word"]).strip(),
                    "start": round(float(w["start"]), 3),
                    "end": round(float(w["end"]), 3),
                }
            )
    return words


def main() -> None:
    if len(sys.argv) < 2:
        print(
            "Usage: python3 word_sync.py <voiceover_audio.mp3> [output.json]",
            file=sys.stderr,
        )
        sys.exit(2)

    audio = sys.argv[1]
    if not os.path.exists(audio):
        print(f"[word_sync] audio not found: {audio}", file=sys.stderr)
        sys.exit(1)

    out = (
        sys.argv[2]
        if len(sys.argv) > 2
        else str(Path(audio).with_suffix("")) + ".words.json"
    )

    words = sync_words(audio)
    Path(out).write_text(
        json.dumps(words, ensure_ascii=False, indent=2), encoding="utf-8"
    )
    print(f"[word_sync] wrote {len(words)} words -> {out}")


if __name__ == "__main__":
    main()
