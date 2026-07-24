import os, sys, subprocess, tempfile, shutil, json, time, math, random
from pathlib import Path
from typing import Optional

WAV2LIP_DIR = None
WAV2LIP_MODEL_PATH = None
FACE_DET_DIR = None

_BASE = Path("/teamspace/studios/this_studio")
if not _BASE.exists():
    _BASE = Path.cwd()
BASE = str(_BASE)
WAV2LIP_REPO = "https://github.com/Rudrabha/Wav2Lip.git"
WAV2LIP_MODEL_URL = "https://iiitaphyd-my.sharepoint.com/personal/radrabha_m_research_iiit_ac_in/_layouts/15/download.aspx?share=EdjI7bZlgApMqsVoEUUXpLsBxqXbn5z8VTmikpFw3tGg"
# Alternate: "https://drive.google.com/uc?id=1I0N1Tv5mN5GwKqXUoGd3Jj5VfQ0bY9kL&export=download"
WAV2LIP_MODEL_GDRIVE = "1I0N1Tv5mN5GwKqXUoGd3Jj5VfQ0bY9kL"

AVATAR_STYLES = {
    "Professional":       "person looking at camera, professional attire, neutral expression, well-lit, studio background",
    "Warm Presenter":     "person with warm smile, casual attire, friendly expression, soft lighting, cozy background",
    "Explainers":         "person gesturing naturally, explaining, educational, clear lighting, simple background",
    "News Anchor":        "person in formal wear, serious but approachable, studio lighting, news desk background",
    "Friendly Coach":     "person nodding encouragingly, casual, energetic, bright lighting, motivational",
    "Storyteller":        "person with expressive face, narrative mode, warm dramatic lighting, artistic background",
    "Virtual Assistant":  "person in smart casual, helpful expression, tech-forward, clean background",
    "Authoritative":      "person with confident posture, formal, direct gaze, strong lighting, professional backdrop",
}

SCRIPT_PRESETS = {
    "Product Launch": {
        "style": "Professional",
        "segments": [
            ("opening", "energetic, direct camera, broad gesture"),
            ("problem", "concerned, leaning forward"),
            ("solution", "confident, smile, open gesture"),
            ("features", "explanatory, counting on fingers"),
            ("cta", "direct powerful gaze, nod"),
        ]
    },
    "Educational": {
        "style": "Warm Presenter",
        "segments": [
            ("hook", "curious expression, raised eyebrows"),
            ("intro", "warm smile, open palms"),
            ("explanation", "thoughtful, gesturing to side"),
            ("example", "animated, illustrative movements"),
            ("summary", "nodding, encouraging smile"),
        ]
    },
    "Storytelling": {
        "style": "Storyteller",
        "segments": [
            ("setup", "mysterious expression, slow head turn"),
            ("conflict", "intense, leaning in, furrowed brow"),
            ("climax", "animated, wide-eyed, big gestures"),
            ("resolution", "relaxed, warm smile, nod"),
        ]
    },
}


