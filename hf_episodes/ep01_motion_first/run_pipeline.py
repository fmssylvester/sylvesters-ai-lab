#!/usr/bin/env python3
"""
Main pipeline — creative director + Veo video gen + HTML gen + HyperFrames render + FFmpeg stitch.
Usage:
  python3 run_pipeline.py                  # full pipeline
  python3 run_pipeline.py --storyboard     # storyboard only
  python3 run_pipeline.py --html           # storyboard + HTML gen
  python3 run_pipeline.py --veo            # generate Veo video clips
  python3 run_pipeline.py --veo-scene 3    # Veo for single scene
  python3 run_pipeline.py --render         # full + render
  python3 run_pipeline.py --scene 3        # render single scene
  python3 run_pipeline.py --stitch         # stitch only
"""
import argparse
import json
import os
import subprocess
import sys

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
SCENES_DIR = os.path.join(SCRIPT_DIR, "scenes")
RENDERS_DIR = os.path.join(SCRIPT_DIR, "renders")
STORYBOARD_PATH = os.path.join(SCRIPT_DIR, "storyboard.json")
OUTPUT_PATH = os.path.join(SCRIPT_DIR, "final_ep01.mp4")
HF_BIN = "/data/data/com.termux/files/home/ai-lab-internal/node_modules/hyperframes/bin/hyperframes.mjs"
CHROMIUM = "/data/data/com.termux/files/usr/bin/chromium-browser"


def run_storyboard():
    from creative_director import load_script, generate_storyboard, save_storyboard
    script = load_script()
    storyboard = generate_storyboard(script)
    save_storyboard(storyboard)
    return storyboard


def run_veo(scene_num: int = None):
    """Generate Veo video clips for scenes."""
    from veo_video_generator import generate_all_videos, generate_video_for_scene, KeyRotator

    if scene_num:
        with open(STORYBOARD_PATH) as f:
            storyboard = json.load(f)
        scene = next((s for s in storyboard["scenes"] if s["scene_number"] == scene_num), None)
        if not scene:
            print(f"❌ Scene {scene_num} not found")
            return
        rotator = KeyRotator()
        generate_video_for_scene(scene, rotator)
    else:
        generate_all_videos()


def run_html_gen():
    from generate_html_v3 import generate_all_scenes
    generate_all_scenes()


def run_render_scene(scene_num: int):
    """Render a single scene with HyperFrames."""
    os.makedirs(RENDERS_DIR, exist_ok=True)

    # Create a temp HyperFrames project for this scene
    scene_html = os.path.join(SCENES_DIR, f"scene_{scene_num:02d}.html")
    if not os.path.exists(scene_html):
        print(f"❌ Scene not found: {scene_html}")
        sys.exit(1)

    # Copy scene HTML as index.html to a temp dir
    tmp_project = os.path.join(RENDERS_DIR, f"_tmp_scene_{scene_num:02d}")
    os.makedirs(tmp_project, exist_ok=True)

    # Write a minimal hyperframes.json
    with open(os.path.join(tmp_project, "hyperframes.json"), "w") as f:
        json.dump({"name": f"scene_{scene_num:02d}"}, f)

    # Copy HTML
    subprocess.run(["cp", scene_html, os.path.join(tmp_project, "index.html")], check=True)

    # Copy video or image for background
    scene_vid = os.path.join(SCENES_DIR, f"scene_{scene_num:02d}.mp4")
    scene_img = os.path.join(SCENES_DIR, f"scene_{scene_num:02d}.png")
    if os.path.exists(scene_vid):
        subprocess.run(["cp", scene_vid, os.path.join(tmp_project, f"scene_{scene_num:02d}.mp4")], check=True)
    elif os.path.exists(scene_img):
        subprocess.run(["cp", scene_img, os.path.join(tmp_project, f"scene_{scene_num:02d}.png")], check=True)

    # Render
    print(f"🎬 Rendering scene {scene_num}...")
    env = os.environ.copy()
    env["HYPERFRAMES_BROWSER_PATH"] = CHROMIUM
    result = subprocess.run(
        ["node", HF_BIN, "render"],
        cwd=tmp_project,
        env=env,
        capture_output=True,
        text=True,
        timeout=300,
    )
    if result.returncode != 0:
        print(f"❌ Render failed for scene {scene_num}")
        print(result.stdout[-500:] if result.stdout else "")
        print(result.stderr[-500:] if result.stderr else "")
        return None

    # Find the rendered file
    renders = os.path.join(tmp_project, "renders")
    if os.path.isdir(renders):
        for f in os.listdir(renders):
            if f.endswith(".mp4"):
                src = os.path.join(renders, f)
                dst = os.path.join(RENDERS_DIR, f"scene_{scene_num:02d}.mp4")
                subprocess.run(["mv", src, dst], check=True)
                print(f"   ✅ scene_{scene_num:02d}.mp4")
                return dst

    print(f"   ⚠️ No MP4 found for scene {scene_num}")
    return None


