#!/usr/bin/env python3
"""
HTML Generator — converts storyboard scenes into HyperFrames HTML with GSAP animations.
"""
import json
import os
import re

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
SCENES_DIR = os.path.join(SCRIPT_DIR, "scenes")
STORYBOARD_PATH = os.path.join(SCRIPT_DIR, "storyboard.json")

GSAP_CDN = "https://cdn.jsdelivr.net/npm/gsap@3.14.2/dist/gsap.min.js"

# Animation presets by type
ANIM_PRESETS = {
    "kinetic_type": """
        // kinetic type — text splits and animates letter by letter
        const chars = target.querySelectorAll('.char');
        tl.from(chars, { opacity: 0, y: 40, rotateX: -90, stagger: 0.03, duration: 0.4, ease: "back.out(1.7)" }, t);
    """,
    "counter": """
        // animated counter
        const endVal = parseInt(target.dataset.value || '100');
        const obj = { val: 0 };
        tl.to(obj, {
            val: endVal,
            duration: 1.5,
            ease: "power2.out",
            onUpdate: () => { target.innerText = Math.floor(obj.val).toLocaleString(); }
        }, t);
    """,
    "comparison": """
        // comparison — left fades in, then right
        const left = target.querySelector('.compare-left');
        const right = target.querySelector('.compare-right');
        const xMark = target.querySelector('.x-mark');
        const checkMark = target.querySelector('.check-mark');
        if (left) tl.from(left, { x: -100, opacity: 0, duration: 0.6, ease: "power3.out" }, t);
        if (xMark) tl.from(xMark, { scale: 0, rotation: -180, duration: 0.4, ease: "back.out(2)" }, t + 0.3);
        if (right) tl.from(right, { x: 100, opacity: 0, duration: 0.6, ease: "power3.out" }, t + 0.8);
        if (checkMark) tl.from(checkMark, { scale: 0, rotation: 180, duration: 0.4, ease: "back.out(2)" }, t + 1.2);
    """,
    "step_reveal": """
        // step reveal — cards slide in sequentially
        const steps = target.querySelectorAll('.step-card');
        steps.forEach((step, i) => {
            tl.from(step, { x: 80, opacity: 0, duration: 0.5, ease: "power3.out" }, t + i * 0.4);
        });
    """,
    "diagram": """
        // diagram — elements draw in
        const els = target.querySelectorAll('.diagram-el');
        els.forEach((el, i) => {
            tl.from(el, { scale: 0, opacity: 0, duration: 0.4, ease: "back.out(1.7)" }, t + i * 0.2);
        });
    """,
    "morph": """
        // morph — shape transforms
        const shape = target.querySelector('.morph-shape');
        if (shape) {
            tl.to(shape, { borderRadius: "50%", scale: 1.2, duration: 0.8, ease: "power2.inOut" }, t);
            tl.to(shape, { borderRadius: "0%", scale: 1, duration: 0.8, ease: "power2.inOut" }, t + 0.8);
        }
    """,
    "glitch": """
        // glitch — text flickers and distorts
        const glitchEl = target.querySelector('.glitch-text');
        if (glitchEl) {
            tl.from(glitchEl, { opacity: 0, duration: 0.1 }, t);
            tl.to(glitchEl, { x: -5, duration: 0.05 }, t + 0.1);
            tl.to(glitchEl, { x: 5, duration: 0.05 }, t + 0.15);
            tl.to(glitchEl, { x: -3, duration: 0.05 }, t + 0.2);
            tl.to(glitchEl, { x: 0, duration: 0.05 }, t + 0.25);
            tl.from(glitchEl, { opacity: 0, duration: 0.1 }, t + 0.3);
        }
    """,
    "stamp": """
        // stamp — verdict seal slams down
        const stamp = target.querySelector('.stamp');
        if (stamp) {
            tl.from(stamp, { scale: 3, opacity: 0, rotation: -30, duration: 0.4, ease: "power4.out" }, t);
            tl.to(stamp, { scale: 1, opacity: 1, rotation: 0, duration: 0.4, ease: "power4.out" }, t);
        }
    """,
}


