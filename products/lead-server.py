import http.server
import json
import os

LEADS_FILE = os.path.join(os.path.dirname(__file__), 'leads.json')

class LeadHandler(http.server.BaseHTTPRequestHandler):
    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()

    def do_POST(self):
        length = int(self.headers.get('Content-Length', 0))
        body = self.rfile.read(length)
        data = json.loads(body)

        if not os.path.exists(LEADS_FILE):
            with open(LEADS_FILE, 'w') as f:
                json.dump([], f)

        with open(LEADS_FILE, 'r') as f:
            leads = json.load(f)

        data['timestamp'] = __import__('datetime').datetime.now().isoformat()
        leads.append(data)

        with open(LEADS_FILE, 'w') as f:
            json.dump(leads, f, indent=2)

        self.send_response(200)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.end_headers()
        self.wfile.write(json.dumps({'success': True}).encode())

    def do_GET(self):
        self.send_response(200)
        self.send_header('Content-Type', 'text/html')
        self.end_headers()
        self.wfile.write(b'Lead server running. POST / to submit leads.')

PORT = 8765
print(f'Lead server running on http://localhost:{PORT}')
print(f'Leads saved to: {LEADS_FILE}')
print(f'Update your landing page form to POST to http://localhost:{PORT}')
http.server.HTTPServer(('0.0.0.0', PORT), LeadHandler).serve_forever()
