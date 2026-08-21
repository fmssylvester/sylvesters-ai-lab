#!/usr/bin/env python3
"""Simple: find where the end waveform matches the start waveform."""
import subprocess
import numpy as np
from pathlib import Path

SRC = "/sdcard/Download/New Calypso Loop (BPM 93)- Loopsgospel - Loopsgospel (youtube).mp3"
OUT_DIR = Path("/data/data/com.termux/files/home/ai-lab-internal/loops")
OUT_DIR.mkdir(exist_ok=True)

# Extract full track
print("Loading track...")
result = subprocess.run([
    'ffmpeg', '-i', SRC, '-f', 'f32le', '-acodec', 'pcm_f32le',
    '-ar', '44100', '-ac', '1', '-'
], capture_output=True)
y = np.frombuffer(result.stdout, dtype=np.float32)
sr = 44100
print(f"Samples: {len(y)}, Duration: {len(y)/sr:.1f}s")

# At 93 BPM: 1 bar = 2.5806s, 8 bars = 20.645s
bar = 2.5806
phrase = bar * 8  # 20.645s

# The segment we want is ~194.2s (3:14)
target_length = 194.2
target_samples = int(target_length * sr)

# Strategy: slide the segment along the track and find where
# the END waveform best matches the START waveform
# This tells us the optimal cut point for a seamless loop

print(f"\nSearching for best alignment (segment length: {target_length:.1f}s)...")
print("Comparing end waveform to start waveform at different offsets...")

best_score = float('inf')
best_offset = 0

# The segment starts at some offset from the track beginning
# Try offsets from 0 to (duration - target_length)
# But we want the segment to LOOP, so we check if end matches start
step = int(0.1 * sr)  # Step by 100ms for speed
search_range = min(len(y) - target_samples, int(180 * sr))  # Search up to 3 minutes

for offset in range(0, search_range, step):
    # Segment would be: y[offset : offset + target_samples]
    # Check if end matches start
    
    # Get last 100ms of segment
    end_start = offset + target_samples - int(0.1 * sr)
    end_end = offset + target_samples
    if end_end > len(y):
        continue
    
    # Get first 100ms of segment
    start_start = offset
    start_end = offset + int(0.1 * sr)
    
    tail = y[end_start:end_end]
    head = y[start_start:start_end]
    
    if len(tail) < 1000 or len(head) < 1000:
        continue
    
    # Measure waveform similarity
    # Align by zero-crossing
    tail_zeros = np.where(np.abs(np.diff(np.sign(tail))))[0]
    head_zeros = np.where(np.abs(np.diff(np.sign(head))))[0]
    
    if len(tail_zeros) == 0 or len(head_zeros) == 0:
        continue
    
    # Use the first zero crossing as alignment point
    tail_align = tail_zeros[0]
    head_align = head_zeros[0]
    
    # Compare waveforms after alignment
    min_len = min(len(tail) - tail_align, len(head) - head_align, 2000)
    if min_len < 100:
        continue
    
    tail_aligned = tail[tail_align:tail_align + min_len]
    head_aligned = head[head_align:head_align + min_len]
    
    # Normalize and compare
    tail_norm = tail_aligned / (np.max(np.abs(tail_aligned)) + 1e-10)
    head_norm = head_aligned / (np.max(np.abs(head_aligned)) + 1e-10)
    
    diff = np.mean((tail_norm - head_norm) ** 2)
    
    # Also check energy match
    tail_energy = np.sqrt(np.mean(tail ** 2) + 1e-10)
    head_energy = np.sqrt(np.mean(head ** 2) + 1e-10)
    energy_ratio = min(tail_energy, head_energy) / (max(tail_energy, head_energy) + 1e-10)
    
    score = diff / (energy_ratio + 0.01)
    
    if score < best_score:
        best_score = score
        best_offset = offset

print(f"\nBest offset: {best_offset} samples ({best_offset/sr:.2f}s)")
print(f"Segment start: {best_offset/sr:.2f}s")
print(f"Segment end: {(best_offset + target_samples)/sr:.2f}s")

# Now create the loop at this offset
print(f"\nCreating loop from {best_offset/sr:.2f}s to {(best_offset + target_samples)/sr:.2f}s...")

# Extract segment
seg_start = best_offset
seg_end = best_offset + target_samples
segment = y[seg_start:seg_end]

# Find zero-crossing near the junction for smooth cut
# Look at last 1000 samples and first 1000 samples
junction_range = 1000
tail_region = segment[-junction_range:]
head_region = segment[:junction_range]

# Find best cut point (zero crossing with smallest discontinuity)
best_cut = 0
best_discontinuity = float('inf')

for i in range(100, junction_range - 100):
    # Check if cutting at position i creates a smooth transition
    # The cut point is at segment[-i], which becomes the new end
    # Then segment[:i] becomes the new beginning (for the loop)
    
    tail_val = segment[-i]
    head_val = segment[i]
    
    discontinuity = abs(tail_val - head_val)
    
    # Also check derivative continuity
    if i > 0 and i < len(segment) - 1:
        tail_deriv = segment[-i] - segment[-i-1]
        head_deriv = segment[i] - segment[i-1]
        deriv_diff = abs(tail_deriv - head_deriv)
        discontinuity += deriv_diff * 0.1
    
    if discontinuity < best_discontinuity:
        best_discontinuity = discontinuity
        best_cut = i

print(f"Optimal cut point: {-best_cut} samples from end ({best_cut/sr*1000:.1f}ms)")

# Apply the cut
# New segment: [0 : -best_cut] + [best_cut : ]
# But we want to keep the same total length
# So we take: segment[best_cut:] + segment[:best_cut]
# No wait, that's not right. Let me think...

# For a loop, we want:
# Original: segment[0 : L]
# After cut: segment[cut:] + segment[:cut] (rotated)
# The new segment should be the same length

cut_pos = best_cut
new_segment = np.concatenate([segment[cut_pos:], segment[:cut_pos]])

print(f"New segment length: {len(new_segment)/sr:.2f}s")

# Verify the junction
junction_check = 1000
print(f"\nJunction verification:")
print(f"  Last sample: {new_segment[-1]:.6f}")
print(f"  First sample: {new_segment[0]:.6f}")
print(f"  Discontinuity: {abs(new_segment[-1] - new_segment[0]):.6f}")

# Write to WAV
import wave
output_int16 = (new_segment * 32767).astype(np.int16)
output_bytes = output_int16.tobytes()

out_wav = OUT_DIR / "calypso_v3_segment.wav"
with wave.open(str(out_wav), 'w') as wav:
    wav.setnchannels(1)
    wav.setsampwidth(2)
    wav.setframerate(sr)
    wav.writeframes(output_bytes)

print(f"\nSegment saved: {out_wav}")

# Tile to 2 hours
print("Tiling to 2 hours...")
out_mp3 = Path("/sdcard/Download/New Calypso Loop v3.mp3")
subprocess.run([
    'ffmpeg', '-y', '-stream_loop', '-1', '-i', str(out_wav),
    '-t', '7200', '-c:a', 'libmp3lame', '-b:a', '192k',
    str(out_mp3)
], capture_output=True)

result = subprocess.run([
    'ffprobe', '-v', 'error', '-show_entries', 'format=duration',
    '-of', 'default=noprint_wrappers=1:nokey=1', str(out_mp3)
], capture_output=True, text=True)
duration = float(result.stdout.strip())
print(f"Output: {out_mp3}")
print(f"Duration: {duration:.2f}s ({duration/3600:.2f} hours)")

print("\nDone! Listen to the loop point.")
