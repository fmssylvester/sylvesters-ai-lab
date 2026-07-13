import sys
import os
import subprocess

WHISPER_BIN = os.path.expanduser("~/whisper.cpp/build/bin/whisper-cli")
WHISPER_MODEL = os.path.expanduser("~/whisper.cpp/models/ggml-base.en.bin")

def hear(audio_path, model=WHISPER_MODEL, binary=WHISPER_BIN):
    """Transcribe an audio file offline via whisper.cpp. Returns the text."""
    if not os.path.exists(binary):
        raise FileNotFoundError(f"whisper.cpp binary not found at {binary}")
    if not os.path.exists(model):
        raise FileNotFoundError(f"whisper model not found at {model}")
    cmd = [
        binary, "-m", model, "-f", os.path.abspath(audio_path),
        "-nt",          # no per-segment timestamps
        "-p", "1",      # steps for progress (quiet)
    ]
    result = subprocess.run(cmd, capture_output=True, text=True, timeout=300)
    # whisper.cpp prints the transcript to stdout; strip the trailing timing block.
    out = result.stdout
    text = []
    for line in out.splitlines():
        if line.startswith("whisper_print_timings") or line.startswith("system_info") or line.startswith("main:"):
            continue
        if line.strip():
            text.append(line.strip())
    return " ".join(text).strip()

def main():
    if len(sys.argv) < 2:
        print("Usage: python3 scripts/hear.py <audio.wav> [model_path]")
        sys.exit(1)
    audio = sys.argv[1]
    model = sys.argv[2] if len(sys.argv) > 2 else WHISPER_MODEL
    transcript = hear(audio, model=model)
    print(transcript)

if __name__ == "__main__":
    main()
