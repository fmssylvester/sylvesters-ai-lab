#!/usr/bin/env python3
"""Find the best loop point by analyzing where energy matches between start and end."""
import subprocess
import numpy as np
from pathlib import Path

SRC = "/sdcard/Download/New Calypso Loop (BPM 93)- Loopsgospel - Loopsgospel (youtube).mp3"
OUT_DIR = Path("/data/data/com.termux/files/home/ai-lab-internal/loops")
OUT_DIR.mkdir(exist_ok=True)

# Get duration
result = subprocess.run([
    'ffprobe', '-v', 'error', '-show_entries', 'format=duration',
    '-of', 'default=noprint_wrappers=1:nokey=1', SRC
], capture_output=True, text=True)
duration = float(result.stdout.strip())
print(f"Source: {duration:.2f}s ({duration/60:.1f} min)")

# Extract full track as raw stereo float32
print("Loading full track...")
result = subprocess.run([
    'ffmpeg', '-i', SRC, '-f', 'f32le', '-acodec', 'pcm_f32le',
    '-ar', '44100', '-ac', '2', '-'
], capture_output=True)
raw = np.frombuffer(result.stdout, dtype=np.float32)
sr = 44100
channels = 2
stereo = raw.reshape(-1, channels)
total_samples = len(stereo)
print(f"Samples: {total_samples}")

# At 93 BPM, one bar = 4 * (60/93) = 2.5806s
bar_duration = 4 * (60 / 93)
beat_duration = 60 / 93

def get_segment(start_s, end_s):
    start_idx = int(start_s * sr)
    end_idx = int(end_s * sr)
    return stereo[start_idx:end_idx]

def rms(seg):
    return np.sqrt(np.mean(seg ** 2) + 1e-10)

# Step 1: Find the energy profile of the first 30 seconds
print("\nAnalyzing energy profile...")
# Check energy in 1-second windows
window_size = sr  # 1 second
n_windows = total_samples // window_size
energies = np.zeros(n_windows)
for i in range(n_windows):
    seg = stereo[i * window_size:(i + 1) * window_size]
    energies[i] = rms(seg)

# Step 2: Find potential loop points
# A good loop point is where:
# 1. The energy at the end of the segment matches the energy at the beginning
# 2. The spectral content matches
# 3. The waveform can be crossfaded smoothly

# Try different segment lengths (from 30s to 5min)
print("\nTesting different loop lengths...")
best_candidates = []

for seg_length_s in np.arange(30, 300, 5):  # 30s to 5min in 5s steps
    seg_length_samples = int(seg_length_s * sr)
    
    # For each possible cut point
    for cut_offset_s in np.arange(0.5, seg_length_s - 0.5, 0.5):  # Step by 0.5s
        cut_sample = int(cut_offset_s * sr)
        
        # The segment is: [cut_sample : cut_sample + seg_length_samples]
        # But we need to wrap around (for the loop)
        # Actually, for a loop, we want: segment = track[cut_sample : cut_sample + seg_length]
        # And when it loops, the end connects back to the beginning
        
        # Check if cut_sample + seg_length fits in the track
        if cut_sample + seg_length_samples > total_samples:
            continue
        
        # Energy at the cut point (end of segment)
        end_region_start = cut_sample + seg_length_samples - sr  # Last 1 second
        end_region_end = cut_sample + seg_length_samples
        end_energy = rms(stereo[end_region_start:end_region_end])
        
        # Energy at the start of the segment
        start_region_start = cut_sample
        start_region_end = cut_sample + sr  # First 1 second
        start_energy = rms(stereo[start_region_start:start_region_end])
        
        # How well do they match?
        energy_ratio = min(end_energy, start_energy) / (max(end_energy, start_energy) + 1e-10)
        
        if energy_ratio > 0.7:  # Good energy match
            # Also check spectral similarity
            end_seg = stereo[end_region_start:end_region_end].flatten()
            start_seg = stereo[start_region_start:start_region_end].flatten()
            
            # Simple spectral comparison via FFT
            end_fft = np.abs(np.fft.rfft(end_seg))
            start_fft = np.abs(np.fft.rfft(start_seg))
            
            # Normalize
            end_fft = end_fft / (np.max(end_fft) + 1e-10)
            start_fft = start_fft / (np.max(start_fft) + 1e-10)
            
            spectral_sim = 1.0 - np.mean(np.abs(end_fft[:min(len(end_fft), len(start_fft))] - start_fft[:min(len(end_fft), len(start_fft))]))
            
            score = energy_ratio * 0.5 + spectral_sim * 0.5
            
            best_candidates.append({
                'cut_time': cut_offset_s,
                'seg_length': seg_length_s,
                'end_time': (cut_sample + seg_length_samples) / sr,
                'energy_ratio': energy_ratio,
                'spectral_sim': spectral_sim,
                'score': score,
                'end_energy': end_energy,
                'start_energy': start_energy
            })

