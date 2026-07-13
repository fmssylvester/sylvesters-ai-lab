import sys
import json
import subprocess
from datetime import datetime, timezone

def get_channel_videos(channel_url, max_videos=30):
    cmd = [
        "yt-dlp",
        "--flat-playlist",
        "--dump-json",
        "--playlist-end", str(max_videos),
        channel_url
    ]
    result = subprocess.run(cmd, capture_output=True, text=True, timeout=120)
    videos = []
    for line in result.stdout.strip().split("\n"):
        if not line:
            continue
        try:
            data = json.loads(line)
            videos.append({
                "title": data.get("title"),
                "video_id": data.get("id"),
                "url": f"https://youtube.com/watch?v={data.get('id')}",
            })
        except json.JSONDecodeError:
            continue
    return videos

def get_full_details(video_id):
    cmd = ["yt-dlp", "--dump-json", f"https://youtube.com/watch?v={video_id}"]
    result = subprocess.run(cmd, capture_output=True, text=True, timeout=60)
    try:
        data = json.loads(result.stdout)
        return {
            "view_count": data.get("view_count"),
            "upload_date": data.get("upload_date"),
            "duration": data.get("duration"),
            "thumbnail": data.get("thumbnail"),
            "like_count": data.get("like_count"),
            "comment_count": data.get("comment_count"),
        }
    except Exception as e:
        print(f"  [error fetching {video_id}: {e}]")
        return {}

def compute_velocity(video, now=None):
    if not video.get("upload_date") or not video.get("view_count"):
        return None
    try:
        upload = datetime.strptime(video["upload_date"], "%Y%m%d").replace(tzinfo=timezone.utc)
    except Exception:
        return None
    now = now or datetime.now(timezone.utc)
    days = max((now - upload).days, 1)
    return round(video["view_count"] / days, 1)

def main():
    if len(sys.argv) < 2:
        print("Usage: python3 scripts/channel_collector.py <channel_url> [max_videos] [output.json]")
        sys.exit(1)

    channel_url = sys.argv[1]
    max_videos = int(sys.argv[2]) if len(sys.argv) > 2 else 30
    output_path = sys.argv[3] if len(sys.argv) > 3 else "channel_data.json"

    print(f"Collecting up to {max_videos} videos from {channel_url}...")
    videos = get_channel_videos(channel_url, max_videos)

    print(f"Fetching full details for {len(videos)} videos...")
    for i, v in enumerate(videos, 1):
        details = get_full_details(v["video_id"])
        v.update(details)
        v["velocity"] = compute_velocity(v)
        print(f"  [{i}/{len(videos)}] {v['title'][:50]}")

    videos.sort(key=lambda v: v["velocity"] if v["velocity"] is not None else -1, reverse=True)

    with open(output_path, "w") as f:
        json.dump(videos, f, indent=2)

    print(f"\nSaved {len(videos)} videos to {output_path}")
    print("\nTop 5 by velocity (views/day):")
    for v in videos[:5]:
        vel = v["velocity"] if v["velocity"] is not None else "N/A"
        print(f"  {vel} v/day — {v['title']}")

if __name__ == "__main__":
    main()