def wrap_chars(text: str) -> str:
    """Wrap each character in a span for kinetic type animation."""
    chars = []
    for c in text:
        if c == " ":
            chars.append('<span class="char" style="display:inline-block;width:0.3em">&nbsp;</span>')
        else:
            chars.append(f'<span class="char" style="display:inline-block">{c}</span>')
    return "".join(chars)


def build_scene_html(scene: dict, style: dict, scene_number: int) -> str:
    """Build a single HyperFrames scene HTML file."""
    duration = scene["duration_seconds"]
    anim_type = scene.get("animation_type", "kinetic_type")
    palette = style["palette"]
    bg = style["background"]
    primary_font = style["primaryFont"]
    accent_font = style.get("accentFont", primary_font)

    # Build text elements
    text_html = ""
    text_elements = scene.get("text_elements", [])
    for te in text_elements:
        role = te.get("role", "heading")
        text = te.get("text", "")
        animate = te.get("animate", "fade in")

        if anim_type == "kinetic_type" and role == "heading":
            display_text = wrap_chars(text)
            text_html += f'<div class="heading kinetic">{display_text}</div>\n'
        elif role == "stat":
            text_html += f'<div class="stat" data-value="{text}">0</div>\n'
        elif role == "subheading":
            text_html += f'<div class="subheading">{text}</div>\n'
        elif role == "label":
            text_html += f'<div class="label">{text}</div>\n'
        elif role == "quote":
            text_html += f'<div class="quote">"{text}"</div>\n'
        else:
            text_html += f'<div class="heading">{text}</div>\n'

    # Build animation JS from GSAP timeline
    gsap_steps = scene.get("gsap_timeline", [])
    anim_js = ""
    if gsap_steps:
        for step in gsap_steps:
            t = step.get("t", 0)
            action = step.get("action", "from")
            target = step.get("target", ".scene-content")
            props = step.get("props", {})
            props_str = json.dumps(props).replace('"', "'")
            anim_js += f'  tl.{action}("{target}", {props_str}, {t});\n'
    else:
        # Use preset
        preset = ANIM_PRESETS.get(anim_type, ANIM_PRESETS["kinetic_type"])
        anim_js = f'  const target = document.querySelector(".scene-content");\n{preset}'

    # Scene-specific HTML layouts
    scene_type = scene.get("type", "concept")
    layout_html = build_layout(scene, palette)

    html = f"""<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=1920, height=1080" />
  <script src="{GSAP_CDN}"></script>
  <link href="https://fonts.googleapis.com/css2?family={primary_font.replace(' ', '+')}:wght@400;700;900&family={accent_font.replace(' ', '+')}:wght@400;700&display=swap" rel="stylesheet" />
  <style>
    * {{ margin: 0; padding: 0; box-sizing: border-box; }}
    html, body {{
      width: 1920px; height: 1080px; overflow: hidden;
      background: {bg};
      font-family: '{primary_font}', sans-serif;
      color: #fff;
    }}
    .scene-content {{
      width: 100%; height: 100%;
      display: flex; flex-direction: column;
      justify-content: center; align-items: center;
      padding: 80px 120px;
      position: relative;
    }}
    .heading {{
      font-size: 72px; font-weight: 900;
      text-align: center; line-height: 1.1;
      color: #fff;
    }}
    .heading.kinetic .char {{
      display: inline-block;
    }}
    .subheading {{
      font-size: 36px; font-weight: 400;
      color: {palette[1] if len(palette) > 1 else '#aaa'};
      margin-top: 20px; text-align: center;
      font-family: '{accent_font}', sans-serif;
    }}
    .stat {{
      font-size: 180px; font-weight: 900;
      color: {palette[2] if len(palette) > 2 else '#ff6b6b'};
      font-family: '{accent_font}', monospace;
      line-height: 1;
    }}
    .label {{
      font-size: 24px; font-weight: 700;
      text-transform: uppercase; letter-spacing: 4px;
      color: {palette[3] if len(palette) > 3 else '#888'};
    }}
    .quote {{
      font-size: 42px; font-style: italic;
      color: {palette[1] if len(palette) > 1 else '#ccc'};
      max-width: 900px; text-align: center;
      line-height: 1.4;
    }}
    .step-card {{
      background: rgba(255,255,255,0.05);
      border: 1px solid rgba(255,255,255,0.1);
      border-radius: 16px; padding: 30px 40px;
      margin: 10px 0; width: 800px;
      display: flex; align-items: center; gap: 20px;
    }}
    .step-number {{
      font-size: 48px; font-weight: 900;
      color: {palette[2] if len(palette) > 2 else '#ff6b6b'};
      min-width: 60px;
    }}
    .step-text {{
      font-size: 28px; color: #ddd;
    }}
    .compare-left, .compare-right {{
      flex: 1; padding: 40px;
      border-radius: 16px; text-align: center;
    }}
    .compare-left {{
      background: rgba(255,50,50,0.1);
      border: 2px solid rgba(255,50,50,0.3);
    }}
    .compare-right {{
      background: rgba(50,255,50,0.1);
      border: 2px solid rgba(50,255,50,0.3);
    }}
    .x-mark, .check-mark {{
      font-size: 80px; position: absolute;
    }}
    .x-mark {{ color: #ff4444; }}
    .check-mark {{ color: #44ff44; }}
    .morph-shape {{
      width: 200px; height: 200px;
      background: linear-gradient(135deg, {palette[2] if len(palette) > 2 else '#ff6b6b'}, {palette[4] if len(palette) > 4 else '#4ecdc4'});
      border-radius: 10%;
    }}
    .glitch-text {{
      font-size: 96px; font-weight: 900;
      color: {palette[2] if len(palette) > 2 else '#ff6b6b'};
      text-shadow: 3px 0 {palette[2] if len(palette) > 2 else '#ff6b6b'}, -3px 0 {palette[4] if len(palette) > 4 else '#4ecdc4'};
    }}
    .stamp {{
      width: 300px; height: 300px;
      border: 8px solid {palette[2] if len(palette) > 2 else '#ff6b6b'};
      border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      font-size: 48px; font-weight: 900;
      color: {palette[2] if len(palette) > 2 else '#ff6b6b'};
      text-transform: uppercase;
      transform: rotate(-15deg);
    }}
    .diagram-el {{
      background: rgba(255,255,255,0.08);
      border: 1px solid rgba(255,255,255,0.15);
      border-radius: 12px; padding: 20px 30px;
      font-size: 24px; color: #eee;
    }}
    .comparison-row {{
      display: flex; gap: 60px; width: 100%;
      justify-content: center; align-items: stretch;
    }}
    .bad-prompt, .good-prompt {{
      flex: 1; padding: 40px;
      border-radius: 16px; font-size: 22px;
      line-height: 1.6;
    }}
    .bad-prompt {{
      background: rgba(255,50,50,0.08);
      border: 2px solid rgba(255,50,50,0.3);
    }}
    .good-prompt {{
      background: rgba(50,255,100,0.08);
      border: 2px solid rgba(50,255,100,0.3);
    }}
    .section-label {{
      position: absolute; top: 40px; left: 80px;
      font-size: 18px; text-transform: uppercase;
      letter-spacing: 6px; color: {palette[3] if len(palette) > 3 else '#666'};
    }}
  </style>
</head>
<body>
  <div id="scene-{scene_number}" class="clip"
       data-composition-id="scene-{scene_number}"
       data-start="0" data-duration="{duration}"
       data-width="1920" data-height="1080">
    <div class="scene-content">
      <div class="section-label">{scene.get('type', '').upper().replace('_', ' ')}</div>
      {layout_html}
    </div>
  </div>

  <script>
    window.__timelines = window.__timelines || {{}};
    const tl = gsap.timeline({{ paused: true }});
    const t = 0;

{anim_js}

    window.__timelines["scene-{scene_number}"] = tl;
  </script>
</body>
</html>"""

    return html


