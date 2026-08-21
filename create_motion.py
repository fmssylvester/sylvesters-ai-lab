#!/usr/bin/env python3
"""
Motion Graphics Video Creator
Creates animated scenes and stitches them together
"""

import subprocess
import os
from pathlib import Path

OUTPUT_DIR = Path("out")
FRAMES_DIR = Path("motion_frames")

OUTPUT_DIR.mkdir(exist_ok=True)
FRAMES_DIR.mkdir(exist_ok=True)

FPS = 30
SCENES = [
    {"name": "title", "duration": 5, "html": """
        <div style="width:1920px;height:1080px;background:linear-gradient(135deg,#1a1a2e,#16213e);display:flex;flex-direction:column;justify-content:center;align-items:center;font-family:Inter,sans-serif;">
            <h1 style="font-size:120px;font-weight:800;color:#fff;opacity:0;animation:fadeInUp 1s forwards;">Motion Graphics</h1>
            <p style="font-size:36px;color:#8892b0;margin-top:20px;opacity:0;animation:fadeInUp 1s 0.5s forwards;">Real animations, not just zoom</p>
        </div>
        <style>
            @keyframes fadeInUp { from { opacity:0; transform:translateY(60px); } to { opacity:1; transform:translateY(0); } }
        </style>
    """},
    {"name": "stats", "duration": 5, "html": """
        <div style="width:1920px;height:1080px;background:linear-gradient(135deg,#0f3460,#16213e);display:flex;justify-content:center;align-items:center;gap:100px;font-family:Inter,sans-serif;">
            <div style="text-align:center;opacity:0;animation:popIn 0.6s 0.3s forwards;">
                <div style="font-size:96px;font-weight:800;color:#00d9ff;">100+</div>
                <div style="font-size:24px;color:#8892b0;">Animations</div>
            </div>
            <div style="text-align:center;opacity:0;animation:popIn 0.6s 0.6s forwards;">
                <div style="font-size:96px;font-weight:800;color:#00ff88;">50+</div>
                <div style="font-size:24px;color:#8892b0;">Effects</div>
            </div>
            <div style="text-align:center;opacity:0;animation:popIn 0.6s 0.9s forwards;">
                <div style="font-size:96px;font-weight:800;color:#ff6b6b;">25+</div>
                <div style="font-size:24px;color:#8892b0;">Transitions</div>
            </div>
        </div>
        <style>
            @keyframes popIn { from { opacity:0; transform:scale(0.5); } to { opacity:1; transform:scale(1); } }
        </style>
    """},
    {"name": "features", "duration": 5, "html": """
        <div style="width:1920px;height:1080px;background:linear-gradient(135deg,#1a1a2e,#0f3460);display:flex;flex-direction:column;justify-content:center;align-items:center;gap:30px;font-family:Inter,sans-serif;">
            <div style="display:flex;align-items:center;gap:30px;opacity:0;animation:slideIn 0.8s 0.3s forwards;">
                <div style="width:80px;height:80px;background:linear-gradient(135deg,#00d9ff,#00ff88);border-radius:20px;display:flex;align-items:center;justify-content:center;font-size:40px;">T</div>
                <div style="font-size:32px;color:#fff;font-weight:600;">Kinetic Typography</div>
            </div>
            <div style="display:flex;align-items:center;gap:30px;opacity:0;animation:slideIn 0.8s 0.7s forwards;">
                <div style="width:80px;height:80px;background:linear-gradient(135deg,#ff6b6b,#ffd93d);border-radius:20px;display:flex;align-items:center;justify-content:center;font-size:40px;">M</div>
                <div style="font-size:32px;color:#fff;font-weight:600;">Motion Paths</div>
            </div>
            <div style="display:flex;align-items:center;gap:30px;opacity:0;animation:slideIn 0.8s 1.1s forwards;">
                <div style="width:80px;height:80px;background:linear-gradient(135deg,#a855f7,#6366f1);border-radius:20px;display:flex;align-items:center;justify-content:center;font-size:40px;">S</div>
                <div style="font-size:32px;color:#fff;font-weight:600;">Shader Transitions</div>
            </div>
        </div>
        <style>
            @keyframes slideIn { from { opacity:0; transform:translateX(-100px); } to { opacity:1; transform:translateX(0); } }
        </style>
    """},
    {"name": "cta", "duration": 4, "html": """
        <div style="width:1920px;height:1080px;background:linear-gradient(135deg,#00d9ff,#00ff88);display:flex;flex-direction:column;justify-content:center;align-items:center;font-family:Inter,sans-serif;">
            <h1 style="font-size:72px;font-weight:800;color:#1a1a2e;text-align:center;opacity:0;animation:scaleIn 0.8s 0.3s forwards;">Create Something Amazing</h1>
            <div style="margin-top:40px;padding:20px 60px;background:#1a1a2e;color:#fff;font-size:28px;font-weight:600;border-radius:50px;opacity:0;animation:slideUp 0.6s 0.8s forwards;">Get Started</div>
        </div>
        <style>
            @keyframes scaleIn { from { opacity:0; transform:scale(0.5); } to { opacity:1; transform:scale(1); } }
            @keyframes slideUp { from { opacity:0; transform:translateY(30px); } to { opacity:1; transform:translateY(0); } }
        </style>
    """}
]


