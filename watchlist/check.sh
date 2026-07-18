#!/data/data/com.termux/files/usr/bin/bash
WATCHDIR=~/ai-lab-internal/watchlist
SNAPSHOTS=$WATCHDIR/snapshots
mkdir -p $SNAPSHOTS

while IFS='|' read -r name url; do
  [ -z "$name" ] && continue
  safe_name=$(echo "$name" | tr -d ' ')
  new_file="$SNAPSHOTS/$safe_name.new"
  old_file="$SNAPSHOTS/$safe_name.old"

  curl -s -A "Mozilla/5.0" "$url" -o "$new_file"

  if [ -f "$old_file" ]; then
    if ! diff -q "$old_file" "$new_file" > /dev/null 2>&1; then
      echo "CHANGED: $name ($url)"
    fi
  else
    echo "FIRST CHECK: $name ($url) - baseline saved, no comparison yet"
  fi

  cp "$new_file" "$old_file"
done < "$WATCHDIR/sources.txt"
