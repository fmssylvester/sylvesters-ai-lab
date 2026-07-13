#!/usr/bin/env python3
"""tool_hunter.py — spot UNDER-THE-RADAR AI opportunities from HN + Reddit (no auth).

Two mission tracks, both scored by BUZZ minus YOUTUBE COVERAGE (low coverage =
white space = opportunity):

  1. NEW AI TOOLS  (type="tool")   — video generation, image generation, AI agents,
                                    vibe coding / AI app builders, AI automation.
  2. PREMIUM LOOPHOLES (type="loophole") — real methods/advantages that get viewers
                                    free or upgraded access to paid AI sites
                                    (ChatGPT, Midjourney, Runway, etc.).

Output: out/tool_opportunities.json  — list of candidates with type + category.
Consumed by tool_vetter.py, which truth-first fact-checks each one.
"""
import sys
import os
import re
import json
import glob
import urllib.request
import urllib.parse

HN_LIMIT = 50
REDDIT_LIMIT = 100

TOOL_QUERIES = [
    ("AI video", "video-gen"),
    ("video generation", "video-gen"),
    ("text to video", "video-gen"),
    ("image generation", "image-gen"),
    ("AI image", "image-gen"),
    ("diffusion model", "image-gen"),
    ("AI agent", "agent"),
    ("agent framework", "agent"),
    ("MCP server", "agent"),
    ("vibe coding", "vibe-coding"),
    ("AI coding", "vibe-coding"),
    ("AI app builder", "vibe-coding"),
    ("AI automation", "automation"),
    ("n8n AI", "automation"),
]

LOOPHOLE_QUERIES = [
    ("free AI", "premium-loophole"),
    ("ChatGPT free", "premium-loophole"),
    ("Midjourney free", "premium-loophole"),
    ("AI free tier", "premium-loophole"),
    ("premium AI free", "premium-loophole"),
    ("Runway free", "premium-loophole"),
    ("AI loophole", "premium-loophole"),
    ("free unlimited AI", "premium-loophole"),
]

REDDIT_SUBS = ["artificial", "MachineLearning", "SideProject", "vibecoding", "aiagents"]

NAME_STOP = {
    "ai", "the", "new", "open", "free", "how", "why", "show", "hn", "i", "you", "my",
    "we", "this", "that", "with", "and", "for", "build", "built", "building", "just",
    "launched", "launch", "release", "released", "tool", "tools", "app", "use", "using",
    "github", "google", "meta", "openai", "anthropic", "microsoft", "apple", "x", "twitter",
    "reddit", "hacker", "news", "update", "updates", "vs", "now", "get", "made", "make",
    "source", "ask", "llm", "your", "generative", "website", "powered", "com", "org",
    "net", "io", "dev", "co", "its", "our", "their", "what", "when", "who",
    "about", "from", "into", "than", "then", "them", "they", "has", "had", "will",
    "would", "could", "should", "here", "there", "another", "one", "two", "first",
    "best", "top", "real", "video", "videos", "image", "images", "model", "models",
    "code", "data", "api", "web", "app", "chrome", "linux", "windows", "macos",
}

BRAND_BLOCK = {
    "youtube", "chatgpt", "gpt3", "gpt4", "gpt5", "claude", "gemini", "llama",
    "copilot", "javascript", "python", "pytorch", "tensorflow", "datadog",
    "openai", "anthropic", "google", "meta", "amazon", "microsoft", "apple",
    "github", "huggingface", "notion", "figma", "twitter", "x", "reddit",
    "stability", "midjourney", "runway", "bing", "edge", "chrome", "cursor",
}

DEV_NOISE = {
    "typescript", "javascript", "python", "rust", "golang", "kotlin", "swift",
    "java", "node", "nodejs", "docker", "kubernetes", "linux", "windows",
    "macos", "react", "vue", "angular", "sql", "html", "css", "bash", "csharp",
}

