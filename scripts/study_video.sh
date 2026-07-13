#!/bin/bash
# study_video.sh <youtube_url> [output_folder] [frame_rate]
#
# frame_rate examples:
#   1    = 1 frame/sec  -> fast-cut intros / hooks / kinetic typography
#   0.5  = 1 frame/2s   -> standard motion-graphics explainer (default)
#   0.25 = 1 frame/4s   -> long talking-head / tutorial
#
# Optional time window (e.g. just the first 15s of an intro):
#   SS=00:00:00 TO=00:00:15 ./study_video.sh <url> <out> 1
#   -> passed as -ss/-to before -i in the ffmpeg line.
#
# Notes:
#   - No API keys / paid services; runs locally via yt-dlp + ffmpeg.
#   - Delete video.mp4 after extraction if storage is tight; frames + transcript suffice.
#   - If a video has no captions, transcript file is empty; frame analysis still works.

URL=$1
OUT=${2:-./study}
RATE=${3:-0.5}

if [ -z "$URL" ]; then
  echo "Usage: ./study_video.sh <youtube_url> [output_folder] [frame_rate]"
  exit 1
fi

mkdir -p "$OUT/frames"

echo "Fetching transcript..."
yt-dlp --write-auto-sub --sub-lang en --skip-download --convert-subs srt \
  -o "$OUT/transcript" "$URL"

echo "Downloading video..."
yt-dlp -f "bv*[height<=1080]+ba" -o "$OUT/video.mp4" "$URL"

echo "Extracting frames at ${RATE} fps..."
SS=${SS:-}; TO=${TO:-}
WIN=""
[ -n "$SS" ] && WIN="$WIN -ss $SS"
[ -n "$TO" ] && WIN="$WIN -to $TO"
# shellcheck disable=SC2086
ffmpeg $WIN -i "$OUT/video.mp4" -vf "fps=${RATE}" "$OUT/frames/frame_%04d.jpg" \
  -hide_banner -loglevel error

echo "Done."
echo "Frames:     $OUT/frames"
echo "Transcript: $OUT/transcript.en.srt"
echo ""
echo "Delete $OUT/video.mp4 if you need to save space — only frames + transcript are needed for analysis."
