#!/usr/bin/env python3
"""Find loop points by matching spectral similarity between different sections."""
import subprocess
import json
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
print(f"Duration: {duration:.2f}s ({duration/60:.1f} min)")

# Extract audio as raw float32
print("\nExtracting audio waveform...")
result = subprocess.run([
    'ffmpeg', '-i', SRC, '-f', 'f32le', '-acodec', 'pcm_f32le',
    '-ar', '22050', '-ac', '1', '-'
], capture_output=True)
y = np.frombuffer(result.stdout, dtype=np.float32)
sr = 22050
print(f"Samples: {len(y)}, Sample rate: {sr}")

# At 93 BPM, one bar = 4 * (60/93) = 2.5806s
# One beat = 0.6452s
# 8 bars (2 phrases) = 20.645s
bar_duration = 4 * (60 / 93)  # 2.5806s
phrase_duration = bar_duration * 2  # 20.645s
beat_duration = 60 / 93  # 0.6452s

print(f"\nMusical timing:")
print(f"  Beat: {beat_duration:.4f}s")
print(f"  Bar (4 beats): {bar_duration:.4f}s")
print(f"  Phrase (8 bars): {phrase_duration:.4f}s")

# Function to get a segment
def get_segment(start_s, end_s):
    start_idx = int(start_s * sr)
    end_idx = int(end_s * sr)
    return y[start_idx:end_idx]

# Function to compute spectral centroid (brightness) for a segment
def spectral_centroid(seg):
    fft = np.abs(np.fft.rfft(seg))
    freqs = np.fft.rfftfreq(len(seg), 1.0/sr)
    if np.sum(fft) == 0:
        return 0
    return np.sum(freqs * fft) / np.sum(fft)

# Function to compute energy
def energy(seg):
    return np.sqrt(np.mean(seg**2))

# Function to compute spectral flatness (tonal vs noisy)
def spectral_flatness(seg):
    fft = np.abs(np.fft.rfft(seg)) + 1e-10
    log_mean = np.mean(np.log(fft))
    mean_log = np.log(np.mean(fft))
    return np.exp(log_mean - mean_log)

# Analyze the track in chunks aligned to bars
print("\nAnalyzing track in bar-aligned chunks...")
chunk_size = int(bar_duration * sr)
n_chunks = len(y) // chunk_size

# Compute features for each bar
bar_features = []
for i in range(n_chunks):
    start_s = i * bar_duration
    seg = get_segment(start_s, start_s + bar_duration)
    bar_features.append({
        'bar': i,
        'time': start_s,
        'energy': float(energy(seg)),
        'centroid': float(spectral_centroid(seg)),
        'flatness': float(spectral_flatness(seg))
    })

print(f"Analyzed {len(bar_features)} bars")

# Normalize features
energies = np.array([b['energy'] for b in bar_features])
centroids = np.array([b['centroid'] for b in bar_features])
flatnesses = np.array([b['flatness'] for b in bar_features])

# Smooth features over 4-bar windows
window = 4
smooth_energies = np.convolve(energies, np.ones(window)/window, mode='same')
smooth_centroids = np.convolve(centroids, np.ones(window)/window, mode='same')
smooth_flatnesses = np.convolve(flatnesses, np.ones(window)/window, mode='same')

# Find potential loop points: places where the music could transition
# Strategy: find bars where the next bar's features match the features
# at the beginning of the track (or some other reference point)

print("\nSearching for loop points (matching sections)...")

# Reference: first 8 bars
ref_end = 8  # bar index
ref_centroid = smooth_centroids[:ref_end].mean()
ref_energy = smooth_energies[:ref_end].mean()
ref_flatness = smooth_flatnesses[:ref_end].mean()

print(f"Reference (bars 0-7): energy={ref_energy:.4f}, centroid={ref_centroid:.1f}, flatness={ref_flatness:.4f}")

