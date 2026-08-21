#!/usr/bin/env python3
"""Create SHORT test loops (single iteration) for audition."""
import subprocess
import json
from pathlib import Path

OUT_DIR = Path("/data/data/com.termux/files/home/ai-lab-internal/loops")
SRC = "/sdcard/Download/New Calypso Loop (BPM 93)- Loopsgospel - Loopsgospel (youtube).mp3"

# Get duration
result = subprocess.run([
    'ffprobe', '-v', 'error', '-show_entries', 'format=duration',
    '-of', 'default=noprint_wrappers=1:nokey=1', SRC
], capture_output=True, text=True)
duration = float(result.stdout.strip())
print(f"Source: {duration:.2f}s ({duration/60:.1f} min)")

# Load analysis
with open(OUT_DIR / "calypso_loop_analysis.json") as f:
    analysis = json.load(f)

# Candidates to test
candidates = [
    {'name': 'bar494_21m14s', 'time': 1274.8, 'note': '21:14, 8.8min loop'},
    {'name': 'bar624_26m50s', 'time': 1610.3, 'note': '26:50, 3.2min loop'},
    {'name': 'bar660_28m23s', 'time': 1703.2, 'note': '28:23, 1.7min loop'},
    {'name': 'bar409_17m35s', 'time': 1055.5, 'note': '17:35, 12.5min loop'},
    {'name': 'endtrim_2s', 'time': duration - 2.0, 'note': 'end - 2s, full track'},
]

print(f"\nCreating short test loops (single pass)...\n")

for c in candidates:
    loop_len = c['time']
    name = c['name']
    out_path = OUT_DIR / f"test_{name}.mp3"
    
    print(f"  {name}: {c['note']}")
    
    # Extract segment with short fade
    fade_s = 0.05
    result = subprocess.run([
        'ffmpeg', '-y', '-i', SRC,
        '-t', str(loop_len),
        '-af', f'afade=t=in:st=0:d={fade_s},afade=t=out:st={loop_len - fade_s}:d={fade_s}',
        '-c:a', 'libmp3lame', '-b:a', '192k',
        str(out_path)
    ], capture_output=True, text=True)
    
    if result.returncode == 0:
        # Verify
        r = subprocess.run([
            'ffprobe', '-v', 'error', '-show_entries', 'format=duration',
            '-of', 'default=noprint_wrappers=1:nokey=1', str(out_path)
        ], capture_output=True, text=True)
        dur = float(r.stdout.strip())
        print(f"    -> {out_path.name} ({dur:.1f}s)")
    else:
        print(f"    -> FAILED: {result.stderr[-100:]}")

print(f"\nDone! Files in {OUT_DIR}/test_*.mp3")
print(f"\nTo extend the best one to 2 hours, tell me which name.")
