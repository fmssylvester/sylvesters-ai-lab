#!/data/data/com.termux/files/usr/bin/bash
# extract-frames.sh <video> <out-dir> [fps] [--normalize]
# Renders footage to a render-safe JPG frame sequence (Remotion OffthreadVideo is
# broken on Termux). Spot-checks frames through verify-asset.sh so a black/blank
# clip can't quietly enter a scene. With --normalize, lifts shadows + adds contrast
# so the clip is uniformly visible (prevents the "black screen" over-darkening bug).
set -euo pipefail
here="$(cd "$(dirname "$0")" && pwd)"

vid="${1:-}"; dir="${2:-}"; fps="${3:-30}"; norm=""
[ "${4:-}" = "--normalize" ] && norm="1"
[ -z "$vid" ] || [ -z "$dir" ] && { echo "usage: extract-frames.sh <video> <out-dir> [fps] [--normalize]"; exit 2; }
[ -f "$vid" ] || { echo "FAIL  missing video: $vid"; exit 1; }

mkdir -p "$dir"
echo "-> extracting $vid @ ${fps}fps -> $dir ${norm:+(normalized)}"
if [ -n "$norm" ]; then
  ffmpeg -y -hide_banner -loglevel error -i "$vid" -vf "fps=${fps},eq=brightness=0.10:contrast=1.12,setsar=1" -q:v 3 "$dir/f-%03d.jpg"
else
  ffmpeg -y -hide_banner -loglevel error -i "$vid" -vf "fps=${fps}" -q:v 3 "$dir/f-%03d.jpg"
fi

count=$(ls "$dir"/f-*.jpg 2>/dev/null | wc -l)
[ "$count" -eq 0 ] && { echo "FAIL  no frames produced"; exit 1; }
echo "   $count frames"

bad=0
for f in "$dir"/f-001.jpg "$dir/f-$(printf '%03d' $((count/2))).jpg" "$dir/f-$(printf '%03d' "$count").jpg"; do
  [ -f "$f" ] && { "$here/verify-asset.sh" "$f" || bad=$((bad+1)); }
done
[ "$bad" -gt 0 ] && { echo "WARN  $bad sampled frame(s) failed the guard — review the clip"; exit 1; }
echo "KEPT  $dir ($count frames, samples passed)"