HOST_STOP = {
    "com", "org", "net", "io", "ai", "dev", "app", "co", "github", "twitter", "x",
    "ycombinator", "youtu", "youtube", "reddit", "old", "www", "medium", "blog",
    "linkedin", "facebook", "instagram", "substack", "wordpress", "notion", "figma",
    "goog", "google", "gitlab", "bitbucket", "replit", "huggingface", "producthunt",
    "arxiv", "wikipedia", "techcrunch", "theverge", "wired", "nytimes", "githubio",
}

UA = {"User-Agent": "Mozilla/5.0 (compatible; brain-engine/1.0)"}


def http_get_json(url, timeout=30):
    req = urllib.request.Request(url, headers=UA)
    with urllib.request.urlopen(req, timeout=timeout) as resp:
        return json.loads(resp.read().decode("utf-8", "replace"))


def candidate_from_url(url):
    if not url:
        return None
    try:
        p = urllib.parse.urlparse(url)
        net = p.netloc.lower()
        if net.startswith("www."):
            net = net[4:]
        if "github.com" in net or "gitlab.com" in net:
            parts = [x for x in p.path.split("/") if x]
            if len(parts) >= 2:
                return parts[1]
            return None
        if "youtu" in net or "reddit" in net or "twitter" in net or "x.com" in net:
            return None
        sld = net.split(".")[0]
        if sld and sld not in HOST_STOP and len(sld) >= 3:
            return sld
    except Exception:
        return None
    return None


def extract_names(title):
    names = set()
    for m in re.findall(r'"([^"]{2,30})"', title):
        names.add(m.strip())
    for m in re.findall(r"'([^']{2,30})'", title):
        names.add(m.strip())
    for m in re.findall(r"\b([A-Z][a-z0-9]+[A-Z][a-zA-Z0-9]+)\b", title):
        if m.lower() not in NAME_STOP:
            names.add(m)
    for m in re.findall(r"\b([A-Za-z]*\d[A-Za-z]*)\b", title):
        if len(m) >= 3 and m.lower() not in NAME_STOP:
            names.add(m)
    return names


def fetch_hn_query(query, tag, qtype, category):
    items = []
    try:
        if tag:
            url = ("https://hn.algolia.com/api/v1/search?query=%s&tags=%s&hitsPerPage=%d"
                   % (urllib.parse.quote(query), tag, HN_LIMIT))
        else:
            url = ("https://hn.algolia.com/api/v1/search?query=%s&hitsPerPage=%d"
                   % (urllib.parse.quote(query), HN_LIMIT))
        data = http_get_json(url)
        for h in data.get("hits", []):
            t = h.get("title") or ""
            u = h.get("url") or ""
            if t:
                items.append({"title": t, "url": u, "type": qtype,
                              "category": category, "show": tag == "show_hn",
                              "src": "hn"})
    except Exception as e:
        print("  [WARN] HN '%s' failed: %s" % (query, e))
    return items


def fetch_reddit():
    items = []
    seen = set()
    for sub in REDDIT_SUBS:
        try:
            url = "https://old.reddit.com/r/%s/hot.json?limit=%d" % (sub, REDDIT_LIMIT)
            data = http_get_json(url)
            for c in data.get("data", {}).get("children", []):
                d = c.get("data", {})
                t = d.get("title") or ""
                u = d.get("url") or ""
                if t and t not in seen:
                    seen.add(t)
                    items.append({"title": t, "url": u, "type": "tool",
                                  "category": "general", "show": False, "src": "reddit"})
        except Exception as e:
            print("  [WARN] Reddit r/%s failed: %s" % (sub, e))
    return items


def load_youtube_coverage(out_dir="out"):
    corpus = []
    for cf in glob.glob(os.path.join(out_dir, "channel_*.json")):
        try:
            with open(cf) as f:
                data = json.load(f)
            if isinstance(data, list):
                corpus.extend(v.get("title", "") for v in data if isinstance(v, dict))
        except Exception:
            continue
    tp = os.path.join(out_dir, "trends.json")
    if os.path.exists(tp):
        try:
            with open(tp) as f:
                trends = json.load(f)
            for t in trends:
                corpus.extend(t.get("example_titles", []))
                if t.get("phrase"):
                    corpus.append(t["phrase"])
        except Exception:
            pass
    return [c.lower() for c in corpus if c]


