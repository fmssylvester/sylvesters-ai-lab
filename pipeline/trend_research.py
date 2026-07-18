"""Fast trend research via the YouTube Data API (free quota with an API key).

This replaces the slow yt-dlp scraping path used by scripts/trend_analyzer.py.
It reads the tracked channels from out/channels.txt, pulls each channel's recent
uploads with live statistics, computes a views/day velocity, and finds the
cross-channel phrases that are hot right now — the same signal the Brain Engine
uses to pick topics.

Requires YOUTUBE_API_KEY in pipeline/.env (a Google Cloud API key with
"YouTube Data API v3" enabled).
"""

from __future__ import annotations

import re
import sys
import json
import time
from collections import defaultdict
from datetime import datetime, timezone
from pathlib import Path

import requests
import config

try:
    from dotenv import load_dotenv
    load_dotenv(config.PIPELINE_DIR / ".env")
except Exception:
    pass

API = "https://www.googleapis.com/youtube/v3"
CHANNELS_FILE = config.PROJECT_ROOT / "out" / "channels.txt"
OUTPUT = config.PROJECT_ROOT / "out" / "trends.json"

STOPWORDS = {"the","a","an","for","to","in","on","is","how","you","your",
             "and","of","this","i","with","free","2026","2025","best","new",
             "get","use","using","that","are","actually","full","only",
             "no","my","me","was","its","it's","not","have"}

CHANNEL_ID_RE = re.compile(r"(UC[\w-]{22})")


def _api(endpoint: str, params: dict) -> dict:
    params["key"] = config.YOUTUBE_API_KEY
    r = requests.get(f"{API}/{endpoint}", params=params, timeout=30)
    r.raise_for_status()
    return r.json()


def extract_channel_id(url: str) -> str | None:
    m = CHANNEL_ID_RE.search(url)
    return m.group(1) if m else None


def collect_channel(channel_url: str, max_videos: int = 10) -> list[dict]:
    cid = extract_channel_id(channel_url)
    if not cid:
        print(f"  [skip] cannot parse channel id from {channel_url}")
        return []
    uploads = _api("channels", {"part": "contentDetails", "id": cid}) \
        ["items"][0]["contentDetails"]["relatedPlaylists"]["uploads"]
    ids = []
    next_page = None
    while len(ids) < max_videos:
        params = {"part": "contentDetails", "playlistId": uploads,
                  "maxResults": min(50, max_videos - len(ids))}
        if next_page:
            params["pageToken"] = next_page
        data = _api("playlistItems", params)
        for it in data.get("items", []):
            ids.append(it["contentDetails"]["videoId"])
        next_page = data.get("nextPageToken")
        if not next_page:
            break
    if not ids:
        return []
    vids = []
    for i in range(0, len(ids), 50):
        chunk = ids[i:i + 50]
        data = _api("videos", {"part": "snippet,statistics",
                               "id": ",".join(chunk)})
        for it in data.get("items", []):
            sn = it["snippet"]
            stats = it.get("statistics", {})
            pub = datetime.strptime(sn["publishedAt"], "%Y-%m-%dT%H:%M:%SZ") \
                .replace(tzinfo=timezone.utc)
            days = max((datetime.now(timezone.utc) - pub).total_seconds() / 86400, 0.5)
            views = int(stats.get("viewCount", 0))
            vids.append({
                "title": sn["title"],
                "video_id": it["id"],
                "view_count": views,
                "upload_date": pub.strftime("%Y%m%d"),
                "velocity": round(views / days, 1),
                "channel_url": channel_url,
            })
    return vids


def extract_phrases(title: str) -> set[str]:
    words = re.findall(r"[a-z0-9']+", title.lower())
    words = [w for w in words if len(w) > 2]
    phrases = set()
    for size in (2, 3):
        for i in range(len(words) - size + 1):
            chunk = words[i:i + size]
            if all(w in STOPWORDS for w in chunk):
                continue
            if chunk[0] in STOPWORDS or chunk[-1] in STOPWORDS:
                continue
            phrases.add(" ".join(chunk))
    return phrases


def find_hot_keywords(all_videos: list[dict], min_channels: int = 2) -> list[dict]:
    keyword_map = defaultdict(list)
    for v in all_videos:
        if v["velocity"] is None:
            continue
        for phrase in extract_phrases(v["title"]):
            keyword_map[phrase].append(v)
    trends = []
    for phrase, videos in keyword_map.items():
        unique = {v["channel_url"] for v in videos}
        if len(unique) >= min_channels:
            avg = sum(v["velocity"] for v in videos) / len(videos)
            trends.append({
                "phrase": phrase,
                "channel_count": len(unique),
                "video_count": len(videos),
                "avg_velocity": round(avg, 1),
                "example_titles": list({v["title"] for v in videos})[:3],
            })
    trends.sort(key=lambda t: (t["channel_count"], t["avg_velocity"]), reverse=True)
    return trends


def research(max_videos: int = 10) -> list[dict]:
    config.require("YOUTUBE_API_KEY")
    urls = [l.strip() for l in CHANNELS_FILE.read_text().splitlines() if l.strip()]
    all_videos = []
    for idx, url in enumerate(urls, 1):
        print(f"[Channel {idx}/{len(urls)}] {url}")
        vids = collect_channel(url, max_videos)
        all_videos.extend(vids)
        time.sleep(0.2)
    print(f"Analyzing {len(all_videos)} videos across {len(urls)} channels...")
    trends = find_hot_keywords(all_videos)
    OUTPUT.write_text(json.dumps(trends, indent=2), encoding="utf-8")
    print(f"Saved fresh trends -> {OUTPUT}")
    return trends


if __name__ == "__main__":
    n = int(sys.argv[1]) if len(sys.argv) > 1 else 10
    tr = research(n)
    print("\nTop cross-channel trends:")
    for t in tr[:12]:
        print(f"  '{t['phrase']}' — {t['channel_count']} ch, avg {t['avg_velocity']} v/day")
        for ex in t["example_titles"]:
            print(f"      -> {ex}")
