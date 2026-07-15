#!/usr/bin/env python3
"""Generate on-brand procedural backgrounds for the Sylvester AI Lab library.

Palette: void #07090D, cyan #00D9FF, gold #E7B84D, red #FF6B6B.
Produces SVG backgrounds across 06_BACKGROUNDS subcategories so every video
can pull a coherent, non-flat backdrop without a download.

Usage:
  python3 scripts/gen_backgrounds.py            # generate the full starter set
"""
import os
import math
import random

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "assets", "06_BACKGROUNDS")
VOID = "#07090D"
CYAN = "#00D9FF"
GOLD = "#E7B84D"
RED = "#FF6B6B"
W, H = 1920, 1080


def _header():
    return (f'<svg xmlns="http://www.w3.org/2000/svg" width="{W}" height="{H}" '
            f'viewBox="0 0 {W} {H}">')


def gradient(name, stops, angle=135):
    a = math.radians(angle)
    x2 = round(math.cos(a) * 50 + 50, 1)
    y2 = round(math.sin(a) * 50 + 50, 1)
    s = "".join(f'<stop offset="{o}%" stop-color="{c}" stop-opacity="{op}"/>'
                for o, c, op in stops)
    return (f'<linearGradient id="{name}" x1="0%" y1="0%" x2="{x2}%" y2="{y2}%">'
            f'{s}</linearGradient>')


def radial(name, cx, cy, r, color, op=0.9):
    return (f'<radialGradient id="{name}" cx="{cx}%" cy="{cy}%" r="{r}%">'
            f'<stop offset="0%" stop-color="{color}" stop-opacity="{op}"/>'
            f'<stop offset="100%" stop-color="{color}" stop-opacity="0"/>'
            f'</radialGradient>')


def dark(i, seed=None):
    vg = radial(f"v{i}", 50, 42, 75, CYAN, 0.06)
    vg2 = radial(f"v2{i}", 78, 88, 60, GOLD, 0.05)
    return _header() + f'<defs>{vg}{vg2}</defs>' \
        f'<rect width="{W}" height="{H}" fill="{VOID}"/>' \
        f'<rect width="{W}" height="{H}" fill="url(#v{i})"/>' \
        f'<rect width="{W}" height="{H}" fill="url(#v2{i})"/>' \
        f'<rect width="{W}" height="{H}" fill="url(#v{i})" opacity="0.4"/>' \
        f'</svg>'


def grad(i, seed):
    r = random.Random(seed)
    c1 = r.choice([CYAN, GOLD, RED])
    c2 = r.choice([CYAN, GOLD])
    g = gradient(f"g{i}", [(0, VOID, 1), (55, c1, 0.18), (100, c2, 0.30)], r.randint(90, 200))
    return _header() + f'<defs>{g}</defs>' \
        f'<rect width="{W}" height="{H}" fill="{VOID}"/>' \
        f'<rect width="{W}" height="{H}" fill="url(#g{i})"/>' \
        f'<rect width="{W}" height="{H}" fill="{VOID}" opacity="0.25"/>' \
        f'</svg>'


def mesh(i, seed):
    r = random.Random(seed)
    blobs = []
    defs = ""
    for k in range(4):
        cx, cy = r.randint(10, 90), r.randint(10, 90)
        col = r.choice([CYAN, GOLD, RED])
        rid = f"m{i}_{k}"
        defs += radial(rid, cx, cy, r.randint(35, 60), col, 0.22)
        blobs.append(f'<rect width="{W}" height="{H}" fill="url(#{rid})"/>')
    return _header() + f'<defs>{defs}</defs>' \
        f'<rect width="{W}" height="{H}" fill="{VOID}"/>' + "".join(blobs) + \
        f'<rect width="{W}" height="{H}" fill="{VOID}" opacity="0.45"/>' \
        f'<filter id="b{i}"><feGaussianBlur stdDeviation="60"/></filter>' \
        f'</svg>'


def grid(i, seed):
    r = random.Random(seed)
    step = r.choice([40, 60, 80])
    lines = []
    for x in range(0, W + 1, step):
        lines.append(f'<line x1="{x}" y1="0" x2="{x}" y2="{H}" stroke="{CYAN}" stroke-opacity="0.10" stroke-width="1"/>')
    for y in range(0, H + 1, step):
        lines.append(f'<line x1="0" y1="{y}" x2="{W}" y2="{y}" stroke="{CYAN}" stroke-opacity="0.10" stroke-width="1"/>')
    vg = radial(f"gv{i}", 50, 50, 70, VOID, 1)
    return _header() + f'<defs>{vg}</defs>' \
        f'<rect width="{W}" height="{H}" fill="{VOID}"/>' + "".join(lines) + \
        f'<rect width="{W}" height="{H}" fill="url(#gv{i})"/>' \
        f'</svg>'


def aurora(i, seed):
    r = random.Random(seed)
    defs = ""
    bands = ""
    for k in range(3):
        cx, cy = r.randint(20, 80), r.randint(10, 70)
        col = r.choice([CYAN, GOLD])
        rid = f"a{i}_{k}"
        defs += radial(rid, cx, cy, r.randint(40, 70), col, 0.16)
        bands += f'<rect width="{W}" height="{H}" fill="url(#{rid})"/>'
    return _header() + f'<defs>{defs}<filter id="f{i}"><feGaussianBlur stdDeviation="90"/></filter></defs>' \
        f'<rect width="{W}" height="{H}" fill="{VOID}"/>' \
        f'<g filter="url(#f{i})">{bands}</g>' \
        f'<rect width="{W}" height="{H}" fill="{VOID}" opacity="0.5"/>' \
        f'</svg>'


def abstract(i, seed):
    r = random.Random(seed)
    shapes = []
    for _ in range(6):
        x, y = r.randint(0, W), r.randint(0, H)
        col = r.choice([CYAN, GOLD, RED])
        kind = r.random()
        if kind < 0.5:
            shapes.append(f'<circle cx="{x}" cy="{y}" r="{r.randint(60,240)}" fill="{col}" fill-opacity="0.06"/>')
        else:
            s = r.randint(80, 320)
            shapes.append(f'<rect x="{x}" y="{y}" width="{s}" height="{s}" fill="none" stroke="{col}" stroke-opacity="0.12" stroke-width="1.5" transform="rotate({r.randint(0,45)} {x} {y})"/>')
    return _header() + f'<rect width="{W}" height="{H}" fill="{VOID}"/>' + "".join(shapes) + f'</svg>'


def main():
    specs = [
        ("Dark", dark, range(6)),
        ("Gradient", grad, range(6)),
        ("Mesh", mesh, range(6)),
        ("Grid", grid, range(6)),
        ("Aurora", aurora, range(6)),
        ("Abstract", abstract, range(6)),
    ]
    total = 0
    for sub, fn, ids in specs:
        d = os.path.join(OUT, sub)
        os.makedirs(d, exist_ok=True)
        for n in ids:
            seed = hash((sub, n)) % (2 ** 31)
            svg = fn(n, seed)
            p = os.path.join(d, f"bg-{sub.lower()}-{n+1:02d}.svg")
            with open(p, "w") as f:
                f.write(svg)
            total += 1
    print(f"generated {total} backgrounds across {len(specs)} subcategories")


if __name__ == "__main__":
    main()