# Sort by score
best_candidates.sort(key=lambda x: x['score'], reverse=True)

print(f"\nFound {len(best_candidates)} candidates with energy ratio > 0.7")
print(f"\nTop 10 candidates:")
for i, c in enumerate(best_candidates[:10]):
    print(f"\n  {i+1}. Cut at {c['cut_time']:.1f}s, segment length {c['seg_length']:.0f}s")
    print(f"     End time: {c['end_time']:.1f}s ({c['end_time']/60:.1f} min)")
    print(f"     Energy ratio: {c['energy_ratio']:.4f}")
    print(f"     Spectral sim: {c['spectral_sim']:.4f}")
    print(f"     Score: {c['score']:.4f}")
    print(f"     End energy: {c['end_energy']:.6f}, Start energy: {c['start_energy']:.6f}")

# Also find the best single cut point (for a simple cut without crossfade)
print(f"\n\n{'='*60}")
print("Best cut points for SIMPLE CUT (no crossfade needed):")
print("="*60)

# For a simple cut, we need the end of the segment to naturally flow into the beginning
# This means finding a point where the music has a natural phrase boundary
# Check every bar boundary
bar_boundaries = np.arange(0, duration, bar_duration)
simple_candidates = []

for bar_idx, bar_time in enumerate(bar_boundaries):
    if bar_time < 10 or bar_time > duration - 10:
        continue
    
    sample_idx = int(bar_time * sr)
    
    # Check energy before and after this bar boundary
    before = stereo[max(0, sample_idx - sr):sample_idx]
    after = stereo[sample_idx:min(sample_idx + sr, total_samples)]
    
    if len(before) == 0 or len(after) == 0:
        continue
    
    before_rms = rms(before)
    after_rms = rms(after)
    
    # Check if there's a natural energy dip (phrase boundary)
    # Look at a wider window
    wide_before = stereo[max(0, sample_idx - 4*sr):sample_idx]
    wide_after = stereo[sample_idx:min(sample_idx + 4*sr, total_samples)]
    
    if len(wide_before) > 0 and len(wide_after) > 0:
        wide_before_rms = rms(wide_before)
        wide_after_rms = rms(wide_after)
        
        # Check for energy dip
        dip_ratio = (before_rms + after_rms) / (2 * max(wide_before_rms, wide_after_rms) + 1e-10)
        
        if dip_ratio < 0.9:  # There's some energy dip
            simple_candidates.append({
                'bar_time': bar_time,
                'bar_idx': bar_idx,
                'before_rms': before_rms,
                'after_rms': after_rms,
                'dip_ratio': dip_ratio,
                'energy_balance': min(before_rms, after_rms) / (max(before_rms, after_rms) + 1e-10)
            })

simple_candidates.sort(key=lambda x: x['dip_ratio'])

print(f"\nFound {len(simple_candidates)} bar boundaries with energy dips:")
for i, c in enumerate(simple_candidates[:15]):
    m = int(c['bar_time'] // 60)
    s = c['bar_time'] % 60
    print(f"  {i+1}. Bar {c['bar_idx']}, {m}:{s:05.2f} ({c['bar_time']:.1f}s) - "
          f"dip: {c['dip_ratio']:.4f}, balance: {c['energy_balance']:.4f}")

# Save results
import json
results = {
    'crossfade_candidates': [{
        'cut_time': c['cut_time'],
        'seg_length': c['seg_length'],
        'score': c['score']
    } for c in best_candidates[:20]],
    'simple_cut_candidates': [{
        'bar_time': c['bar_time'],
        'bar_idx': c['bar_idx'],
        'dip_ratio': c['dip_ratio'],
        'energy_balance': c['energy_balance']
    } for c in simple_candidates[:20]]
}

with open(OUT_DIR / "calypso_best_cuts.json", 'w') as f:
    json.dump(results, f, indent=2)

print(f"\nSaved to {OUT_DIR / 'calypso_best_cuts.json'}")
