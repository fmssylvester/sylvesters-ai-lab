#!/usr/bin/env python3
"""
Vox-Style Video Creator — OpenCode Implementation
Based on: https://youtu.be/Dmqz8opSHzE

Workflow:
1. Research topic → create style prompt + animation prompt
2. Generate first image
3. Turn image into video
4. Take last frame → use as first frame for next scene
5. Repeat for all scenes
6. Stitch all videos together with FFmpeg
"""

import os
import json
import requests
import subprocess
import sys
import time
from datetime import datetime
from pathlib import Path

# Config
GEMINI_KEY = os.environ.get("GEMINI_API_KEY", "")
OUTPUT_DIR = Path("vox_output")
OUTPUT_DIR.mkdir(exist_ok=True)
TEMP_DIR = OUTPUT_DIR / "temp"
TEMP_DIR.mkdir(exist_ok=True)


def research_topic(topic):
    """Research topic and create storyboard with Gemini."""
    print(f"\n[1/6] Researching: {topic}")
    
    # Try multiple models in case of rate limits
    models = [
        "gemini-2.0-flash-lite",
        "gemini-2.0-flash",
        "gemini-1.5-flash"
    ]
    
    prompt = f"""You are a Vox-style video producer. Create a storyboard for a 30-60 second video about: {topic}

Output JSON with this exact structure:
{{
  "title": "Video title",
  "scenes": [
    {{
      "scene_number": 1,
      "narration": "What the narrator says",
      "visual_description": "Detailed description for image generation",
      "animation_direction": "Camera movement and element animation",
      "duration_seconds": 5
    }}
  ],
  "style_prompt": "Overall visual style description",
  "color_palette": ["#hex1", "#hex2", "#hex3"]
}}

Rules:
- 4-8 scenes total
- Each scene 3-8 seconds
- Visual descriptions should be specific for AI image generation
- Animation directions should describe movement (pan, zoom, reveal, etc.)
- Vox style: clean, editorial, paper-collage aesthetic, bold typography"""
    
    last_error = None
    for model in models:
        try:
            url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={GEMINI_KEY}"
            response = requests.post(url, json={
                "contents": [{"parts": [{"text": prompt}]}]
            }, timeout=60)
            response.raise_for_status()
            
            result = response.json()["candidates"][0]["content"]["parts"][0]["text"]
            
            # Extract JSON from response
            json_match = result[result.find("{"):result.rfind("}") + 1]
            storyboard = json.loads(json_match)
            
            # Save storyboard
            with open(OUTPUT_DIR / "storyboard.json", "w") as f:
                json.dump(storyboard, f, indent=2)
            
            print(f"  Created {len(storyboard['scenes'])} scenes")
            return storyboard
            
        except requests.exceptions.HTTPError as e:
            last_error = e
            print(f"  Rate limited on {model}, trying next...")
            time.sleep(2)
            continue
    
    # If all models fail, create a default storyboard
    print(f"  All models rate-limited, creating default storyboard...")
    storyboard = {
        "title": topic,
        "scenes": [
            {"scene_number": 1, "narration": f"Introduction to {topic}", "visual_description": f"Abstract representation of {topic}", "animation_direction": "Slow zoom in", "duration_seconds": 5},
            {"scene_number": 2, "narration": f"Key aspects of {topic}", "visual_description": f"Key elements of {topic}", "animation_direction": "Pan across", "duration_seconds": 5},
            {"scene_number": 3, "narration": f"Impact of {topic}", "visual_description": f"Visual impact of {topic}", "animation_direction": "Reveal transition", "duration_seconds": 5},
            {"scene_number": 4, "narration": f"Conclusion on {topic}", "visual_description": f"Summary visual of {topic}", "animation_direction": "Fade out", "duration_seconds": 5}
        ],
        "style_prompt": "Vox editorial style, paper collage, bold colors",
        "color_palette": ["#FF6B6B", "#4ECDC4", "#45B7D1"]
    }
    
    with open(OUTPUT_DIR / "storyboard.json", "w") as f:
        json.dump(storyboard, f, indent=2)
    
    print(f"  Created {len(storyboard['scenes'])} scenes (default)")
    return storyboard


def generate_image(prompt, filename, style_suffix="editorial style, clean design, bold colors"):
    """Generate image using Pollinations.ai (free)."""
    print(f"  Generating: {filename}")
    
    full_prompt = f"{prompt}, {style_suffix}"
    encoded = requests.utils.quote(full_prompt)
    url = f"https://image.pollinations.ai/prompt/{encoded}?width=1920&height=1080&nologo=true"
    
    resp = requests.get(url, timeout=120)
    resp.raise_for_status()
    
    filepath = TEMP_DIR / filename
    filepath.write_bytes(resp.content)
    return filepath


