#!/data/data/com.termux/files/usr/bin/bash
# verify-asset.sh <image-file>
# Empirically-tuned guard. Rejects blank/near-empty images before they enter a scene.
# Metrics (normalized 0..1, via ImageMagick):
#   stddev < 0.02            -> BLANK  (solid colour, dead capture)
#   stddev < 0.06 OR         -> SUSPECT near-empty (e.g. cookie wall / unpainted SPA)
#     mean > 0.97 or < 0.03
#   otherwise                -> PASS
# Reference numbers: blank=0.00  perplexity(near-empty)=0.08/mean0.99
#                    real footage=0.24  openai=0.32  huggingface=0.40
set -euo pipefail

f="${1:-}"
[ -z "$f" ] && { echo "usage: verify-asset.sh <image>"; exit 2; }
[ -f "$f" ] || { echo "FAIL  missing file: $f"; exit 1; }

stats="$(identify -format "%wx%h %[fx:mean] %[fx:standard_deviation]" "$f" 2>/dev/null)" || {
  echo "FAIL  not a decodable image: $f"; exit 1; }
read -r dims mean stddev <<< "$stats"

verdict="PASS"; code=0
awk_lt() { awk -v a="$1" -v b="$2" 'BEGIN{exit !(a<b)}'; }
awk_gt() { awk -v a="$1" -v b="$2" 'BEGIN{exit !(a>b)}'; }

if awk_lt "$stddev" 0.02; then
  verdict="BLANK"; code=1
elif awk_lt "$stddev" 0.06 || awk_gt "$mean" 0.97 || awk_lt "$mean" 0.03; then
  verdict="SUSPECT"; code=1
fi

printf "%-8s %s  mean=%.3f stddev=%.3f  %s\n" "$verdict" "$dims" "$mean" "$stddev" "$f"
exit $code
