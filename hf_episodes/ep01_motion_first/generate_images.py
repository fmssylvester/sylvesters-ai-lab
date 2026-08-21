#!/usr/bin/env python3
"""
Image Generator — downloads AI images from Pollinations.ai for each scene.
"""
import json
import os
import re
import time
import requests
import urllib.parse

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
STORYBOARD_PATH = os.path.join(SCRIPT_DIR, "storyboard.json")
IMAGES_DIR = os.path.join(SCRIPT_DIR, "images")

# Pollinations.ai free image API
POLLINATIONS_URL = "https://image.pollinations.ai/prompt/{prompt}?width=1920&height=1080&nologo=true&seed={seed}"


def load_storyboard():
    with open(STORYBOARD_PATH) as f:
        return json.load(f)


def visual_to_image_prompt(visual_desc: str, scene_type: str, text_elements: list) -> str:
    """Convert visual description to a Pollinations.ai image prompt."""
    # Build a rich prompt based on the scene type and visual description
    base_style = "dark tech editorial motion graphics style, dark background, neon cyan and purple accents, minimalist, clean"

    # Extract key visual elements from the description
    key_elements = visual_desc.split(".")[0]  # First sentence is usually the main visual

    # Build prompt based on scene type
    if scene_type == "hook":
        prompt = f"Abstract digital typography collision, words COPY and PASTE colliding and shattering into digital particles, dark tech background with cyan and purple neon glow, motion graphics style, cinematic"
    elif scene_type == "glitch":
        prompt = f"Glitch art digital distortion, wall of scrolling code text on left side, video play button icon on right morphing into static noise, dark background with red and cyan glitch artifacts, tech editorial style"
    elif scene_type == "step_reveal":
        prompt = f"Minimalist toggle switch flipping from red STATIC to green MOTION-FIRST, clean tech interface design, dark background, two branching nodes showing camera and timeline icons, neon cyan accents"
    elif scene_type == "diagram":
        if "camera" in visual_desc.lower():
            prompt = f"Camera lens diagram with radial lines expanding outward, technical illustration style, dark background, neon cyan outlines, motion graphics, clean minimalist design"
        else:
            prompt = f"Abstract particles flowing in slow motion, leaves and smoke drifting across dark background, volumetric light rays, ethereal atmosphere, motion graphics style"
    elif scene_type == "comparison":
        prompt = f"Split screen comparison layout, left side red-tinted chaotic visual clutter, right side clean blue-tinted motion tokens, dark background, tech editorial style, before and after"
    elif scene_type == "warning":
        prompt = f"Yellow hazard warning stripes scrolling diagonally, stability meter gauge hitting red zone, dark background, technical warning interface, neon accents"
    elif scene_type == "stamp":
        prompt = f"Official circular seal stamp with laurel wreath, APPROVED text in center, dramatic camera shake effect, dark background, golden and cyan accents, authoritative design"
    elif scene_type == "cta":
        prompt = f"Stylized laboratory beaker with digital pulse wave inside, social media icons floating around, subscribe button glowing, dark tech background, neon cyan and purple"
    else:
        prompt = f"{key_elements}, {base_style}"

    # Add style suffix
    prompt = f"{prompt}, {base_style}, 4k, detailed, professional"

    return prompt


def download_image(prompt: str, scene_number: int, seed: int = 42) -> str:
    """Download image from Pollinations.ai."""
    os.makedirs(IMAGES_DIR, exist_ok=True)

    encoded_prompt = urllib.parse.quote(prompt)
    url = POLLINATIONS_URL.format(prompt=encoded_prompt, seed=seed)

    output_path = os.path.join(IMAGES_DIR, f"scene_{scene_number:02d}.png")

    # Skip if already exists
    if os.path.exists(output_path) and os.path.getsize(output_path) > 10000:
        print(f"   ⏭️  scene_{scene_number:02d}.png exists, skipping")
        return output_path

    print(f"   🎨 Generating image for scene {scene_number}...")
    print(f"      Prompt: {prompt[:80]}...")

    try:
        resp = requests.get(url, timeout=120, stream=True)
        resp.raise_for_status()

        with open(output_path, "wb") as f:
            for chunk in resp.iter_content(chunk_size=8192):
                f.write(chunk)

        size_kb = os.path.getsize(output_path) / 1024
        print(f"   ✅ scene_{scene_number:02d}.png ({size_kb:.0f} KB)")
        return output_path

    except Exception as e:
        print(f"   ❌ Failed: {e}")
        return None


def generate_all_images():
    storyboard = load_storyboard()
    scenes = storyboard["scenes"]

    print(f"🎨 Generating {len(scenes)} AI images...\n")

    results = []
    for scene in scenes:
        num = scene["scene_number"]
        prompt = visual_to_image_prompt(
            scene["visual_description"],
            scene["type"],
            scene.get("text_elements", [])
        )
        path = download_image(prompt, num, seed=num * 10)
        results.append({"scene": num, "path": path, "prompt": prompt})
        time.sleep(2)  # Be nice to the API

    successful = sum(1 for r in results if r["path"])
    print(f"\n✅ Generated {successful}/{len(scenes)} images")
    return results


if __name__ == "__main__":
    generate_all_images()
