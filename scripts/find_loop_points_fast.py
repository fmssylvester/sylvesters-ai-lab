#!/usr/bin/env python3
"""Find natural loop points using ffmpeg (fast)."""
import subprocess
import json
import numpy as np
from pathlib import Path

SRC = "/sdcard/Download/New Calypso Loop (BPM 93)- Loopsgospel - Loopsgospel (youtube).mp3"
OUT_DIR = Path("/data/data/com.termux/files/home/ai-lab-internal/loops")
OUT_DIR.mkdir(exist_ok=True)

# Step 1: Get duration
result = subprocess.run([
    'ffprobe', '-v', 'error', '-show_entries', 'format=duration',
    '-of', 'default=noprint_wrappers=1:nokey=1', SRC
], capture_output=True, text=True)
duration = float(result.stdout.strip())
print(f"Duration: {duration:.2f}s ({duration/60:.1f} min)")

# Step 2: Find silence points (phrase boundaries)
print("\nFinding silence/near-silence regions...")
result = subprocess.run([
    'ffmpeg', '-i', SRC, '-af',
    'silencedetect=noise=-35dB:d=0.3',  # 0.3s silence at -35dB
    '-f', 'null', '-'
], capture_output=True, text=True)

silence_regions = []
for line in result.stderr.split('\n'):
    if 'silence_start' in line:
        start = float(line.split('silence_start:')[1].strip())
        silence_regions.append({'start': start, 'end': None})
    elif 'silence_end' in line and silence_regions:
        end = float(line.split('silence_end:')[1].strip().split()[0])
        silence_regions[-1]['end'] = end

# Filter to regions > 0.3s
silence_regions = [r for r in silence_regions if r['end'] and (r['end'] - r['start']) >= 0.3]
print(f"Found {len(silence_regions)} silence regions (>0.3s):")
for i, r in enumerate(silence_regions):
    print(f"  {i+1}. {r['start']:.2f}s - {r['end']:.2f}s ({r['end']-r['start']:.2f}s)")

# Step 3: Check beat alignment at silence boundaries
print("\nChecking beat alignment...")
# At 93 BPM, one beat = 60/93 = 0.6452s
beat_duration = 60 / 93

def beats_from_start(time_s):
    """How many beats from track start."""
    return time_s / beat_duration

def nearest_beat(time_s):
    """Snap time to nearest beat."""
    beats = beats_from_start(time_s)
    nearest = round(beats)
    return nearest * beat_duration

def bars_from_start(time_s):
    """How many bars (4 beats) from track start."""
    return beats_from_start(time_s) / 4

# Step 4: For each silence region, check if end and start of next section align to beats
print("\nEvaluating loop candidates...")
candidates = []

for i, region in enumerate(silence_regions):
    # The "end" point is somewhere in this silence
    # The "start" point is where the music picks up after
    
    region_duration = region['end'] - region['start']
    
    # Try the end of the silence as loop end
    end_time = region['end']
    
    # Look for a good start point after the silence
    # Check multiple offsets (in ms) after silence end
    for offset_ms in range(0, 500, 10):  # 0-500ms in 10ms steps
        start_time = end_time + offset_ms / 1000.0
        
        # Check beat alignment
        end_beat_offset = beats_from_start(end_time) % 1  # Fractional beat
        start_beat_offset = beats_from_start(start_time) % 1
        
        # How well do these align to beats?
        end_align = min(end_beat_offset, 1 - end_beat_offset)  # Distance to nearest beat
        start_align = min(start_beat_offset, 1 - start_beat_offset)
        
        # Bar alignment (every 4 beats)
        end_bar_offset = beats_from_start(end_time) % 4
        start_bar_offset = beats_from_start(start_time) % 4
        end_bar_align = min(end_bar_offset, 4 - end_bar_offset)
        start_bar_align = min(start_bar_offset, 4 - start_bar_offset)
        
        # Quality: prefer bar-aligned > beat-aligned > any
        quality = 0
        if end_bar_align < 0.1 and start_bar_align < 0.1:
            quality = 0.9 + (0.1 - end_bar_align - start_bar_align)  # Bar-aligned
        elif end_align < 0.05 and start_align < 0.05:
            quality = 0.7 + (0.1 - end_align - start_align)  # Beat-aligned
        else:
            quality = max(0, 1.0 - end_align - start_align)
        
        if quality > 0.5:
            loop_length = duration - end_time + start_time
            candidates.append({
                'end_time': end_time,
                'start_time': start_time,
                'loop_length': loop_length,
                'quality': quality,
                'region_idx': i,
                'region_start': region['start'],
                'region_end': region['end'],
                'end_bar_align': end_bar_align,
                'start_bar_align': start_bar_align
            })

