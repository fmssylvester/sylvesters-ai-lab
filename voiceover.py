import os, sys, subprocess, tempfile, json, re
from pathlib import Path

VOICE_PRESETS = {
    "Narrator (US Male)":     "en-US-ChristopherNeural",
    "Narrator (US Female)":   "en-US-JennyNeural",
    "Storyteller (UK Male)":  "en-GB-RyanNeural",
    "Storyteller (UK Female)":"en-GB-SoniaNeural",
    "Warm (AU Female)":       "en-AU-NatashaNeural",
    "Calm (US Female)":       "en-US-AriaNeural",
    "Deep (US Male)":         "en-US-GuyNeural",
    "Youthful (US Female)":   "en-US-AnaNeural",
    "Energetic (US Male)":    "en-US-DavisNeural",
    "Elegant (UK Female)":    "en-GB-LibbyNeural",
}
_PITCH_ALIAS = {"x-low": "-12", "low": "-6", "medium": "+0", "high": "+6", "x-high": "+12"}

def list_voices():
    try:
        import edge_tts
        return sorted(set(v["ShortName"] for v in edge_tts.list_voices()))
    except Exception:
        return list(VOICE_PRESETS.keys())


def generate(text: str, voice: str = "en-US-ChristopherNeural",
             pitch: str = "medium", rate: str = "medium",
             output_path: str = None) -> str:
    if output_path is None:
        output_path = os.path.join(tempfile.gettempdir(), f"voiceover_{abs(hash(text))}.mp3")
    os.makedirs(os.path.dirname(output_path) or ".", exist_ok=True)
    pitch_hz = _PITCH_ALIAS.get(pitch, "+0")
    rate_pct = {"x-slow": "-50", "slow": "-25", "medium": "+0", "fast": "+25", "x-fast": "+50"}.get(rate, "+0")
    ssml = (
        f'<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="en-US">'
        f'<voice name="{voice}">'
        f'<prosody pitch="{pitch_hz}Hz" rate="{rate_pct}%">'
        f'{_escape_ssml(text)}'
        f'</prosody></voice></speak>'
    )
    import edge_tts
    subprocess.run(
        [sys.executable, "-m", "edge_tts", "--voice", voice, "--text", text, "--write-media", output_path],
        capture_output=True, check=True
    )
    if not os.path.exists(output_path):
        raise RuntimeError("edge-tts produced no output")
    return output_path


def _escape_ssml(text: str) -> str:
    text = text.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")
    text = text.replace('"', "&quot;").replace("'", "&apos;")
    return text


def combine(video_path: str, audio_path: str, output_path: str = None,
            volume: float = 1.0, mix: bool = True) -> str:
    if output_path is None:
        out_dir = os.path.dirname(video_path) or "."
        stem = Path(video_path).stem
        output_path = os.path.join(out_dir, f"{stem}_voiced.mp4")
    if mix:
        cmd = [
            "ffmpeg", "-y",
            "-i", video_path,
            "-i", audio_path,
            "-c:v", "copy",
            "-c:a", "aac",
            "-map", "0:v:0",
            "-map", "1:a:0",
            "-shortest",
            "-af", f"volume={volume}",
            output_path
        ]
    else:
        cmd = [
            "ffmpeg", "-y",
            "-i", video_path,
            "-i", audio_path,
            "-c:v", "copy",
            "-c:a", "aac",
            "-map", "0:v:0",
            "-map", "1:a:0",
            "-shortest",
            output_path
        ]
    subprocess.run(cmd, capture_output=True, check=True)
    if not os.path.exists(output_path):
        raise RuntimeError("ffmpeg combine produced no output")
    return output_path


def strip_audio(video_path: str, output_path: str = None) -> str:
    if output_path is None:
        out_dir = os.path.dirname(video_path) or "."
        stem = Path(video_path).stem
        output_path = os.path.join(out_dir, f"{stem}_muted.mp4")
    subprocess.run([
        "ffmpeg", "-y", "-i", video_path,
        "-c:v", "copy", "-an", output_path
    ], capture_output=True, check=True)
    return output_path


if __name__ == "__main__":
    import sys
    text = sys.argv[1] if len(sys.argv) > 1 else "Hello, this is a test voiceover."
    voice = sys.argv[2] if len(sys.argv) > 2 else "en-US-ChristopherNeural"
    out = generate(text, voice=voice)
    print(f"Generated: {out}")