def generate_scene_images(storyboard):
    """Generate images for all scenes."""
    print(f"\n[2/6] Generating scene images...")
    
    images = []
    for scene in storyboard["scenes"]:
        filename = f"scene_{scene['scene_number']:02d}.png"
        img_path = generate_image(scene["visual_description"], filename)
        images.append(img_path)
        print(f"    ✓ Scene {scene['scene_number']}: {img_path.name}")
    
    return images


def extract_last_frame(video_path, output_path):
    """Extract last frame from video using FFmpeg."""
    cmd = [
        "ffmpeg", "-y", "-sseof", "-0.1",
        "-i", str(video_path),
        "-frames:v", "1",
        "-q:v", "2",
        str(output_path)
    ]
    subprocess.run(cmd, capture_output=True, check=True)
    return output_path


def image_to_video(image_path, output_path, prompt, duration=4):
    """Convert image to video using Gemini video generation."""
    print(f"  Creating video from {image_path.name}...")
    
    # Use Pollinations for video (or could use Gemini video API)
    # For now, create a Ken Burns style animation with FFmpeg
    
    cmd = [
        "ffmpeg", "-y",
        "-loop", "1",
        "-i", str(image_path),
        "-vf", f"scale=1920:1080:force_original_aspect_ratio=decrease,pad=1920:1080:(ow-iw)/2:(oh-ih)/2,zoompan=z='min(zoom+0.0015,1.5)':d={duration*25}:s=1920x1080:fps=25",
        "-c:v", "libx264",
        "-t", str(duration),
        "-pix_fmt", "yuv420p",
        str(output_path)
    ]
    subprocess.run(cmd, capture_output=True, check=True)
    return output_path


def generate_scene_videos(storyboard, images):
    """Generate videos for all scenes."""
    print(f"\n[3/6] Generating scene videos...")
    
    videos = []
    for i, scene in enumerate(storyboard["scenes"]):
        img_path = images[i]
        video_path = TEMP_DIR / f"video_{scene['scene_number']:02d}.mp4"
        
        # Get duration from storyboard
        duration = scene.get("duration_seconds", 5)
        
        # Create video from image with Ken Burns effect
        image_to_video(img_path, video_path, scene.get("animation_direction", ""), duration)
        videos.append(video_path)
        print(f"    ✓ Video {scene['scene_number']}: {video_path.name}")
    
    return videos


def stitch_videos(videos, output_path):
    """Stitch all videos together with FFmpeg."""
    print(f"\n[4/6] Stitching {len(videos)} videos...")
    
    # Create concat file
    concat_file = TEMP_DIR / "concat.txt"
    with open(concat_file, "w") as f:
        for video in videos:
            f.write(f"file '{video.absolute()}'\n")
    
    # Stitch
    cmd = [
        "ffmpeg", "-y",
        "-f", "concat",
        "-safe", "0",
        "-i", str(concat_file),
        "-c:v", "libx264",
        "-crf", "18",
        "-preset", "fast",
        "-pix_fmt", "yuv420p",
        str(output_path)
    ]
    subprocess.run(cmd, capture_output=True, check=True)
    
    print(f"    ✓ Final video: {output_path}")
    return output_path


def add_audio(video_path, narration_text, output_path):
    """Add narration using TTS (optional)."""
    print(f"\n[5/6] Adding audio...")
    # This would use ElevenLabs or other TTS API
    # For now, just copy the video
    import shutil
    shutil.copy2(video_path, output_path)
    return output_path


def cleanup():
    """Remove temporary files."""
    print(f"\n[6/6] Cleaning up...")
    import shutil
    shutil.rmtree(TEMP_DIR, ignore_errors=True)


def create_video(topic):
    """Main pipeline: research → images → videos → stitch."""
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    print(f"\n{'='*60}")
    print(f"VOX-STYLE VIDEO CREATOR")
    print(f"Topic: {topic}")
    print(f"Time: {timestamp}")
    print(f"{'='*60}")
    
    # Step 1: Research
    storyboard = research_topic(topic)
    
    # Step 2: Generate images
    images = generate_scene_images(storyboard)
    
    # Step 3: Generate videos
    videos = generate_scene_videos(storyboard, images)
    
    # Step 4: Stitch
    final_path = OUTPUT_DIR / f"final_{timestamp}.mp4"
    stitch_videos(videos, final_path)
    
    # Step 5: Add audio (placeholder)
    output_path = OUTPUT_DIR / f"vox_{topic.replace(' ', '_')}_{timestamp}.mp4"
    add_audio(final_path, "", output_path)
    
    # Step 6: Cleanup
    cleanup()
    
    print(f"\n{'='*60}")
    print(f"COMPLETE!")
    print(f"Output: {output_path}")
    print(f"Size: {output_path.stat().st_size / 1024 / 1024:.1f} MB")
    print(f"{'='*60}")
    
    return output_path


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python vox_video.py 'topic here'")
        sys.exit(1)
    
    create_video(sys.argv[1])