def build_layout(scene: dict, palette: list) -> str:
    """Build scene-type-specific HTML layout."""
    scene_type = scene.get("type", "concept")
    text_elements = scene.get("text_elements", [])

    if scene_type == "comparison":
        return build_comparison_layout(scene, palette)
    elif scene_type == "step":
        return build_step_layout(scene, palette)
    elif scene_type == "hook":
        return build_hook_layout(scene, palette)
    elif scene_type == "verdict":
        return build_verdict_layout(scene, palette)
    elif scene_type == "cta":
        return build_cta_layout(scene, palette)
    else:
        return build_default_layout(scene, palette)


def build_hook_layout(scene, palette):
    texts = scene.get("text_elements", [])
    heading = texts[0]["text"] if texts else ""
    sub = texts[1]["text"] if len(texts) > 1 else ""
    return f"""
      <div class="glitch-text">{heading}</div>
      <div class="subheading" style="margin-top:30px">{sub}</div>
    """


def build_comparison_layout(scene, palette):
    texts = scene.get("text_elements", [])
    left_text = texts[0]["text"] if texts else ""
    right_text = texts[1]["text"] if len(texts) > 1 else ""
    return f"""
      <div class="comparison-row">
        <div class="compare-left">
          <div class="x-mark" style="position:relative;font-size:60px;margin-bottom:10px">✗</div>
          <div style="font-size:22px;color:#ff8888;line-height:1.6">{left_text}</div>
        </div>
        <div class="compare-right">
          <div class="check-mark" style="position:relative;font-size:60px;margin-bottom:10px">✓</div>
          <div style="font-size:22px;color:#88ff88;line-height:1.6">{right_text}</div>
        </div>
      </div>
    """


