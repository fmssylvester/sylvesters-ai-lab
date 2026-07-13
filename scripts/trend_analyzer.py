import sys
import json
import re
from collections import defaultdict
from channel_collector import get_channel_videos, get_full_details, compute_velocity

def collect_channel(channel_url, max_videos=15):
    videos = get_channel_videos(channel_url, max_videos)
    for v in videos:
        details = get_full_details(v["video_id"])
        v.update(details)
        v["velocity"] = compute_velocity(v)
        v["channel_url"] = channel_url
    return videos

STOPWORDS = {"the","a","an","for","to","in","on","is","how","you","your",
             "and","of","this","i","with","free","2026","2025","best","new",
             "get","use","using","that","this","are","actually","full","only",
             "no","my","me","was","its","it's","not","have"}

def extract_phrases(title):
    """Extract 2-3 word meaningful phrases, not single generic words."""
    words = re.findall(r"[a-z0-9']+", title.lower())
    words = [w for w in words if len(w) > 2]
    phrases = set()
    for size in (2, 3):
        for i in range(len(words) - size + 1):
            chunk = words[i:i+size]
            if all(w in STOPWORDS for w in chunk):
                continue
            if chunk[0] in STOPWORDS or chunk[-1] in STOPWORDS:
                continue
            phrases.add(" ".join(chunk))
    return phrases

def find_hot_keywords(all_videos, min_channels=2):
    keyword_map = defaultdict(list)
    for v in all_videos:
        if v["velocity"] is None:
            continue
        for phrase in extract_phrases(v["title"]):
            keyword_map[phrase].append(v)

    trends = []
    for phrase, videos in keyword_map.items():
        unique_channels = set(v["channel_url"] for v in videos)
        if len(unique_channels) >= min_channels:
            avg_velocity = sum(v["velocity"] for v in videos) / len(videos)
            trends.append({
                "phrase": phrase,
                "channel_count": len(unique_channels),
                "video_count": len(videos),
                "avg_velocity": round(avg_velocity, 1),
                "example_titles": list(set(v["title"] for v in videos))[:3],
            })

    trends.sort(key=lambda t: (t["channel_count"], t["avg_velocity"]), reverse=True)
    return trends

def main():
    if len(sys.argv) < 2:
        print("Usage: python3 scripts/trend_analyzer.py <channels.txt> [max_videos_per_channel] [output.json]")
        sys.exit(1)

    channels_file = sys.argv[1]
    max_videos = int(sys.argv[2]) if len(sys.argv) > 2 else 15
    output_path = sys.argv[3] if len(sys.argv) > 3 else "trend_report.json"

    with open(channels_file) as f:
        channel_urls = [line.strip() for line in f if line.strip()]

    all_videos = []
    for idx, url in enumerate(channel_urls, 1):
        print(f"\n[Channel {idx}/{len(channel_urls)}] {url}")
        videos = collect_channel(url, max_videos)
        all_videos.extend(videos)

    print(f"\nAnalyzing {len(all_videos)} total videos across {len(channel_urls)} channels...")
    trends = find_hot_keywords(all_videos)

    with open(output_path, "w") as f:
        json.dump(trends, f, indent=2)

    print(f"\nSaved trend report to {output_path}")
    print("\nTop cross-channel trends (real phrase, not filler words):")
    for t in trends[:10]:
        print(f"  '{t['phrase']}' — {t['channel_count']} channels, avg {t['avg_velocity']} v/day")
        for ex in t["example_titles"]:
            print(f"      -> {ex}")

if __name__ == "__main__":
    main()
