#!/data/data/com.termux/files/usr/bin/bash
set -uo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$ROOT" || exit 1

if [ -x "$ROOT/.venv/bin/python" ]; then
  PYTHON="$ROOT/.venv/bin/python"
else
  PYTHON="python3"
fi

mkdir -p out

if [ -f .env ]; then
  set -a
  . ./.env || true
  set +a
fi

MODE="manual"
NICHE_HINT=""
TOP_N=5
DEPTH=50
START_STAGE=""
URLS=()

usage() {
  cat <<'EOF'
run_full_engine.sh — Content Creation Brain Engine orchestrator

USAGE
  Auto-discovery:
    ./run_full_engine.sh --discover "niche term" [top_n] [search_depth]

  Manual channel list:
    ./run_full_engine.sh "niche description" channel_url_1 channel_url_2 ...

  Resume from a stage:
    ./run_full_engine.sh --from <stage> ...   (stages below)

STAGES (in order)
  discover   niche_discovery.py -> out/channels.txt
  collect    channel_collector.py per channel -> out/channel_N.json
  trends     trend_analyzer.py -> out/trends.json
  thumbnails thumbnail_analyzer.py -> out/thumbnail_analysis.json
  tools      tool_hunter.py + tool_vetter.py -> out/vetted_tools.json
  history    trend_history.py snapshot -> out/history/
  blueprint  blueprint_synthesizer.py -> out/guideline.md
  hooks      hook_generator.py (grounded in real titles) -> out/hooks.md
  repurpose  repurposing_planner.py -> out/repurposing.md

NOTE
  tool_hunter.py spots two tracks: NEW AI TOOLS (video/image gen, agents,
  vibe coding, automation) and PREMIUM LOOPHOLES (free/upgraded access to
  paid AI). tool_vetter.py truth-first fact-checks each before coverage.
EOF
}

while [ $# -gt 0 ]; do
  case "$1" in
    --discover)
      MODE="discover"
      NICHE_HINT="${2:-}"
      shift 2
      if [[ "${1:-}" =~ ^[0-9]+$ ]]; then TOP_N="$1"; shift; fi
      if [[ "${1:-}" =~ ^[0-9]+$ ]]; then DEPTH="$1"; shift; fi
      ;;
    --from)
      START_STAGE="${2:-}"
      shift 2
      ;;
    --help|-h)
      usage
      exit 0
      ;;
    --)
      shift
      break
      ;;
    *)
      if [ -z "$NICHE_HINT" ]; then
        NICHE_HINT="$1"
      else
        URLS+=("$1")
      fi
      shift
      ;;
  esac
done

collect_will_run=0
for i in "${!STAGES[@]}"; do
  [ "${STAGES[$i]}" = "collect" ] && [ "$i" -ge "$start_idx" ] && collect_will_run=1
done
if [ "$MODE" = "discover" ]; then
  STAGES=(discover collect trends thumbnails tools history blueprint hooks repurpose)
else
  STAGES=(collect trends thumbnails tools history blueprint hooks repurpose)
fi

start_idx=0
if [ -n "$START_STAGE" ]; then
  for i in "${!STAGES[@]}"; do
    [ "${STAGES[$i]}" = "$START_STAGE" ] && start_idx=$i
  done
fi

