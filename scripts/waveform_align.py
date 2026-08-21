#!/usr/bin/env python3
"""Waveform-level crossfade: find optimal alignment point between end and beginning."""
import subprocess
import numpy as np
from pathlib import Path

SRC = "/sdcard/Download/New Calypso Loop (BPM 93)- Loopsgospel - Loopsgospel (youtube).mp3"
OUT_DIR = Path("/data/data/com.termux/files/home/ai-lab-internal/loops")
OUT_DIR.mkdir(exist_ok=True)
OUT_WAV = OUT_DIR / "segment_wavealigned.wav"
OUT_MP3 = Path("/sdcard/Download/New Calypso Loop v2 (3m14s).mp3")

# Step 1: Extract segment as raw float32
print("Extracting segment (26:50 = 194.2s)...")
seg_wav = OUT_DIR / "seg_raw.wav"
subprocess.run([
    'ffmpeg', '-y', '-i', SRC, '-t', '194.2',
    '-c:a', 'pcm_s16le', '-ar', '44100', '-ac', '2',
    str(seg_wav)
], capture_output=True)

# Read as raw samples
result = subprocess.run([
    'ffmpeg', '-i', str(seg_wav), '-f', 'f32le', '-acodec', 'pcm_f32le', '-'
], capture_output=True)
raw = np.frombuffer(result.stdout, dtype=np.float32)
sr = 44100
channels = 2
samples_per_channel = len(raw) // channels
stereo = raw.reshape(-1, channels)

print(f"Segment: {samples_per_channel} samples ({samples_per_channel/sr:.2f}s)")

# Step 2: Find the best alignment point
# Strategy: slide the beginning of the segment against the end
# and find the offset that minimizes the waveform discontinuity

# Use a crossfade window of ~100ms (4410 samples)
crossfade_samples = 4410  # 100ms at 44100Hz
search_range = 2205  # Search ±50ms for alignment

print(f"Finding optimal alignment (searching ±{search_range} samples = ±{search_range/sr*1000:.0f}ms)...")

# Extract the tail (end of segment) and head (beginning of segment)
# We'll compare different overlap positions
best_score = float('inf')
best_offset = 0

# For each candidate offset, measure how well the tail matches the head
for offset in range(-search_range, search_range + 1, 10):  # Step by 10 samples for speed
    # The overlap region: tail[-crossfade_samples:] overlaps with head[:crossfade_samples]
    # With offset, we shift where the overlap starts
    
    # Tail samples (end of segment)
    tail_start = samples_per_channel - crossfade_samples + offset
    tail_end = samples_per_channel + offset
    
    # Head samples (beginning of segment)
    head_start = 0
    head_end = crossfade_samples
    
    if tail_start < 0 or tail_end > samples_per_channel:
        continue
    
    tail = stereo[max(0, tail_start):min(tail_end, samples_per_channel)]
    head = stereo[head_start:min(head_end, len(stereo))]
    
    min_len = min(len(tail), len(head))
    if min_len < 100:
        continue
    
    tail = tail[:min_len]
    head = head[:min_len]
    
    # Measure discontinuity: how different are the waveforms at the junction?
    # Use both amplitude matching and phase continuity
    diff = tail - head
    score = np.mean(diff ** 2)  # MSE
    
    # Also penalize large amplitude jumps
    tail_rms = np.sqrt(np.mean(tail ** 2) + 1e-10)
    head_rms = np.sqrt(np.mean(head ** 2) + 1e-10)
    amp_ratio = max(tail_rms, head_rms) / (min(tail_rms, head_rms) + 1e-10)
    score *= amp_ratio
    
    if score < best_score:
        best_score = score
        best_offset = offset

print(f"Best offset: {best_offset} samples ({best_offset/sr*1000:.1f}ms)")
print(f"Score: {best_score:.6f}")

# Step 3: Create the crossfaded output
print("Creating crossfaded segment...")