# Also try mid-silence as end point
for i, region in enumerate(silence_regions):
    region_duration = region['end'] - region['start']
    if region_duration > 0.5:
        # Try the middle of the silence
        for offset_s in np.arange(0.1, min(region_duration, 1.5), 0.05):
            end_time = region['start'] + offset_s
            
            for offset_ms in range(0, 500, 10):
                start_time = region['end'] + offset_ms / 1000.0
                
                end_beat_offset = beats_from_start(end_time) % 1
                start_beat_offset = beats_from_start(start_time) % 1
                end_align = min(end_beat_offset, 1 - end_beat_offset)
                start_align = min(start_beat_offset, 1 - start_beat_offset)
                
                end_bar_offset = beats_from_start(end_time) % 4
                start_bar_offset = beats_from_start(start_time) % 4
                end_bar_align = min(end_bar_offset, 4 - end_bar_offset)
                start_bar_align = min(start_bar_offset, 4 - start_bar_offset)
                
                quality = 0
                if end_bar_align < 0.1 and start_bar_align < 0.1:
                    quality = 0.9 + (0.1 - end_bar_align - start_bar_align)
                elif end_align < 0.05 and start_align < 0.05:
                    quality = 0.7 + (0.1 - end_align - start_align)
                else:
                    quality = max(0, 1.0 - end_align - start_align)
                
                if quality > 0.5:
                    loop_length = duration - end_time + start_time
                    candidates.append({
                        'end_time': end_time,
                        'start_time': start_time,
                        'loop_length': loop_length,
                        'quality': quality,
                        'region_idx': i,
                        'region_start': region['start'],
                        'region_end': region['end'],
                        'end_bar_align': end_bar_align,
                        'start_bar_align': start_bar_align
                    })

# Sort by quality
candidates.sort(key=lambda x: x['quality'], reverse=True)

# Remove duplicates (end times within 0.1s of each other)
filtered = []
for c in candidates:
    is_dup = False
    for f in filtered:
        if abs(c['end_time'] - f['end_time']) < 0.1:
            is_dup = True
            break
    if not is_dup:
        filtered.append(c)

print(f"\n{'='*70}")
print(f"TOP LOOP CANDIDATES (bar-aligned, beat-aligned):")
print(f"{'='*70}")
for i, c in enumerate(filtered[:20]):
    end_m = int(c['end_time'] // 60)
    end_s = c['end_time'] % 60
    start_m = int(c['start_time'] // 60)
    start_s = c['start_time'] % 60
    
    loop_m = int(c['loop_length'] // 60)
    loop_s = c['loop_length'] % 60
    
    bars_end = beats_from_start(c['end_time']) / 4
    bars_start = beats_from_start(c['start_time']) / 4
    
    print(f"\n  Candidate {i+1}:")
    print(f"    END:   {end_m}:{end_s:05.2f} ({c['end_time']:.3f}s)  [bar {bars_end:.1f}]")
    print(f"    START: {start_m}:{start_s:05.2f} ({c['start_time']:.3f}s)  [bar {bars_start:.1f}]")
    print(f"    LOOP:  {loop_m}:{loop_s:05.2f} ({c['loop_length']:.1f}s)")
    print(f"    Quality: {c['quality']:.4f}  Region: {c['region_start']:.1f}-{c['region_end']:.1f}s")

# Save best candidates
if filtered:
    info = {
        'source': SRC,
        'source_duration': duration,
        'candidates': [{
            'end_time': float(c['end_time']),
            'start_time': float(c['start_time']),
            'loop_length': float(c['loop_length']),
            'quality': float(c['quality'])
        } for c in filtered[:10]]
    }
    with open(OUT_DIR / "calypso_candidates.json", 'w') as f:
        json.dump(info, f, indent=2)
    print(f"\nSaved to {OUT_DIR / 'calypso_candidates.json'}")
