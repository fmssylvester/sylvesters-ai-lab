"""Step 3 — YouTube uploader.

Uploads the rendered video to YouTube via the YouTube Data API v3 using OAuth2
(client-secret flow). Tokens are cached to disk so you only authorize once.

Setup (free):
  1. Create a project in Google Cloud, enable "YouTube Data API v3".
  2. Create an OAuth 2.0 "Desktop" client ID -> download JSON to
     client_secret.json in the project root (or set YOUTUBE_CLIENT_SECRETS).
  3. On first run the script prints a consent URL; paste the code back.
"""

from __future__ import annotations

import os
from pathlib import Path

import config


def _build_client():
    from google.auth.transport.requests import Request
    from google.oauth2.credentials import Credentials
    from google_auth_oauthlib.flow import InstalledAppFlow
    from googleapiclient.discovery import build
    from googleapiclient.http import MediaFileUpload

    scopes = ["https://www.googleapis.com/auth/youtube.upload"]
    creds = None
    token_path = Path(config.YOUTUBE_TOKEN)
    if token_path.exists():
        creds = Credentials.from_authorized_user_file(str(token_path), scopes)
    if not creds or not creds.valid:
        if creds and creds.expired and creds.refresh_token:
            creds.refresh(Request())
        else:
            flow = InstalledAppFlow.from_client_secrets_file(
                config.YOUTUBE_CLIENT_SECRETS, scopes
            )
            # run_local_server needs a browser; on Termux we use console flow.
            creds = flow.run_console() if _no_browser() else flow.run_local_server(port=0)
        token_path.write_text(creds.to_json(), encoding="utf-8")

    return build("youtube", "v3", credentials=creds), MediaFileUpload


def _no_browser() -> bool:
    return os.environ.get("TERMUX", "") != "" or not _has_display()


def _has_display() -> bool:
    return "DISPLAY" in os.environ


def upload(video_path: Path, title: str, description: str,
           tags: list[str], privacy: str | None = None) -> str:
    """Upload the video. Returns the YouTube video ID."""
    config.require("YOUTUBE_CLIENT_SECRETS")
    youtube, MediaFileUpload = _build_client()

    body = {
        "snippet": {
            "title": title,
            "description": description,
            "tags": tags,
            "categoryId": config.YOUTUBE_CATEGORY_ID,
        },
        "status": {
            "privacyStatus": privacy or config.YOUTUBE_PRIVACY,
            "selfDeclaredMadeForKids": False,
        },
    }
    media = MediaFileUpload(str(video_path), chunksize=-1, resumable=True,
                            mimetype="video/mp4")

    print(f"[upload] Uploading {video_path.name} -> YouTube ({body['status']['privacyStatus']})")
    req = youtube.videos().insert(part="snippet,status", body=body, media_body=media)
    response = None
    while response is None:
        status, response = req.next_chunk()
        if status:
            print(f"[upload] {int(status.progress() * 100)}%")
    video_id = response["id"]
    print(f"[upload] Uploaded. Video ID: {video_id}")
    return video_id


if __name__ == "__main__":
    import sys
    p = Path(sys.argv[1])
    upload(p, p.stem, "Uploaded by pipeline.", ["ai", "tools"], "private")
