"""Topic research via the YouTube Data API — first-hand signal for a query.

Unlike trend_research.py (which analyzes a fixed channel list for cross-channel
heat), this searches YouTube for a SPECIFIC topic and pulls the top videos with
live statistics + snippets. It distills a research brief: what's already covering
the topic, the angles competitors use, recurring phrasing, which tools dominate
the space, and where the gaps are. That brief grounds the script generator in
real data instead of Gemini guessing.

Requires YOUTUBE_API_KEY in pipeline/.env (a Google Cloud key with
"YouTube Data API v3" enabled).
"""

from __future__ import annotations

import json
import re
import sys
from collections import Counter
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

# Generic English stopwords only — keep topic words (ai, image, video, prompt)
# so recurring-phrase analysis reflects how competitors actually phrase titles.
STOPWORDS = {
    "the", "a", "an", "for", "to", "in", "on", "is", "how", "you", "your",
    "and", "of", "this", "i", "with", "free", "2026", "2025", "best", "new",
    "get", "use", "using", "that", "are", "actually", "full", "only", "no",
    "my", "me", "was", "its", "it's", "not", "have", "from", "into", "what",
    "why", "when", "who", "your", "our", "all", "can", "will", "just", "like",
    "make", "making", "create", "creating", "step", "steps", "tutorial",
    "beginner", "beginners", "guide", "course", "tips", "top", "easy", "simple",
}

# Image-to-video / image-gen tools to scan for, so the brief shows which
# products dominate the conversation right now.
TOOLS = [
    "Runway", "Kling", "Luma", "Pika", "Hailuo", "MiniMax", "Stable Diffusion",
    "ComfyUI", "Midjourney", "Google Flow", "Veo", "Sora", "Gen-3", "Gen-2",
    "Flux", "LeiaPix", "AnimateDiff", "Hunyuan", "Mochi", "LTX",
]


def _slug(topic: str) -> str:
    return "".join(c if c.isalnum() else "-" for c in topic.lower()).strip("-")


def _api(endpoint: str, params: dict) -> dict:
    params["key"] = config.YOUTUBE_API_KEY
    r = requests.get(f"{API}/{endpoint}", params=params, timeout=30)
    r.raise_for_status()
    return r.json()


def search_videos(query: str, order: str, max_results: int) -> list[str]:
    data = _api("search", {
        "part": "snippet", "q": query, "type": "video",
        "maxResults": max_results, "order": order, "safeSearch": "none",
    })
    return [
        it["id"]["videoId"]
        for it in data.get("items", [])
        if it.get("id", {}).get("videoId")
    ]


def fetch_details(ids: list[str]) -> list[dict]:
    out = []
    for i in range(0, len(ids), 50):
        chunk = ids[i:i + 50]
        data = _api("videos", {
            "part": "snippet,statistics,contentDetails",
            "id": ",".join(chunk),
        })
        for it in data.get("items", []):
            sn = it.get("snippet", {})
            st = it.get("statistics", {})
            pub = sn.get("publishedAt", "")
            try:
                days = max(
                    (datetime.now(timezone.utc) - datetime.strptime(pub, "%Y-%m-%dT%H:%M:%SZ").replace(tzinfo=timezone.utc)).total_seconds() / 86400,
                    0.5,
                )
            except Exception:
                days = None
            views = int(st.get("viewCount", 0) or 0)
            out.append({
                "video_id": it["id"],
                "title": sn.get("title", ""),
                "channel": sn.get("channelTitle", ""),
                "published": pub,
                "views": views,
                "likes": int(st.get("likeCount", 0) or 0),
                "comments": int(st.get("commentCount", 0) or 0),
                "duration": it.get("contentDetails", {}).get("duration", ""),
                "description": (sn.get("description", "") or "").strip().replace("\n", " "),
                "velocity": round(views / days, 1) if days else None,
            })
    return out