if [ "$MODE" = "manual" ] && [ "$collect_will_run" -eq 1 ] && [ ${#URLS[@]} -eq 0 ] && [ ! -f out/channels.txt ]; then
  echo "ERROR: manual mode needs at least one channel URL (or an existing out/channels.txt)." >&2
  echo "Run with --help for usage." >&2
  exit 1
fi

stage_discover() {
  echo "==> [discover] searching niche: \"$NICHE_HINT\" (top_n=$TOP_N, depth=$DEPTH)"
  "$PYTHON" scripts/niche_discovery.py "$NICHE_HINT" "$TOP_N" "$DEPTH" \
    || echo "  [WARN] niche_discovery.py failed; out/channels.txt may be missing"
}

stage_collect() {
  if [ ${#URLS[@]} -eq 0 ] && [ -f out/channels.txt ]; then
    mapfile -t URLS < out/channels.txt
  fi
  if [ ${#URLS[@]} -eq 0 ]; then
    echo "  [WARN] no channel URLs available; skipping collect"
    return
  fi
  echo "==> [collect] fetching channel data for ${#URLS[@]} channel(s)"
  local i=1
  for url in "${URLS[@]}"; do
    local outf="out/channel_${i}.json"
    if [ -s "$outf" ]; then
      echo "  [skip] $outf already exists"
    else
      echo "  collecting $url -> $outf"
      "$PYTHON" scripts/channel_collector.py "$url" 30 "$outf" \
        || echo "  [WARN] channel_collector.py failed for $url"
    fi
    i=$((i + 1))
  done
}

stage_trends() {
  if [ ! -f out/channels.txt ]; then
    echo "  [WARN] out/channels.txt missing; skipping trends"
    return
  fi
  echo "==> [trends] analyzing cross-channel trends -> out/trends.json"
  "$PYTHON" scripts/trend_analyzer.py out/channels.txt 15 out/trends.json \
    || echo "  [WARN] trend_analyzer.py failed"
}

stage_thumbnails() {
  echo "==> [thumbnails] analyzing top thumbnails -> out/thumbnail_analysis.json"
  "$PYTHON" scripts/thumbnail_analyzer.py 6 \
    || echo "  [WARN] thumbnail_analyzer.py failed (vision backends unreachable?)"
}

stage_tools() {
  if [ ! -f scripts/tool_hunter.py ]; then
    echo "==> [tools] SKIPPED — scripts/tool_hunter.py is MISSING"
    echo "    This stage (tool_hunter -> tool_opportunities.json -> tool_vetter -> vetted_tools.json)"
    echo "    cannot run. blueprint_synthesizer.py will note 'no vetted tools provided'."
    echo "    To enable, recreate scripts/tool_hunter.py (HN + Reddit scraper)."
    return
  fi
  echo "==> [tools] hunting tool opportunities -> out/tool_opportunities.json"
  "$PYTHON" scripts/tool_hunter.py \
    || echo "  [WARN] tool_hunter.py failed"
  if [ -f out/tool_opportunities.json ]; then
    echo "==> [tools] vetting candidates -> out/vetted_tools.json"
    "$PYTHON" scripts/tool_vetter.py out/tool_opportunities.json 5 \
      || echo "  [WARN] tool_vetter.py failed"
  else
    echo "  [WARN] no tool_opportunities.json; skipping vetting"
  fi
}

stage_history() {
  echo "==> [history] snapshotting trends -> out/history/"
  "$PYTHON" scripts/trend_history.py snapshot \
    || echo "  [WARN] trend_history.py snapshot failed"
}

stage_blueprint() {
  echo "==> [blueprint] synthesizing guideline -> out/guideline.md"
  "$PYTHON" scripts/blueprint_synthesizer.py "$NICHE_HINT" \
    || { echo "  [ERROR] blueprint_synthesizer.py failed"; exit 1; }
}

stage_hooks() {
  echo "==> [hooks] generating hooks from REAL collected titles -> out/hooks.md"
  "$PYTHON" scripts/hook_generator.py "$NICHE_HINT" out/hooks.md \
    || echo "  [WARN] hook_generator.py failed (need out/channel_*.json)"
}

stage_repurpose() {
  echo "==> [repurpose] expanding guideline -> out/repurposing.md"
  "$PYTHON" scripts/repurposing_planner.py out/guideline.md out/repurposing.md \
    || echo "  [WARN] repurposing_planner.py failed (need out/guideline.md)"
}

echo "Brain Engine — mode=$MODE niche=\"$NICHE_HINT\" python=$PYTHON"
for i in "${!STAGES[@]}"; do
  [ "$i" -lt "$start_idx" ] && continue
  "stage_${STAGES[$i]}"
done

echo ""
echo "===== PIPELINE COMPLETE ====="
echo "Outputs:"
for f in out/channel_*.json out/trends.json out/thumbnail_analysis.json out/vetted_tools.json out/guideline.md out/hooks.md out/repurposing.md; do
  if [ -s "$f" ]; then echo "  [ok]   $f ($(wc -c < "$f") bytes)"; fi
done
if [ -d out/history ]; then echo "  [ok]   out/history/ ($(ls out/history | wc -l) snapshots)"; fi
echo ""
echo "Next: open out/guideline.md, or run a specific script directly."
