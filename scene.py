import os, json, tempfile, time, shutil, glob, re, textwrap
from pathlib import Path
from typing import Optional

# --- Pipeline: chain the film-making tools ---

def linear_pipeline(
    prompt: str,
    voice_text: Optional[str] = None,
    voice_name: str = "en-US-ChristopherNeural",
    face_source: Optional[str] = None,
    interpolate_multiplier: int = 1,
    aspect_ratio: str = "16:9",
    quality: str = "720p",
    duration: int = 3,
    steps: int = 8,
    seed: int = 43,
    auto_direct: bool = True,
    progress=None,
) -> dict:
    """
    Run the full film-making pipeline:
    1. Generate video with LTX-2.3 (calls launch_app's generate_video)
    2. Optionally face-swap characters (calls swapper)
    3. Optionally interpolate frames (calls interpolator)
    4. Optionally add voiceover (calls voiceover)

    Returns {video_path, voiceover_path, swapped_path, interpolated_path, status}
    """
    _prog = progress or _noop_progress
    result = {"video_path": None, "voiceover_path": None, "swapped_path": None, "interpolated_path": None, "status": []}

    # Step 1: Generate video
    _prog(0, desc="Generating video with LTX-2.3...")
    try:
        from launch_app import generate_video as gen_vid
    except ImportError:
        result["status"].append("ERROR: launch_app not importable")
        return result

    try:
        vid, msg, _ = gen_vid(
            mode="Text-to-Video",
            start_frame=None,
            end_frame=None,
            prompt=prompt,
            aspect_ratio=aspect_ratio,
            gen_quality=quality,
            duration=duration,
            steps=steps,
            seed=seed,
            auto_direct=auto_direct,
            progress=_prog if not progress else None,
        )
        result["video_path"] = vid
        result["status"].append(f"Video generated: {Path(vid).name}" if vid else "Video generation returned None")
    except Exception as e:
        result["status"].append(f"Video generation failed: {e}")
        return result

    current = vid
    if not current or not os.path.exists(current):
        result["status"].append("No video produced; aborting pipeline")
        return result

    # Step 2: Face swap
    if face_source and os.path.exists(face_source):
        _prog(0.3, desc="Swapping faces...")
        try:
            from swapper import swap_video
            swapped = swap_video(face_source, current, restore=True)
            result["swapped_path"] = swapped
            result["status"].append(f"Face-swapped: {Path(swapped).name}")
            current = swapped
        except Exception as e:
            result["status"].append(f"Face swap skipped: {e}")
    else:
        result["status"].append("Face swap: no source image provided")

    # Step 3: Frame interpolation
    if interpolate_multiplier > 1 and current:
        _prog(0.5, desc=f"Interpolating {interpolate_multiplier}x...")
        try:
            from interpolator import interpolate_video
            interp = interpolate_video(current, multiplier=interpolate_multiplier)
            result["interpolated_path"] = interp
            result["status"].append(f"Interpolated {interpolate_multiplier}x: {Path(interp).name}")
            current = interp
        except Exception as e:
            result["status"].append(f"Interpolation skipped: {e}")

    # Step 4: Voiceover
    if voice_text and current:
        _prog(0.7, desc="Generating voiceover...")
        try:
            from voiceover import generate as gen_voice, combine
            audio = gen_voice(voice_text, voice=voice_name)
            result["voiceover_path"] = audio
            voiced = combine(current, audio)
            result["status"].append(f"Voiceover added: {Path(voiced).name}")
            current = voiced
        except Exception as e:
            result["status"].append(f"Voiceover skipped: {e}")

    _prog(1.0, desc="Pipeline complete!")
    result["final_path"] = current
    return result


def storyboard_pipeline(scenes: list, progress=None) -> list:
    """
    Process multiple scenes in sequence.

    Each scene dict:
    {
        "prompt": "...",
        "voice_text": "...",
        "voice_name": "en-US-...",
        "face_source": "/path/to/face.png",
        "interpolate": 2,
        "aspect": "16:9",
        "quality": "720p",
        "duration": 3,
        "steps": 8,
        "seed": 43,
        "auto_direct": True,
    }
    """
    results = []
    _prog = progress or _noop_progress
    total = len(scenes)
    for i, scene in enumerate(scenes):
        _prog(i / total, desc=f"Scene {i+1}/{total}...")
        r = linear_pipeline(
            prompt=scene.get("prompt", ""),
            voice_text=scene.get("voice_text"),
            voice_name=scene.get("voice_name", "en-US-ChristopherNeural"),
            face_source=scene.get("face_source"),
            interpolate_multiplier=scene.get("interpolate", 1),
            aspect_ratio=scene.get("aspect", "16:9"),
            quality=scene.get("quality", "720p"),
            duration=scene.get("duration", 3),
            steps=scene.get("steps", 8),
            seed=scene.get("seed", 43) + i * 1000,
            auto_direct=scene.get("auto_direct", True),
        )
        r["scene_index"] = i
        results.append(r)
    return results


def script_to_scenes(script_text: str) -> list:
    """Parse a plain-text script into scene descriptions."""
    scenes = []
    blocks = re.split(r'\n\s*\n', script_text.strip())
    for block in blocks:
        lines = block.strip().split("\n")
        prompt = lines[0] if lines else ""
        voice = "\n".join(lines[1:]) if len(lines) > 1 else None
        if prompt:
            scenes.append({"prompt": prompt, "voice_text": voice})
    return scenes if scenes else [{"prompt": script_text}]


def _noop_progress(*args, **kwargs):
    pass
