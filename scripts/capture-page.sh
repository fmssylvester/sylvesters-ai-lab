#!/data/data/com.termux/files/usr/bin/bash
# capture-page.sh <url> <out.png> [full]
# Captures a real rendered web page via the microlink API (reliable on Termux,
# unlike local headless Chromium), then gates it through verify-asset.sh.
# A capture is only kept if it PASSES the blank/near-empty guard.
set -euo pipefail
here="$(cd "$(dirname "$0")" && pwd)"

url="${1:-}"; out="${2:-}"; mode="${3:-viewport}"
[ -z "$url" ] || [ -z "$out" ] && { echo "usage: capture-page.sh <url> <out.png> [full]"; exit 2; }

full="false"; [ "$mode" = "full" ] && full="true"
api="https://api.microlink.io/?url=${url}&screenshot=true&meta=false&fullPage=${full}&embed=screenshot.url"

tmp="$(mktemp --suffix=.png)"
echo "-> fetching $url"
curl -s --max-time 60 -L "$api" -o "$tmp" || { echo "FAIL  network error: $url"; rm -f "$tmp"; exit 1; }

if "$here/verify-asset.sh" "$tmp"; then
  mkdir -p "$(dirname "$out")"; mv "$tmp" "$out"
  echo "KEPT  $out"
else
  echo "REJECT $url (did not pass guard; not saved)"; rm -f "$tmp"; exit 1
fi
