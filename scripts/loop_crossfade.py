#!/usr/bin/env python3
"""Seamless Calypso loop: crossfade end→beginning, tile to 2h."""
import subprocess, sys, os
import wave
import numpy as np

SR = 44100
INPUT = "/sdcard/Download/New Calypso Loop (BPM 93)- Loopsgospel - Loopsgospel (youtube).mp3"
OUTPUT = "/sdcard/Download/New Calypso Loop 2Hours.mp3"
CROSSFADE_SEC = 4

print("1. Decode trimmed audio to raw PCM...")
sys.stdout.flush()
trimmed_pcm = "/data/data/com.termux/files/home/ai-lab-internal/out/trimmed.pcm"
subprocess.run([
    "ffmpeg", "-y", "-i", INPUT, "-t", "1801.97",
    "-ar", str(SR), "-ac", "1", "-f", "s16le", "-acodec", "pcm_s16le",
    trimmed_pcm
], check=True, capture_output=True)

file_size = os.path.getsize(trimmed_pcm)
total_samples = file_size // 2
print(f"   {total_samples} samples ({total_samples/SR:.2f}s)")

cf = int(CROSSFADE_SEC * SR)
print(f"2. Read crossfade regions ({CROSSFADE_SEC}s each)...")

with open(trimmed_pcm, "rb") as f:
    f.seek(file_size - cf * 2)
    end_region = np.frombuffer(f.read(cf * 2), dtype=np.int16).astype(np.float32) / 32768.0
    f.seek(0)
    start_region = np.frombuffer(f.read(cf * 2), dtype=np.int16).astype(np.float32) / 32768.0

fade_out = np.linspace(1.0, 0.0, cf, dtype=np.float32)
fade_in = np.linspace(0.0, 1.0, cf, dtype=np.float32)
blended = end_region * fade_out + start_region * fade_in
blended_int = (blended * 32767).clip(-32767, 32767).astype(np.int16)

print("3. Build seamless period WAV...")
seamless_wav = "/data/data/com.termux/files/home/ai-lab-internal/out/seamless_period.wav"
middle_start = cf
middle_end = total_samples - cf

with wave.open(seamless_wav, 'w') as wf:
    wf.setnchannels(1)
    wf.setsampwidth(2)
    wf.setframerate(SR)

    with open(trimmed_pcm, "rb") as f:
        f.seek(middle_start * 2)
        remaining = middle_end - middle_start
        chunk = 1024 * 1024
        while remaining > 0:
            to_read = min(chunk, remaining * 2)
            data = f.read(to_read)
            if not data:
                break
            wf.writeframes(data)
            remaining -= len(data) // 2

    wf.writeframes(blended_int.tobytes())

seamless_samples = middle_end - middle_start + cf
print(f"   Seamless period: {seamless_samples/SR:.2f}s")

print("4. Loop to 2 hours...")
n_copies = int(np.ceil(7200 * SR / seamless_samples))

subprocess.run([
    "ffmpeg", "-y",
    "-stream_loop", str(n_copies),
    "-i", seamless_wav,
    "-t", "7200",
    "-af", "afade=t=out:st=7195:d=5",
    "-codec:a", "libmp3lame", "-b:a", "192k",
    OUTPUT
], check=True, capture_output=True)

os.remove(trimmed_pcm)
os.remove(seamless_wav)

r = subprocess.run([
    "ffprobe", "-v", "error", "-show_entries", "format=duration",
    "-of", "csv=p=0", OUTPUT
], capture_output=True, text=True)
print(f"Done! {float(r.stdout.strip()):.1f}s → {OUTPUT}")
