#!/usr/bin/env python3
"""
Veo 3.1 Video Generator — Gemini API client with multi-account key rotation.
Takes still images + motion prompts → generates real video clips via Veo 3.1.
"""
import json
import os
import sys
import time
import base64
import requests
from pathlib import Path

SCRIPT_DIR = Path(__file__).parent
ACCOUNTS_FILE = SCRIPT_DIR.parent.parent / "veo_accounts.json"
VIDEOS_DIR = SCRIPT_DIR / "videos"
IMAGES_DIR = SCRIPT_DIR / "images"

BASE_URL = "https://generativelanguage.googleapis.com/v1beta"
MODEL = "veo-3.1-fast-generate-preview"
POLL_INTERVAL = 15  # seconds between status checks
MAX_POLL_ATTEMPTS = 40  # 10 minutes max wait


class KeyRotator:
    """Rotates through multiple Gemini API keys to manage free tier quotas."""

    def __init__(self):
        self.keys = []
        self.current_index = 0
        self.key_status = {}  # key -> last error or success
        self._load_keys()

    def _load_keys(self):
        # Primary key from environment
        env_key = os.environ.get("GEMINI_API_KEY", "")
        if env_key:
            self.keys.append(env_key)
            self.key_status[env_key] = {"source": "env", "errors": 0, "uses": 0}

        # Additional keys from veo_accounts.json
        if ACCOUNTS_FILE.exists():
            with open(ACCOUNTS_FILE) as f:
                data = json.load(f)
            for entry in data.get("accounts", []):
                key = entry.get("api_key", "")
                if key and key not in self.keys:
                    self.keys.append(key)
                    self.key_status[key] = {
                        "source": entry.get("name", "file"),
                        "errors": 0,
                        "uses": 0,
                    }

        print(f"🔑 Loaded {len(self.keys)} API key(s)")
        if not self.keys:
            print("❌ No API keys found. Set GEMINI_API_KEY or create veo_accounts.json")
            sys.exit(1)

    def get_key(self):
        """Get current key, rotate if exhausted."""
        return self.keys[self.current_index]

    def rotate(self, reason="quota"):
        """Rotate to next key."""
        if len(self.keys) <= 1:
            return False  # No rotation possible

        old_key = self.keys[self.current_index]
        self.key_status[old_key]["errors"] += 1

        self.current_index = (self.current_index + 1) % len(self.keys)
        new_key = self.keys[self.current_index]

        print(f"   🔄 Rotating key ({reason}): {self.key_status[old_key]['source']} → {self.key_status[new_key]['source']}")
        return True

    def mark_success(self):
        key = self.keys[self.current_index]
        self.key_status[key]["uses"] += 1
        self.key_status[key]["errors"] = 0  # Reset consecutive errors

    def status(self):
        """Print status of all keys."""
        print("\n🔑 Key Status:")
        for i, key in enumerate(self.keys):
            info = self.key_status[key]
            marker = " ← current" if i == self.current_index else ""
            print(f"   [{i}] {info['source']}: {info['uses']} uses, {info['errors']} errors{marker}")


def start_video_generation(prompt: str, image_path: str, key: str, duration: int = 8) -> str:
    """Start a video generation job. Returns operation name."""
    # Read and encode image
    with open(image_path, "rb") as f:
        image_data = base64.b64encode(f.read()).decode("utf-8")

    payload = {
        "instances": [
            {
                "prompt": prompt,
                "image": {
                    "bytesBase64Encoded": image_data,
                    "mimeType": "image/png",
                },
            }
        ],
        "parameters": {
            "aspectRatio": "16:9",
        },
    }

    url = f"{BASE_URL}/models/{MODEL}:predictLongRunning?key={key}"
    resp = requests.post(url, json=payload, timeout=30)

    if resp.status_code == 429:
        return None, "quota"
    resp.raise_for_status()

    data = resp.json()
    op_name = data.get("name", "")
    if not op_name:
        raise Exception(f"No operation name in response: {json.dumps(data)[:200]}")

    return op_name, None


