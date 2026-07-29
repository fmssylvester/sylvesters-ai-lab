import http.server
import json
import os
import urllib.request
import mimetypes
from datetime import datetime

NVIDIA_KEY = os.environ.get('NVIDIA_API_KEY', '')

SYSTEM_PROMPT = """You are SupportAI — a LIVE INTERACTIVE DEMO of the AI Customer Support Agent n8n workflow template. You represent the template ITSELF, not a support agent for a separate company.

## YOUR CONTEXT (Ground Truth)
- You ARE the product being demonstrated here. This is an n8n workflow template.
- The template handles customer inquiries with AI, remembers 10 messages of context, escalates complex issues to humans, and integrates via webhook.
- It uses GPT-5-mini (or your choice of model) and costs ~$0.002 per conversation to run.
- It imports into n8n in 1 click. Setup takes ~5 minutes.
- The template is sold on Gumroad for $29 one-time payment (no subscription).
- Gumroad URL: sylvesterlab.gumroad.com/l/ai-customer-support-pro
- A step-by-step installation guide is available for +$5 as a premium option on Gumroad.
- The workflow has 4 connected nodes: Webhook → AI Agent → Context Window → Webhook Reply.

## TRIAL AWARENESS
- The user gets 5 free messages to test you live.
- Be naturally helpful — demonstrate the quality of responses they'll get.
- If asked about pricing: "$29 one-time, no subscription. Includes the full template + setup guide."
- If asked about where to buy: "You can get it on Gumroad at sylvesterlab.gumroad.com/l/ai-customer-support-pro"
- If asked about the cheaper $12 version: "There's a base version on Gumroad, but the Pro version at $29 includes step-by-step installation help and email support."

## Core Behavior
- Be concise, friendly, and professional (you ARE the demo of what the template can do)
- Respond in under 150 words
- If a question is outside your scope (complex technical issues, account-specific), mention that this is a demo and the full template is customizable
- Never claim to be human — you're an AI demo

## What to say when asked about yourself
"SupportAI is a live demo of the AI Customer Support Agent n8n workflow template. I'm running on NVIDIA Nemotron-3 30B right now! The template imports into n8n in one click and handles customer inquiries with AI, remembers conversation context, and escalates when needed. You can get the full template on Gumroad for $29."""

MAX_TRIAL_MSGS = 5

def call_ai(messages):
    payload = {
        "model": "nvidia/nemotron-3-nano-30b-a3b",
        "messages": [
            {"role": "system", "content": SYSTEM_PROMPT},
            *messages[-6:]
        ],
        "max_tokens": 300,
        "temperature": 0.7
    }
    req = urllib.request.Request(
        "https://integrate.api.nvidia.com/v1/chat/completions",
        data=json.dumps(payload).encode(),
        headers={
            "Content-Type": "application/json",
            "Authorization": f"Bearer {NVIDIA_KEY}"
        }
    )
    try:
        resp = urllib.request.urlopen(req, timeout=30)
        data = json.loads(resp.read())
        return data["choices"][0]["message"]["content"]
    except Exception as e:
        return f"I apologize, I'm having a temporary issue. Please try again in a moment. (Error: {str(e)[:50]})"

BASE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.join(BASE, 'ai-customer-support-agent')
MEDIA_ROOT = os.path.join(BASE, 'media')
LEADS_FILE = os.path.join(BASE, 'leads.json')
conversations = {}
conv_msg_count = {}

class Handler(http.server.BaseHTTPRequestHandler):
    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()

    def do_POST(self):
        length = int(self.headers.get('Content-Length', 0))
        if length == 0:
            self.send_error(400)
            return
        body = json.loads(self.rfile.read(length))

        if 'email' in body and 'name' in body:
            if not os.path.exists(LEADS_FILE):
                with open(LEADS_FILE, 'w') as f: json.dump([], f)
            with open(LEADS_FILE, 'r') as f: leads = json.load(f)
            body['timestamp'] = datetime.now().isoformat()
            leads.append(body)
            with open(LEADS_FILE, 'w') as f: json.dump(leads, f, indent=2)
            self.respond_json({"success": True, "message": "Thanks! Walkthrough coming soon."})
            return

        msg = body.get('message', '')
        conv_id = body.get('conversationId', 'default')

        if conv_id not in conv_msg_count:
            conv_msg_count[conv_id] = 0
        conv_msg_count[conv_id] += 1

        if conv_msg_count[conv_id] >= MAX_TRIAL_MSGS:
            self.respond_json({
                "success": True,
                "trial_over": True,
                "redirect": "https://sylvesterlab.gumroad.com/l/ai-customer-support-pro",
                "conversationId": conv_id
            })
            return

        if conv_id not in conversations:
            conversations[conv_id] = []
        conversations[conv_id].append({"role": "user", "content": msg})
        if len(conversations[conv_id]) > 20:
            conversations[conv_id] = conversations[conv_id][-20:]

        ai_response = call_ai(conversations[conv_id])
        conversations[conv_id].append({"role": "assistant", "content": ai_response})
        self.respond_json({
            "success": True,
            "response": ai_response,
            "conversationId": conv_id,
            "timestamp": datetime.now().isoformat()
        })

    def do_GET(self):
        path = self.path.split('?')[0]
        if path == '/':
            path = '/index.html'

        if path.startswith('/media/'):
            filepath = os.path.join(MEDIA_ROOT, path.lstrip('/media/'))
        else:
            filepath = os.path.join(ROOT, path.lstrip('/'))

        filepath = os.path.normpath(filepath)
        in_media = filepath.startswith(MEDIA_ROOT)
        in_root = filepath.startswith(ROOT)

        if (in_media or in_root) and os.path.isfile(filepath) and not filepath.endswith('.json'):
            with open(filepath, 'rb') as f:
                self.send_response(200)
                self.send_header('Content-Type', mimetypes.guess_type(filepath)[0] or 'application/octet-stream')
                self.send_header('Access-Control-Allow-Origin', '*')
                self.end_headers()
                self.wfile.write(f.read())
        else:
            self.send_error(404)

    def respond_json(self, data):
        self.send_response(200)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.end_headers()
        self.wfile.write(json.dumps(data).encode())

PORT = int(os.environ.get('PORT', 8080))
print(f'  🌐 Landing page: http://localhost:{PORT}')
print(f'  💬 Chat API: POST / (message + conversationId)')
print(f'  📋 Leads: POST / (name + email)')
print(f'  🧠 AI: NVIDIA Nemotron-3 30B')
print(f'  🎬 Videos: http://localhost:{PORT}/media/')
http.server.HTTPServer(('0.0.0.0', PORT), Handler).serve_forever()
