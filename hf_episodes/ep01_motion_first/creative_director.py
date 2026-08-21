#!/usr/bin/env python3
"""
Creative Director Pipeline — Gemini analyzes script, generates HyperFrames storyboard.
Uses Gemini REST API (no SDK needed).
"""
import json
import os
import sys
import requests

GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY", "")
GEMINI_MODEL = "gemini-3-flash-preview"
GEMINI_URL = f"https://generativelanguage.googleapis.com/v1beta/models/{GEMINI_MODEL}:generateContent?key={GEMINI_API_KEY}"

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
WORKSPACE = "/data/data/com.termux/files/home/ai-lab-internal/pipeline/workspace/ai-video-motion-first-secret"
STORYBOARD_PATH = os.path.join(SCRIPT_DIR, "storyboard.json")


def load_script():
    with open(os.path.join(WORKSPACE, "script.json")) as f:
        return json.load(f)


def ask_gemini(prompt: str, retries: int = 5) -> str:
    import time
    payload = {
        "contents": [{"parts": [{"text": prompt}]}],
        "generationConfig": {
            "temperature": 0.7,
            "topP": 0.95,
            "maxOutputTokens": 16384,
            "responseMimeType": "application/json",
        },
    }
    for attempt in range(retries):
        resp = requests.post(GEMINI_URL, json=payload, timeout=120)
        if resp.status_code == 503:
            wait = 15 * (attempt + 1)
            print(f"   ⚠️ Gemini 503 (high demand), waiting {wait}s... (attempt {attempt+1}/{retries})")
            time.sleep(wait)
            continue
        resp.raise_for_status()
        data = resp.json()
        return data["candidates"][0]["content"]["parts"][0]["text"]
    raise Exception(f"Gemini unavailable after {retries} retries")


def generate_storyboard(script: dict) -> dict:
    sections_text = ""
    for i, s in enumerate(script["sections"], 1):
        sections_text += f"\n--- Section {i}: {s['heading']} ---\n{s['voiceover']}\n"

    prompt = f"""You are a motion graphics creative director for a YouTube explainer series called "Sylvester's AI Lab".

Here is the script for Episode 1: "{script['title']}"

HOOK: {script['hook']}

SECTIONS:
{sections_text}

CTA: {script['cta']}

Your job: Create a detailed storyboard for a motion graphics video (NO talking heads, NO stock footage — pure animated graphics).

Return a JSON object with this EXACT structure:
{{
  "title": "episode title",
  "style": {{
    "name": "style name (e.g. dark-tech, minimal-clean, vibrant-editorial)",
    "description": "one sentence describing the visual approach",
    "background": "hex color for primary background",
    "palette": ["#hex1", "#hex2", "#hex3", "#hex4", "#hex5", "#hex6"],
    "primaryFont": "font name from Google Fonts",
    "accentFont": "font name from Google Fonts"
  }},
  "scenes": [
    {{
      "scene_number": 1,
      "type": "hook|intro|concept|comparison|step|warning|verdict|cta",
      "duration_seconds": 5,
      "narration": "exact voiceover text from script",
      "visual_description": "what the viewer sees — animated elements, not static",
      "animation_type": "kinetic_type|counter|comparison|step_reveal|diagram|morph|glitch|stamp",
      "gsap_timeline": [
        {{
          "t": 0.0,
          "action": "from|to|fromTo|set",
          "target": "CSS selector",
          "props": {{}},
          "note": "what this does"
        }}
      ],
      "text_elements": [
        {{
          "text": "text to display",
          "role": "heading|subheading|stat|label|quote",
          "animate": "how it appears"
        }}
      ]
    }}
  ]
}}

RULES:
- 8-12 scenes total
- Each scene duration: 3-8 seconds
- Total video: 50-70 seconds
- Every scene MUST have real GSAP animations (no static text)
- Use kinetic typography for key phrases
- Use animated counters for numbers/stats
- Use comparison layouts for before/after
- Use step-by-step reveals for formulas
- Use glitch effects for "trap" or "mistake" scenes
- Use stamp/seal effect for verdict
- All text must animate in — nothing static
- Color palette: dark background with vibrant accent colors
- Think "Apple keynote meets Vox explainer"

IMPORTANT: Return ONLY valid JSON. No markdown fences, no explanation, no trailing commas. The JSON must parse correctly."""

    print("🧠 Asking Gemini for creative direction...")
    raw = ask_gemini(prompt)

    # Strip markdown fences if present
    cleaned = raw.strip()
    if cleaned.startswith("```"):
        cleaned = cleaned.split("\n", 1)[1]
    if cleaned.endswith("```"):
        cleaned = cleaned.rsplit("```", 1)[0]
    cleaned = cleaned.strip()

    # Save raw response for debugging
    raw_path = os.path.join(SCRIPT_DIR, "raw_gemini_response.txt")
    with open(raw_path, "w") as f:
        f.write(cleaned)
    print(f"   Raw response saved to {raw_path}")

    try:
        return json.loads(cleaned)
    except json.JSONDecodeError as e:
        print(f"   ⚠️ JSON parse error: {e}")
        print(f"   Attempting to fix common issues...")
        # Try to fix common JSON issues
        import re
        # Remove trailing commas
        fixed = re.sub(r',\s*([}\]])', r'\1', cleaned)
        # Fix unescaped quotes in strings
        try:
            return json.loads(fixed)
        except json.JSONDecodeError:
            print(f"   ❌ Could not parse Gemini response. Saving to debug file.")
            with open(os.path.join(SCRIPT_DIR, "parse_error.txt"), "w") as f:
                f.write(f"Error: {e}\n\nCleaned response:\n{cleaned}\n\nFixed attempt:\n{fixed}")
            raise


def save_storyboard(storyboard: dict):
    with open(STORYBOARD_PATH, "w") as f:
        json.dump(storyboard, f, indent=2)
    print(f"✅ Storyboard saved to {STORYBOARD_PATH}")
    print(f"   Style: {storyboard['style']['name']}")
    print(f"   Scenes: {len(storyboard['scenes'])}")
    total_dur = sum(s["duration_seconds"] for s in storyboard["scenes"])
    print(f"   Total duration: ~{total_dur}s")


if __name__ == "__main__":
    script = load_script()
    storyboard = generate_storyboard(script)
    save_storyboard(storyboard)
