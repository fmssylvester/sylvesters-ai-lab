#!/usr/bin/env python3
"""
Creative Director — AI-powered motion design planning and critique.

Two modes:
    PLAN:   Generate a creative brief from a scene description
            python3 scripts/creative-director.py --plan "scene description"

    CRITIQUE: Analyze a rendered frame
            python3 scripts/creative-director.py --critique frame.png [--scene NAME]
"""

import sys
import os
import json
import subprocess
import urllib.request
import base64

# ─── Motion Design Constitution ─────────────────────────────────────────────
CONSTITUTION = """
## Motion Design Constitution

- Animate ideas, not words. Visuals before text.
- Every frame could be a poster — composition quality before animation quality.
- One focal point per frame. Dominant primary, single secondary, minimal supporting.
- Negative space is a design element. Objects must breathe.
- Progressive storytelling: beginning → escalation → payoff. Never jump to the final state.
- No generic scale/fade/slide as primary animation language. Motion must feel physically motivated.
- Build reusable components. Never hardcode one-off animations.
"""

# ─── Design tokens ──────────────────────────────────────────────────────────
DESIGN_TOKENS = """
## Design Tokens (Sylvester's AI Lab)

- Background: #07090D (near-black)
- Cyan accent: #00D9FF
- Gold accent: #E7B84D
- Typography: display serif for headlines, system sans for UI
- Z-index: background=0 → transition=100
- FPS: 30 (all compositions)
- Output: 1920x1080 (16:9)
"""

# ─── Current trends ─────────────────────────────────────────────────────────
TRENDS = """
## Current Motion Design Trends (2024-2026)

- Kinetic typography: text as the primary visual element, animated with purpose
- Gradient mesh backgrounds: organic color fields, not flat gradients
- Film grain + vignette: cinematic texture adds depth and warmth
- Muted palettes with single bold accent: restraint > saturation
- Negative space storytelling: what you DON'T show matters
- Physics-based motion: springs, momentum, inertia — not linear easing
- Depth of field simulation: blur as a storytelling tool, not decoration
- Micro-interactions: small, purposeful movements that reward attention
- Audio-reactive visuals: animation driven by sound (waveforms, beats)
- Cinematic aspect ratios: 2.39:1 or 16:9 with heavy letterboxing
- Generative/organic textures: noise fields, particle systems, fluid simulation
- Dark-mode-first: dark backgrounds with luminous accents
- Typography hierarchy through weight + size, not color
- Transition as content: the morph between states IS the story
"""

# ─── Asset sources ──────────────────────────────────────────────────────────
ASSET_SOURCES = """
## Free Asset Sources (No License Issues)

- Footage: Pexels (pexels.com), Pixabay (pixabay.com), Coverr (coverr.co)
- Images: Unsplash (unsplash.com), Pexels, Pixabay
- Audio: Freesound (freesound.org), Pixabay Audio, Free Music Archive
- Music: Pixabay Music, Free Music Archive, Incompetech
- Textures: Textures.com, Unsplash (search "texture"), Pexels
- Fonts: Google Fonts (fonts.google.com), Font Squirrel
- Icons: Lucide (lucide.dev), Phosphor (phosphoricons.com)
- LUTs / Color: GitHub (search "cinematic LUT"), RocketStock free LUTs

## Paid / Premium Sources (Higher Quality)

- Footage: Artgrid, Storyblocks, Motion Array
- Music: Artlist, Epidemic Sound, Musicbed
- Fonts: Adobe Fonts, MyFonts, Fontshare
- 3D: Turbosquid, Sketchfab, Poly Haven (free)
"""

# ─── Framing guide reference ────────────────────────────────────────────────
FRAMING_GUIDE = """
## Framing Principles for Each Asset

When describing how to frame an asset, use these principles:

### Rule of Thirds
- Place the subject at one of the 4 intersection points
- Leave 2/3 of the frame as negative space
- Horizon line on the upper or lower third, never center

### Golden Ratio (1.618)
- Spiral composition: subject at the spiral's focal point
- Use for organic, flowing layouts
- Better for nature/abstract content than UI/tech

### Center Frame (Breaking the Rule)
- Use ONLY for symmetry, power, or confrontation
- Works for logos, icons, hero text
- Must have strong bilateral symmetry to justify

### Depth Layering
- Foreground: large, blurred, framing element (10-20% of frame)
- Midground: the main subject, sharp, at focal point
- Background: atmospheric, desaturated, blurred
- Creates cinematic depth without 3D

### Negative Space
- Subject occupies <30% of frame
- The empty space IS the composition
- Works for: headlines, minimal moments, breathing room between acts

### Aspect Ratio Considerations
- 16:9 (1920x1080): standard, safe for all platforms
- 2.39:1: cinematic letterbox, use black bars top/bottom
- 9:16: vertical/mobile, stack elements vertically
- 1:1: square, center-heavy, good for social
"""


