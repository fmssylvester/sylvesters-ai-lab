import sys
import os
import subprocess
import json
import urllib.request

PIPER_VOICE = os.path.expanduser("~/piper-voices/en_US-ryan-medium.onnx")

def _to_abs(path):
    return os.path.abspath(os.path.expanduser(path))

def speak_piper(text, output_path):
    """Primary: fully offline, unlimited, no API key needed.

    Piper runs inside a glibc Ubuntu chroot (proot-distro) because
    onnxruntime has no Termux/Android wheel. The voice model and the
    output file live on the shared Android filesystem, so the absolute
    path passed to Piper resolves identically inside and outside the chroot.
    """
    try:
        abs_out = _to_abs(output_path)
        os.makedirs(os.path.dirname(abs_out), exist_ok=True)
        cmd = [
            "proot-distro", "login", "ubuntu", "--",
            "piper", "--model", _to_abs(PIPER_VOICE),
            "--output_file", abs_out,
        ]
        result = subprocess.run(
            cmd,
            input=text.encode("utf-8"),
            capture_output=True,
            timeout=120,
        )
        if result.returncode == 0 and os.path.exists(abs_out):
            return abs_out
        return None
    except Exception:
        return None

def speak_ttsai(text, output_path):
    """Fallback: TTS.ai free API using Kokoro model."""
    try:
        payload = {
            "model": "kokoro",
            "input": text,
            "voice": "af_bella"
        }
        req = urllib.request.Request(
            "https://api.tts.ai/v1/audio/speech",
            data=json.dumps(payload).encode(),
            headers={"Content-Type": "application/json"}
        )
        with urllib.request.urlopen(req, timeout=30) as resp:
            audio_data = resp.read()
        with open(output_path, "wb") as f:
            f.write(audio_data)
        return output_path
    except Exception:
        return None

def main():
    if len(sys.argv) < 3:
        print("Usage: python3 scripts/tts.py '<text>' <output.wav>")
        sys.exit(1)

    text = sys.argv[1]
    output_path = sys.argv[2]

    for name, fn in [("piper", speak_piper), ("ttsai", speak_ttsai)]:
        result = fn(text, output_path)
        if result:
            print(f"[{name}] saved to {output_path}")
            return

    print("All TTS backends failed.")

if __name__ == "__main__":
    main()
