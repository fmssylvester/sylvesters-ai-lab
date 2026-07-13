#!/bin/bash
# study_channel.sh <channel_url_or_handle> <how_many_recent_videos> [output_folder]

CHANNEL=$1
COUNT=${2:-5}
OUT=${3:-./study-channel}

SELF_DIR="$(cd "$(dirname "$0")" && pwd)"
STUDY_VIDEO="$SELF_DIR/study_video.sh"

mkdir -p "$OUT"

echo "Fetching last $COUNT video URLs from $CHANNEL..."
yt-dlp --flat-playlist --print "%(url)s" --playlist-end "$COUNT" "$CHANNEL" > "$OUT/urls.txt"

i=1
while read -r VIDEO_URL; do
  "$STUDY_VIDEO" "$VIDEO_URL" "$OUT/video_$i" 0.5
  i=$((i+1))
done < "$OUT/urls.txt"

echo "All videos processed into $OUT/video_1, video_2, etc."
