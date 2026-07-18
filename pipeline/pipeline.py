"""Master pipeline — runs the full Sylvester's AI Lab automation in sequence:

  1. Script generator  (Gemini API) .............. writes script.json + .md
  2. Wait for voiceover (manual, kikivoice.ai) .... PAUSES for audio file
  3. Render trigger     (Remotion, local) ......... renders the mp4
  4. Uploader           (YouTube Data API) ........ uploads the video
  5. Notifier           (Telegram bot) ............ pings you when it's up

Usage:
    python pipeline.py "Best free AI video tools 2026"
    python pipeline.py "Topic here" --privacy public --no-notify

Everything is free-tier friendly. Secrets come from environment variables or a
pipeline/.env file (see config.py for the full list).
"""

from __future__ import annotations

import argparse
import sys
from pathlib import Path

import config

try:
    from dotenv import load_dotenv
    load_dotenv(config.PIPELINE_DIR / ".env")
except Exception:
    pass

import script_generator
import render_trigger
import uploader
import notifier
import voiceover


def _slug(topic: str) -> str:
    return "".join(c if c.isalnum() else "-" for c in topic.lower()).strip("-")


def run(topic: str, privacy: str, notify: bool, voiceover_mode: str) -> None:
    slug = _slug(topic)
    workspace = config.WORKSPACE / slug
    audio_path = workspace / config.VOICEOVER_FILENAME

    print(f"\n=== Sylvester's AI Lab pipeline: {topic} ===\n")

    # 1. Script
    if notify:
        notifier.send_notification(f"Starting: *{topic}*")
    script = script_generator.generate_script(topic, workspace)

    # 2. Voiceover (auto via Edge TTS, or pause for manual kikivoice.ai upload)
    print("\n-- Voiceover stage --")
    if voiceover_mode == "auto":
        voiceover.generate_voiceover(script, audio_path)
    else:
        print(f"Record on kikivoice.ai, then save it to:\n  {audio_path}\n")
        render_trigger.wait_for_audio(audio_path)

    # 3. Render (batched + resumable; runs locally or on a remote CI runner)
    print("\n-- Render stage --")
    video_path = render_trigger.render_batches(slug, audio_path)

    # 4. Upload
    print("\n-- Upload stage --")
    video_id = uploader.upload(
        video_path,
        title=script.get("title", topic),
        description=script.get("description", ""),
        tags=script.get("tags", []),
        privacy=privacy,
    )
    youtube_url = f"https://www.youtube.com/watch?v={video_id}"

    # 5. Notify
    print("\n-- Notify stage --")
    if privacy == "public":
        notifier.send_video_live(script.get("title", topic), video_id, youtube_url)
    else:
        notifier.send_notification(
            f"Uploaded as *{privacy}*: [{script.get('title', topic)}]({youtube_url})"
        )

    print(f"\n✅ Done. Video ID: {video_id}\n   {youtube_url}\n")


def main() -> None:
    p = argparse.ArgumentParser(description="Sylvester's AI Lab pipeline")
    p.add_argument("topic", help="Video topic")
    p.add_argument("--privacy", default=config.YOUTUBE_PRIVACY,
                   choices=["private", "public", "unlisted"])
    p.add_argument("--no-notify", action="store_true",
                   help="Skip Telegram notifications")
    p.add_argument("--tts", default=config.VOICEOVER_MODE, choices=["auto", "manual"],
                   help="auto = Edge TTS voiceover; manual = wait for kikivoice.ai upload")
    args = p.parse_args()

    try:
        run(args.topic, args.privacy, notify=not args.no_notify,
            voiceover_mode=args.tts)
    except Exception as exc:  # surface failures to Telegram too
        print(f"[FATAL] {exc}", file=sys.stderr)
        if not args.no_notify:
            try:
                notifier.send_notification(f"❌ *Failed*: {exc}")
            except Exception:
                pass
        sys.exit(1)


if __name__ == "__main__":
    main()