def build_plan_prompt(description):
    """Build the pre-production creative brief prompt."""
    return f"""You are a senior creative director at a top motion design studio. A director has given you this scene concept:

"{description}"

{CONSTITUTION}{DESIGN_TOKENS}{TRENDS}{ASSET_SOURCES}{FRAMING_GUIDE}

## Generate a Full Creative Brief

Structure your response in these sections:

### 1. SCENE INTERPRETATION
- What is the core message / story beat?
- What emotion should the viewer feel?
- What is the narrative arc (beginning → escalation → payoff)?
- What is the ONE thing the viewer should remember?

### 2. VISUAL DIRECTION
- Overall mood (3-5 adjectives)
- Color palette (specific hex codes, not "blue" — give me #00D9FF)
- Lighting direction (hard/soft, direction, contrast ratio)
- Texture treatment (grain, noise, clean, organic)
- Depth of field strategy

### 3. ASSET LIST
For EACH asset needed, provide:
- **Asset name**: descriptive label
- **Type**: footage / image / texture / audio / font / icon / 3D
- **Search terms**: exact phrases to search on Pexels/Pixabay/Unsplash
- **Source**: which site to download from
- **Resolution**: minimum quality needed
- **License**: free / attribution required / paid
- **Usage**: where in the scene this asset appears (foreground/midground/background)

### 4. FRAMING GUIDE
For EACH visual asset, describe exactly how to frame it:
- Position in frame (use rule of thirds grid: top-left, center-right, etc.)
- Scale relative to frame (e.g., "subject fills 40% of frame height")
- Depth layer (foreground / midground / background)
- Blur/DOF treatment (sharp, slight blur, heavy bokeh)
- Crop/scale behavior (static, slow zoom, parallax)

### 5. TYPOGRAPHY PLAN
- Headline font (from Google Fonts, specify exact name)
- Body/UI font
- Hierarchy: size, weight, color for each text layer
- Animation direction for text (kinetic type, fade, morph, etc.)

### 6. ANIMATION STORYBOARD
Describe 4-6 key moments (frames) in the scene:
- Frame N: what happens, what moves, what appears/disappears
- Easing: spring / ease-out / ease-in-out / linear
- Duration: approximate frames at 30fps
- Audio sync: any sound design cues

### 7. TECHNICAL NOTES
- Recommended composition duration (frames at 30fps)
- Layer order (z-index from back to front)
- Any special effects needed (grain, vignette, glow, blur)
- Performance considerations (heavy assets, render time)

Be specific. Give me hex codes, font names, exact search terms, precise frame numbers. No vague directions.
"""


def build_critique_prompt(scene=None):
    """Build the post-render critique prompt."""
    scene_context = ""
    if scene:
        scene_context = f"\n## Scene Context\nThis frame is from the '{scene}' composition.\n"

    return f"""You are a senior creative director at a top motion design studio (think: ManvsMachine, Pentagram, Ordinary Folk). You have 15+ years of experience in motion graphics, typography, and cinematic storytelling.

Analyze this rendered frame from a motion graphics composition. Give clear, actionable creative feedback.

{CONSTITUTION}{DESIGN_TOKENS}{TRENDS}{scene_context}

## Output Format

### 1. COMPOSITION
- Focal point clarity
- Balance and weight distribution
- Negative space usage

### 2. TYPOGRAPHY
- Readability, hierarchy, weight/size contrast

### 3. COLOR & TONE
- Palette cohesion, contrast ratios, accent usage

### 4. MOTION QUALITY (inferred)
- Purposeful movement? Progressive storytelling? Physically motivated?

### 5. TREND ALIGNMENT
- What trends are present? What's missing?

### 6. WHAT WORKS (2-3 specific things)

### 7. WHAT TO CHANGE (2-3 specific, actionable fixes)

### 8. OVERALL SCORE (1-10 with one-line verdict)

Be direct, specific, and opinionated. No hedging.
"""