def build_step_layout(scene, palette):
    texts = scene.get("text_elements", [])
    steps_html = ""
    for i, te in enumerate(texts, 1):
        steps_html += f"""
        <div class="step-card">
          <div class="step-number">{i}</div>
          <div class="step-text">{te['text']}</div>
        </div>"""
    return steps_html


def build_verdict_layout(scene, palette):
    texts = scene.get("text_elements", [])
    heading = texts[0]["text"] if texts else "VERDICT"
    sub = texts[1]["text"] if len(texts) > 1 else ""
    return f"""
      <div class="stamp">VERDICT</div>
      <div class="heading" style="margin-top:40px">{heading}</div>
      <div class="subheading">{sub}</div>
    """


def build_cta_layout(scene, palette):
    texts = scene.get("text_elements", [])
    lines = [te["text"] for te in texts]
    lines_html = "".join(f'<div style="margin:8px 0">{l}</div>' for l in lines)
    return f"""
      <div class="heading" style="font-size:56px">{lines_html}</div>
    """


def build_default_layout(scene, palette):
    parts = []
    for te in scene.get("text_elements", []):
        role = te.get("role", "heading")
        text = te.get("text", "")
        if role == "heading":
            parts.append(f'<div class="heading">{wrap_chars(text)}</div>')
        elif role == "stat":
            parts.append(f'<div class="stat" data-value="{text}">0</div>')
        else:
            parts.append(f'<div class="subheading">{text}</div>')
    return "\n".join(parts)


def generate_all_scenes():
    with open(STORYBOARD_PATH) as f:
        storyboard = json.load(f)

    os.makedirs(SCENES_DIR, exist_ok=True)
    style = storyboard["style"]
    scenes = storyboard["scenes"]

    print(f"🎬 Generating {len(scenes)} scenes...")
    for scene in scenes:
        num = scene["scene_number"]
        html = build_scene_html(scene, style, num)
        path = os.path.join(SCENES_DIR, f"scene_{num:02d}.html")
        with open(path, "w") as f:
            f.write(html)
        print(f"   ✅ scene_{num:02d}.html ({scene['duration_seconds']}s, {scene['animation_type']})")

    print(f"\n✅ All scenes written to {SCENES_DIR}")


if __name__ == "__main__":
    generate_all_scenes()
