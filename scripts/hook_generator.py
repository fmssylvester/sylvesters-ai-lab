#!/usr/bin/env python3
"""hook_generator.py — write video HOOKS extracted from REAL collected channel titles.

CORE RULE (user-enforced): hooks must be grounded in the actual titles we collected
(channel_*.json), NEVER invented from the LLM's general knowledge. We feed the real
high-velocity titles to the model, ask it to surface the hook STRUCTURES those real
titles use, then generate original hooks that mirror those proven structures.

Fails loudly if no real channel data exists (run channel_collector.py first).
"""
import sys
import os
import json
import glob
import urllib.request


def load_real_titles(out_dir="out", top_n=25):
    files = glob.glob(os.path.join(out_dir, "channel_*.json"))
    if not files:
        return []
    videos = []
    for cf in files:
        try:
            with open(cf) as f:
                data = json.load(f)
            if isinstance(data, list):
                videos.extend(v for v in data if isinstance(v, dict))
        except Exception:
            continue
    videos = [v for v in videos if v.get("title")]
    videos.sort(key=lambda v: v.get("velocity") if v.get("velocity") is not None else -1, reverse=True)
    return [v["title"] for v in videos[:top_n]]


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
                return json.loads(resp.read())["choices"][0]["message"]["content"]
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
                return json.loads(resp.read())["choices"][0]["message"]["content"]
        except Exception as e:
            print("  [github failed: " + str(e) + "]")
    return None


def main():
    niche_hint = sys.argv[1] if len(sys.argv) > 1 else ""
    out_path = sys.argv[2] if len(sys.argv) > 2 else "out/hooks.md"

    print("Loading REAL collected channel titles...")
    titles = load_real_titles()
    if not titles:
        print("FATAL: no real channel data found in out/channel_*.json.")
        print("Run channel_collector.py (or the full engine) BEFORE generating hooks.")
        print("Generating hooks from general knowledge is explicitly forbidden.")
        sys.exit(1)
    print("  Loaded %d real titles (top by views/day)." % len(titles))

    titles_block = "\n".join("- " + t for t in titles)
    niche_line = ('Our video is about: "%s"\n\n' % niche_hint) if niche_hint else ""

    prompt = (
        "You are a YouTube script hook writer for a credibility-first AI channel. "
        "You must ground every hook in the STRUCTURES of REAL high-performing titles "
        "we actually collected -- not invented from general knowledge.\n\n"
        + niche_line +
        "REAL COLLECTED TITLES (top performers by views/day):\n" + titles_block + "\n\n"
        "STEP 1 — Extract the 4-5 recurring HOOK STRUCTURES these real titles use "
        "(e.g. 'Stop doing X', 'The truth about Y', 'Nobody tells you Z', curiosity "
        "gap, contrarian claim, numbered list, 'X but Y'). Quote the real title that "
        "exemplifies each structure.\n\n"
        "STEP 2 — Write 8 ORIGINAL hooks for OUR video that each MIRROR one of those "
        "proven structures. For each hook, tag it with the real title structure it "
        "mirrors, e.g. '[mirrors: \"Stop Doing X\"]'. Keep each hook to ONE sentence, "
        "under 18 words, no clickbait that breaks the promise. Honest but compelling.\n\n"
        "Output format:\n"
        "## Observed Hook Structures\n"
        "- structure name — example real title\n\n"
        "## Generated Hooks (grounded in the above)\n"
        "1. hook text  [mirrors: structure]\n"
        "...\n\n"
        "Do NOT invent topics. Only reuse the proven hook mechanics from the real titles."
    )

    print("Generating hooks grounded in real titles...")
    result = call_llm(prompt)
    if not result:
        print("FATAL: all LLM backends failed.")
        sys.exit(1)

    with open(out_path, "w") as f:
        f.write(result)
    print("Saved hooks to " + out_path + "\n")
    print(result)


if __name__ == "__main__":
    main()
