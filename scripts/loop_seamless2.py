#!/usr/bin/env python3
"""Seamless loop: trim silence, aloop (sample-level seamless), fade out."""
import subprocess
import sys
import os

INPUT = "/sdcard/Download/New Calypso Loop (BPM 93)- Loopsgospel - Loopsgospel (youtube).mp3"
OUTPUT = "/sdcard/Download/New Calypso Loop 2Hours.mp3"
TMP = "/data/data/com.termux/files/home/ai-lab-internal/out/tmp_loop.wav"
SR = 44100
DURATION = 7200

# Step 1: Trim silence + decode to WAV
print("Trimming...")
sys.stdout.flush()
subprocess.run([
    "ffmpeg", "-y", "-i", INPUT,
    "-t", "1801.97",
    "-ar", str(SR), "-ac", "1", "-f", "wav", TMP
], check=True, capture_output=True)

# Step 2: aloop (seamless at sample level) + trim to 2h + fade out
print("Looping to 2 hours...")
sys.stdout.flush()
subprocess.run([
    "ffmpeg", "-y", "-i", TMP,
    "-filter_complex", f"[0:a]aloop=loop=-1:size=2e+09[looped];"
                       f"[looped]atrim=0:{DURATION},afade=t=out:st={DURATION-5}:d=5[out]",
    "-map", "[out]",
    "-codec:a", "libmp3lame", "-b:a", "192k",
    OUTPUT
], check=True, capture_output=True)

os.remove(TMP)

r = subprocess.run([
    "ffprobe", "-v", "error",
    "-show_entries", "format=duration",
    "-of", "csv=p=0", OUTPUT
], capture_output=True, text=True)
print(f"Done! {float(r.stdout.strip()):.1f}s")
print(f"File: {OUTPUT}")
