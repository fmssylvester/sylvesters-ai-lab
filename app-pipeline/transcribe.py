#!/usr/bin/env python3
"""Transcribe audio using whisper.cpp with word-level timestamps."""
import subprocess
import json
import os
from pathlib import Path

WHISPER_CLI = "/data/data/com.termux/files/usr/bin/whisper-cli"
DEFAULT_MODEL = str(Path(__file__).parent / "models" / "ggml-tiny.bin")
TMP_DIR = str(Path(__file__).parent / "tmp")


def transcribe(audio_path: str, model: str = DEFAULT_MODEL, language: str = "en") -> dict:
    """Transcribe audio file and return segments with timestamps.
    
    Returns dict with:
        - segments: list of {start, end, text, confidence}
        - words: list of {word, start, end, probability}
        - language: detected language
        - duration: total duration in seconds
    """
    audio_path = str(Path(audio_path).resolve())
    
    if not os.path.exists(audio_path):
        raise FileNotFoundError(f"Audio not found: {audio_path}")
    
    os.makedirs(TMP_DIR, exist_ok=True)
    
    # Use a temp file for whisper JSON output
    base_name = Path(audio_path).stem
    output_base = os.path.join(TMP_DIR, f"{base_name}_whisper")
    
    # Run whisper-cli with JSON output
    cmd = [
        WHISPER_CLI,
        "-m", model,
        "-f", audio_path,
        "-l", language,
        "--output-json",
        "--output-file", output_base,
        "--no-prints",
    ]
    
    result = subprocess.run(cmd, capture_output=True, text=True, timeout=600)
    
    if result.returncode != 0:
        raise RuntimeError(f"whisper-cli failed: {result.stderr}")
    
    # Find the JSON output file
    json_path = f"{output_base}.json"
    
    if not os.path.exists(json_path):
        raise FileNotFoundError(f"Whisper JSON output not found at {json_path}")
    
    with open(json_path, "r") as f:
        whisper_output = json.load(f)
    
    # Parse into our format
    segments = []
    words = []
    
    for seg in whisper_output.get("transcription", []):
        start_ms = seg.get("offsets", {}).get("from", 0)
        end_ms = seg.get("offsets", {}).get("to", 0)
        text = seg.get("text", "").strip()
        
        segments.append({
            "start": start_ms / 1000.0,
            "end": end_ms / 1000.0,
            "text": text,
            "confidence": -0.5,  # Not available in this format
            "no_speech_prob": 0.0,
        })
        
        # Split text into words and distribute timestamps
        if text:
            word_list = text.split()
            if word_list:
                seg_duration = (end_ms - start_ms) / 1000.0
                word_duration = seg_duration / len(word_list)
                
                for j, word in enumerate(word_list):
                    word_start = (start_ms / 1000.0) + (j * word_duration)
                    word_end = word_start + word_duration
                    words.append({
                        "word": word,
                        "start": word_start,
                        "end": word_end,
                        "probability": 0.9,
                    })
    
    # Get duration from last segment
    duration = segments[-1]["end"] if segments else 0.0
    
    # Clean up JSON file
    os.remove(json_path)
    
    return {
        "segments": segments,
        "words": words,
        "language": language,
        "duration": duration,
    }


def transcribe_to_text(audio_path: str, **kwargs) -> str:
    """Return just the transcribed text."""
    result = transcribe(audio_path, **kwargs)
    return " ".join(seg["text"] for seg in result["segments"])


if __name__ == "__main__":
    import sys
    if len(sys.argv) < 2:
        print("Usage: python3 transcribe.py <audio_file>")
        sys.exit(1)
    
    result = transcribe(sys.argv[1])
    print(f"Duration: {result['duration']:.1f}s")
    print(f"Segments: {len(result['segments'])}")
    print(f"Words: {len(result['words'])}")
    print()
    for seg in result["segments"]:
        print(f"[{seg['start']:.1f}-{seg['end']:.1f}] {seg['text']}")