def extract_phrases(title: str) -> set[str]:
    words = re.findall(r"[a-z0-9']+", title.lower())
    words = [w for w in words if len(w) > 2 and w not in STOPWORDS]
    phrases = set()
    for size in (2, 3):
        for i in range(len(words) - size + 1):
            chunk = words[i:i + size]
            if chunk[0] in STOPWORDS or chunk[-1] in STOPWORDS:
                continue
            phrases.add(" ".join(chunk))
    return phrases


def count_tools(vids: list[dict]) -> list[dict]:
    counts: Counter = Counter()
    for v in vids:
        blob = f"{v['title']} {v['description']}".lower()
        for tool in TOOLS:
            if tool.lower() in blob:
                counts[tool] += 1
    return [{"tool": t, "mentions": c} for t, c in counts.most_common()]


def research(topic: str, per_search: int = 12) -> dict:
    config.require("YOUTUBE_API_KEY")
    print(f"[research] Searching YouTube for: {topic}")

    # Blend relevance (on-topic) + viewCount (proven) results, deduped.
    ids: list[str] = []
    for order in ("relevance", "viewCount"):
        for vid in search_videos(topic, order, per_search):
            if vid not in ids:
                ids.append(vid)
    print(f"[research] {len(ids)} unique videos; fetching details...")
    vids = fetch_details(ids)

    phrases: Counter = Counter()
    for v in vids:
        for p in extract_phrases(v["title"]):
            phrases[p] += 1
    common = [
        {"phrase": p, "count": c}
        for p, c in phrases.most_common(25)
        if c > 1
    ]

    tools = count_tools(vids)
    total_views = sum(v["views"] for v in vids)
    brief = {
        "topic": topic,
        "query_time": datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M UTC"),
        "video_count": len(vids),
        "total_views": total_views,
        "top_videos": sorted(vids, key=lambda v: v["views"], reverse=True)[:10],
        "common_phrases": common,
        "tool_mentions": tools,
    }

    ws = config.WORKSPACE / _slug(topic)
    ws.mkdir(parents=True, exist_ok=True)
    (ws / "research.json").write_text(
        json.dumps(brief, indent=2, ensure_ascii=False), encoding="utf-8"
    )
    (ws / "research.md").write_text(_to_markdown(brief), encoding="utf-8")
    print(f"[research] Saved -> {ws / 'research.json'}")
    return brief


def _to_markdown(brief: dict) -> str:
    lines = [
        f"# Research brief: {brief['topic']}",
        "",
        f"- Query time: {brief['query_time']}",
        f"- Videos analyzed: {brief['video_count']}",
        f"- Total views across sample: {brief['total_views']:,}",
        "",
        "## Top videos (by views)",
        "",
    ]
    for v in brief["top_videos"]:
        lines.append(
            f"- **{v['title']}** — {v['views']:,} views · {v['channel']} · "
            f"https://youtu.be/{v['video_id']}"
        )
    lines += ["", "## Recurring phrases in titles", ""]
    for p in brief["common_phrases"][:15]:
        lines.append(f"- `{p['phrase']}` × {p['count']}")
    lines += ["", "## Tools mentioned", ""]
    if brief["tool_mentions"]:
        for t in brief["tool_mentions"]:
            lines.append(f"- **{t['tool']}** — {t['mentions']} video(s)")
    else:
        lines.append("- (none of the tracked tools detected in this sample)")
    return "\n".join(lines)


if __name__ == "__main__":
    topic = sys.argv[1] if len(sys.argv) > 1 else input("Topic: ")
    b = research(topic)
    print(f"\n=== Research brief: {b['topic']} ===")
    print(f"Videos analyzed: {b['video_count']} | Total views: {b['total_views']:,}")
    print("\nTop videos:")
    for v in b["top_videos"][:8]:
        print(f"  {v['views']:>10,} views | {v['title']}  ({v['channel']})")
    print("\nRecurring phrases across titles:")
    for p in b["common_phrases"][:10]:
        print(f"  '{p['phrase']}' x{p['count']}")
    if b["tool_mentions"]:
        print("\nTools mentioned:")
        for t in b["tool_mentions"]:
            print(f"  {t['tool']} x{t['mentions']}")
