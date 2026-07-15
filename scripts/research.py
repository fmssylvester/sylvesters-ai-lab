#!/usr/bin/env python3
"""Visual research + intelligence pipeline.

Operationalizes the Creative Director research/asset/intelligence workflows from
BRAIN.md (Creative Director Operating Standard). The agent performs the actual
web/reference search with its own tools; this script persists and analyzes the
results so knowledge becomes reusable.

Commands:
  extract <img1> [<img2> ...]   Run vision.py design-analysis on each image and
                                append the extracted principles to
                                visual-intelligence.md.
  refs <url> <note...>          Record a researched reference in research/REFERENCES.md.

vision.py requires API keys in .env (github backend is best). We load .env so
subcommands inherit the environment.
"""
import sys
import os
import subprocess
import datetime

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
VISION = os.path.join(ROOT, "scripts", "vision.py")
INTEL = os.path.join(ROOT, "visual-intelligence.md")
REFS = os.path.join(ROOT, "research", "REFERENCES.md")

DESIGN_PROMPT = (
    "You are a senior motion-design critic. Analyze this reference image and extract "
    "REUSABLE design knowledge only. Return concise bullet points under these headings: "
    "Composition, Visual Hierarchy, Spacing/Negative Space, Lighting/Color, Motion implied, "
    "Transitions/Layering, Typography, and exactly 3 'Reusable Principles' applicable to a "
    "premium tech motion-graphics video. Be specific and concrete. No preamble."
)


def load_env():
    p = os.path.join(ROOT, ".env")
    if os.path.exists(p):
        for line in open(p):
            line = line.strip()
            if not line or line.startswith("#") or "=" not in line:
                continue
            k, v = line.split("=", 1)
            os.environ.setdefault(k.strip(), v.strip().strip('"').strip("'"))


def extract(images):
    load_env()
    out = [f"\n\n## Reference analysis — {datetime.date.today().isoformat()}\n"]
    for img in images:
        if not os.path.exists(img):
            print("missing:", img)
            continue
        print("analyzing", img)
        r = subprocess.run(
            [sys.executable, VISION, DESIGN_PROMPT, img],
            capture_output=True, text=True,
        )
        txt = (r.stdout or r.stderr).strip()
        out.append(f"\n### {os.path.basename(img)}\n{txt}\n")
    with open(INTEL, "a") as f:
        f.write("".join(out))
    print("appended to visual-intelligence.md")


def refs(url, note):
    os.makedirs(os.path.dirname(REFS), exist_ok=True)
    with open(REFS, "a") as f:
        f.write(f"- {datetime.date.today().isoformat()} | {url} | {' '.join(note)}\n")
    print("added reference ->", REFS)


def main():
    if len(sys.argv) < 2:
        print("usage: research.py extract <img...> | refs <url> <note>")
        sys.exit(1)
    cmd = sys.argv[1]
    if cmd == "extract":
        extract(sys.argv[2:])
    elif cmd == "refs":
        refs(sys.argv[2], sys.argv[3:])
    else:
        print("unknown command:", cmd)
        sys.exit(1)


if __name__ == "__main__":
    main()
