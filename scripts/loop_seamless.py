#!/usr/bin/env python3
"""Seamless loop: trim silence, crossfade copies, extend to 2 hours."""
import subprocess
import numpy as np
import wave
import os
import sys

SR = 44100
TRIMMED = "/data/data/com.termux/files/home/ai-lab-internal/out/calypso_trimmed.mp3"
WAV_TMP = "/data/data/com.termux/files/home/ai-lab-internal/out/calypso_temp.wav"
OUTPUT = "/sdcard/Download/New Calypso Loop 2Hours.mp3"
DURATION = 2 * 3600
CROSSFADE_SEC = 3  # 3-second crossfade at loop point

print("Step 1: Decode trimmed file to WAV...")
sys.stdout.flush()
subprocess.run([
    "ffmpeg", "-y", "-i", TRIMMED,
    "-ar", str(SR), "-ac", "1", "-f", "wav", WAV_TMP
], capture_output=True)

print("Step 2: Load WAV...")
sys.stdout.flush()
with wave.open(WAV_TMP, 'r') as wf:
    n_frames = wf.getnframes()
    raw = wf.readframes(n_frames)
    audio = np.frombuffer(raw, dtype=np.int16).astype(np.float64) / 32767.0

print(f"   Loaded {len(audio)} samples ({len(audio)/SR:.2f}s)")
sys.stdout.flush()

# Crossfade: take end of one copy and beginning of next, blend them
cf_samples = int(CROSSFADE_SEC * SR)
fade_out = np.linspace(1, 0, cf_samples)
fade_in = np.linspace(0, 1, cf_samples)

# One period = original - crossfade overlap
# The crossfade region is shared between end of copy N and start of copy N+1
period_samples = len(audio) - cf_samples

print(f"Step 3: Build seamless period ({period_samples/SR:.2f}s, crossfade {CROSSFADE_SEC}s)...")
sys.stdout.flush()

# Build one seamless period: original audio with crossfade region blended
# Crossfade: blend last cf_samples of one copy with first cf_samples of next
crossfade_region = audio[-cf_samples:] * fade_out + audio[:cf_samples] * fade_in
# Middle part: everything except the crossfade regions
middle = audio[cf_samples:-cf_samples]
seamless_period = np.concatenate([middle, crossfade_region])

print(f"   Seamless period: {len(seamless_period)/SR:.2f}s")
sys.stdout.flush()

# Tile to fill 2 hours
total_needed = int(DURATION * SR)
n_copies = int(np.ceil(total_needed / len(seamless_period)))
full = np.tile(seamless_period, n_copies)[:total_needed]

# Fade out last 5 seconds
fade_out_5s = np.linspace(1, 0, int(5 * SR))
full[-int(5*SR):] *= fade_out_5s

# Normalize
peak = np.max(np.abs(full))
if peak > 0:
    full = full / peak * 0.9

print(f"Step 4: Write output ({len(full)/SR:.1f}s)...")
sys.stdout.flush()

# Write WAV then convert to MP3
out_wav = "/data/data/com.termux/files/home/ai-lab-internal/out/calypso_final.wav"
full_int = (full * 32767).clip(-32767, 32767).astype(np.int16)
with wave.open(out_wav, 'w') as wf:
    wf.setnchannels(1)
    wf.setsampwidth(2)
    wf.setframerate(SR)
    wf.writeframes(full_int.tobytes())

print("Step 5: Convert to MP3...")
sys.stdout.flush()
subprocess.run([
    "ffmpeg", "-y", "-i", out_wav,
    "-codec:a", "libmp3lame", "-b:a", "192k",
    OUTPUT
], capture_output=True)

# Clean up
os.remove(WAV_TMP)
os.remove(out_wav)

# Verify
result = subprocess.run([
    "ffprobe", "-v", "error",
    "-show_entries", "format=duration",
    "-of", "csv=p=0", OUTPUT
], capture_output=True, text=True)
print(f"Done! Duration: {float(result.stdout.strip()):.1f}s")
print(f"File: {OUTPUT}")