# Find bars that match the reference
candidates = []
for i in range(16, n_chunks - 16):  # Skip first/last 16 bars
    # Compare a window of bars starting here to the reference
    window_end = min(i + 8, n_chunks)
    match_energy = smooth_energies[i:window_end].mean()
    match_centroid = smooth_centroids[i:window_end].mean()
    match_flatness = smooth_flatnesses[i:window_end].mean()
    
    # Similarity score
    energy_sim = 1.0 - abs(ref_energy - match_energy) / (ref_energy + 1e-10)
    centroid_sim = 1.0 - abs(ref_centroid - match_centroid) / (ref_centroid + 1e-10)
    flatness_sim = 1.0 - abs(ref_flatness - match_flatness) / (ref_flatness + 1e-10)
    
    similarity = (energy_sim * 0.3 + centroid_sim * 0.4 + flatness_sim * 0.3)
    
    if similarity > 0.85:
        candidates.append({
            'bar': i,
            'time': i * bar_duration,
            'similarity': float(similarity),
            'energy_sim': float(energy_sim),
            'centroid_sim': float(centroid_sim),
            'flatness_sim': float(flatness_sim)
        })

# Sort by similarity
candidates.sort(key=lambda x: x['similarity'], reverse=True)

# Deduplicate (keep only bars that are at least 16 bars apart)
filtered = []
for c in candidates:
    is_dup = False
    for f in filtered:
        if abs(c['bar'] - f['bar']) < 16:
            is_dup = True
            break
    if not is_dup:
        filtered.append(c)

print(f"\nFound {len(filtered)} candidate loop points (similarity > 0.85):")
for i, c in enumerate(filtered[:20]):
    m = int(c['time'] // 60)
    s = c['time'] % 60
    loop_length = duration - c['time']
    print(f"  {i+1}. Bar {c['bar']}, {m}:{s:05.2f} ({c['time']:.1f}s) - "
          f"similarity: {c['similarity']:.4f} - "
          f"loop: {loop_length:.1f}s ({loop_length/60:.1f} min)")

# Also try: find sections where energy drops then rises (phrase boundary)
print("\n\nSearching for phrase boundaries (energy dip)...")
energy_dips = []
for i in range(8, n_chunks - 8):
    # Check if this bar is a local minimum
    left_avg = smooth_energies[max(0,i-4):i].mean()
    right_avg = smooth_energies[i+1:min(n_chunks,i+5)].mean()
    current = smooth_energies[i]
    
    if current < left_avg * 0.85 and current < right_avg * 0.85:
        # This is an energy dip
        # Check if the section after matches the section before
        before = smooth_energies[max(0,i-8):i]
        after = smooth_energies[i+1:min(n_chunks,i+9)]
        
        if len(before) > 0 and len(after) > 0:
            # Check if energy levels are similar before and after
            level_match = 1.0 - abs(before.mean() - after.mean()) / (before.mean() + 1e-10)
            if level_match > 0.9:
                energy_dips.append({
                    'bar': i,
                    'time': i * bar_duration,
                    'dip_energy': float(current),
                    'before_energy': float(before.mean()),
                    'after_energy': float(after.mean()),
                    'level_match': float(level_match)
                })

print(f"Found {len(energy_dips)} energy dips:")
for i, d in enumerate(energy_dips[:10]):
    m = int(d['time'] // 60)
    s = d['time'] % 60
    print(f"  {i+1}. Bar {d['bar']}, {m}:{s:05.2f} ({d['time']:.1f}s) - "
              f"level_match: {d['level_match']:.4f}")

# Save all results
results = {
    'source': SRC,
    'duration': duration,
    'bar_duration': bar_duration,
    'phrase_duration': phrase_duration,
    'spectral_matches': [{
        'bar': c['bar'],
        'time': c['time'],
        'similarity': c['similarity']
    } for c in filtered[:20]],
    'energy_dips': [{
        'bar': d['bar'],
        'time': d['time'],
        'level_match': d['level_match']
    } for d in energy_dips[:10]]
}

with open(OUT_DIR / "calypso_loop_analysis.json", 'w') as f:
    json.dump(results, f, indent=2)

print(f"\nResults saved to {OUT_DIR / 'calypso_loop_analysis.json'}")
