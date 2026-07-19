"""Web research via Tavily (https://tavily.com).

Complements topic_research.py (YouTube) with broader web sources — official
docs, guides, blogs — so the script generator has first-hand, non-YouTube
grounding too. Gives the multi-part series real, citable material on how
prompting actually works and how creators approach it.

Requires TAVILY_API_KEY in the environment or pipeline/.env.
"""

from __future__ import annotations

import json
import os
import sys
from datetime import datetime, timezone
from pathlib import Path

import requests

import config

try:
    from dotenv import load_dotenv
    load_dotenv(config.PIPELINE_DIR / ".env")
except Exception:
    pass

URL = "https://api.tavily.com/search"


def _key() -> str:
    key = os.getenv("TAVILY_API_KEY", "")
    if not key:
        raise RuntimeError(
            "Missing TAVILY_API_KEY. Set it in the environment or pipeline/.env."
        )
    return key


def _slug(topic: str) -> str:
    return "".join(c if c.isalnum() else "-" for c in topic.lower()).strip("-")


def search(query: str, max_results: int = 8, depth: str = "advanced") -> dict:
    r = requests.post(
        URL,
        json={
            "api_key": _key(),
            "query": query,
            "search_depth": depth,
            "max_results": max_results,
            "include_answer": True,
        },
        timeout=60,
    )
    r.raise_for_status()
    return r.json()


def research(topic: str, queries: list[str] | None = None, per: int = 6) -> dict:
    if queries is None:
        queries = [
            topic,
            f"{topic} step by step",
            f"{topic} common mistakes beginners make",
        ]
    results = []
    for q in queries:
        print(f"[tavily] querying: {q}")
        try:
            data = search(q, max_results=per)
        except Exception as e:
            print(f"[tavily] query failed ({e}); skipping.")
            continue
        answer = data.get("answer", "")
        for it in data.get("results", []):
            results.append({
                "query": q,
                "title": it.get("title", ""),
                "url": it.get("url", ""),
                "content": (it.get("content", "") or "")[:700],
                "score": round(it.get("score", 0), 3),
            })
        if answer:
            results.insert(0, {"query": q, "title": "Tavily answer", "url": "",
                              "content": answer[:900], "score": 1.0})

    brief = {
        "topic": topic,
        "source": "tavily",
        "query_time": datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M UTC"),
        "queries": queries,
        "result_count": len(results),
        "results": results,
    }
    ws = config.WORKSPACE / _slug(topic)
    ws.mkdir(parents=True, exist_ok=True)
    (ws / "web_research.json").write_text(
        json.dumps(brief, indent=2, ensure_ascii=False), encoding="utf-8"
    )
    (ws / "web_research.md").write_text(_to_markdown(brief), encoding="utf-8")
    print(f"[tavily] Saved -> {ws / 'web_research.json'}")
    return brief


def _to_markdown(brief: dict) -> str:
    lines = [
        f"# Web research (Tavily): {brief['topic']}",
        "",
        f"- Query time: {brief['query_time']}",
        f"- Results: {brief['result_count']}",
        "",
    ]
    for r in brief["results"]:
        lines.append(f"## {r['title']}  (score {r['score']})")
        if r["url"]:
            lines.append(f"{r['url']}")
        lines.append("")
        lines.append(r["content"])
        lines.append("")
    return "\n".join(lines)


if __name__ == "__main__":
    topic = sys.argv[1] if len(sys.argv) > 1 else input("Topic: ")
    b = research(topic)
    print(f"\n=== Web research: {b['topic']} ({b['result_count']} results) ===")
    for r in b["results"][:15]:
        print(f"  [{r['score']:.2f}] {r['title']}")
        if r["url"]:
            print(f"      {r['url']}")
