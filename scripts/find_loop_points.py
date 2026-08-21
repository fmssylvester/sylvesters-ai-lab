#!/usr/bin/env python3
"""Find natural loop points mid-track for Calypso."""
import numpy as np
from pathlib import Path

try:
    import librosa
    import soundfile as sf
except ImportError:
    import subprocess, sys
    subprocess.check_call([sys.executable, '-m', 'pip', 'install', 'librosa', 'soundfile', '-q'])
    import librosa
    import soundfile as sf

SRC = "/sdcard/Music/New Calypso Loop (BPM 93)- Loopsgospel - Loopsgospel (youtube).mp3"
OUT_DIR = Path("/data/data/com.termux/files/home/ai-lab-internal/loops")
OUT_DIR.mkdir(exist_ok=True)

print("Loading Calypso...")
y, sr = librosa.load(SRC, sr=22050, mono=False)
if y.ndim == 2:
    y = librosa.to_mono(y)
duration = len(y) / sr
print(f"Duration: {duration:.2f}s ({duration/60:.1f} min)")

# ---- Find low-energy points (phrase boundaries) ----
print("\nFinding phrase boundaries (low energy regions)...")
frame_len = 2048
hop = 512
rms = librosa.feature.rms(y=y, frame_length=frame_len, hop_length=hop)[0]
times = librosa.frames_to_time(np.arange(len(rms)), sr=sr, hop_length=hop)

# Convert RMS to dB
rms_db = librosa.amplitude_to_db(rms, ref=np.max)

# Find frames where energy is low (below -30dB) - potential phrase endings
threshold_db = -30
low_energy_mask = rms_db < threshold_db
low_energy_times = times[low_energy_mask]

# Find clusters of low energy (sustained quiet = phrase boundary)
if len(low_energy_times) > 0:
    # Group consecutive low-energy frames into regions
    gaps = np.diff(low_energy_times)
    split_points = np.where(gaps > 0.5)[0]  # 0.5s gap between regions
    
    regions = []
    start_idx = 0
    for sp in split_points:
        region = low_energy_times[start_idx:sp+1]
        if len(region) > 0:
            regions.append((region[0], region[-1]))
        start_idx = sp + 1
    # Last region
    region = low_energy_times[start_idx:]
    if len(region) > 0:
        regions.append((region[0], region[-1]))
    
    print(f"Found {len(regions)} low-energy regions:")
    for i, (start, end) in enumerate(regions):
        print(f"  Region {i+1}: {start:.2f}s - {end:.2f}s (duration: {end-start:.2f}s)")

# ---- Find zero crossings at low-energy points ----
print("\nFinding zero crossings near low-energy regions...")
# Work with original sr for precision
y_mono = y

# Convert low-energy times to sample indices
low_energy_regions_samples = []
for start, end in regions:
    start_sample = int(start * sr)
    end_sample = int(end * sr)
    low_energy_regions_samples.append((start_sample, end_sample))

# Find zero crossings in these regions
zero_crossings = []
for start_s, end_s in low_energy_regions_samples:
    segment = y_mono[start_s:end_s]
    if len(segment) == 0:
        continue
    # Find zero crossings
    signs = np.sign(segment)
    crossings = np.where(np.diff(signs))[0] + start_s
    zero_crossings.extend(crossings.tolist())

print(f"Found {len(zero_crossings)} zero crossings in low-energy regions")

# ---- Evaluate potential loop points ----
print("\nEvaluating loop candidates (ms precision)...")

def get_segment(start_s, end_s):
    start_sample = int(start_s * sr)
    end_sample = int(end_s * sr)
    return y_mono[start_sample:end_sample]

def measure_loop_quality(end_time, start_time):
    """How well does start_time follow end_time?"""
    end_seg = get_segment(end_time - 0.1, end_time)  # 100ms before end point
    start_seg = get_segment(start_time, start_time + 0.1)  # 100ms after start point
    
    if len(end_seg) < 1000 or len(start_seg) < 1000:
        return -1, 0, 0
    
    # Energy match
    end_energy = np.sqrt(np.mean(end_seg**2))
    start_energy = np.sqrt(np.mean(start_seg**2))
    energy_ratio = min(end_energy, start_energy) / (max(end_energy, start_energy) + 1e-10)
    
    # Phase continuity (sign match at boundary)
    end_sign = np.sign(end_seg[-100:]).mean()
    start_sign = np.sign(start_seg[:100]).mean()
    phase_match = 1.0 - abs(end_sign - start_sign) / 2
    
    # Spectral continuity (compare frequency content)
    end_fft = np.abs(np.fft.rfft(end_seg))
    start_fft = np.abs(np.fft.rfft(start_seg))
    # Normalize
    end_fft = end_fft / (np.max(end_fft) + 1e-10)
    start_fft = start_fft / (np.max(start_fft) + 1e-10)
    spectral_match = 1.0 - np.mean(np.abs(end_fft[:min(len(end_fft), len(start_fft))] - start_fft[:min(len(end_fft), len(start_fft))]))
    
    # Overall quality (weighted)
    quality = (energy_ratio * 0.3 + phase_match * 0.3 + spectral_match * 0.4)
    
    return quality, energy_ratio, spectral_match