def poll_operation(op_name: str, key: str) -> dict:
    """Poll operation until done. Returns response dict."""
    url = f"{BASE_URL}/{op_name}?key={key}"

    for attempt in range(MAX_POLL_ATTEMPTS):
        resp = requests.get(url, timeout=30)
        resp.raise_for_status()
        data = resp.json()

        if data.get("done"):
            return data

        # Check for error
        if "error" in data:
            raise Exception(f"Operation error: {data['error']}")

        time.sleep(POLL_INTERVAL)

    raise Exception(f"Timeout after {MAX_POLL_ATTEMPTS * POLL_INTERVAL}s")


def download_video(uri: str, key: str, output_path: Path):
    """Download video from URI."""
    # Follow redirects with auth header
    resp = requests.get(uri, headers={"x-goog-api-key": key}, timeout=120, allow_redirects=True)
    resp.raise_for_status()

    with open(output_path, "wb") as f:
        f.write(resp.content)

    size_mb = os.path.getsize(output_path) / (1024 * 1024)
    return size_mb


def generate_video_for_scene(
    scene: dict, rotator: KeyRotator, dry_run: bool = False
) -> Path | None:
    """Generate Veo video for a single scene."""
    num = scene["scene_number"]
    video_prompt = scene.get("video_prompt", "")
    if not video_prompt:
        print(f"   ⏭️  Scene {num}: no video_prompt, skipping")
        return None

    image_path = IMAGES_DIR / f"scene_{num:02d}.png"
    if not image_path.exists():
        print(f"   ❌ Scene {num}: image not found: {image_path}")
        return None

    output_path = VIDEOS_DIR / f"scene_{num:02d}.mp4"
    if output_path.exists() and output_path.stat().st_size > 1000:
        print(f"   ⏭️  Scene {num}: video exists ({output_path.stat().st_size / 1024:.0f} KB), skipping")
        return output_path

    if dry_run:
        print(f"   🏃 Scene {num}: DRY RUN — would generate: {video_prompt[:60]}...")
        return None

    print(f"   🎬 Scene {num}: Generating video...")
    print(f"      Prompt: {video_prompt[:80]}...")

    os.makedirs(VIDEOS_DIR, exist_ok=True)

    # Try with current key, rotate on 429
    max_retries = len(rotator.keys)
    for attempt in range(max_retries):
        key = rotator.get_key()
        try:
            op_name, error = start_video_generation(video_prompt, str(image_path), key)
            if error == "quota":
                print(f"   ⚠️  Key exhausted, rotating... (attempt {attempt + 1}/{max_retries})")
                if not rotator.rotate("quota"):
                    print(f"   ❌ No more keys available")
                    return None
                continue

            print(f"   ⏳ Operation started: {op_name.split('/')[-1][:20]}...")

            # Poll for completion
            result = poll_operation(op_name, key)

            # Extract video URI
            video_uri = (
                result.get("response", {})
                .get("generateVideoResponse", {})
                .get("generatedSamples", [{}])[0]
                .get("video", {})
                .get("uri", "")
            )

            if not video_uri:
                print(f"   ❌ No video URI in response")
                return None

            # Download
            size_mb = download_video(video_uri, key, output_path)
            rotator.mark_success()
            print(f"   ✅ scene_{num:02d}.mp4 ({size_mb:.1f} MB)")
            return output_path

        except requests.exceptions.HTTPError as e:
            if e.response.status_code == 429:
                print(f"   ⚠️  Quota exhausted, rotating key...")
                if not rotator.rotate("quota"):
                    print(f"   ❌ No more keys available")
                    return None
                continue
            raise

    print(f"   ❌ All keys exhausted for scene {num}")
    return None


