import sys
import os
import json
import subprocess
from collections import defaultdict

def search_niche_videos(query, max_results=50):
    """Search YouTube for the niche term, extract unique channels from results."""
    cmd = [
        "yt-dlp", "--flat-playlist", "--dump-json",
        f"ytsearch{max_results}:{query}"
    ]
    result = subprocess.run(cmd, capture_output=True, text=True, timeout=180)
    videos = []
    for line in result.stdout.strip().split("\n"):
        if not line:
            continue
        try:
            data = json.loads(line)
            channel_url = data.get("channel_url") or data.get("uploader_url")
            channel_name = data.get("channel") or data.get("uploader")
            if channel_url and channel_name:
                videos.append({
                    "channel_url": channel_url,
                    "channel_name": channel_name,
                    "video_title": data.get("title"),
                    "video_id": data.get("id"),
                })
        except json.JSONDecodeError:
            continue
    return videos

def rank_channels_by_appearance(videos, min_appearances=1):
    """Channels showing up multiple times across search results are more established in this niche."""
    channel_map = defaultdict(list)
    for v in videos:
        channel_map[v["channel_url"]].append(v)

    ranked = []
    for url, appearances in channel_map.items():
        if len(appearances) >= min_appearances:
            ranked.append({
                "channel_url": url,
                "channel_name": appearances[0]["channel_name"],
                "appearances_in_search": len(appearances),
                "sample_titles": [a["video_title"] for a in appearances[:3]],
            })

    ranked.sort(key=lambda c: c["appearances_in_search"], reverse=True)
    return ranked

def quick_velocity_check(channel_url, sample_size=5):
    """Lightweight check -- just enough videos to estimate if this channel is actually performing."""
    sys.path.insert(0, "scripts")
    from channel_collector import get_channel_videos, get_full_details, compute_velocity

    videos = get_channel_videos(channel_url, sample_size)
    velocities = []
    for v in videos:
        details = get_full_details(v["video_id"])
        v.update(details)
        vel = compute_velocity(v)
        if vel is not None:
            velocities.append(vel)

    if not velocities:
        return None
    return round(sum(velocities) / len(velocities), 1)

def main():
    if len(sys.argv) < 2:
        print('Usage: python3 scripts/niche_discovery.py "niche search term" [top_n_channels] [search_depth]')
        sys.exit(1)

    query = sys.argv[1]
    top_n = int(sys.argv[2]) if len(sys.argv) > 2 else 5
    search_depth = int(sys.argv[3]) if len(sys.argv) > 3 else 50

    print("Searching niche: \"" + query + "\" (depth: " + str(search_depth) + " videos)...")
    videos = search_niche_videos(query, search_depth)
    print("Found " + str(len(videos)) + " videos across the search results.")

    ranked = rank_channels_by_appearance(videos)
    print("Discovered " + str(len(ranked)) + " unique channels in this niche.")

    print("\nChecking real velocity for top candidates (this takes a while)...")
    candidates = ranked[:top_n * 2]  # check more than we need, since some will underperform
    verified = []

    for i, c in enumerate(candidates, 1):
        print("\n[" + str(i) + "/" + str(len(candidates)) + "] " + c["channel_name"])
        avg_velocity = quick_velocity_check(c["channel_url"])
        print("  Average velocity: " + str(avg_velocity) + " v/day")
        if avg_velocity is not None:
            c["avg_velocity"] = avg_velocity
            verified.append(c)

    verified.sort(key=lambda c: c["avg_velocity"], reverse=True)
    top_channels = verified[:top_n]

    os.makedirs("out", exist_ok=True)
    output_path = "out/discovered_channels.json"
    with open(output_path, "w") as f:
        json.dump(top_channels, f, indent=2)

    channels_txt_path = "out/channels.txt"
    with open(channels_txt_path, "w") as f:
        for c in top_channels:
            f.write(c["channel_url"] + "\n")

    print("\n" + "=" * 60)
    print("TOP " + str(len(top_channels)) + " CHANNELS IN \"" + query + "\" (auto-discovered and verified):")
    print("=" * 60)
    for c in top_channels:
        print("\n" + c["channel_name"] + " -- avg " + str(c["avg_velocity"]) + " v/day")
        print("  " + c["channel_url"])
        print("  Appeared " + str(c["appearances_in_search"]) + "x in niche search results")

    print("\nSaved to " + output_path)
    print("Also wrote channel URLs to " + channels_txt_path + " -- ready for run_full_engine.sh")

if __name__ == "__main__":
    main()