def call_backend(prompt, image_path=None, backend="openrouter"):
    """Send prompt (optionally with image) to a vision/text backend."""
    key_map = {
        "openrouter": ("OPENROUTER_API_KEY", "OPENROUTER_MODEL", "google/gemma-4-26b-a4b-it:free",
                       "https://openrouter.ai/api/v1/chat/completions", None),
        "nvidia": ("NVIDIA_API_KEY", "NVIDIA_MODEL", "meta/llama-3.2-11b-vision-instruct",
                    "https://integrate.api.nvidia.com/v1/chat/completions", None),
        "github": ("GITHUB_MODELS_TOKEN", "GITHUB_MODEL", "openai/gpt-4o",
                    "https://models.github.ai/inference/chat/completions", None),
    }

    if backend not in key_map:
        return None

    key_env, model_env, default_model, url, _ = key_map[backend]
    key = os.environ.get(key_env)
    if not key:
        return None
    model = os.environ.get(model_env, default_model)

    content = [{"type": "text", "text": prompt}]

    if image_path:
        jpg_path = image_path
        if image_path.lower().endswith(".png"):
            jpg_path = image_path.rsplit(".", 1)[0] + ".jpg"
            try:
                subprocess.run(["ffmpeg", "-y", "-i", image_path, jpg_path],
                               capture_output=True, timeout=30)
            except Exception:
                jpg_path = image_path
        with open(jpg_path, "rb") as f:
            img_b64 = base64.b64encode(f.read()).decode()
        mime = "image/jpeg" if jpg_path.endswith(".jpg") else "image/png"
        content.append({"type": "image_url", "image_url": {"url": f"data:{mime};base64,{img_b64}"}})

    payload = {"model": model, "messages": [{"role": "user", "content": content}]}
    if backend in ("nvidia", "github"):
        payload["max_tokens"] = 4096

    headers = {"Content-Type": "application/json", "Authorization": f"Bearer {key}"}
    if backend == "github":
        headers["Accept"] = "application/vnd.github+json"
        headers["X-GitHub-Api-Version"] = "2022-11-28"

    req = urllib.request.Request(url, data=json.dumps(payload).encode(), headers=headers)
    with urllib.request.urlopen(req, timeout=180) as resp:
        data = json.loads(resp.read())
    return data["choices"][0]["message"]["content"]


def load_env():
    """Load .env keys into os.environ."""
    env_path = os.path.join(os.path.dirname(__file__), "..", ".env")
    if os.path.exists(env_path):
        with open(env_path) as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith("#") and "=" in line:
                    k, v = line.split("=", 1)
                    os.environ.setdefault(k.strip(), v.strip())


def run_with_fallback(prompt, image_path=None):
    """Try backends in order, return first success."""
    for backend in ("openrouter", "github", "nvidia"):
        try:
            result = call_backend(prompt, image_path, backend=backend)
            if result:
                return f"[creative-director/{backend}]\n{result}"
        except Exception:
            continue
    return "All backends failed. Check API keys in .env and network."


def main():
    load_env()

    if len(sys.argv) < 2:
        print(__doc__)
        sys.exit(1)

    mode = sys.argv[1]

    if mode == "--plan":
        description = " ".join(sys.argv[2:]) if len(sys.argv) > 2 else None
        if not description:
            print("Usage: python3 scripts/creative-director.py --plan \"scene description\"")
            sys.exit(1)
        prompt = build_plan_prompt(description)
        print(run_with_fallback(prompt))

    elif mode == "--critique":
        if len(sys.argv) < 3:
            print("Usage: python3 scripts/creative-director.py --critique frame.png [--scene NAME]")
            sys.exit(1)
        image_path = sys.argv[2]
        if not os.path.exists(image_path):
            print(f"Error: {image_path} not found")
            sys.exit(1)
        scene = None
        if "--scene" in sys.argv:
            idx = sys.argv.index("--scene")
            if idx + 1 < len(sys.argv):
                scene = sys.argv[idx + 1]
        prompt = build_critique_prompt(scene)
        print(run_with_fallback(prompt, image_path))

    else:
        # Legacy: bare image path = critique mode
        if os.path.exists(mode):
            scene = None
            if "--scene" in sys.argv:
                idx = sys.argv.index("--scene")
                if idx + 1 < len(sys.argv):
                    scene = sys.argv[idx + 1]
            prompt = build_critique_prompt(scene)
            print(run_with_fallback(prompt, mode))
        else:
            print(f"Unknown mode: {mode}")
            print(__doc__)
            sys.exit(1)


if __name__ == "__main__":
    main()
