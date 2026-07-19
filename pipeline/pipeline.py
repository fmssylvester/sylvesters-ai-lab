"""Master pipeline — runs the full Sylvester's AI Lab automation in sequence:

   1. Script generator  (Gemini API) .............. writes script.json + .md
   2. Voiceover          (Edge TTS) ................ narrated mp3
   3. Word sync          (WhisperX)  ............... word_timestamps.json
   4. Scene classifier   (Gemini API) ............. scene_plan.json
   5. Asset resolver     .......................... brand logos per section
   6. B-roll descriptor  (Gemini API) ............. broll_descriptions.json
   7. Render trigger     (Remotion, batched) ...... renders the mp4
   8. Uploader           (YouTube Data API) ....... uploads the video
   9. Notifier           (Telegram bot) ........... pings you when it's up

All enrichment is merged into episodeRuntime.json (and passed as --props) so
the Episode composition receives word timestamps, scene plans, brand assets,
and b-roll briefs.

Usage:
    python pipeline.py "Best free AI video tools 2026"
    python pipeline.py "Topic here" --privacy public --no-notify

Everything is free-tier friendly. Secrets come from environment variables or a
pipeline/.env file (see config.py for the full list).
"""

from __future__ import annotations

import argparse
import json
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
import word_sync
import scene_classifier
import asset_resolver
import broll_descriptor


def _slug(topic: str) -> str:
    return "".join(c if c.isalnum() else "-" for c in topic.lower()).strip("-")


def run(topic: str, privacy: str, notify: bool, voiceover_mode: str) -> None:
    slug = _slug(topic)
    workspace = config.WORKSPACE / slug
    audio_path = workspace / config.VOICEOVER_FILENAME

    print(f"\n=== Sylvester's AI Lab pipeline: {topic} ===\n")

    # 1. Script (idempotent: reuse committed script.json when present)
    if notify:
        try:
            notifier.send_notification(f"Starting: *{topic}*")
        except Exception as exc:
            print(f"[warn] start notification failed: {exc}")
    script_json_path = workspace / config.SCRIPT_JSON_REL
    if script_json_path.exists():
        try:
            existing = json.loads(script_json_path.read_text(encoding="utf-8"))
            if existing.get("sections"):
                print(f"[run] reusing existing script.json in '{workspace.name}'")
                script = existing
            else:
                script = script_generator.generate_script(
                    topic, workspace, script_generator.load_research_brief(workspace)
                )
        except Exception as exc:
            print(f"[run] could not read existing script ({exc}); regenerating")
            script = script_generator.generate_script(
                topic, workspace, script_generator.load_research_brief(workspace)
            )
    else:
        script = script_generator.generate_script(
            topic, workspace, script_generator.load_research_brief(workspace)
        )

    # 2. Voiceover (auto via Edge TTS) — required before word_sync, which
    #    needs the narrated audio to produce word-level timestamps.
    print("\n-- Voiceover stage --")
    if voiceover_mode == "auto":
        voiceover.generate_voiceover(script, audio_path)
    else:
        print(f"Record on kikivoice.ai, then save it to:\n  {audio_path}\n")
        render_trigger.wait_for_audio(audio_path)

    # 3. Word sync (WhisperX) — word_timestamps.json for animation triggers.
    print("\n-- Word sync stage (WhisperX) --")
    word_timestamps = word_sync.generate_word_timestamps(
        str(audio_path), workspace / "word_timestamps.json"
    )

    # 4. Scene intent classifier (reuse committed scene_plan.json when present).
    print("\n-- Scene classifier stage --")
    scene_plan_path = workspace / "scene_plan.json"
    if scene_plan_path.exists():
        try:
            scene_plan = json.loads(scene_plan_path.read_text(encoding="utf-8"))
            print(f"[run] reusing existing scene_plan.json in '{workspace.name}'")
        except Exception as exc:
            print(f"[run] could not read scene_plan.json ({exc}); regenerating")
            scene_plan = scene_classifier.classify_sections(script, workspace)
    else:
        scene_plan = scene_classifier.classify_sections(script, workspace)

    # 5. Asset resolver — real brand logos mentioned in each section (local, no API).
    print("\n-- Asset resolver stage --")
    section_assets = asset_resolver.resolve_sections(script)

    # 6. B-roll descriptor (reuse committed broll_descriptions.json when present).
    print("\n-- B-roll descriptor stage --")
    broll_path = workspace / "broll_descriptions.json"
    if broll_path.exists():
        try:
            _raw = json.loads(broll_path.read_text(encoding="utf-8"))
            broll = [
                (d.get("description", "") if isinstance(d, dict) else str(d)) for d in _raw
            ]
            print(f"[run] reusing existing broll_descriptions.json in '{workspace.name}'")
        except Exception as exc:
            print(f"[run] could not read broll_descriptions.json ({exc}); regenerating")
            broll = broll_descriptor.describe_sections(script, workspace)
    else:
        broll = broll_descriptor.describe_sections(script, workspace)

    # Merge per-section enrichment into the script sections so the Episode
    # composition receives everything through episodeRuntime.json / --props.
    enriched_sections = []
    sections = script.get("sections", [])
    for i, s in enumerate(sections):
        sec = dict(s)
        if i < len(scene_plan):
            sec["visualTreatment"] = scene_plan[i].get("visual_treatment")
            sec["mood"] = scene_plan[i].get("mood")
            sec["suggestedComponents"] = scene_plan[i].get("suggested_components")
        if i < len(section_assets):
            sec["assets"] = section_assets[i]
        if i < len(broll):
            sec["broll"] = broll[i]
        enriched_sections.append(sec)

    enriched = {
        "wordTimestamps": word_timestamps,
        "sections": enriched_sections,
    }

    # 7. Render (batched + resumable; runs locally or on a remote CI runner)
    print("\n-- Render stage --")
    video_path = render_trigger.render_batches(slug, audio_path, enriched=enriched)

    # 4. Upload (non-fatal: a YouTube/API hiccup must not lose the render)
    print("\n-- Upload stage --")
    video_id = None
    try:
        video_id = uploader.upload(
            video_path,
            title=script.get("title", topic),
            description=script.get("description", ""),
            tags=script.get("tags", []),
            privacy=privacy,
        )
    except Exception as exc:
        print(f"[warn] YouTube upload failed: {exc}")
        print(f"[warn] Rendered video kept at: {video_path}")
    youtube_url = f"https://www.youtube.com/watch?v={video_id}" if video_id else ""

    # 5. Notify
    print("\n-- Notify stage --")
    if notify:
        try:
            if video_id:
                if privacy == "public":
                    notifier.send_video_live(script.get("title", topic), video_id, youtube_url)
                else:
                    notifier.send_notification(
                        f"Uploaded as *{privacy}*: [{script.get('title', topic)}]({youtube_url})"
                    )
            else:
                notifier.send_notification(
                    f"⚠️ Render finished but YouTube upload failed: {script.get('title', topic)}"
                )
        except Exception as exc:
            print(f"[warn] notification failed: {exc}")

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
