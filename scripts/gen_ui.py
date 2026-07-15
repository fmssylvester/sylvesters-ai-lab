#!/usr/bin/env python3
"""Generate on-brand UI + device-frame scaffolds for Sylvester AI Lab.

Palette: void #07090D, panel rgba(255,255,255,0.04), border rgba(255,255,255,0.08),
cyan #00D9FF, gold #E7B84D, text #F5F7FA / #94A3B8.
Produces reusable SVG shells that future scenes drop content into.

Usage: python3 scripts/gen_ui.py
"""
import os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
UI = os.path.join(ROOT, "assets", "03_UI_ELEMENTS")
DEV = os.path.join(ROOT, "assets", "04_DEVICE_FRAMES")

VOID = "#07090D"
PANEL = "rgba(255,255,255,0.04)"
BORDER = "rgba(255,255,255,0.08)"
PANEL2 = "rgba(255,255,255,0.07)"
CYAN = "#00D9FF"
GOLD = "#E7B84D"
TXT = "#F5F7FA"
MUT = "#94A3B8"

SVG = '<svg xmlns="http://www.w3.org/2000/svg" width="{w}" height="{h}" viewBox="0 0 {w} {h}">'


def wrap(w, h, body):
    return (SVG.format(w=w, h=h) + body + "</svg>")


def rr(x, y, w, h, r, fill=PANEL, stroke=BORDER, sw=1):
    return (f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="{r}" '
            f'fill="{fill}" stroke="{stroke}" stroke-width="{sw}"/>')


def line(x, y, w, op=0.5, col=MUT, h=6):
    return f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="3" fill="{col}" opacity="{op}"/>'


def dot(x, y, c=CYAN, r=5):
    return f'<circle cx="{x}" cy="{y}" r="{r}" fill="{c}"/>'


def glass_card():
    b = rr(0, 0, 440, 260, 22)
    b += rr(28, 30, 120, 14, 7, PANEL2, "none")
    b += line(28, 74, 300, 0.7) + line(28, 96, 220, 0.4) + line(28, 118, 260, 0.4)
    b += dot(388, 44, CYAN, 6) + dot(410, 44, GOLD, 6)
    return wrap(440, 260, b)


def stat_card():
    b = rr(0, 0, 360, 200, 20)
    b += rr(28, 28, 90, 12, 6, PANEL2, "none")
    b += f'<text x="28" y="128" font-family="Space Grotesk, sans-serif" font-size="56" font-weight="700" fill="{TXT}">2,481</text>'
    b += line(28, 156, 180, 0.5)
    b += dot(320, 40, CYAN, 6)
    return wrap(360, 200, b)


def feature_card():
    b = rr(0, 0, 360, 220, 20)
    b += dot(54, 54, GOLD, 18) + f'<circle cx="54" cy="54" r="9" fill="{VOID}"/>'
    b += rr(96, 40, 130, 14, 7, PANEL2, "none")
    b += line(28, 110, 300, 0.6) + line(28, 134, 250, 0.4) + line(28, 158, 270, 0.4)
    return wrap(360, 220, b)


def bento_cell():
    b = rr(0, 0, 300, 200, 18)
    b += rr(24, 24, 80, 10, 5, PANEL2, "none")
    b += line(24, 70, 180, 0.5) + line(24, 92, 140, 0.35)
    b += dot(250, 40, CYAN, 5)
    return wrap(300, 200, b)


def toast():
    b = rr(0, 0, 320, 64, 16, "rgba(255,255,255,0.06)")
    b += dot(34, 32, CYAN, 8)
    b += rr(56, 20, 120, 10, 5, PANEL2, "none") + line(56, 40, 180, 0.5)
    return wrap(320, 64, b)


def search_bar():
    b = rr(0, 0, 420, 56, 14, "rgba(255,255,255,0.06)")
    b += f'<circle cx="34" cy="28" r="10" fill="none" stroke="{MUT}" stroke-width="2"/>'
    b += f'<line x1="42" y1="36" x2="50" y2="44" stroke="{MUT}" stroke-width="2"/>'
    b += rr(64, 18, 200, 12, 6, PANEL2, "none")
    return wrap(420, 56, b)


def dashboard():
    b = rr(0, 0, 720, 440, 20)
    b += rr(0, 0, 200, 440, 20, "rgba(255,255,255,0.03)", BORDER)
    b += dot(40, 40, CYAN, 6)
    for i, y in enumerate([80, 130, 180, 230]):
        b += rr(28, y, 150, 12, 6, PANEL2, "none")
    # top bar
    b += rr(216, 24, 470, 40, 12, "rgba(255,255,255,0.03)", BORDER)
    # content blocks
    b += rr(216, 88, 220, 150, 14) + rr(456, 88, 220, 150, 14)
    b += rr(216, 256, 460, 150, 14)
    b += line(240, 120, 120, 0.6) + line(480, 120, 120, 0.6) + line(240, 300, 200, 0.5)
    return wrap(720, 440, b)


def line_chart():
    b = rr(0, 0, 360, 220, 18)
    pts = "40,170 90,140 140,150 190,100 240,120 300,70 320,90"
    b += f'<polyline points="{pts}" fill="none" stroke="{CYAN}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>'
    b += dot(300, 70, GOLD, 6)
    b += line(28, 40, 120, 0.6)
    return wrap(360, 220, b)