# Generate candidate pairs: end_point somewhere in middle, start_point slightly after
candidates = []

# Also try the "resolve" approach: find where the music has a sustained chord/pause
# and use that as both end and start (with small gap)
for region_start, region_end in regions:
    region_duration = region_end - region_start
    if region_duration > 0.3:  # At least 300ms of quiet
        # Try different points within the region as potential loop points
        for offset in np.arange(0, min(region_duration, 2.0), 0.05):
            candidate_end = region_start + offset
            # Look for start point after the quiet region
            for next_offset in np.arange(0.0, 0.5, 0.05):
                candidate_start = region_end + next_offset
                if candidate_start < duration - 1:
                    quality, energy_ratio, spectral_match = measure_loop_quality(candidate_end, candidate_start)
                    if quality > 0.3:
                        candidates.append({
                            'end_time': candidate_end,
                            'start_time': candidate_start,
                            'quality': quality,
                            'energy_ratio': energy_ratio,
                            'spectral_match': spectral_match,
                            'region': (region_start, region_end)
                        })

# Also try autocorrelation-based approach: find where a section repeats
print("Checking for repeating sections...")
# Check 4-bar phrases (about 10.3s at 93 BPM)
bar_duration = 60 / 93 * 4  # 4 bars
phrase_duration = bar_duration * 2  # 8 bars

# Sample at different offsets and check similarity
acorr_candidates = []
test_offsets = np.arange(0, duration - phrase_duration - 10, 1.0)  # Every 1 second
for offset in test_offsets:
    seg1 = get_segment(offset, offset + phrase_duration)
    # Check if this same phrase appears later
    for later_offset in np.arange(offset + phrase_duration, min(offset + phrase_duration + 30, duration - phrase_duration), 0.5):
        seg2 = get_segment(later_offset, later_offset + phrase_duration)
        if len(seg1) == len(seg2) and len(seg1) > 0:
            # Normalized cross-correlation
            seg1_norm = seg1 / (np.sqrt(np.sum(seg1**2)) + 1e-10)
            seg2_norm = seg2 / (np.sqrt(np.sum(seg2**2)) + 1e-10)
            corr = np.sum(seg1_norm * seg2_norm)
            if corr > 0.7:
                acorr_candidates.append({
                    'end_time': offset + phrase_duration,
                    'start_time': later_offset,
                    'quality': corr,
                    'phrase_duration': phrase_duration,
                    'gap': later_offset - (offset + phrase_duration)
                })

# Combine and sort candidates
all_candidates = candidates + acorr_candidates
all_candidates.sort(key=lambda x: x['quality'], reverse=True)

print(f"\n{'='*60}")
print(f"TOP LOOP CANDIDATES:")
print(f"{'='*60}")
for i, c in enumerate(all_candidates[:15]):
    end_m = int(c['end_time'] // 60)
    end_s = c['end_time'] % 60
    start_m = int(c['start_time'] // 60)
    start_s = c['start_time'] % 60
    loop_len = duration - c['end_time'] + c['start_time']
    
    print(f"\n  Candidate {i+1}:")
    print(f"    END point:   {end_m}:{end_s:05.2f} ({c['end_time']:.3f}s)")
    print(f"    START point: {start_m}:{start_s:05.2f} ({c['start_time']:.3f}s)")
    print(f"    Loop length: {loop_len:.2f}s ({loop_len/60:.1f} min)")
    print(f"    Quality:     {c['quality']:.4f}")
    if 'energy_ratio' in c:
        print(f"    Energy:      {c['energy_ratio']:.4f}")
    if 'spectral_match' in c:
        print(f"    Spectral:    {c['spectral_match']:.4f}")
    if 'gap' in c:
        print(f"    Gap:         {c['gap']:.2f}s")

# Save best candidate info
if all_candidates:
    best = all_candidates[0]
    info = {
        'end_time': float(best['end_time']),
        'start_time': float(best['start_time']),
        'loop_length': float(duration - best['end_time'] + best['start_time']),
        'quality': float(best['quality']),
        'source_duration': float(duration)
    }
    import json
    info_path = OUT_DIR / "calypso_loop_point.json"
    with open(info_path, 'w') as f:
        json.dump(info, f, indent=2)
    print(f"\nBest candidate saved to {info_path}")

print(f"\nTo create the loop:")
print(f"  1. Trim END at {all_candidates[0]['end_time']:.3f}s")
print(f"  2. Trim START at {all_candidates[0]['start_time']:.3f}s")
print(f"  3. Concatenate end-part + start-part")
print(f"  4. Apply crossfade at junction")
print(f"  5. Tile to 2 hours")
