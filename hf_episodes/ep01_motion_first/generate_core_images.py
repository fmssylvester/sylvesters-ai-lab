#!/usr/bin/env python3
"""
Generate core images for Episode 1 — cinematic, script-matched.
"""
import os
import time
import urllib.parse
import requests

IMAGES_DIR = os.path.dirname(os.path.abspath(__file__)) + "/images_v3"
POLLINATIONS_URL = "https://image.pollinations.ai/prompt/{prompt}?width=1920&height=1080&nologo=true&seed={seed}"

# Each image must look like a frame from a real cinematic video
IMAGES = {
    "woman_portrait": {
        "prompt": "Cinematic portrait of a young woman in a worn red leather jacket standing on rain-soaked cobblestone streets at night, neon signs casting colored reflections in puddles, face partially lit by warm streetlight, shot on 35mm film, f/2.0 bokeh, photorealistic, ultra detailed",
        "seed": 1001
    },
    "explorer_cave": {
        "prompt": "Cinematic portrait of a weathered male explorer in his 40s with dirt-streaked face wearing worn canvas jacket, holding a glowing brass oil lantern at chest height, deep inside an ancient stone cave, dramatic chiaroscuro lighting, lantern as the only light source, deep shadows, photorealistic, 4K",
        "seed": 2001
    },
    "runner_chaotic": {
        "prompt": "Cinematic shot of a figure running through a dark urban street, heavy motion blur, legs distorted and morphing unnaturally, red tinted lighting, chaotic movement, unsettling atmosphere, photorealistic style",
        "seed": 3001
    },
    "person_turning": {
        "prompt": "Cinematic close-up of a calm person slowly turning their head toward the camera, clean composition, soft blue-green lighting, sharp focus on face, shallow depth of field, photorealistic, serene expression",
        "seed": 4001
    },
    "hands_cards": {
        "prompt": "Cinematic close-up of a pair of male hands in their 40s slightly weathered, positioned above a spread of playing cards on a green felt poker table, dramatic overhead studio lighting, photorealistic, shallow depth of field",
        "seed": 5001
    },
    "ai_morphing_face": {
        "prompt": "Cinematic close-up of a human face that is clearly morphing and distorting unnaturally, skin stretching and melting, uncanny valley effect, one eye larger than the other, disturbing AI generation artifact, red warning light in background, photorealistic horror",
        "seed": 6001
    },
    "ai_morphing_hands": {
        "prompt": "Cinematic close-up of human hands with fingers melting and fusing together unnaturally, cards distorting between fingers, uncanny valley AI generation artifact, disturbing morphing effect, photorealistic",
        "seed": 7001
    },
    "clean_still": {
        "prompt": "Cinematic still frame of a professional video editing timeline on a dark monitor screen, clean interface, playhead at center, color grading panels visible, soft ambient light reflecting off screen, photorealistic, shallow depth of field",
        "seed": 8001
    }
}

def generate_all():
    os.makedirs(IMAGES_DIR, exist_ok=True)
    
    print(f"Generating {len(IMAGES)} core images...\n")
    
    for name, info in IMAGES.items():
        output = os.path.join(IMAGES_DIR, f"{name}.png")
        
        if os.path.exists(output) and os.path.getsize(output) > 5000:
            print(f"  ⏭️  {name}.png exists ({os.path.getsize(output)//1024}KB)")
            continue
        
        encoded = urllib.parse.quote(info["prompt"])
        url = POLLINATIONS_URL.format(prompt=encoded, seed=info["seed"])
        
        print(f"  🎬 {name}: {info['prompt'][:70]}...")
        
        try:
            resp = requests.get(url, timeout=180, stream=True)
            resp.raise_for_status()
            with open(output, "wb") as f:
                for chunk in resp.iter_content(8192):
                    f.write(chunk)
            print(f"     ✅ {os.path.getsize(output)//1024} KB")
        except Exception as e:
            print(f"     ❌ {e}")
        
        time.sleep(5)
    
    print(f"\nDone. Images in {IMAGES_DIR}")

if __name__ == "__main__":
    generate_all()
