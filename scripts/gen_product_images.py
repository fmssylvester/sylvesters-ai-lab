#!/usr/bin/env python3
"""Generate branded product images for n8n templates."""
import os, sys
from PIL import Image, ImageDraw, ImageFont

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MEDIA = os.path.join(ROOT, "products", "media")
CYAN = (0, 217, 255)
GOLD = (231, 184, 77)
VOID = (7, 9, 13)
TEXT = (245, 247, 250)
MUTED = (148, 163, 184)
PANEL = (255, 255, 255, 10)
BORDER = (255, 255, 255, 20)

def get_font(size):
    try:
        return ImageFont.truetype("/data/data/com.termux/files/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", size)
    except:
        return ImageFont.load_default()

def draw_rounded_rect(draw, xy, r, fill=None, outline=None, width=1):
    x1, y1, x2, y2 = xy
    draw.rounded_rectangle(xy, r, fill=fill, outline=outline, width=width)

def gen_cover(name, tagline, filename):
    img = Image.new("RGBA", (1200, 630), VOID)
    d = ImageDraw.Draw(img)
    draw_rounded_rect(d, (40, 40, 1160, 590), 24, fill=PANEL, outline=BORDER)
    f = get_font(48)
    tf = get_font(22)
    sf = get_font(18)
    d.text((80, 200), name, fill=CYAN, font=f)
    d.text((80, 280), tagline, fill=TEXT, font=tf)
    d.text((80, 340), "Ready-to-import n8n workflow", fill=MUTED, font=sf)
    d.ellipse([1050, 80, 1080, 110], fill=GOLD)
    d.ellipse([1090, 80, 1120, 110], fill=CYAN)
    img.save(os.path.join(MEDIA, filename))
    print(f"  {filename}")

def gen_dashboard(name, filename):
    img = Image.new("RGBA", (1200, 800), VOID)
    d = ImageDraw.Draw(img)
    draw_rounded_rect(d, (30, 30, 1170, 770), 20, fill=PANEL, outline=BORDER)
    draw_rounded_rect(d, (30, 30, 280, 770), 20, fill=(255,255,255,8), outline=BORDER)
    d.ellipse([60, 60, 80, 80], fill=CYAN)
    for i, y in enumerate([120, 180, 240, 300]):
        draw_rounded_rect(d, (50, y, 250, y+40), 8, fill=PANEL)
    draw_rounded_rect(d, (310, 50, 1140, 100), 12, fill=(255,255,255,8), outline=BORDER)
    draw_rounded_rect(d, (310, 130, 720, 380), 16, fill=PANEL)
    draw_rounded_rect(d, (740, 130, 1140, 380), 16, fill=PANEL)
    draw_rounded_rect(d, (310, 410, 1140, 740), 16, fill=PANEL)
    f = get_font(20)
    d.text((340, 160), name, fill=CYAN, font=f)
    d.text((340, 440), "Activity Overview", fill=TEXT, font=f)
    img.save(os.path.join(MEDIA, filename))
    print(f"  {filename}")

def gen_features(name, features, filename):
    img = Image.new("RGBA", (1200, 800), VOID)
    d = ImageDraw.Draw(img)
    draw_rounded_rect(d, (30, 30, 1170, 770), 20, fill=PANEL, outline=BORDER)
    f = get_font(36)
    tf = get_font(18)
    d.text((80, 60), "Features", fill=CYAN, font=f)
    cx, cy = 80, 160
    for feat, desc in features[:4]:
        draw_rounded_rect(d, (cx, cy, cx+520, cy+130), 16, fill=PANEL)
        d.ellipse([cx+24, cy+24, cx+54, cy+54], fill=GOLD)
        d.text((cx+70, cy+30), feat, fill=TEXT, font=get_font(20))
        d.text((cx+70, cy+65), desc, fill=MUTED, font=tf)
        cy += 155
        if cy > 620:
            cx, cy = 600, 160
    img.save(os.path.join(MEDIA, filename))
    print(f"  {filename}")

