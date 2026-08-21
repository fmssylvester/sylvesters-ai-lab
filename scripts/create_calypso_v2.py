#!/usr/bin/env python3
"""Create loop from best spectral match candidates."""
import subprocess
import json
import sys
from pathlib import Path

OUT_DIR = Path("/data/data/com.termux/files/home/ai-lab-internal/loops")
SRC = "/sdcard/Download/New Calypso Loop (BPM 93)- Loopsgospel - Loopsgospel (youtube).mp3"

# Load analysis
with open(OUT_DIR / "calypso_loop_analysis.json") as f:
    analysis = json.load(f)

duration = analysis['duration']
bar_duration = analysis['bar_duration']

# Get duration
result = subprocess.run([
    'ffprobe', '-v', 'error', '-show_entries', 'format=duration',
    '-of', 'default=noprint_wrappers=1:nokey=1', SRC
], capture_output=True, text=True)
duration = float(result.stdout.strip())

# Top candidates - test a few
candidates = [
    {'name': 'bar494', 'bar': 494, 'time': 1274.8},  # 21:14, 8.8 min loop
    {'name': 'bar624', 'bar': 624, 'time': 1610.3},  # 26:50, 3.2 min loop
    {'name': 'bar660', 'bar': 660, 'time': 1703.2},  # 28:23, 1.7 min loop
    {'name': 'bar409', 'bar': 409, 'time': 1055.5},  # 17:35, 12.5 min loop
]

def create_loop(end_time, output_path, fade_ms=30):
    """Create a loop: [0:end_time] tiled, with crossfade at junction."""
    loop_length = end_time
    
    # Step 1: Extract the segment
    print(f"  Extracting {loop_length:.2f}s segment...")
    result = subprocess.run([
        'ffmpeg', '-y', '-i', SRC,
        '-t', str(loop_length),
        '-af', 'aresample=44100',
        '-f', 'wav', '-acodec', 'pcm_s16le', '-ac', '2',
        str(OUT_DIR / 'temp_segment.wav')
    ], capture_output=True, text=True)
    
    if result.returncode != 0:
        print(f"  ERROR: {result.stderr[-200:]}")
        return False
    
    # Step 2: Apply equal-power crossfade at junction
    print(f"  Applying {fade_ms}ms crossfade at junction...")
    fade_s = fade_ms / 1000.0
    
    # Use aloop to tile, then atrim to exact length, then crossfade
    # For simplicity: extract segment, apply short fade-in/fade-out, then tile
    fade_filter = f'afade=t=in:st=0:d={fade_s},afade=t=out:st={loop_length - fade_s}:d={fade_s}'
    
    result = subprocess.run([
        'ffmpeg', '-y', '-i', str(OUT_DIR / 'temp_segment.wav'),
        '-af', fade_filter,
        '-f', 'wav', '-acodec', 'pcm_s16le', '-ac', '2',
        str(OUT_DIR / 'temp_faded.wav')
    ], capture_output=True, text=True)
    
    if result.returncode != 0:
        print(f"  ERROR: {result.stderr[-200:]}")
        return False
    
    # Step 3: Tile to 2 hours
    print(f"  Tiling to 2 hours...")
    result = subprocess.run([
        'ffmpeg', '-y', '-stream_loop', '-1', '-i', str(OUT_DIR / 'temp_faded.wav'),
        '-t', '7200',
        '-c:a', 'libmp3lame', '-b:a', '192k',
        str(output_path)
    ], capture_output=True, text=True)
    
    if result.returncode != 0:
        print(f"  ERROR: {result.stderr[-200:]}")
        return False
    
    # Verify
    result = subprocess.run([
        'ffprobe', '-v', 'error', '-show_entries', 'format=duration',
        '-of', 'default=noprint_wrappers=1:nokey=1', str(output_path)
    ], capture_output=True, text=True)
    
    final_duration = float(result.stdout.strip())
    print(f"  Output: {final_duration:.2f}s ({final_duration/3600:.2f} hours)")
    
    # Cleanup
    (OUT_DIR / 'temp_segment.wav').unlink(missing_ok=True)
    (OUT_DIR / 'temp_faded.wav').unlink(missing_ok=True)
    
    return True

# Create loops from candidates
print("Creating test loops...\n")

for c in candidates:
    print(f"\n{'='*50}")
    print(f"Testing {c['name']} (bar {c['bar']}, {c['time']:.1f}s)")
    print(f"Loop length: {duration - c['time']:.1f}s ({(duration - c['time'])/60:.1f} min)")
    print(f"{'='*50}")
    
    output = OUT_DIR / f"calypso_v2_{c['name']}.mp3"
    success = create_loop(c['time'], output, fade_ms=50)
    
    if success:
        print(f"  Saved: {output}")
    else:
        print(f"  FAILED")

# Also try the user's suggested approach: trim from end to a resolve point
print(f"\n{'='*50}")
print(f"Testing END-trim approach (user's suggestion)")
print(f"{'='*50}")

# Find a good point near the end where the music resolves
# Use the last bar before the final 2 seconds
end_trim_time = duration - 2.0  # Trim 2 seconds from end
print(f"  Trimming at {end_trim_time:.2f}s (removing last 2s)")

# Find a good start point after the trim
# Look at bars near the beginning that have similar energy to the end
# For now, try the very beginning
start_trim_time = 0.0

loop_length = end_trim_time - start_trim_time
print(f"  Loop length: {loop_length:.2f}s ({loop_length/60:.1f} min)")

output = OUT_DIR / f"calypso_v2_endtrim.mp3"
success = create_loop(end_trim_time, output, fade_ms=50)

if success:
    print(f"  Saved: {output}")
else:
    print(f"  FAILED")

print(f"\nAll done! Check {OUT_DIR} for new files.")