def main():
    out_path = sys.argv[1] if len(sys.argv) > 1 else "out/tool_opportunities.json"
    top_n = int(sys.argv[2]) if len(sys.argv) > 2 else 20

    print("Hunting AI opportunities from Hacker News + Reddit...")
    print("  Track 1: NEW AI TOOLS (video/image gen, agents, vibe coding, automation)")
    print("  Track 2: PREMIUM LOOPHOLES (free/upgraded access to paid AI)")
    items = []
    for q, cat in TOOL_QUERIES:
        items.extend(fetch_hn_query(q, "show_hn", "tool", cat))
    for q, cat in LOOPHOLE_QUERIES:
        items.extend(fetch_hn_query(q, None, "loophole", cat))
    items.extend(fetch_reddit())
    print("  Collected %d items" % len(items))

    candidates = {}
    for item in items:
        title = item.get("title", "")
        names = set()
        u = candidate_from_url(item.get("url", ""))
        if u:
            names.add(u)
        names |= extract_names(title)
        itype = item.get("type", "tool")
        icat = item.get("category", "general")
        is_show = item.get("show", False)
        for name in names:
            if name.lower() in DEV_NOISE:
                continue
            key = name.lower()
            if key not in candidates:
                candidates[key] = {
                    "candidate": name,
                    "type": "tool",
                    "categories": set(),
                    "example_titles": [],
                    "hn_mentions": 0,
                    "reddit_mentions": 0,
                    "yt_coverage": 0,
                    "opportunity_score": 0,
                    "sources": set(),
                }
            cand = candidates[key]
            if itype == "loophole":
                cand["type"] = "loophole"
            cand["categories"].add(icat)
            if title and title not in cand["example_titles"]:
                cand["example_titles"].append(title)
            weight = 3 if is_show else 1
            if item.get("src") == "reddit":
                cand["reddit_mentions"] += weight
            else:
                cand["hn_mentions"] += weight
            cand["sources"].add(item.get("src", "hn"))

    coverage = load_youtube_coverage()
    for cand in candidates.values():
        low = cand["candidate"].lower()
        cov = sum(1 for c in coverage if low in c)
        cand["yt_coverage"] = cov
        buzz = cand["hn_mentions"] + cand["reddit_mentions"]
        cand["opportunity_score"] = max(0, buzz * 10 - cov * 8)
        cand["example_titles"] = cand["example_titles"][:5]
        cand["categories"] = sorted(cand["categories"])
        cand["sources"] = sorted(cand["sources"])

    ranked = sorted(candidates.values(), key=lambda c: c["opportunity_score"], reverse=True)
    ranked = [c for c in ranked if c["opportunity_score"] > 0]
    ranked = [c for c in ranked if c["candidate"].lower() not in BRAND_BLOCK][:top_n]

    os.makedirs(os.path.dirname(out_path) or ".", exist_ok=True)
    with open(out_path, "w") as f:
        json.dump(ranked, f, indent=2)

    tools = [c for c in ranked if c["type"] == "tool"]
    holes = [c for c in ranked if c["type"] == "loophole"]
    print("Saved %d opportunities to %s" % (len(ranked), out_path))
    print("  NEW TOOLS:  %d   PREMIUM LOOPHOLES: %d" % (len(tools), len(holes)))
    print("\nTop NEW TOOLS:")
    for c in tools[:8]:
        print("  %s [%s] score=%d (yt_cov=%d)" % (c["candidate"], ",".join(c["categories"]), c["opportunity_score"], c["yt_coverage"]))
    print("\nTop PREMIUM LOOPHOLES:")
    for c in holes[:8]:
        print("  %s score=%d (yt_cov=%d)" % (c["candidate"], c["opportunity_score"], c["yt_coverage"]))
    print("\nUNVERIFIED. Run tool_vetter.py next to fact-check (existence + whether a loophole actually works).")


if __name__ == "__main__":
    main()
