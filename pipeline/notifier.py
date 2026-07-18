"""Step 4 — Telegram notifier.

Sends a message (and optionally a thumbnail/photo) to your Telegram chat via
the Bot API when the video goes live. Uses the free, official Bot API over
HTTPS — no libraries beyond `requests` required.

Bot: sylvester_aibot   Chat ID: 8800205878
"""

from __future__ import annotations

import requests
import config


def send_message(text: str) -> dict:
    config.require("TELEGRAM_BOT_TOKEN")
    url = f"https://api.telegram.org/bot{config.TELEGRAM_BOT_TOKEN}/sendMessage"
    resp = requests.post(url, json={
        "chat_id": config.TELEGRAM_CHAT_ID,
        "text": text,
        "parse_mode": "Markdown",
        "disable_web_page_preview": False,
    }, timeout=30)
    resp.raise_for_status()
    return resp.json()


def send_video_live(title: str, video_id: str, url: str) -> dict:
    msg = (
        f"🎬 *Sylvester's AI Lab — video is live!*\n\n"
        f"*{title}*\n\n"
        f"▶️ {url}\n\n"
        f"(videoId: `{video_id}`)"
    )
    return send_message(msg)


def send_notification(text: str) -> dict:
    """Generic notification used for stage updates / errors."""
    return send_message(f"🤖 *Pipeline:* {text}")


if __name__ == "__main__":
    import sys
    send_message(sys.argv[1] if len(sys.argv) > 1 else "Pipeline test message")