def gen_mobile(filename):
    img = Image.new("RGBA", (600, 900), VOID)
    d = ImageDraw.Draw(img)
    draw_rounded_rect(d, (20, 20, 580, 880), 50, fill=(11,14,20), outline=BORDER)
    draw_rounded_rect(d, (40, 40, 560, 860), 40, fill=VOID)
    draw_rounded_rect(d, (220, 28, 380, 48), 10, fill=(11,14,20))
    d.ellipse([280, 34, 320, 42], fill=(255,255,255,30))
    for y in range(100, 800, 80):
        draw_rounded_rect(d, (80, y, 520, y+50), 12, fill=PANEL)
    img.save(os.path.join(MEDIA, filename))
    print(f"  {filename}")

def gen_workflow(nodes, edges, filename):
    img = Image.new("RGBA", (1200, 700), VOID)
    d = ImageDraw.Draw(img)
    draw_rounded_rect(d, (30, 30, 1170, 670), 20, fill=PANEL, outline=BORDER)
    f = get_font(14)
    for i, (name, x, y) in enumerate(nodes):
        draw_rounded_rect(d, (x, y, x+160, y+50), 10, fill=(0,217,255,40), outline=CYAN)
        d.text((x+10, y+14), name, fill=TEXT, font=f)
        if i < len(nodes) - 1:
            nx, ny = nodes[i+1][1], nodes[i+1][2]
            d.line([x+160, y+25, nx, ny+25], fill=CYAN, width=2)
    img.save(os.path.join(MEDIA, filename))
    print(f"  {filename}")

# Multi-Channel Hub
print("Multi-Channel Hub images:")
gen_cover("Multi-Channel Hub", "WhatsApp + Telegram + SMS in one workflow", "hub-cover.png")
gen_dashboard("Multi-Channel Hub", "hub-dashboard.png")
gen_features("Multi-Channel Hub", [
    ("WhatsApp", "Business API integration with automated replies"),
    ("Telegram", "Bot-powered messaging with markdown support"),
    ("SMS", "Twilio-powered text message automation"),
    ("AI Responses", "GPT-4o-mini generates channel-optimized replies"),
], "hub-features.png")
gen_mobile("hub-mobile.png")
gen_workflow([
    ("Webhook", 50, 300), ("AI Agent", 280, 300), ("Router", 510, 300),
    ("Send WhatsApp", 740, 100), ("Send Telegram", 740, 280), ("Send SMS", 740, 460),
    ("Response", 970, 300)
], [], "hub-workflow.png")

# CS Agent
print("CS Agent images:")
gen_cover("AI Customer Support Agent", "24/7 AI-powered customer support", "cs-agent-cover.png")
gen_dashboard("CS Agent", "cs-agent-dashboard.png")
gen_features("CS Agent", [
    ("Smart Replies", "AI generates context-aware responses"),
    ("Memory", "Remembers conversation history"),
    ("Escalation", "Hand-off to human agents when needed"),
    ("Analytics", "Track satisfaction and response times"),
], "cs-agent-features.png")
gen_mobile("cs-agent-mobile.png")
gen_workflow([
    ("Webhook", 50, 300), ("AI Agent", 280, 300), ("Memory", 280, 450),
    ("Response", 510, 300)
], [], "cs-agent-workflow.png")

# SMS Bot
print("SMS Bot images:")
gen_cover("Missed Call SMS Bot", "AI auto-replies when you miss a call", "sms-bot-cover.png")
gen_dashboard("SMS Bot", "sms-bot-dashboard.png")
gen_features("SMS Bot", [
    ("Auto-Reply", "Instant AI SMS on missed calls"),
    ("Twilio", "Reliable SMS delivery worldwide"),
    ("Customizable", "Set your business name and tone"),
    ("Analytics", "Track replies and response rates"),
], "sms-bot-features.png")
gen_mobile("sms-bot-mobile.png")
gen_workflow([
    ("Webhook", 50, 300), ("AI Generator", 280, 300), ("Twilio SMS", 510, 300),
    ("Response", 740, 300)
], [], "sms-bot-workflow.png")
