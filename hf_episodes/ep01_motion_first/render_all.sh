#!/bin/bash
cd /data/data/com.termux/files/home/ai-lab-internal/hf_episodes/ep01_motion_first
export HYPERFRAMES_BROWSER_PATH=/data/data/com.termux/files/usr/bin/chromium-browser
HF=/data/data/com.termux/files/home/ai-lab-internal/node_modules/hyperframes/bin/hyperframes.mjs

for i in 01 02 03 04 05 06 07 08 09 10; do
  echo "$(date) === Rendering scene $i ==="
  mkdir -p renders/_tmp_$i
  cp scenes/scene_$i.html renders/_tmp_$i/index.html
  # Copy video clip if it exists (Veo), else image
  if [ -f "scenes/scene_$i.mp4" ]; then
    cp scenes/scene_$i.mp4 renders/_tmp_$i/
    echo "  Using Veo video: scene_$i.mp4"
  elif [ -f "scenes/scene_$i.png" ]; then
    cp scenes/scene_$i.png renders/_tmp_$i/
  fi
  echo "{\"name\":\"scene_$i\"}" > renders/_tmp_$i/hyperframes.json
  cd renders/_tmp_$i
  node $HF render 2>&1 | tail -3
  cd /data/data/com.termux/files/home/ai-lab-internal/hf_episodes/ep01_motion_first
  mv renders/_tmp_$i/renders/_tmp_$i_*.mp4 renders/scene_$i.mp4 2>/dev/null
  rm -rf renders/_tmp_$i
  echo "$(date) ✅ scene_$i.mp4 done"
done

echo "$(date) === All scenes rendered ==="
ls -la renders/scene_*.mp4
