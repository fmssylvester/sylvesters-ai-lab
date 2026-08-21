#!/usr/bin/env python3
"""
Vox-Style Video Creator — Simplified Version
Creates a 4-scene video with Ken Burns effect
"""

import os
import requests
import subprocess
import json
import sys
from pathlib import Path

OUTPUT_DIR = Path("vox_output")
OUTPUT_DIR.mkdir(exist_ok=True)
TEMP_DIR = OUTPUT_DIR / "temp"
TEMP_DIR.mkdir(exist_ok=True)


def create_storyboard(topic):
    """Create a simple storyboard."""
    print(f"\n[1/4] Creating storyboard for: {topic}")
    
    storyboard = {
        "title": topic,
        "scenes": [
            {
                "scene_number": 1,
                "visual_description": f"Introduction to {topic}, abstract visualization, bold typography, editorial style",
                "duration_seconds": 4
            },
            {
                "scene_number": 2,
                "visual_description": f"Key concept of {topic}, infographic style, clean design, paper collage aesthetic",
                "duration_seconds": 4
            },
            {
                "scene_number": 3,
                "visual_description": f"Impact of {topic}, data visualization, bold colors, modern editorial",
                "duration_seconds": 4
            },
            {
                "scene_number": 4,
                "visual_description": f"Future of {topic}, minimal design, strong conclusion, Vox style",
                "duration_seconds": 4
            }
        ]
    }
    
    with open(OUTPUT_DIR / "storyboard.json", "w") as f:
        json.dump(storyboard, f, indent=2)
    
    print(f"  ✓ Created {len(storyboard['scenes'])} scenes")
    return storyboard


def generate_images(storyboard):
    """Generate images using Pollinations.ai."""
    print(f"\n[2/4] Generating images...")
    
    images = []
    for scene in storyboard["scenes"]:
        prompt = scene["visual_description"]
        encoded = requests.utils.quote(prompt)
        url = f"https://image.pollinations.ai/prompt/{encoded}?width=1920&height=1080&nologo=true&seed={scene['scene_number']}"
        
        print(f"  Generating scene {scene['scene_number']}...")
        resp = requests.get(url, timeout=120)
        
        filepath = TEMP_DIR / f"scene_{scene['scene_number']:02d}.png"
        filepath.write_bytes(resp.content)
        images.append(filepath)
        print(f"    ✓ Saved: {filepath.name}")
    
    return images


def create_videos(images):
    """Create videos with Ken Burns effect."""
    print(f"\n[3/4] Creating videos...")
    
    videos = []
    for i, img_path in enumerate(images, 1):
        video_path = TEMP_DIR / f"video_{i:02d}.mp4"
        
        # Ken Burns effect - slow zoom
        cmd = [
            "ffmpeg", "-y",
            "-loop", "1",
            "-i", str(img_path),
            "-vf", f"scale=2160:1215:force_original_aspect_ratio=decrease,pad=2160:1215:(ow-iw)/2:(oh-ih)/2,zoompan=z='min(zoom+0.001,1.3)':d=125:s=1920x1080:fps=25",
            "-c:v", "libx264",
            "-t", "5",
            "-pix_fmt", "yuv420p",
            str(video_path)
        ]
        subprocess.run(cmd, capture_output=True, check=True)
        videos.append(video_path)
        print(f"  ✓ Video {i}: {video_path.name}")
    
    return videos


def stitch_videos(videos):
    """Stitch all videos together."""
    print(f"\n[4/4] Stitching videos...")
    
    concat_file = TEMP_DIR / "concat.txt"
    with open(concat_file, "w") as f:
        for video in videos:
            f.write(f"file '{video.absolute()}'\n")
    
    output_path = OUTPUT_DIR / "final_video.mp4"
    cmd = [
        "ffmpeg", "-y",
        "-f", "concat",
        "-safe", "0",
        "-i", str(concat_file),
        "-c:v", "libx264",
        "-crf", "18",
        "-pix_fmt", "yuv420p",
        str(output_path)
    ]
    subprocess.run(cmd, capture_output=True, check=True)
    
    print(f"  ✓ Final: {output_path}")
    return output_path


def main():
    topic = sys.argv[1] if len(sys.argv) > 1 else "The Future of AI"
    
    print("=" * 60)
    print(f"VOX-STYLE VIDEO: {topic}")
    print("=" * 60)
    
    storyboard = create_storyboard(topic)
    images = generate_images(storyboard)
    videos = create_videos(images)
    final = stitch_videos(videos)
    
    size = final.stat().st_size / 1024 / 1024
    print(f"\n{'=' * 60}")
    print(f"DONE! {final} ({size:.1f} MB)")
    print("=" * 60)


if __name__ == "__main__":
    main()
