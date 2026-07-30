import http.server
import json
import os
import urllib.request

SYSTEM_PROMPT = """You are a professional, friendly customer support agent for a SaaS company. Your name is 'SupportAI'.

## Core Rules
- Be helpful, concise, and empathetic
- Never make up information you don't know
- If you need more details, ask clarifying questions
- Always maintain a professional tone
- If a customer is frustrated, acknowledge their frustration first

## When to Escalate
If the customer asks about:
- Account deletion or data privacy requests
- Billing disputes or refunds
- Security concerns or suspected account breaches
- Anything requiring human judgment or policy exceptions

Respond with: ESCALATE: [reason] and I will guide them on next steps.

## Response Format
Keep responses under 150 words unless complex. Use clear sections for multi-part answers.

## Available Information
You are a first-line support agent. You can:
- Answer common questions about product features
- Help with troubleshooting basic issues
- Guide users to relevant documentation
- Collect information for escalation

Remember: You represent the company. Be professional, helpful, and honest."""

GITHUB_TOKEN = os.environ.get('GITHUB_MODELS_TOKEN', '')
OPENROUTER_KEY = os.environ.get('OPENROUTER_API_KEY', '')

def call_ai(messages):
    payload = {
        "model": "gpt-4o",
        "messages": [
            {"role": "system", "content": SYSTEM_PROMPT},
            *messages
        ],
        "max_tokens": 500,
        "temperature": 0.7
    }
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {GITHUB_TOKEN}"
    }
    req = urllib.request.Request(
        "https://models.github.ai/inference/chat/completions",
        data=json.dumps(payload).encode(),
        headers=headers
    )
    try:
        resp = urllib.request.urlopen(req, timeout=30)
        data = json.loads(resp.read())
        return data["choices"][0]["message"]["content"]
    except urllib.error.HTTPError as e:
        body = e.read().decode()
        return f"I apologize, I'm having trouble connecting to my AI backend right now. Please try again in a moment."

conversations = {}

class CSAgentHandler(http.server.BaseHTTPRequestHandler):
    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()

    def do_POST(self):
        length = int(self.headers.get('Content-Length', 0))
        body = json.loads(self.rfile.read(length))
        
        msg = body.get('message', '')
        conv_id = body.get('conversationId', 'default')
        customer_id = body.get('customerId', 'anonymous')
        
        if conv_id not in conversations:
            conversations[conv_id] = []
        
        conversations[conv_id].append({"role": "user", "content": msg})
        if len(conversations[conv_id]) > 20:
            conversations[conv_id] = conversations[conv_id][-20:]
        
        ai_response = call_ai(conversations[conv_id])
        conversations[conv_id].append({"role": "assistant", "content": ai_response})
        
        self.send_response(200)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.end_headers()
        self.wfile.write(json.dumps({
            "success": True,
            "response": ai_response,
            "conversationId": conv_id,
            "timestamp": __import__('datetime').datetime.now().isoformat()
        }).encode())

    def do_GET(self):
        self.send_response(200)
        self.send_header('Content-Type', 'text/html')
        self.end_headers()
        self.wfile.write(b'CS Agent server running. POST / to chat.')

PORT = 8766
print(f'CS Agent API running on http://localhost:{PORT}')
print(f'AI Backend: GitHub Models GPT-4o')
print(f'Landing page should POST to http://localhost:{PORT}')
http.server.HTTPServer(('0.0.0.0', PORT), CSAgentHandler).serve_forever()
