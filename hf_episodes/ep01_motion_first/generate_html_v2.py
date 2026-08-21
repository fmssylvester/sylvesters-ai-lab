#!/usr/bin/env python3
"""
HTML Generator v2 — AI images + GSAP animations = real motion graphics.
"""
import json
import os
import base64

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
SCENES_DIR = os.path.join(SCRIPT_DIR, "scenes")
IMAGES_DIR = os.path.join(SCRIPT_DIR, "images")
STORYBOARD_PATH = os.path.join(SCRIPT_DIR, "storyboard.json")

GSAP_CDN = "https://cdn.jsdelivr.net/npm/gsap@3.14.2/dist/gsap.min.js"


def img_to_data_uri(path: str) -> str:
    """Convert image to data URI for embedding."""
    if not path or not os.path.exists(path):
        return ""
    with open(path, "rb") as f:
        data = base64.b64encode(f.read()).decode()
    return f"data:image/png;base64,{data}"


def build_scene(scene: dict, style: dict) -> str:
    num = scene["scene_number"]
    duration = scene["duration_seconds"]
    scene_type = scene.get("type", "concept")
    anim_type = scene.get("animation_type", "kinetic_type")
    palette = style["palette"]
    bg = style["background"]

    # Get image — use just filename (images copied to scenes dir)
    img_filename = f"scene_{num:02d}.png"
    img_src = img_filename

    # Text elements
    texts = scene.get("text_elements", [])

    # Build text HTML
    text_html = ""
    for te in texts:
        role = te.get("role", "heading")
        text = te.get("text", "")
        if role == "heading":
            text_html += f'<h1 class="scene-heading">{text}</h1>\n'
        elif role == "subheading":
            text_html += f'<p class="scene-subheading">{text}</p>\n'
        elif role == "stat":
            text_html += f'<div class="scene-stat" data-target="{text}">0</div>\n'
        elif role == "label":
            text_html += f'<span class="scene-label">{text}</span>\n'

    # Build GSAP animation based on scene type
    gsap_js = build_gsap(scene_type, anim_type, scene)

    html = f"""<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=1920, height=1080" />
  <script src="{GSAP_CDN}"></script>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;700;900&family=JetBrains+Mono:wght@400;700&display=swap" rel="stylesheet" />
  <style>
    * {{ margin: 0; padding: 0; box-sizing: border-box; }}
    html, body {{
      width: 1920px; height: 1080px; overflow: hidden;
      background: {bg};
      font-family: 'Inter', sans-serif;
      color: #fff;
    }}

    /* Background image layer */
    .bg-image {{
      position: absolute; top: 0; left: 0;
      width: 100%; height: 100%;
      object-fit: cover;
      opacity: 0.35;
      filter: saturate(0.7) contrast(1.1);
    }}

    /* Dark overlay gradient */
    .overlay {{
      position: absolute; top: 0; left: 0;
      width: 100%; height: 100%;
      background: linear-gradient(
        135deg,
        rgba(5,5,5,0.85) 0%,
        rgba(5,5,5,0.6) 50%,
        rgba(5,5,5,0.85) 100%
      );
    }}

    /* Content layer */
    .content {{
      position: absolute; top: 0; left: 0;
      width: 100%; height: 100%;
      display: flex; flex-direction: column;
      justify-content: center; align-items: center;
      padding: 80px 120px;
      z-index: 10;
    }}

    /* Typography */
    .scene-heading {{
      font-size: 80px; font-weight: 900;
      text-align: center; line-height: 1.05;
      text-shadow: 0 4px 30px rgba(0,0,0,0.8);
      letter-spacing: -2px;
    }}
    .scene-subheading {{
      font-size: 36px; font-weight: 400;
      color: {palette[1]};
      margin-top: 24px; text-align: center;
      text-shadow: 0 2px 20px rgba(0,0,0,0.6);
    }}
    .scene-stat {{
      font-size: 200px; font-weight: 900;
      color: {palette[2]};
      font-family: 'JetBrains Mono', monospace;
      text-shadow: 0 0 60px {palette[2]}40;
    }}
    .scene-label {{
      font-size: 20px; font-weight: 700;
      text-transform: uppercase; letter-spacing: 6px;
      color: {palette[3]}; opacity: 0.7;
    }}

    /* Accent lines */
    .accent-line {{
      position: absolute;
      background: {palette[1]};
      opacity: 0.3;
    }}
    .accent-line.horizontal {{
      width: 0; height: 2px;
      top: 50%; left: 10%;
    }}
    .accent-line.vertical {{
      width: 2px; height: 0;
      left: 50%; top: 20%;
    }}

    /* Glow effects */
    .glow-orb {{
      position: absolute;
      border-radius: 50%;
      filter: blur(80px);
    }}

    /* Scene-type specific */
    .comparison-container {{
      display: flex; gap: 60px; width: 100%;
      justify-content: center;
    }}
    .compare-side {{
      flex: 1; padding: 40px;
      border-radius: 20px;
      text-align: center;
      opacity: 0;
    }}
    .compare-bad {{
      background: rgba(255,62,62,0.15);
      border: 2px solid rgba(255,62,62,0.3);
    }}
    .compare-good {{
      background: rgba(0,240,255,0.15);
      border: 2px solid rgba(0,240,255,0.3);
    }}

    .step-cards {{
      display: flex; flex-direction: column;
      gap: 20px; width: 800px;
    }}
    .step-card {{
      display: flex; align-items: center; gap: 24px;
      background: rgba(255,255,255,0.06);
      border: 1px solid rgba(255,255,255,0.1);
      border-radius: 16px; padding: 24px 32px;
      opacity: 0; transform: translateX(60px);
    }}
    .step-num {{
      font-size: 48px; font-weight: 900;
      color: {palette[2]}; min-width: 60px;
    }}
    .step-text {{
      font-size: 28px; color: #eee;
    }}

    .stamp {{
      width: 280px; height: 280px;
      border: 6px solid {palette[2]};
      border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      font-size: 36px; font-weight: 900;
      color: {palette[2]};
      text-transform: uppercase;
      transform: rotate(-15deg) scale(3);
      opacity: 0;
      text-align: center;
      line-height: 1.2;
    }}

    /* Noise texture */
    .noise {{
      position: absolute; top: 0; left: 0;
      width: 100%; height: 100%;
      opacity: 0.03;
      background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E");
      z-index: 5;
    }}
  </style>
</head>
<body>
  <img class="bg-image" src="{img_src}" alt="" />
  <div class="overlay"></div>
  <div class="noise"></div>

  <!-- Accent lines -->
  <div class="accent-line horizontal"></div>
  <div class="accent-line vertical"></div>

  <!-- Glow orbs -->
  <div class="glow-orb" style="width:400px;height:400px;background:{palette[1]};top:-100px;right:-100px;"></div>
  <div class="glow-orb" style="width:300px;height:300px;background:{palette[2]};bottom:-80px;left:-80px;"></div>

  <div class="content">
    {text_html}
  </div>

  <script>
    window.__timelines = window.__timelines || {{}};
    const tl = gsap.timeline({{ paused: true }});

{gsap_js}

    window.__timelines["scene-{num}"] = tl;
  </script>
</body>
</html>"""

    return html