def bar_chart():
    b = rr(0, 0, 360, 220, 18)
    for i, h in enumerate([60, 90, 50, 120, 80, 140]):
        x = 36 + i * 50
        b += f'<rect x="{x}" y="{200-h}" width="26" height="{h}" rx="5" fill="{CYAN}" opacity="{0.4+i*0.1:.1f}"/>'
    b += line(28, 40, 120, 0.6)
    return wrap(360, 220, b)


def form_field():
    b = rr(0, 0, 360, 72, 12, "rgba(255,255,255,0.05)", "rgba(0,217,255,0.3)")
    b += rr(20, 28, 90, 10, 5, PANEL2, "none")
    b += rr(20, 44, 280, 10, 5, PANEL2, "none")
    return wrap(360, 72, b)


def mobile_card():
    b = rr(0, 0, 300, 200, 18)
    b += dot(40, 44, GOLD, 14) + f'<circle cx="40" cy="44" r="7" fill="{VOID}"/>'
    b += rr(72, 34, 120, 12, 6, PANEL2, "none") + line(24, 90, 250, 0.5) + line(24, 114, 200, 0.35)
    return wrap(300, 200, b)


# ---------- device frames ----------
def phone():
    w, h = 300, 620
    b = f'<rect x="0" y="0" width="{w}" height="{h}" rx="46" fill="#0B0E14" stroke="{BORDER}" stroke-width="2"/>'
    b += f'<rect x="14" y="14" width="{w-28}" height="{h-28}" rx="34" fill="{VOID}"/>'
    b += f'<rect x="118" y="22" width="64" height="12" rx="6" fill="#0B0E14"/>'  # notch
    b += dot(150, 28, "rgba(255,255,255,0.15)", 3)
    return wrap(w, h, b)


def laptop():
    w, h = 860, 540
    b = f'<rect x="40" y="20" width="{w-80}" height="{h-120}" rx="18" fill="#0B0E14" stroke="{BORDER}" stroke-width="2"/>'
    b += f'<rect x="56" y="36" width="{w-112}" height="{h-152}" rx="8" fill="{VOID}"/>'
    b += f'<path d="M10 {h-100} H{w-10} L{w-40} {h-20} H40 Z" fill="#0B0E14" stroke="{BORDER}" stroke-width="2"/>'
    b += f'<rect x="{w/2-60}" y="{h-96}" width="120" height="10" rx="5" fill="rgba(255,255,255,0.06)"/>'
    return wrap(w, h, b)


def tablet():
    w, h = 560, 760
    b = f'<rect x="0" y="0" width="{w}" height="{h}" rx="40" fill="#0B0E14" stroke="{BORDER}" stroke-width="2"/>'
    b += f'<rect x="18" y="18" width="{w-36}" height="{h-36}" rx="28" fill="{VOID}"/>'
    b += dot(280, 40, "rgba(255,255,255,0.15)", 4)
    return wrap(w, h, b)


def desktop():
    w, h = 860, 580
    b = f'<rect x="40" y="20" width="{w-80}" height="{h-160}" rx="16" fill="#0B0E14" stroke="{BORDER}" stroke-width="2"/>'
    b += f'<rect x="56" y="36" width="{w-112}" height="{h-192}" rx="8" fill="{VOID}"/>'
    b += f'<rect x="{w/2-70}" y="{h-140}" width="140" height="14" rx="7" fill="#0B0E14"/>'
    b += f'<rect x="{w/2-180}" y="{h-126}" width="360" height="90" rx="10" fill="#0B0E14" stroke="{BORDER}" stroke-width="2"/>'
    return wrap(w, h, b)


def watch():
    w, h = 250, 310
    b = f'<rect x="0" y="0" width="{w}" height="{h}" rx="64" fill="#0B0E14" stroke="{BORDER}" stroke-width="2"/>'
    b += f'<rect x="22" y="22" width="{w-44}" height="{h-44}" rx="46" fill="{VOID}"/>'
    b += dot(125, 50, CYAN, 5)
    b += line(70, 150, 110, 0.5) + line(70, 172, 80, 0.4)
    return wrap(w, h, b)


def main():
    specs = [
        (UI, "Glass", {"glass-card.svg": glass_card()}),
        (UI, "Cards", {"stat-card.svg": stat_card(), "feature-card.svg": feature_card(),
                       "bento-cell.svg": bento_cell()}),
        (UI, "Notifications", {"toast.svg": toast()}),
        (UI, "Search", {"search-bar.svg": search_bar()}),
        (UI, "Dashboards", {"dashboard.svg": dashboard()}),
        (UI, "Charts", {"line-chart.svg": line_chart(), "bar-chart.svg": bar_chart()}),
        (UI, "Forms", {"field.svg": form_field()}),
        (UI, "Mobile", {"mobile-card.svg": mobile_card()}),
        (DEV, "Phones", {"phone.svg": phone()}),
        (DEV, "Laptops", {"laptop.svg": laptop()}),
        (DEV, "Tablets", {"tablet.svg": tablet()}),
        (DEV, "Desktop", {"desktop.svg": desktop()}),
        (DEV, "Smart Watches", {"watch.svg": watch()}),
    ]
    total = 0
    for base, sub, files in specs:
        d = os.path.join(base, sub)
        os.makedirs(d, exist_ok=True)
        for name, svg in files.items():
            with open(os.path.join(d, name), "w") as f:
                f.write(svg)
            total += 1
    print(f"generated {total} UI/device scaffolds")


if __name__ == "__main__":
    main()