def capture_scene(scene, scene_index):
    """Capture frames for a single scene."""
    print(f"  Capturing scene {scene_index + 1}: {scene['name']}")
    
    # Create HTML file
    html_content = f"""<!DOCTYPE html>
<html><head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;">{scene['html']}</body></html>"""
    
    html_file = FRAMES_DIR / f"scene_{scene_index}.html"
    html_file.write_text(html_content)
    
    frames_captured = 0
    total_frames = scene['duration'] * FPS
    
    for frame in range(total_frames):
        # Calculate animation progress (0 to 1)
        progress = frame / total_frames
        
        frame_file = FRAMES_DIR / f"scene{scene_index}_frame_{frame:05d}.png"
        
        cmd = [
            "chromium-browser",
            "--headless",
            "--no-sandbox",
            "--disable-gpu",
            "--virtual-time-budget=5000",
            f"--window-size=1920,1080",
            f"--screenshot={frame_file}",
            f"file://{html_file.absolute()}"
        ]
        
        subprocess.run(cmd, capture_output=True)
        frames_captured += 1
    
    print(f"    Captured {frames_captured} frames")
    return frames_captured


def stitch_scenes():
    """Stitch all scene frames into final video."""
    print("\nStitching video...")
    
    # Get all frames sorted
    all_frames = sorted(FRAMES_DIR.glob("scene*_frame_*.png"))
    
    # Create concat file
    concat_file = FRAMES_DIR / "concat.txt"
    with open(concat_file, "w") as f:
        for frame in all_frames:
            f.write(f"file '{frame.absolute()}'\n")
    
    # Stitch with FFmpeg
    output_video = OUTPUT_DIR / "motion_graphics.mp4"
    cmd = [
        "ffmpeg", "-y",
        "-framerate", str(FPS),
        "-i", str(concat_file),
        "-c:v", "libx264",
        "-crf", "18",
        "-pix_fmt", "yuv420p",
        str(output_video)
    ]
    subprocess.run(cmd, capture_output=True, check=True)
    
    return output_video


def cleanup():
    """Remove temporary files."""
    import shutil
    if FRAMES_DIR.exists():
        shutil.rmtree(FRAMES_DIR)


def main():
    print("=" * 60)
    print("MOTION GRAPHICS VIDEO CREATOR")
    print("=" * 60)
    
    # Capture each scene
    for i, scene in enumerate(SCENES):
        capture_scene(scene, i)
    
    # Stitch together
    output = stitch_scenes()
    
    # Cleanup
    cleanup()
    
    size = output.stat().st_size / 1024 / 1024
    print(f"\n{'=' * 60}")
    print(f"DONE! {output} ({size:.1f} MB)")
    print("=" * 60)


if __name__ == "__main__":
    main()