def generate_all_videos(storyboard_path: str = None, dry_run: bool = False):
    """Generate videos for all scenes in storyboard."""
    if storyboard_path is None:
        storyboard_path = SCRIPT_DIR / "storyboard.json"

    with open(storyboard_path) as f:
        storyboard = json.load(f)

    scenes = storyboard["scenes"]
    scenes_with_prompts = [s for s in scenes if s.get("video_prompt")]

    print(f"\n🎬 Veo Video Generator")
    print(f"   Model: {MODEL}")
    print(f"   Scenes: {len(scenes_with_prompts)} with video prompts")
    print()

    rotator = KeyRotator()

    results = []
    for scene in scenes:
        result = generate_video_for_scene(scene, rotator, dry_run=dry_run)
        results.append({"scene": scene["scene_number"], "path": result})

    successful = sum(1 for r in results if r["path"])
    print(f"\n✅ Generated {successful}/{len(scenes)} videos")

    rotator.status()
    return results


def test_single(prompt: str, key: str = None):
    """Quick test: generate one video from text only (no image)."""
    if key is None:
        key = os.environ.get("GEMINI_API_KEY", "")

    print(f"\n🧪 Testing Veo 3.1 Fast (text-to-video)")
    print(f"   Prompt: {prompt[:80]}...")

    payload = {
        "instances": [{"prompt": prompt}],
        "parameters": {"aspectRatio": "16:9"},
    }

    url = f"{BASE_URL}/models/{MODEL}:predictLongRunning?key={key}"
    print(f"   Sending request...")
    resp = requests.post(url, json=payload, timeout=30)

    if resp.status_code == 429:
        print(f"   ❌ 429 Quota exhausted on this key")
        print(f"   💡 Add a fresh key to veo_accounts.json and retry")
        return False

    resp.raise_for_status()
    data = resp.json()
    op_name = data.get("name", "")

    if not op_name:
        print(f"   ❌ No operation name: {json.dumps(data)[:200]}")
        return False

    print(f"   ✅ Operation started: {op_name}")

    # Poll
    print(f"   ⏳ Polling for completion...")
    try:
        result = poll_operation(op_name, key)
        video_uri = (
            result.get("response", {})
            .get("generateVideoResponse", {})
            .get("generatedSamples", [{}])[0]
            .get("video", {})
            .get("uri", "")
        )

        if video_uri:
            output = SCRIPT_DIR / "test_veo_output.mp4"
            size = download_video(video_uri, key, output)
            print(f"   ✅ Downloaded: {output} ({size:.1f} MB)")
            # Copy to phone storage
            phone = Path("/sdcard/Download/veo_test.mp4")
            import shutil
            shutil.copy2(output, phone)
            print(f"   📱 Copied to {phone}")
            return True
        else:
            print(f"   ❌ No video URI in response")
            return False
    except Exception as e:
        print(f"   ❌ Error: {e}")
        return False


if __name__ == "__main__":
    import argparse

    parser = argparse.ArgumentParser(description="Veo 3.1 Video Generator")
    parser.add_argument("--test", action="store_true", help="Quick test (text-to-video)")
    parser.add_argument("--prompt", type=str, default="Dark background with glowing cyan text blocks colliding and shattering into digital particles, slow motion debris floating, cinematic lighting", help="Test prompt")
    parser.add_argument("--dry-run", action="store_true", help="Show what would be generated")
    parser.add_argument("--scene", type=int, help="Generate video for single scene")
    parser.add_argument("--key", type=str, help="Specific API key to use")
    args = parser.parse_args()

    if args.test:
        test_single(args.prompt, args.key)
    elif args.scene:
        with open(SCRIPT_DIR / "storyboard.json") as f:
            storyboard = json.load(f)
        scene = next((s for s in storyboard["scenes"] if s["scene_number"] == args.scene), None)
        if scene:
            rotator = KeyRotator()
            generate_video_for_scene(scene, rotator)
        else:
            print(f"Scene {args.scene} not found")
    else:
        generate_all_videos(dry_run=args.dry_run)
