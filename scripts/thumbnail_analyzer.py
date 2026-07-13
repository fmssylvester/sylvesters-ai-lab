import sys
import os
import json
import glob
import subprocess
import urllib.request

def download_thumbnail(url, save_path):
    try:
        urllib.request.urlretrieve(url, save_path)
        return os.path.exists(save_path) and os.path.getsize(save_path) > 0
    except Exception as e:
        print("  [download failed: " + str(e) + "]")
        return False

def analyze_thumbnail(image_path):
    """Reuses scripts/vision.py as a subprocess, same fallback chain already built."""
    question = (
        "Describe this YouTube thumbnail's visual composition: layout (split-screen, "
        "single subject, etc), dominant colors, presence and style of on-screen text, "
        "whether a face is shown, and overall emotional tone. Be specific and concise."
    )
    try:
        result = subprocess.run(
            ["python3", "scripts/vision.py", question, image_path],
            capture_output=True, text=True, timeout=90
        )
        return result.stdout.strip()
    except Exception as e:
        return "[vision analysis failed: " + str(e) + "]"

def load_top_videos(out_dir="out", top_n=6):
    channel_files = glob.glob(os.path.join(out_dir, "channel_*.json"))
    all_videos = []
    for cf in channel_files:
        try:
            with open(cf) as f:
                data = json.load(f)
                if isinstance(data, list):
                    all_videos.extend(data)
        except Exception:
            continue

    top = sorted(
        [v for v in all_videos if v.get("velocity") is not None and v.get("thumbnail")],
        key=lambda v: v["velocity"], reverse=True
    )[:top_n]
    return top

def main():
    out_dir = "out"
    top_n = int(sys.argv[1]) if len(sys.argv) > 1 else 6

    print("Loading top-performing videos with thumbnails...")
    top_videos = load_top_videos(out_dir, top_n)

    if not top_videos:
        print("No videos with thumbnails found. Run channel_collector.py first.")
        sys.exit(1)

    thumb_dir = os.path.join(out_dir, "thumbnails")
    os.makedirs(thumb_dir, exist_ok=True)

    results = []
    for i, v in enumerate(top_videos, 1):
        print("\n[" + str(i) + "/" + str(len(top_videos)) + "] " + v["title"][:60])
        img_path = os.path.join(thumb_dir, v["video_id"] + ".jpg")

        if not os.path.exists(img_path):
            print("  Downloading thumbnail...")
            ok = download_thumbnail(v["thumbnail"], img_path)
            if not ok:
                continue
        else:
            print("  (already downloaded)")

        print("  Analyzing...")
        analysis = analyze_thumbnail(img_path)
        print("  " + analysis[:150])

        results.append({
            "title": v["title"],
            "velocity": v["velocity"],
            "thumbnail_path": img_path,
            "analysis": analysis
        })

    output_path = os.path.join(out_dir, "thumbnail_analysis.json")
    with open(output_path, "w") as f:
        json.dump(results, f, indent=2)

    print("\nSaved " + str(len(results)) + " thumbnail analyses to " + output_path)

if __name__ == "__main__":
    main()
