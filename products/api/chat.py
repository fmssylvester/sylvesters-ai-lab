import json
import os
import urllib.request
from http.server import BaseHTTPRequestHandler
from datetime import datetime

NVIDIA_KEY = os.environ.get('NVIDIA_API_KEY', '')

AGENT_SYSTEM_PROMPT = """You are an intelligent AI agent with memory and tools — a LIVE INTERACTIVE DEMO of the "AI Agent with Memory & Tools" n8n workflow template.

## YOUR CONTEXT
- You ARE the product being demonstrated. This is an n8n workflow template.
- The template has 7 connected nodes: Webhook → AI Agent → OpenAI Chat Model → Window Buffer Memory (20 msg) → Calculator Tool → Wikipedia Tool → Webhook Response
- It imports into n8n in 1 click. Setup takes ~5 minutes.
- Requires only an OpenAI API key. Calculator and Wikipedia tools need no extra keys.
- Sold on Gumroad for $29 (Essentials), $69 (Professional), $149 (Enterprise).
- Gumroad URL: sylvesterlab.gumroad.com/l/ai-agent-n8n

## YOUR CAPABILITIES (as the demo)
- You can do math, answer factual questions, and have conversations
- When asked a calculation: show the result with a brief explanation
- When asked about facts/history/science: give a concise answer
- Use **bold** for numbers and key facts in your responses

## TRIAL AWARENESS
- User gets 5 free messages
- If asked about pricing: "$29 one-time for Essentials, $69 Professional, $149 Enterprise"
- If asked where to buy: "sylvesterlab.gumroad.com/l/ai-agent-n8n" """

SYSTEM_PROMPT = """You are SupportAI — a LIVE INTERACTIVE DEMO of the AI Customer Support Agent n8n workflow template.

## YOUR CONTEXT
- You ARE the product being demonstrated. This is an n8n workflow template.
- The template handles customer inquiries with AI, remembers 10 messages of context, escalates complex issues to humans, and integrates via webhook.
- It uses GPT-5-mini (or your choice of model) and costs ~$0.002 per conversation to run.
- It imports into n8n in 1 click. Setup takes ~5 minutes.
- Sold on Gumroad for $29 one-time. URL: sylvesterlab.gumroad.com/l/ai-customer-support-pro

## TRIAL AWARENESS
- User gets 5 free messages
- If asked about pricing: "$29 one-time, no subscription."
- If asked where to buy: "sylvesterlab.gumroad.com/l/ai-customer-support-pro" """

MAX_TRIAL_MSGS = 5
conversations = {}
conv_msg_count = {}

def call_ai(messages, product='cs-agent'):
    system = AGENT_SYSTEM_PROMPT if product == 'ai-agent' else SYSTEM_PROMPT
    payload = {
        "model": "nvidia/nemotron-3-nano-30b-a3b",
        "messages": [
            {"role": "system", "content": system},
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
        resp = urllib.request.urlopen(req, timeout=25)
        data = json.loads(resp.read())
        return data["choices"][0]["message"]["content"]
    except Exception as e:
        return f"I apologize, I'm having a temporary issue. Please try again in a moment. (Error: {str(e)[:50]})"

class handler(BaseHTTPRequestHandler):
    def do_OPTIONS(self):
        self.send_response(204)
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
            try:
                leads_file = '/tmp/leads.json'
                if os.path.exists(leads_file):
                    with open(leads_file, 'r') as f:
                        leads = json.load(f)
                else:
                    leads = []
                body['timestamp'] = datetime.now().isoformat()
                leads.append(body)
                with open(leads_file, 'w') as f:
                    json.dump(leads, f, indent=2)
            except Exception:
                pass
            self.respond_json({"success": True, "message": "Thanks! Walkthrough coming soon."})
            return

        msg = body.get('message', '')
        conv_id = body.get('conversationId', 'default')
        product = body.get('product', 'cs-agent')

        if conv_id not in conv_msg_count:
            conv_msg_count[conv_id] = 0
        conv_msg_count[conv_id] += 1

        redirect_url = "https://sylvesterlab.gumroad.com/l/ai-customer-support-pro"
        if product == 'ai-agent':
            redirect_url = "https://sylvesterlab.gumroad.com/l/ai-agent-n8n"

        if conv_msg_count[conv_id] >= MAX_TRIAL_MSGS:
            self.respond_json({
                "success": True, "trial_over": True,
                "redirect": redirect_url, "conversationId": conv_id
            })
            return

        if conv_id not in conversations:
            conversations[conv_id] = []
        conversations[conv_id].append({"role": "user", "content": msg})
        if len(conversations[conv_id]) > 20:
            conversations[conv_id] = conversations[conv_id][-20:]

        ai_response = call_ai(conversations[conv_id], product)
        conversations[conv_id].append({"role": "assistant", "content": ai_response})
        self.respond_json({
            "success": True, "response": ai_response,
            "conversationId": conv_id, "timestamp": datetime.now().isoformat()
        })

    def respond_json(self, data):
        self.send_response(200)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.end_headers()
        self.wfile.write(json.dumps(data).encode())
