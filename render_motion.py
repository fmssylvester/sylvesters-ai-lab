#!/usr/bin/env python3
"""
Motion Graphics Renderer using Chromium + FFmpeg
Renders HTML animations to MP4
"""

import subprocess
import os
import time
from pathlib import Path

HTML_FILE = Path("motion_graphics/index.html")
FRAMES_DIR = Path("motion_graphics/frames")
OUTPUT_DIR = Path("out")
OUTPUT_VIDEO = OUTPUT_DIR / "motion_graphics.mp4"

FPS = 30
DURATION = 19  # seconds
WIDTH = 1920
HEIGHT = 1080


def capture_frames():
    """Capture frames using Chromium headless."""
    print(f"Capturing {FPS * DURATION} frames...")
    
    FRAMES_DIR.mkdir(parents=True, exist_ok=True)
    
    # Use Chromium to capture screenshots
    for frame in range(FPS * DURATION):
        time_sec = frame / FPS
        
        # Create a simple HTML that seeks to specific time
        html_content = f"""
        <!DOCTYPE html>
        <html>
        <head><meta charset="UTF-8"></head>
        <body>
        <iframe id="comp" src="file://{HTML_FILE.absolute()}" 
                width="{WIDTH}" height="{HEIGHT}" 
                style="border:none;"></iframe>
        <script>
          setTimeout(() => {{
            const iframe = document.getElementById('comp');
            if (iframe.contentWindow && iframe.contentWindow.__timelines) {{
              const tl = iframe.contentWindow.__timelines['motion-demo'];
              if (tl) tl.seek({time_sec});
            }}
          }}, 100);
        </script>
        </body>
        </html>
        """
        
        temp_html = FRAMES_DIR / f"temp_{frame:05d}.html"
        temp_html.write_text(html_content)
        
        # Capture screenshot
        cmd = [
            "chromium-browser",
            "--headless",
            "--no-sandbox",
            "--disable-gpu",
            f"--window-size={WIDTH},{HEIGHT}",
            f"--screenshot={FRAMES_DIR / f'frame_{frame:05d}.png'}",
            f"file://{temp_html.absolute()}"
        ]
        
        subprocess.run(cmd, capture_output=True, check=True)
        
        if frame % 30 == 0:
            print(f"  Frame {frame}/{FPS * DURATION} ({time_sec:.1f}s)")
    
    print("  Done capturing frames")


def stitch_video():
    """Stitch frames to MP4."""
    print("Encoding video...")
    
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    
    cmd = [
        "ffmpeg", "-y",
        "-framerate", str(FPS),
        "-i", str(FRAMES_DIR / "frame_%05d.png"),
        "-c:v", "libx264",
        "-crf", "18",
        "-pix_fmt", "yuv420p",
        str(OUTPUT_VIDEO)
    ]
    
    subprocess.run(cmd, capture_output=True, check=True)
    print(f"  Saved: {OUTPUT_VIDEO}")


def cleanup():
    """Remove temp files."""
    import shutil
    if FRAMES_DIR.exists():
        shutil.rmtree(FRAMES_DIR)


def main():
    print("=" * 60)
    print("MOTION GRAPHICS RENDERER")
    print("=" * 60)
    
    capture_frames()
    stitch_video()
    cleanup()
    
    size = OUTPUT_VIDEO.stat().st_size / 1024 / 1024
    print(f"\n{'=' * 60}")
    print(f"DONE! {OUTPUT_VIDEO} ({size:.1f} MB)")
    print("=" * 60)


if __name__ == "__main__":
    main()