class AvatarGenerator:

    def __init__(self, base_dir: str = BASE):
        self.base_dir = base_dir
        self.wav2lip_dir = os.path.join(base_dir, "Wav2Lip")
        self.model_path = os.path.join(self.wav2lip_dir, "checkpoints", "wav2lip_gan.pth")
        self.models_dir = os.path.join(base_dir, "ComfyUI", "models")
        self.input_dir = os.path.join(base_dir, "ComfyUI", "input")
        self.output_dir = os.path.join(base_dir, "ComfyUI", "output")
        os.makedirs(self.input_dir, exist_ok=True)
        os.makedirs(self.output_dir, exist_ok=True)

    def ensure_wav2lip(self, force: bool = False):
        if not os.path.isdir(self.wav2lip_dir):
            print("Cloning Wav2Lip...")
            subprocess.run(
                ["git", "clone", WAV2LIP_REPO, self.wav2lip_dir],
                capture_output=True, check=True
            )

        ckpt_dir = os.path.join(self.wav2lip_dir, "checkpoints")
        os.makedirs(ckpt_dir, exist_ok=True)

        if not os.path.isfile(self.model_path) or force:
            print("Downloading Wav2Lip GAN model...")
            self._download_model(ckpt_dir)

        if os.path.isdir(self.wav2lip_dir):
            sys.path.insert(0, self.wav2lip_dir)
        return True

    def _download_model(self, ckpt_dir: str):
        path = os.path.join(ckpt_dir, "wav2lip_gan.pth")
        if os.path.isfile(path) and os.path.getsize(path) > 100_000_000:
            return

        try:
            import gdown
            gdown.download(f"https://drive.google.com/uc?id={WAV2LIP_MODEL_GDRIVE}", path, quiet=False)
        except Exception:
            try:
                subprocess.run([
                    "curl", "-L",
                    "-H", "Accept: application/octet-stream",
                    "-o", path,
                    "https://github.com/justinjohn0306/Wav2Lip/releases/download/v1.0/wav2lip_gan.pth"
                ], capture_output=True, check=True)
            except Exception:
                print("WARNING: Could not download Wav2Lip model. Install manually.")
                return

        if os.path.isfile(path):
            sz = os.path.getsize(path)
            print(f"Wav2Lip model: {sz/1e6:.0f}MB")

    def generate_avatar(self, script_text: str,
                         character_image: Optional[str] = None,
                         voice: str = "en-US-ChristopherNeural",
                         avatar_style: str = "Professional",
                         aspect: str = "16:9",
                         quality: str = "720p",
                         emotion: str = "neutral",
                         reference_audio: Optional[str] = None,
                         progress=None) -> dict:
        _prog = progress or _noop_progress
        result = {"status": [], "video_path": None, "audio_path": None}

        temp_dir = tempfile.mkdtemp(prefix="avatar_")

        # Step 1: Generate voiceover audio (cloned or edge-tts)
        _prog(0.1, desc="Generating voiceover...")
        try:
            if reference_audio and os.path.exists(reference_audio):
                from voice_cloner import clone_voice
                audio_path = os.path.join(temp_dir, "voiceover.wav")
                clone_voice(script_text, reference_audio, output_path=audio_path,
                            edge_voice=voice)
                result["audio_path"] = audio_path
                result["status"].append("Voiceover generated (cloned voice)")
            else:
                from voiceover import generate as generate_audio
                audio_path = os.path.join(temp_dir, "voiceover.mp3")
                generate_audio(script_text, voice=voice, output_path=audio_path)
                result["audio_path"] = audio_path
                result["status"].append("Voiceover generated")
        except Exception as e:
            result["status"].append(f"Voiceover failed: {e}")
            shutil.rmtree(temp_dir, ignore_errors=True)
            return result

        # Step 2: Create or use base avatar video
        _prog(0.3, desc="Creating base avatar...")
        avatar_video = self._create_base_avatar(
            character_image, script_text, avatar_style,
            aspect, quality, temp_dir
        )
        if not avatar_video:
            result["status"].append("Base avatar creation failed")
            shutil.rmtree(temp_dir, ignore_errors=True)
            return result
        result["status"].append("Base avatar created")

        # Step 3: Lip-sync with Wav2Lip
        _prog(0.5, desc="Applying lip-sync...")
        try:
            lip_synced = self._lip_sync(avatar_video, audio_path, temp_dir)
            if lip_synced:
                result["video_path"] = lip_synced
                result["status"].append("Lip-sync applied")
            else:
                # Fallback to just the avatar video with voiceover
                from voiceover import combine
                combined = combine(avatar_video, audio_path,
                                   output_path=os.path.join(temp_dir, "combined.mp4"))
                result["video_path"] = combined
                result["status"].append("Lip-sync unavailable, voiceover added")
        except Exception as e:
            result["status"].append(f"Lip-sync failed, using voiceover: {e}")
            from voiceover import combine
            try:
                combined = combine(avatar_video, audio_path,
                                   output_path=os.path.join(self.output_dir, f"avatar_{int(time.time())}.mp4"))
                result["video_path"] = combined
            except Exception as e2:
                result["status"].append(f"Combine failed: {e2}")
                result["video_path"] = avatar_video

        # Step 4: Face restoration (optional, if ReActor available)
        if result["video_path"] and os.path.exists(result["video_path"]):
            _prog(0.8, desc="Enhancing face quality...")
            try:
                from swapper import swap_video
                if character_image and os.path.exists(character_image):
                    enhanced = swap_video(character_image, result["video_path"],
                                          restore=True, every_n=5)
                    if enhanced and os.path.exists(enhanced):
                        result["video_path"] = enhanced
                        result["status"].append("Face quality enhanced")
            except Exception:
                pass

        _prog(1.0, desc="Avatar complete!")
        return result

    def _create_base_avatar(self, character_image, script_text, avatar_style,
                            aspect, quality, temp_dir) -> Optional[str]:
        # Use LTX to generate a talking-head base video
        w, h = self._compute_dims(aspect, quality)

        if character_image and os.path.exists(character_image):
            prompt = (
                f"{AVATAR_STYLES.get(avatar_style, AVATAR_STYLES['Professional'])}, "
                f"talking head, speaking to camera, medium shot, "
                f"subtle head movement, natural, realistic, "
                f"professional video, high quality, 30fps"
            )
        else:
            prompt = (
                f"{AVATAR_STYLES.get(avatar_style, AVATAR_STYLES['Professional'])}, "
                f"talking head, medium shot, speaking to camera, "
                f"subtle head bob, professional video, 30fps"
            )

        try:
            from launch_app import generate_video as gen_video
            duration = max(3, min(10, max(1, len(script_text.split()) // 3)))
            vid, msg, _ = gen_video(
                mode="Text-to-Video" if not character_image else "Image-to-Video",
                start_frame=character_image,
                end_frame=None,
                prompt=prompt,
                aspect_ratio=aspect,
                gen_quality=quality,
                duration=duration,
                steps=8,
                seed=random.randint(1, 99999),
                auto_direct=False,
                progress=None,
            )
            if vid and os.path.exists(vid):
                return vid
        except Exception as e:
            print(f"LTX avatar gen failed: {e}")

        # Fallback: generate a simple talking head using Wav2Lip on static image
        return self._generate_static_avatar(character_image, avatar_style, temp_dir, w, h)

    def _generate_static_avatar(self, character_image, avatar_style,
                                 temp_dir, w, h) -> Optional[str]:
        if not character_image or not os.path.exists(character_image):
            return None
        import cv2
        import numpy as np
        img = cv2.imread(character_image)
        img = cv2.resize(img, (w, h))
        # Create a 5-second video from the static image
        fps = 25
        output_path = os.path.join(temp_dir, "base_avatar.mp4")
        fourcc = cv2.VideoWriter_fourcc(*"mp4v")
        writer = cv2.VideoWriter(output_path, fourcc, fps, (w, h))
        for _ in range(fps * 5):
            writer.write(img)
        writer.release()
        return output_path if os.path.exists(output_path) else None

    def _lip_sync(self, video_path: str, audio_path: str, temp_dir: str) -> Optional[str]:
        # Wav2Lip inference
        if not self.ensure_wav2lip():
            return None

        output_path = os.path.join(self.output_dir, f"avatar_lipsync_{int(time.time())}.mp4")
        args = [
            sys.executable, os.path.join(self.wav2lip_dir, "inference.py"),
            "--checkpoint_path", self.model_path,
            "--face", video_path,
            "--audio", audio_path,
            "--outfile", output_path,
            "--pads", "0", "0", "0", "0",
            "--resize_factor", "1",
        ]
        try:
            result = subprocess.run(args, capture_output=True, timeout=300)
            if os.path.exists(output_path) and os.path.getsize(output_path) > 1000:
                return output_path
            print(f"Wav2Lip stderr: {result.stderr.decode()[-500:]}")
        except Exception as e:
            print(f"Wav2Lip failed: {e}")
        return None

    def parse_script(self, script_text: str) -> list:
        presets = SCRIPT_PRESETS.get(script_text.split()[0] if script_text else "")
        segments = []
        lines = [l.strip() for l in script_text.strip().split("\n") if l.strip()]

        if presets:
            for i, line in enumerate(lines):
                seg_idx = min(i, len(presets["segments"]) - 1)
                seg_name, seg_direction = presets["segments"][seg_idx]
                segments.append({
                    "text": line,
                    "timing": seg_name,
                    "direction": seg_direction,
                    "style": presets["style"],
                })
        else:
            for line in lines:
                segments.append({
                    "text": line,
                    "timing": "default",
                    "direction": "neutral expression, natural head movement",
                    "style": "Warm Presenter",
                })
        return segments

    def _compute_dims(self, aspect: str, quality: str) -> tuple:
        QUALITY = {"720p": 1280, "1080p (1K)": 1920}
        long_edge = QUALITY.get(quality, 1280)
        num, den = aspect.split(":")
        num, den = int(num), int(den)
        if num >= den:
            w = long_edge
            h = int(round(long_edge * den / num / 32) * 32)
        else:
            h = long_edge
            w = int(round(long_edge * num / den / 32) * 32)
        return max(256, w), max(256, h)


def _noop_progress(*args, **kwargs):
    pass


# ---- Standalone CLI ----
if __name__ == "__main__":
    import sys
    gen = AvatarGenerator()
    gen.ensure_wav2lip()
    text = sys.argv[1] if len(sys.argv) > 1 else "Hello, I am an AI assistant. How can I help you today?"
    img = sys.argv[2] if len(sys.argv) > 2 else None
    voice = sys.argv[3] if len(sys.argv) > 3 else "en-US-ChristopherNeural"
    result = gen.generate_avatar(text, character_image=img, voice=voice)
    print(json.dumps(result.get("status", []), indent=2))
    if result.get("video_path"):
        print(f"Avatar video: {result['video_path']}")
