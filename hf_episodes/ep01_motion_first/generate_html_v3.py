#!/usr/bin/env python3
"""
HTML Generator v3 — AI images + GSAP animations = real motion graphics.
Supports Veo video backgrounds (falls back to static images).
Clean rewrite with proper HyperFrames structure.
"""
import json
import os
import shutil

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
SCENES_DIR = os.path.join(SCRIPT_DIR, "scenes")
IMAGES_DIR = os.path.join(SCRIPT_DIR, "images")
VIDEOS_DIR = os.path.join(SCRIPT_DIR, "videos")
STORYBOARD_PATH = os.path.join(SCRIPT_DIR, "storyboard.json")

GSAP_CDN = "https://cdn.jsdelivr.net/npm/gsap@3.14.2/dist/gsap.min.js"


def has_veo_video(num: int) -> bool:
    """Check if a Veo video clip exists for this scene."""
    vpath = os.path.join(VIDEOS_DIR, f"scene_{num:02d}.mp4")
    return os.path.exists(vpath) and os.path.getsize(vpath) > 1000


def build_scene(scene: dict, style: dict) -> str:
    num = scene["scene_number"]
    duration = scene["duration_seconds"]
    scene_type = scene.get("type", "concept")
    palette = style["palette"]
    bg = style["background"]
    texts = scene.get("text_elements", [])
    use_video = has_veo_video(num)

    # Background element: video or image
    if use_video:
        bg_html = f'    <video class="bg" src="scene_{num:02d}.mp4" autoplay loop muted playsinline></video>'
        bg_css = "    .bg {{ position: absolute; top: 0; left: 0; width: 100%; height: 100%; object-fit: cover; }}"
    else:
        bg_html = f'    <img class="bg" src="scene_{num:02d}.png" alt="" />'
        bg_css = "    .bg {{ position: absolute; top: 0; left: 0; width: 100%; height: 100%; object-fit: cover; opacity: 0.35; filter: saturate(0.7) contrast(1.1); }}"

    text_html = ""
    for te in texts:
        role = te.get("role", "heading")
        text = te.get("text", "")
        if role == "heading":
            text_html += f'<h1 class="sh">{text}</h1>\n'
        elif role == "subheading":
            text_html += f'<p class="ss">{text}</p>\n'
        elif role == "stat":
            text_html += f'<div class="stat" data-target="{text}">0</div>\n'
        elif role == "label":
            text_html += f'<span class="sl">{text}</span>\n'

    gsap = build_gsap(scene_type, num, duration, use_video=use_video)

    return f"""<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=1920, height=1080" />
  <script src="{GSAP_CDN}"></script>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;700;900&family=JetBrains+Mono:wght@400;700&display=swap" rel="stylesheet" />
  <style>
    * {{ margin: 0; padding: 0; box-sizing: border-box; }}
    html, body {{ width: 1920px; height: 1080px; overflow: hidden; background: {bg}; font-family: 'Inter', sans-serif; color: #fff; }}
{bg_css}
    .ov {{ position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: linear-gradient(135deg, rgba(5,5,5,0.85) 0%, rgba(5,5,5,0.6) 50%, rgba(5,5,5,0.85) 100%); }}
    .ct {{ position: absolute; top: 0; left: 0; width: 100%; height: 100%; display: flex; flex-direction: column; justify-content: center; align-items: center; padding: 80px 120px; z-index: 10; }}
    .sh {{ font-size: 80px; font-weight: 900; text-align: center; line-height: 1.05; text-shadow: 0 4px 30px rgba(0,0,0,0.8); letter-spacing: -2px; }}
    .ss {{ font-size: 36px; font-weight: 400; color: {palette[1]}; margin-top: 24px; text-align: center; text-shadow: 0 2px 20px rgba(0,0,0,0.6); }}
    .stat {{ font-size: 200px; font-weight: 900; color: {palette[2]}; font-family: 'JetBrains Mono', monospace; text-shadow: 0 0 60px {palette[2]}40; }}
    .sl {{ font-size: 20px; font-weight: 700; text-transform: uppercase; letter-spacing: 6px; color: {palette[3]}; opacity: 0.7; }}
    .al {{ position: absolute; background: {palette[1]}; opacity: 0.3; }}
    .al.h {{ width: 0; height: 2px; top: 50%; left: 10%; }}
    .al.v {{ width: 2px; height: 0; left: 50%; top: 20%; }}
    .go {{ position: absolute; border-radius: 50%; filter: blur(80px); }}
  </style>
</head>
<body>
  <div id="root" data-composition-id="scene-{num}" data-start="0" data-duration="{duration}" data-width="1920" data-height="1080">
{bg_html}
    <div class="ov"></div>
    <div class="al h"></div>
    <div class="al v"></div>
    <div class="go" style="width:400px;height:400px;background:{palette[1]};top:-100px;right:-100px;"></div>
    <div class="go" style="width:300px;height:300px;background:{palette[2]};bottom:-80px;left:-80px;"></div>
    <div class="ct">
      {text_html}
    </div>
  </div>
  <script>
{gsap}
  </script>
</body>
</html>"""