def build_gsap(scene_type: str, anim_type: str, scene: dict) -> str:
    """Build GSAP timeline JS based on scene type."""
    num = scene["scene_number"]
    # Use single quotes for JS strings containing double quotes in selectors
    s = f"[data-composition-id='scene-{num}']"
    lines = []

    # Always animate background image (Ken Burns)
    lines.append('  // Ken Burns on background')
    lines.append(f"  tl.from('{s} .bg-image', {{ scale: 1.2, duration: 8, ease: 'none' }}, 0);")
    lines.append(f"  tl.to('{s} .bg-image', {{ scale: 1.0, duration: 8, ease: 'none' }}, 0);")

    # Animate glow orbs
    lines.append('  // Glow orbs')
    lines.append(f"  tl.from('{s} .glow-orb', {{ opacity: 0, scale: 0.5, duration: 2, stagger: 0.3, ease: 'power2.out' }}, 0.5);")

    # Animate accent lines
    lines.append('  // Accent lines')
    lines.append(f"  tl.to('{s} .accent-line.horizontal', {{ width: '80%', duration: 1.5, ease: 'power3.out' }}, 0.3);")
    lines.append(f"  tl.to('{s} .accent-line.vertical', {{ height: '60%', duration: 1.5, ease: 'power3.out' }}, 0.5);")

    # Scene-type specific animations
    if scene_type == "hook":
        lines.append('  // Hook — dramatic text reveal')
        lines.append(f"  tl.from('{s} .scene-heading', {{ y: 80, opacity: 0, duration: 0.8, ease: 'power4.out' }}, 0.5);")
        lines.append(f"  tl.from('{s} .scene-subheading', {{ y: 40, opacity: 0, duration: 0.6, ease: 'power3.out' }}, 1.0);")

    elif scene_type == "glitch":
        lines.append('  // Glitch — text distortion')
        lines.append(f"  tl.from('{s} .scene-heading', {{ opacity: 0, duration: 0.1 }}, 0.5);")
        lines.append('  for(let i=0; i<5; i++) {')
        lines.append(f"    tl.to('{s} .scene-heading', {{ x: -5+i*2, duration: 0.05 }}, 0.5+i*0.08);")
        lines.append('  }')
        lines.append(f"  tl.to('{s} .scene-heading', {{ x: 0, duration: 0.1 }}, 1.0);")
        lines.append(f"  tl.from('{s} .scene-subheading', {{ opacity: 0, y: 20, duration: 0.5 }}, 1.2);")

    elif scene_type == "step_reveal":
        lines.append('  // Step reveal — sequential')
        lines.append(f"  tl.from('{s} .scene-heading', {{ x: -60, opacity: 0, duration: 0.7, ease: 'power3.out' }}, 0.3);")
        lines.append(f"  tl.from('{s} .scene-subheading', {{ x: 60, opacity: 0, duration: 0.7, ease: 'power3.out' }}, 0.8);")

    elif scene_type == "diagram":
        lines.append('  // Diagram — build in')
        lines.append(f"  tl.from('{s} .scene-heading', {{ scale: 0.5, opacity: 0, duration: 0.8, ease: 'back.out(1.7)' }}, 0.4);")
        lines.append(f"  tl.from('{s} .scene-label', {{ opacity: 0, y: 20, duration: 0.5 }}, 1.0);")

    elif scene_type == "comparison":
        lines.append('  // Comparison — split screen')
        lines.append(f"  tl.from('{s} .scene-heading', {{ y: -40, opacity: 0, duration: 0.6 }}, 0.3);")
        lines.append(f"  tl.from('{s} .scene-subheading', {{ y: 40, opacity: 0, duration: 0.6 }}, 0.6);")

    elif scene_type == "warning":
        lines.append('  // Warning — urgent reveal')
        lines.append(f"  tl.from('{s} .scene-heading', {{ scale: 2, opacity: 0, duration: 0.5, ease: 'power4.out' }}, 0.3);")
        lines.append(f"  tl.from('{s} .scene-subheading', {{ opacity: 0, duration: 0.4 }}, 0.9);")

    elif scene_type == "stamp":
        lines.append('  // Stamp — slam down')
        lines.append(f"  tl.to('{s} .stamp', {{ opacity: 1, scale: 1, rotation: 0, duration: 0.4, ease: 'power4.out' }}, 0.5);")
        lines.append(f"  tl.from('{s} .scene-heading', {{ opacity: 0, y: 30, duration: 0.5 }}, 1.0);")

    elif scene_type == "cta":
        lines.append('  // CTA — pulse in')
        lines.append(f"  tl.from('{s} .scene-heading', {{ scale: 0.8, opacity: 0, duration: 0.8, ease: 'power2.out' }}, 0.3);")
        lines.append(f"  tl.from('{s} .scene-subheading', {{ opacity: 0, y: 20, duration: 0.5 }}, 1.0);")

    else:
        lines.append('  // Default — fade in')
        lines.append(f"  tl.from('{s} .scene-heading', {{ y: 40, opacity: 0, duration: 0.8, ease: 'power3.out' }}, 0.5);")
        lines.append(f"  tl.from('{s} .scene-subheading', {{ opacity: 0, duration: 0.5 }}, 1.0);")

    # Fade out at end
    lines.append('  // Fade out')
    lines.append(f"  tl.to('{s} .content', {{ opacity: 0, duration: 0.5 }}, -0.5);")

    return "\n".join(lines)


def generate_all_scenes():
    with open(STORYBOARD_PATH) as f:
        storyboard = json.load(f)

    os.makedirs(SCENES_DIR, exist_ok=True)

    # Copy images into scenes dir so HyperFrames can find them
    for f in os.listdir(IMAGES_DIR):
        if f.endswith(".png"):
            src = os.path.join(IMAGES_DIR, f)
            dst = os.path.join(SCENES_DIR, f)
            import shutil
            shutil.copy2(src, dst)

    style = storyboard["style"]
    scenes = storyboard["scenes"]

    print(f"🎬 Generating {len(scenes)} HTML scenes with AI images...\n")

    for scene in scenes:
        num = scene["scene_number"]
        html = build_scene(scene, style)
        path = os.path.join(SCENES_DIR, f"scene_{num:02d}.html")
        with open(path, "w") as f:
            f.write(html)
        print(f"   ✅ scene_{num:02d}.html ({scene['duration_seconds']}s, {scene['type']})")

    print(f"\n✅ All scenes written to {SCENES_DIR}")


if __name__ == "__main__":
    generate_all_scenes()
