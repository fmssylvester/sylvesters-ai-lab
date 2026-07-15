#!/bin/bash
# Content Creation Brain Engine — full pipeline
# Usage: ./research_and_plan.sh "niche description" channel1_url channel2_url [channel3_url ...]

if [ "$#" -lt 3 ]; then
    echo "Usage: ./research_and_plan.sh \"niche description\" <channel_url_1> <channel_url_2> [more channel urls...]"
    exit 1
fi

NICHE="$1"
shift
CHANNELS=("$@")

mkdir -p out

echo "=== STEP 1: Writing channel list ==="
> out/channels.txt
for ch in "${CHANNELS[@]}"; do
    echo "$ch" >> out/channels.txt
done
cat out/channels.txt

echo ""
echo "=== STEP 2: Collecting individual channel data ==="
i=1
for ch in "${CHANNELS[@]}"; do
    echo ""
    echo "--- Channel $i: $ch ---"
    python3 scripts/channel_collector.py "$ch" 15 "out/channel_${i}.json"
    i=$((i+1))
done

echo ""
echo "=== STEP 3: Analyzing cross-channel trends ==="
python3 scripts/trend_analyzer.py out/channels.txt 15 out/trends.json

echo ""
echo "=== STEP 4: Synthesizing production guideline ==="
python3 scripts/blueprint_synthesizer.py "$NICHE"

echo ""
echo "=== DONE ==="
echo "Trend report: out/trends.json"
echo "Production guideline: out/guideline.md"