# Apply equal-power crossfade at the alignment point
# The crossfade region blends tail into head
fade_in = np.sin(np.linspace(0, np.pi/2, crossfade_samples))  # Equal-power fade in
fade_out = np.cos(np.linspace(0, np.pi/2, crossfade_samples))  # Equal-power fade out

# Build output
total_samples = samples_per_channel  # Keep same length
output = np.zeros((total_samples, channels), dtype=np.float32)

# Copy the non-crossfaded parts
# Before the crossfade: segment[0 : total_samples - crossfade_samples + offset]
copy_end = total_samples - crossfade_samples + best_offset
if copy_end > 0:
    output[:copy_end] = stereo[:copy_end]

# The crossfade region
crossfade_start = copy_end
crossfade_end = crossfade_start + crossfade_samples

if crossfade_end <= total_samples:
    # Tail region (fading out)
    tail_region_start = total_samples - crossfade_samples + best_offset
    tail_region = stereo[max(0, tail_region_start):tail_region_start + crossfade_samples]
    
    # Head region (fading in)
    head_region_start = crossfade_start
    head_region = stereo[head_region_start:head_region_start + crossfade_samples]
    
    min_len = min(len(tail_region), len(head_region), crossfade_samples)
    
    # Apply crossfade
    output[crossfade_start:crossfade_start + min_len] = (
        tail_region[:min_len] * fade_out[:min_len, np.newaxis] +
        head_region[:min_len] * fade_in[:min_len, np.newaxis]
    )
    
    # Copy remaining
    remaining_start = crossfade_end
    if remaining_start < total_samples:
        remaining_src = head_region_start + min_len
        remaining_len = total_samples - remaining_start
        remaining_end = min(remaining_src + remaining_len, len(stereo))
        actual_len = remaining_end - remaining_src
        if actual_len > 0 and remaining_start + actual_len <= total_samples:
            output[remaining_start:remaining_start + actual_len] = stereo[remaining_src:remaining_end]

# Convert back to int16 and write
output_int16 = (output * 32767).astype(np.int16)
output_bytes = output_int16.tobytes()

# Write WAV
import wave
with wave.open(str(OUT_WAV), 'w') as wav:
    wav.setnchannels(channels)
    wav.setsampwidth(2)
    wav.setframerate(sr)
    wav.writeframes(output_bytes)

print(f"Written: {OUT_WAV}")

# Step 4: Verify loop quality
print("\nVerifying loop quality...")
# Check the junction point - compare last few samples with first few samples
junction_region = 500  # 500 samples ≈ 11ms
tail_end = output[-junction_region:]
head_start_out = output[:junction_region]

# Measure discontinuity at the junction
discontinuity = np.abs(output[-1] - output[0])
print(f"Sample discontinuity at junction: {discontinuity}")

# Check RMS continuity
tail_rms = np.sqrt(np.mean(output[-4410:] ** 2))
head_rms = np.sqrt(np.mean(output[:4410] ** 2))
print(f"Tail RMS: {tail_rms:.6f}, Head RMS: {head_rms:.6f}")
print(f"RMS ratio: {max(tail_rms, head_rms) / (min(tail_rms, head_rms) + 1e-10):.4f}")

# Step 5: Tile to 2 hours
print("\nTiling to 2 hours...")
subprocess.run([
    'ffmpeg', '-y', '-stream_loop', '-1', '-i', str(OUT_WAV),
    '-t', '7200', '-c:a', 'libmp3lame', '-b:a', '192k',
    str(OUT_MP3)
], capture_output=True)

# Verify
result = subprocess.run([
    'ffprobe', '-v', 'error', '-show_entries', 'format=duration',
    '-of', 'default=noprint_wrappers=1:nokey=1', str(OUT_MP3)
], capture_output=True, text=True)
duration = float(result.stdout.strip())
print(f"Output: {OUT_MP3}")
print(f"Duration: {duration:.2f}s ({duration/3600:.2f} hours)")

# Cleanup
seg_wav.unlink(missing_ok=True)
(OUT_DIR / "seg_raw.wav").unlink(missing_ok=True)

print("\nDone! Listen to the loop point at ~3:14.")
