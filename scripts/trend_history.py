import sys
import os
import json
import glob
from datetime import datetime, timezone

def snapshot_current_trends(out_dir="out"):
    """Save a timestamped copy of the current trends.json for future comparison."""
    trends_path = os.path.join(out_dir, "trends.json")
    if not os.path.exists(trends_path):
        print("No trends.json found. Run trend_analyzer.py first.")
        return None

    with open(trends_path) as f:
        trends = json.load(f)

    timestamp = datetime.now(timezone.utc).strftime("%Y%m%d_%H%M%S")
    history_dir = os.path.join(out_dir, "history")
    os.makedirs(history_dir, exist_ok=True)

    snapshot_path = os.path.join(history_dir, "trends_" + timestamp + ".json")
    with open(snapshot_path, "w") as f:
        json.dump({"timestamp": timestamp, "trends": trends}, f, indent=2)

    print("Saved snapshot: " + snapshot_path)
    return snapshot_path

def load_snapshots(out_dir="out"):
    history_dir = os.path.join(out_dir, "history")
    files = sorted(glob.glob(os.path.join(history_dir, "trends_*.json")))
    snapshots = []
    for f in files:
        try:
            with open(f) as fh:
                snapshots.append(json.load(fh))
        except Exception:
            continue
    return snapshots

def compare_latest_two(out_dir="out"):
    snapshots = load_snapshots(out_dir)
    if len(snapshots) < 2:
        print("Need at least 2 snapshots to compare. Currently have " + str(len(snapshots)) + ".")
        print("Run this script after collecting trends multiple times (e.g. daily) to build history.")
        return

    previous = snapshots[-2]
    current = snapshots[-1]

    prev_map = {t["phrase"]: t for t in previous["trends"]}
    curr_map = {t["phrase"]: t for t in current["trends"]}

    print("\nComparing " + previous["timestamp"] + " -> " + current["timestamp"])
    print("=" * 60)

    rising = []
    falling = []
    new_entries = []

    for phrase, curr_t in curr_map.items():
        if phrase in prev_map:
            prev_velocity = prev_map[phrase]["avg_velocity"]
            curr_velocity = curr_t["avg_velocity"]
            change = curr_velocity - prev_velocity
            change_pct = round((change / prev_velocity) * 100, 1) if prev_velocity else 0
            if change > 0:
                rising.append((phrase, prev_velocity, curr_velocity, change_pct))
            elif change < 0:
                falling.append((phrase, prev_velocity, curr_velocity, change_pct))
        else:
            new_entries.append((phrase, curr_t["avg_velocity"]))

    rising.sort(key=lambda x: x[3], reverse=True)
    falling.sort(key=lambda x: x[3])

    print("\n RISING (accelerating -- good timing to cover):")
    for phrase, prev_v, curr_v, pct in rising[:8]:
        print("  '" + phrase + "': " + str(prev_v) + " -> " + str(curr_v) + " v/day (+" + str(pct) + "%)")

    print("\n NEW SINCE LAST CHECK:")
    for phrase, velocity in new_entries[:8]:
        print("  '" + phrase + "': " + str(velocity) + " v/day (wasn't trending before)")

    print("\n FALLING (losing momentum -- may be too late):")
    for phrase, prev_v, curr_v, pct in falling[:8]:
        print("  '" + phrase + "': " + str(prev_v) + " -> " + str(curr_v) + " v/day (" + str(pct) + "%)")

def main():
    action = sys.argv[1] if len(sys.argv) > 1 else "snapshot"

    if action == "snapshot":
        snapshot_current_trends()
    elif action == "compare":
        compare_latest_two()
    else:
        print("Usage: python3 scripts/trend_history.py [snapshot|compare]")

if __name__ == "__main__":
    main()
