#!/usr/bin/env python3
"""repurposing_planner.py — repurpose ONE guideline into multi-format content.

Reads the production guideline (out/guideline.md) and expands it into:
  - 5 YouTube Shorts ideas (hook + visual + why it works)
  - 3 community-post ideas (poll / tip / discussion)
  - 3 long-thread / X ideas (narrative arc)
  - 2 email/newsletter blurbs

Fails loudly if out/guideline.md does not exist (run blueprint_synthesizer.py first).
"""
import sys
import os
import json
import urllib.request


def load_guideline(path="out/guideline.md"):
    if not os.path.exists(path):
        return None
    with open(path) as f:
        return f.read()


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
    guideline_path = sys.argv[1] if len(sys.argv) > 1 else "out/guideline.md"
    out_path = sys.argv[2] if len(sys.argv) > 2 else "out/repurposing.md"

    print("Loading guideline from " + guideline_path + "...")
    guideline = load_guideline(guideline_path)
    if not guideline:
        print("FATAL: " + guideline_path + " not found.")
        print("Run blueprint_synthesizer.py (or the full engine) BEFORE repurposing.")
        sys.exit(1)
    print("  Loaded %d characters." % len(guideline))

    prompt = (
        "You are a multi-format content strategist for a credibility-first AI channel. "
        "Below is a finished video production guideline. Repurpose it into OTHER formats "
        "so one research effort fuels a week of content. Stay honest -- no hype, no "
        "claims the guideline doesn't support.\n\n"
        "=== GUIDELINE ===\n" + guideline + "\n=== END GUIDELINE ===\n\n"
        "Produce:\n\n"
        "## YouTube Shorts (5)\n"
        "For each: a 1-sentence hook, the visual (reference the guideline's visual direction), "
        "and why it works. Keep under 40s each.\n\n"
        "## Community Posts (3)\n"
        "Polls, quick tips, or discussion prompts that drive comments. Tie each to a "
        "specific point in the guideline.\n\n"
        "## Threads / X Posts (3)\n"
        "A narrative arc (hook tweet + 4-6 supporting tweets) summarizing the video's "
        "core argument. Numbered 1/ N.\n\n"
        "## Newsletter Blurbs (2)\n"
        "Short emails linking back to the video,Lead with the credibility angle.\n\n"
        "Be specific and reference actual elements from the guideline above."
    )

    print("Generating repurposing plan...")
    result = call_llm(prompt)
    if not result:
        print("FATAL: all LLM backends failed.")
        sys.exit(1)

    with open(out_path, "w") as f:
        f.write(result)
    print("Saved repurposing plan to " + out_path + "\n")
    print(result)


if __name__ == "__main__":
    main()