def build_gsap(scene_type: str, num: int, duration: int, use_video: bool = False) -> str:
    tl_var = f"window.__timelines = window.__timelines || {{}}; const tl = gsap.timeline({{ paused: true }});"
    lines = [tl_var]

    # Ken Burns only for static images (Veo videos already have motion)
    if not use_video:
        lines.append("tl.from('.bg', {scale:1.2, duration:8, ease:'none'}, 0);")
        lines.append("tl.to('.bg', {scale:1.0, duration:8, ease:'none'}, 0);")
    # Glow orbs
    lines.append("tl.from('.go', {opacity:0, scale:0.5, duration:2, stagger:0.3, ease:'power2.out'}, 0.5);")
    # Accent lines
    lines.append("tl.to('.al.h', {width:'80%', duration:1.5, ease:'power3.out'}, 0.3);")
    lines.append("tl.to('.al.v', {height:'60%', duration:1.5, ease:'power3.out'}, 0.5);")

    if scene_type == "hook":
        lines.append("tl.from('.sh', {y:80, opacity:0, duration:0.8, ease:'power4.out'}, 0.5);")
        lines.append("tl.from('.ss', {y:40, opacity:0, duration:0.6, ease:'power3.out'}, 1.0);")
    elif scene_type == "glitch":
        lines.append("tl.from('.sh', {opacity:0, duration:0.1}, 0.5);")
        lines.append("for(let i=0;i<5;i++){tl.to('.sh',{x:-5+i*2,duration:0.05},0.5+i*0.08);}")
        lines.append("tl.to('.sh', {x:0, duration:0.1}, 1.0);")
        lines.append("tl.from('.ss', {opacity:0, y:20, duration:0.5}, 1.2);")
    elif scene_type == "step_reveal":
        lines.append("tl.from('.sh', {x:-60, opacity:0, duration:0.7, ease:'power3.out'}, 0.3);")
        lines.append("tl.from('.ss', {x:60, opacity:0, duration:0.7, ease:'power3.out'}, 0.8);")
    elif scene_type == "diagram":
        lines.append("tl.from('.sh', {scale:0.5, opacity:0, duration:0.8, ease:'back.out(1.7)'}, 0.4);")
        lines.append("tl.from('.sl', {opacity:0, y:20, duration:0.5}, 1.0);")
    elif scene_type == "comparison":
        lines.append("tl.from('.sh', {y:-40, opacity:0, duration:0.6}, 0.3);")
        lines.append("tl.from('.ss', {y:40, opacity:0, duration:0.6}, 0.6);")
    elif scene_type == "warning":
        lines.append("tl.from('.sh', {scale:2, opacity:0, duration:0.5, ease:'power4.out'}, 0.3);")
        lines.append("tl.from('.ss', {opacity:0, duration:0.4}, 0.9);")
    elif scene_type == "stamp":
        lines.append("tl.from('.sh', {scale:3, opacity:0, rotation:-30, duration:0.4, ease:'power4.out'}, 0.5);")
        lines.append("tl.from('.ss', {opacity:0, y:30, duration:0.5}, 1.0);")
    elif scene_type == "cta":
        lines.append("tl.from('.sh', {scale:0.8, opacity:0, duration:0.8, ease:'power2.out'}, 0.3);")
        lines.append("tl.from('.ss', {opacity:0, y:20, duration:0.5}, 1.0);")
    else:
        lines.append("tl.from('.sh', {y:40, opacity:0, duration:0.8, ease:'power3.out'}, 0.5);")
        lines.append("tl.from('.ss', {opacity:0, duration:0.5}, 1.0);")

    lines.append("tl.to('.ct', {opacity:0, duration:0.5}, -0.5);")
    lines.append(f"window.__timelines['scene-{num}'] = tl;")

    js = "\n".join(f"    {l}" for l in lines)
    return f"""  <script>
    window.__timelines = window.__timelines || {{}};
    const tl = gsap.timeline({{ paused: true }});
{js}
  </script>"""


def generate_all_scenes():
    with open(STORYBOARD_PATH) as f:
        storyboard = json.load(f)

    os.makedirs(SCENES_DIR, exist_ok=True)

    # Copy images into scenes dir
    for f in os.listdir(IMAGES_DIR):
        if f.endswith(".png"):
            shutil.copy2(os.path.join(IMAGES_DIR, f), os.path.join(SCENES_DIR, f))

    # Copy Veo video clips into scenes dir
    if os.path.isdir(VIDEOS_DIR):
        for f in os.listdir(VIDEOS_DIR):
            if f.endswith(".mp4"):
                shutil.copy2(os.path.join(VIDEOS_DIR, f), os.path.join(SCENES_DIR, f))
                print(f"  📹 Using Veo video: {f}")

    style = storyboard["style"]
    scenes = storyboard["scenes"]

    print(f"Generating {len(scenes)} scenes...")
    for scene in scenes:
        num = scene["scene_number"]
        html = build_scene(scene, style)
        path = os.path.join(SCENES_DIR, f"scene_{num:02d}.html")
        with open(path, "w") as f:
            f.write(html)
        print(f"  scene_{num:02d}.html ({scene['duration_seconds']}s, {scene['type']})")
    print("Done.")


if __name__ == "__main__":
    generate_all_scenes()
