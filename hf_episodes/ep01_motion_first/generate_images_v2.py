#!/usr/bin/env python3
"""
Image Generator v2 — Cinematic, realistic images that match the script.
Each image looks like a frame from a real video, not abstract art.
"""
import json
import os
import time
import urllib.parse
import requests

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
STORYBOARD_PATH = os.path.join(SCRIPT_DIR, "storyboard.json")
IMAGES_DIR = os.path.join(SCRIPT_DIR, "images_v2")

POLLINATIONS_URL = "https://image.pollinations.ai/prompt/{prompt}?width=1920&height=1080&nologo=true&seed={seed}"

# Cinematic prompts that MATCH the script — each shows a real scene
SCENE_PROMPTS = {
    1: {
        "prompt": "Cinematic close-up of a computer screen showing an AI image prompt being copied, the cursor selecting text from a Midjourney-style prompt box, warm monitor glow in a dark room, photorealistic, shallow depth of field, 4k film still",
        "seed": 101
    },
    2: {
        "prompt": "Cinematic over-the-shoulder shot of a person at a desk with two monitors, left monitor shows a long detailed text prompt, right monitor shows a distorted AI-generated video with melting faces and artifacts, realistic office setting, moody lighting, 4k film still",
        "seed": 201
    },
    3: {
        "prompt": "Cinematic close-up of a hand flipping a physical toggle switch from red OFF position to green ON position, the switch is mounted on a clean white panel, dramatic side lighting, shallow depth of field, photorealistic, 4k film still",
        "seed": 301
    },
    4: {
        "prompt": "Cinematic shot of a professional cinema camera on a tripod in a dark studio, the lens reflecting blue light, text overlays floating around it saying slow pan and zoom in and crane shot, dramatic rim lighting, photorealistic, 4k film still",
        "seed": 401
    },
    5: {
        "prompt": "Cinematic split-screen comparison, left side shows a chaotic scribbled figure running with motion blur and red tint, right side shows a calm person slowly turning their head with clean composition and blue tint, dramatic lighting, photorealistic, 4k film still",
        "seed": 501
    },
    6: {
        "prompt": "Cinematic wide shot of a misty forest at golden hour, leaves gently falling through volumetric light rays, smoke drifting through trees, atmospheric and ethereal, shallow depth of field, photorealistic, 4k film still",
        "seed": 601
    },
    7: {
        "prompt": "Cinematic comparison shot, left side shows a cluttered desk with hundreds of sticky notes and papers everywhere, right side shows a clean desk with three simple index cards, dramatic contrast lighting, photorealistic, 4k film still",
        "seed": 701
    },
    8: {
        "prompt": "Cinematic close-up of a person trying to tie shoelaces but their fingers are morphing and distorting unnaturally, uncanny valley effect, yellow warning light in background, unsettling atmosphere, photorealistic, 4k film still",
        "seed": 801
    },
    9: {
        "prompt": "Cinematic shot of a wooden desk with a rubber stamp pressing down on a document, the stamp says APPROVED, dramatic overhead lighting, ink spreading on paper, shallow depth of field, photorealistic, 4k film still",
        "seed": 901
    },
    10: {
        "prompt": "Cinematic shot of a glowing computer monitor in a dark room showing a YouTube subscribe button being clicked, the screen reflects on a person's face, warm and inviting atmosphere, shallow depth of field, photorealistic, 4k film still",
        "seed": 1001
    }
}


def generate_image(prompt: str, seed: int, scene_num: int) -> str:
    """Generate a single cinematic image."""
    os.makedirs(IMAGES_DIR, exist_ok=True)
    output_path = os.path.join(IMAGES_DIR, f"scene_{scene_num:02d}.png")

    # Skip if already exists and valid
    if os.path.exists(output_path) and os.path.getsize(output_path) > 10000:
        print(f"   ⏭️  scene_{scene_num:02d}.png exists ({os.path.getsize(output_path)//1024}KB), skipping")
        return output_path

    encoded = urllib.parse.quote(prompt)
    url = POLLINATIONS_URL.format(prompt=encoded, seed=seed)

    print(f"   🎬 Scene {scene_num}: Generating cinematic image...")
    print(f"      Prompt: {prompt[:80]}...")

    try:
        resp = requests.get(url, timeout=180, stream=True)
        resp.raise_for_status()

        with open(output_path, "wb") as f:
            for chunk in resp.iter_content(chunk_size=8192):
                f.write(chunk)

        size_kb = os.path.getsize(output_path) / 1024
        print(f"   ✅ scene_{scene_num:02d}.png ({size_kb:.0f} KB)")
        return output_path

    except Exception as e:
        print(f"   ❌ Failed: {e}")
        return None


def generate_all():
    print(f"\n🎬 Generating {len(SCENE_PROMPTS)} cinematic images...\n")

    results = []
    for scene_num, info in sorted(SCENE_PROMPTS.items()):
        path = generate_image(info["prompt"], info["seed"], scene_num)
        results.append({"scene": scene_num, "path": path})
        time.sleep(5)  # Be nice to Pollinations rate limit

    successful = sum(1 for r in results if r["path"])
    print(f"\n✅ Generated {successful}/{len(SCENE_PROMPTS)} images")
    return results


if __name__ == "__main__":
    generate_all()
