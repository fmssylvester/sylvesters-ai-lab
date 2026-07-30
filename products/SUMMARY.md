# Architecture Summary

## Hosting: Render → Vercel Migration

**Date:** July 2026

**Why:** Render's free tier puts the server to sleep after inactivity, causing a 30-second cold start on every visit. Vercel serves static assets (HTML, videos, images) from CDN at edge — zero cold start. Serverless functions wake in <500ms. For a landing page with a chat demo, this is the right platform.

**Trade-offs accepted:**
- In-memory conversation state is best-effort on serverless (Vercel may route to different instances). Fine for a demo — the real product is the n8n template.
- Lead capture writes to `/tmp/leads.json` instead of persistent storage. The form gives the user a success message regardless of the write outcome. For production, wire up Vercel KV.
- Leads lost on instance recycle — acceptable for current scale. If leads become important, add Vercel KV or a simple Supabase table.

## Vercel Structure

```
products/
├── api/
│   └── index.py            # Flask app — only handles POST /
├── public/
│   ├── index.html          # Landing page (served from CDN instantly)
│   ├── media/              # Demo videos, product images (CDN)
│   ├── pulse/              # Pulse patient records demo (CDN)
│   └── ...                 # Product images/static assets
├── ai-agent-memory/        # AI Agent product files (not served)
├── ai-customer-support-agent/  # CS Agent product files (not served)
├── missed-call-sms/        # SMS Bot product files (not served)
├── patient-records-system/ # Patient Records product files (not served)
├── vercel.json             # Routes POST / to function, static everything else via CDN
├── requirements.txt        # Flask dependency
└── SUMMARY.md              # This file
```

## Vercel Config (`vercel.json`)

- `public/` is served as static assets by Vercel CDN — no function invocation needed
- POST `/` is the only route that hits the Flask function (chat API + lead capture)
- GET `/` → CDN serves `public/index.html` instantly

## Flask App (`api/index.py`)

- POST `/` handles two payload shapes:
  1. `{name, email, ...}` → lead capture (saves to `/tmp/leads.json`)
  2. `{message, conversationId, product?}` → AI chat (calls NVIDIA Nemotron-3 30B)
- `product` field selects which system prompt (CS Agent vs AI Agent)
- 5-message trial limit per conversation
- CORS headers on all responses

## Deployment

1. Push to GitHub (`main` branch)
2. Vercel auto-deploys (connected via GitHub integration)
3. URL: `https://sylvesterlab.vercel.app` (custom domain TBD)
4. Env vars needed in Vercel dashboard: `NVIDIA_API_KEY`

## n8n Template Store

| Product | Gumroad | Price Range | Demo |
|---------|---------|-------------|------|
| AI Customer Support Agent | `/l/ai-customer-support-pro` | $29 | Chat on landing page |
| Missed Call SMS Text-Back | `/l/missed-call-sms-pro` | $29 | — |
| Patient Records System | `/l/patient-records-n8n` | $49–$197 | Pulse website |
| AI Agent with Memory & Tools | `/l/ai-agent-n8n` | $29–$149 | Chat on landing page (product=ai-agent) |

## Previous Host (Render)

The old `server.py` (Python `http.server`) served all routes from one process. It supported GET /media/, GET /pulse/, and the POST handler. On Render this was necessary because the free tier couldn't serve static files independently. On Vercel, static files are handled at the CDN layer and the function only handles POST.
