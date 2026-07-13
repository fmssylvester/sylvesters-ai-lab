import sys
import os
import json
import glob
import urllib.request

def load_all_data(out_dir="out"):
    trends = []
    trends_path = os.path.join(out_dir, "trends.json")
    if os.path.exists(trends_path):
        with open(trends_path) as f:
            trends = json.load(f)

    channel_files = glob.glob(os.path.join(out_dir, "channel_*.json"))
    all_videos = []
    for cf in channel_files:
        try:
            with open(cf) as f:
                data = json.load(f)
                if isinstance(data, list):
                    all_videos.extend(data)
        except Exception:
            continue

    thumbnail_insights = []
    thumb_path = os.path.join(out_dir, "thumbnail_analysis.json")
    if os.path.exists(thumb_path):
        with open(thumb_path) as f:
            thumbnail_insights = json.load(f)

    vetted_tools = []
    vetted_path = os.path.join(out_dir, "vetted_tools.json")
    if os.path.exists(vetted_path):
        with open(vetted_path) as f:
            vetted_tools = json.load(f)

    return trends, all_videos, thumbnail_insights, vetted_tools

def build_prompt(trends, all_videos, thumbnail_insights, vetted_tools, niche_hint=""):
    top_videos = sorted(
        [v for v in all_videos if v.get("velocity") is not None],
        key=lambda v: v["velocity"], reverse=True
    )[:12]

    top_trends = trends[:8]

    video_lines = "\n".join(
        "- \"" + v['title'] + "\" (" + str(v['velocity']) + " views/day, " + str(v.get('duration','?')) + "s duration)"
        for v in top_videos
    )
    trend_lines = "\n".join(
        "- \"" + t['phrase'] + "\" -- spiking across " + str(t['channel_count']) + " channels, avg " + str(t['avg_velocity']) + " views/day"
        for t in top_trends
    )

    thumb_lines = ""
    if thumbnail_insights:
        thumb_lines = "\n\nREAL THUMBNAIL ANALYSIS (from actual top-performing thumbnails, not guessed):\n"
        for t in thumbnail_insights[:6]:
            thumb_lines += "- \"" + t['title'][:60] + "\" (" + str(t['velocity']) + " v/day): " + t['analysis'][:200] + "\n"

    tool_lines = ""
    worth_covering = [t for t in vetted_tools if t.get("vetting_report") and "WORTH COVERING" in t["vetting_report"].upper() and "NOT WORTH" not in t["vetting_report"].upper()]
    if worth_covering:
        tool_lines = "\n\nVETTED, GENUINE TOOL OPPORTUNITIES (fact-checked, not just buzz):\n"
        for t in worth_covering[:3]:
            tool_lines += "- " + t['candidate'] + ": " + t['vetting_report'][:250] + "\n"

    niche_line = ""
    if niche_hint:
        niche_line = "NICHE FOCUS: " + niche_hint

    prompt = (
        "You are a YouTube content strategist building a brand on TRUTH and credibility, "
        "not hype. Based on real performance data, real thumbnail analysis, and "
        "fact-checked tool vetting below, synthesize the BEST cross-channel patterns "
        "into ONE original, honest video production guideline. Do not clone any single "
        "video. Do not recommend covering anything that wasn't verified as genuinely "
        "worth covering.\n\n"
        "TOP PERFORMING VIDEOS (by views/day since upload):\n"
        + video_lines + "\n\n"
        "CROSS-CHANNEL TRENDING TOPICS:\n"
        + trend_lines
        + thumb_lines
        + tool_lines + "\n\n"
        + niche_line + "\n\n"
        "Produce a structured production guideline with these exact sections:\n\n"
        "## Title Options\n"
        "3 original, honest title options (no exaggerated claims).\n\n"
        "## Hook (First 15 Seconds)\n"
        "Structural approach for the opening hook.\n\n"
        "## Video Structure and Pacing\n"
        "Section-by-section structure and approximate timing.\n\n"
        "## Visual and Thumbnail Direction\n"
        "Base this on the REAL thumbnail analysis provided above if present -- describe "
        "actual observed patterns, not generic guesses.\n\n"
        "## Recommended Tool Focus\n"
        "If vetted tool opportunities were provided above, recommend which one (if any) "
        "is genuinely worth building this video around, and why. If none were provided "
        "or none are genuinely worth it, say so honestly.\n\n"
        "## Why This Will Work\n"
        "2-3 sentences connecting this guideline back to the specific data points above.\n\n"
        "Keep it concrete, honest, and actionable."
    )
    return prompt

def call_llm(prompt):
    key = os.environ.get("OPENROUTER_API_KEY")
    if key:
        try:
            payload = {"model": "openrouter/free", "messages": [{"role": "user", "content": prompt}]}
            req = urllib.request.Request(
                "https://openrouter.ai/api/v1/chat/completions",
                data=json.dumps(payload).encode(),
                headers={"Content-Type": "application/json", "Authorization": "Bearer " + key}
            )
            with urllib.request.urlopen(req, timeout=60) as resp:
                data = json.loads(resp.read())
            return data["choices"][0]["message"]["content"]
        except Exception as e:
            print("  [openrouter failed: " + str(e) + "]")

    gh_key = os.environ.get("GITHUB_MODELS_TOKEN")
    if gh_key:
        try:
            payload = {"model": "openai/gpt-4o", "messages": [{"role": "user", "content": prompt}]}
            req = urllib.request.Request(
                "https://models.github.ai/inference/chat/completions",
                data=json.dumps(payload).encode(),
                headers={"Content-Type": "application/json", "Authorization": "Bearer " + gh_key}
            )
            with urllib.request.urlopen(req, timeout=60) as resp:
                data = json.loads(resp.read())
            return data["choices"][0]["message"]["content"]
        except Exception as e:
            print("  [github failed: " + str(e) + "]")

    return None

def main():
    niche_hint = sys.argv[1] if len(sys.argv) > 1 else ""
    out_dir = "out"

    print("Loading collected data (trends, channels, thumbnails, vetted tools)...")
    trends, all_videos, thumbnail_insights, vetted_tools = load_all_data(out_dir)

    if not trends and not all_videos:
        print("No data found. Run channel_collector.py and trend_analyzer.py first.")
        sys.exit(1)

    print("Loaded " + str(len(trends)) + " trends, " + str(len(all_videos)) + " videos, " +
          str(len(thumbnail_insights)) + " thumbnail analyses, " + str(len(vetted_tools)) + " vetted tools.")

    prompt = build_prompt(trends, all_videos, thumbnail_insights, vetted_tools, niche_hint)

    print("Synthesizing production guideline...")
    result = call_llm(prompt)

    if not result:
        print("All LLM backends failed.")
        sys.exit(1)

    output_path = os.path.join(out_dir, "guideline.md")
    with open(output_path, "w") as f:
        f.write(result)

    print("\nSaved guideline to " + output_path + "\n")
    print(result)

if __name__ == "__main__":
    main()
