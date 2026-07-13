import sys
import os
import json
import urllib.request

def call_llm(prompt):
    key = os.environ.get("OPENROUTER_API_KEY")
    if key:
        try:
            payload = {
                "model": "openrouter/free",
                "messages": [{"role": "user", "content": prompt}]
            }
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
            payload = {
                "model": "openai/gpt-4o",
                "messages": [{"role": "user", "content": prompt}]
            }
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

def vet_candidate(candidate):
    name = candidate["candidate"]
    ctype = candidate.get("type", "tool")
    categories = candidate.get("categories", [])
    cat_text = ", ".join(categories) if categories else "n/a"
    example_titles = candidate.get("example_titles", [])
    titles_text = "\n".join("- " + t for t in example_titles)

    if ctype == "loophole":
        prompt = (
            "You are a skeptical, truth-first reviewer vetting a claimed LOOPHOLE or "
            "method that gives viewers free or upgraded access to a PREMIUM AI product "
            "(e.g. ChatGPT, Midjourney, Runway, Sora, Claude, paid image/video generators).\n\n"
            "Claimed loophole / advantage: " + name + "\n"
            "Category context: " + cat_text + "\n\n"
            "Where it surfaced:\n" + titles_text + "\n\n"
            "Answer DIRECTLY and HONESTLY, based on what you actually know (never invent "
            "or guess mechanics you can't verify):\n\n"
            "1. DOES THIS METHOD ACTUALLY WORK as described? (yes / no / uncertain, with reasoning)\n"
            "2. WHAT EXACTLY does the viewer get for free or cheaper, and for how long "
            "(permanent, trial, or patched already)?\n"
            "3. RISK: Does using it violate the service's Terms of Service, risk account "
            "bans, or expose the viewer to scams/malware? Be explicit about ethics + safety.\n"
            "4. IS IT STILL LIVE, or has the provider already closed it?\n"
            "5. VERDICT: Is this a genuinely useful, safe advantage worth a viewer's "
            "time? (WORTH COVERING / NOT WORTH COVERING / NEEDS MORE RESEARCH -- one sentence why)\n\n"
            "Prioritize viewer safety and honesty. If it's a ban risk or likely a scam, "
            "say NOT WORTH COVERING and explain why."
        )
    else:
        prompt = (
            "You are a skeptical, truth-first tech reviewer vetting whether an AI tool is "
            "genuinely worth covering in a YouTube video, or just hype/vaporware/marketing noise.\n\n"
            "Candidate tool name: " + name + "\n"
            "Track: NEW AI TOOL  |  Category: " + cat_text + "\n\n"
            "Context it was mentioned in:\n" + titles_text + "\n\n"
            "Answer these questions directly and honestly, based on what you actually know "
            "about this tool (if you're not certain it exists or don't have reliable "
            "information, say so clearly -- do not guess or invent details):\n\n"
            "1. DOES THIS TOOL ACTUALLY EXIST AND FUNCTION? (yes/no/uncertain, with reasoning)\n"
            "2. ACCESS REALITY: Is it genuinely free/available as claimed, or is there a "
            "catch (waitlist, region lock, paywall after trial, requires expensive hardware)?\n"
            "3. IS THIS GENUINELY NEW, or a reskin/wrapper of an existing tool "
            "(e.g. just a ChatGPT wrapper, a Stable Diffusion frontend, etc)?\n"
            "4. RED FLAGS: Any signs of scam patterns, exaggerated claims, or "
            "'too good to be true' framing common in AI hype content?\n"
            "5. VERDICT: Is this genuinely worth a viewer's time? (WORTH COVERING / "
            "NOT WORTH COVERING / NEEDS MORE RESEARCH -- with one sentence why)\n\n"
            "Be honest and skeptical. It is better to say 'uncertain' or 'not worth it' "
            "than to inflate something that doesn't deserve coverage."
        )

    result = call_llm(prompt)
    return result

def main():
    input_path = sys.argv[1] if len(sys.argv) > 1 else "out/tool_opportunities.json"
    top_n = int(sys.argv[2]) if len(sys.argv) > 2 else 5

    if not os.path.exists(input_path):
        print("No tool_opportunities.json found. Run tool_hunter.py first.")
        sys.exit(1)

    with open(input_path) as f:
        candidates = json.load(f)

    top_candidates = candidates[:top_n]
    vetted = []

    for i, c in enumerate(top_candidates, 1):
        print("\n[" + str(i) + "/" + str(len(top_candidates)) + "] Vetting: " + c["candidate"])
        verdict = vet_candidate(c)
        if verdict:
            print(verdict[:300])
        else:
            print("  [vetting failed -- no LLM response]")

        vetted.append({
            "candidate": c["candidate"],
            "type": c.get("type", "tool"),
            "categories": c.get("categories", []),
            "opportunity_score": c.get("opportunity_score"),
            "vetting_report": verdict or "[vetting failed]"
        })

    output_path = "out/vetted_tools.json"
    with open(output_path, "w") as f:
        json.dump(vetted, f, indent=2)

    print("\nSaved vetted reports to " + output_path)
    print("\nReview these BEFORE deciding what to make a video about --")
    print("opportunity score tells you what's undiscussed, this tells you if it's REAL.")

if __name__ == "__main__":
    main()