def run_render_all():
    """Render all scenes."""
    os.makedirs(RENDERS_DIR, exist_ok=True)

    with open(STORYBOARD_PATH) as f:
        storyboard = json.load(f)

    scenes = storyboard["scenes"]
    print(f"\n🎬 Rendering {len(scenes)} scenes...\n")

    rendered = []
    for scene in scenes:
        num = scene["scene_number"]
        result = run_render_scene(num)
        if result:
            rendered.append(result)

    print(f"\n✅ Rendered {len(rendered)}/{len(scenes)} scenes")
    return rendered


def run_stitch():
    """Stitch all scene MP4s into final video with FFmpeg."""
    with open(STORYBOARD_PATH) as f:
        storyboard = json.load(f)

    scenes = storyboard["scenes"]
    scene_files = []
    for scene in scenes:
        num = scene["scene_number"]
        path = os.path.join(RENDERS_DIR, f"scene_{num:02d}.mp4")
        if os.path.exists(path):
            scene_files.append(path)

    if not scene_files:
        print("❌ No rendered scenes found")
        sys.exit(1)

    # Create concat list
    concat_list = os.path.join(RENDERS_DIR, "concat.txt")
    with open(concat_list, "w") as f:
        for path in scene_files:
            f.write(f"file '{path}'\n")

    # Stitch with FFmpeg
    print(f"\n🎥 Stitching {len(scene_files)} scenes...")
    result = subprocess.run(
        [
            "ffmpeg", "-y",
            "-f", "concat", "-safe", "0",
            "-i", concat_list,
            "-c:v", "libx264", "-crf", "18",
            "-movflags", "+faststart",
            OUTPUT_PATH,
        ],
        capture_output=True,
        text=True,
        timeout=120,
    )
    if result.returncode != 0:
        print(f"❌ FFmpeg failed:\n{result.stderr[-500:]}")
        sys.exit(1)

    size_mb = os.path.getsize(OUTPUT_PATH) / (1024 * 1024)
    print(f"✅ Final video: {OUTPUT_PATH}")
    print(f"   Size: {size_mb:.1f} MB")

    # Copy to phone storage
    phone_path = "/sdcard/Download/ep01_motion_first.mp4"
    subprocess.run(["cp", OUTPUT_PATH, phone_path], check=True)
    print(f"   📱 Copied to {phone_path}")


def main():
    parser = argparse.ArgumentParser(description="Motion Graphics Pipeline")
    parser.add_argument("--storyboard", action="store_true", help="Storyboard only")
    parser.add_argument("--html", action="store_true", help="Storyboard + HTML gen")
    parser.add_argument("--veo", action="store_true", help="Generate Veo video clips")
    parser.add_argument("--veo-scene", type=int, help="Veo for single scene number")
    parser.add_argument("--render", action="store_true", help="Full pipeline + render")
    parser.add_argument("--scene", type=int, help="Render single scene number")
    parser.add_argument("--stitch", action="store_true", help="Stitch only (skip render)")
    args = parser.parse_args()

    # Check API key
    if not os.environ.get("GEMINI_API_KEY"):
        print("❌ Set GEMINI_API_KEY environment variable")
        sys.exit(1)

    if args.veo_scene:
        if not os.path.exists(STORYBOARD_PATH):
            print("⚠️ No storyboard found, generating...")
            run_storyboard()
        run_veo(args.veo_scene)
        return

    if args.veo:
        if not os.path.exists(STORYBOARD_PATH):
            print("⚠️ No storyboard found, generating...")
            run_storyboard()
        run_veo()
        return

    if args.scene:
        # Single scene render
        if not os.path.exists(STORYBOARD_PATH):
            print("⚠️ No storyboard found, generating...")
            run_storyboard()
        if not os.path.exists(os.path.join(SCENES_DIR, f"scene_{args.scene:02d}.html")):
            run_html_gen()
        run_render_scene(args.scene)
        return

    if args.storyboard:
        run_storyboard()
        return

    if args.html:
        if not os.path.exists(STORYBOARD_PATH):
            run_storyboard()
        run_html_gen()
        return

    if args.stitch:
        run_stitch()
        return

    if args.render:
        # Full pipeline
        if not os.path.exists(STORYBOARD_PATH):
            run_storyboard()
        if not any(f.startswith("scene_") for f in os.listdir(SCENES_DIR) if f.endswith(".html")):
            run_html_gen()
        run_render_all()
        run_stitch()
        return

    # Default: full pipeline
    print("=" * 60)
    print("  SYLVESTER'S AI LAB — Motion Graphics Pipeline")
    print("  Episode 1: The Motion-First Secret")
    print("=" * 60)
    print()

    # Step 1: Storyboard
    print("📝 STEP 1: Creative Director (Gemini)")
    run_storyboard()
    print()

    # Step 2: Veo Video Generation
    print("🎬 STEP 2: Veo 3.1 Video Generation")
    run_veo()
    print()

    # Step 3: HTML Generation
    print("🎨 STEP 3: Generating HTML + GSAP scenes")
    run_html_gen()
    print()

    # Step 4: Render
    print("🎬 STEP 4: Rendering with HyperFrames")
    run_render_all()
    print()

    # Step 5: Stitch
    print("🎥 STEP 5: Stitching with FFmpeg")
    run_stitch()
    print()

    print("=" * 60)
    print("  ✅ DONE!")
    print("=" * 60)


if __name__ == "__main__":
    main()
