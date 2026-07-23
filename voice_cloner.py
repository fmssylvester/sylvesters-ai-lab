import os, sys, tempfile, json, subprocess, shutil
from pathlib import Path

TTS_VENV_PYTHON = None
_venv_candidates = [
    "/teamspace/studios/this_studio/.tts_venv/bin/python",
    os.path.expanduser("~/.tts_venv/bin/python"),
]

BACKENDS = {"edge_tts": True}

def _find_tts_python():
    global TTS_VENV_PYTHON
    if TTS_VENV_PYTHON:
        return TTS_VENV_PYTHON
    for p in _venv_candidates:
        if os.path.isfile(p):
            TTS_VENV_PYTHON = p
            return p
    return None

def _check_coqui():
    if "coqui" in BACKENDS:
        return BACKENDS["coqui"]
    try:
        import TTS
        BACKENDS["coqui"] = True
        return True
    except Exception:
        pass
    py = _find_tts_python()
    if py:
        try:
            r = subprocess.run([py, "-c", "from TTS.api import TTS; print('ok')"],
                               capture_output=True, text=True, timeout=15)
            BACKENDS["coqui"] = r.returncode == 0 and "ok" in r.stdout
            return BACKENDS["coqui"]
        except Exception:
            pass
    BACKENDS["coqui"] = False
    return False

def list_backends():
    backends = []
    if _check_coqui():
        backends.append("coqui-xtts")
    backends.append("edge-tts")
    return backends

LANGUAGES = {
    "en": "English", "zh-cn": "Chinese (Simplified)", "ja": "Japanese",
    "ko": "Korean", "fr": "French", "de": "German",
    "it": "Italian", "es": "Spanish", "pt": "Portuguese",
    "pl": "Polish", "tr": "Turkish", "ru": "Russian",
    "nl": "Dutch", "ar": "Arabic", "cs": "Czech",
    "hi": "Hindi", "hu": "Hungarian", "vi": "Vietnamese",
}

def clone_voice(text: str, reference_audio: str,
                backend: str = "coqui-xtts",
                language: str = "en",
                output_path: str = None,
                edge_voice: str = "en-US-ChristopherNeural",
                progress=None) -> str:
    _prog = progress or _noop

    if not reference_audio or not os.path.exists(reference_audio):
        print(f"No reference audio — falling back to edge-tts ({edge_voice})")
        from voiceover import generate
        return generate(text, voice=edge_voice, output_path=output_path)

    if output_path is None:
        stem = "".join(c for c in text[:20] if c.isalnum() or c in " -_").strip() or "clone"
        output_path = os.path.join(tempfile.gettempdir(), f"{stem}_{int(time.time())}.wav")
    os.makedirs(os.path.dirname(output_path) or ".", exist_ok=True)

    if backend == "coqui-xtts":
        try:
            return _coqui_xtts(text, reference_audio, language, output_path, _prog)
        except Exception as e:
            print(f"Coqui XTTS failed ({e}) — falling back to edge-tts")

    from voiceover import generate
    return generate(text, voice=edge_voice, output_path=output_path)

def _coqui_xtts(text, ref_audio, language, output_path, prog):
    prog(desc="Loading Coqui XTTS v2 (first run downloads ~1.8GB model)...")
    py = _find_tts_python()
    if py:
        return _subprocess_tts(text, ref_audio, language, output_path, py, prog)
    from TTS.api import TTS
    prog(desc="Generating cloned voice...")
    tts = TTS("tts_models/multilingual/multi-dataset/xtts_v2",
              gpu=os.path.exists("/usr/local/cuda"))
    tts.tts_to_file(
        text=text,
        speaker_wav=ref_audio,
        language=language if language in LANGUAGES else "en",
        file_path=output_path,
    )
    if not os.path.exists(output_path):
        raise RuntimeError("Coqui TTS produced no output")
    return output_path

def _subprocess_tts(text, ref_audio, language, output_path, python_bin, prog):
    script = f"""
import sys, json
sys.path.insert(0, '{os.path.dirname(output_path)}')
from TTS.api import TTS
print("[TTS] Loading model...", flush=True)
tts = TTS("tts_models/multilingual/multi-dataset/xtts_v2",
          gpu={str(os.path.exists('/usr/local/cuda')).lower()})
print("[TTS] Generating...", flush=True)
tts.tts_to_file(
    text={json.dumps(text)},
    speaker_wav={json.dumps(ref_audio)},
    language={json.dumps(language if language in LANGUAGES else 'en')},
    file_path={json.dumps(output_path)},
)
print("[TTS] Done", flush=True)
"""
    result = subprocess.run(
        [python_bin, "-c", script],
        capture_output=True, text=True, timeout=600,
    )
    out = result.stdout
    err = result.stderr
    if "[TTS] Done" in out and os.path.exists(output_path):
        return output_path
    raise RuntimeError(f"TTS subprocess failed: {err[-300:]}")
    return output_path

def _noop(*args, **kwargs):
    pass

if __name__ == "__main__":
    import sys
    text = sys.argv[1] if len(sys.argv) > 1 else "Hello, this is a cloned voice."
    ref = sys.argv[2] if len(sys.argv) > 2 else None
    out = clone_voice(text, ref)
    print(f"Output: {out}")
