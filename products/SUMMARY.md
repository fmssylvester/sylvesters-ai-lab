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
│   └── chat.js             # Node.js serverless function (POST /api/chat)
├── public/
│   ├── index.html          # Landing page (served from CDN instantly)
│   ├── media/              # Demo videos, product images (CDN)
│   ├── pulse/              # Pulse patient records demo (CDN)
│   └── ...                 # Product images/static assets
├── ai-agent-memory/        # AI Agent product files (not served)
├── ai-customer-support-agent/  # CS Agent product files (not served)
├── missed-call-sms/        # SMS Bot product files (not served)
├── patient-records-system/ # Patient Records product files (not served)
├── package.json            # Node.js project marker for Vercel detection
├── vercel.json             # Config: api/chat.js gets 30s maxDuration
└── SUMMARY.md              # This file
```

## Vercel Config (`vercel.json`)

- `public/` is served as static assets by Vercel CDN — no function invocation needed
- `api/chat.js` handles POST `/api/chat` for both chat messages and demo form submissions
- GET everything → CDN serves static files instantly
- Project rootDirectory set to `products/` so the site root is `public/index.html`

## Node.js Function (`api/chat.js`)

- CommonJS `module.exports` (Vercel auto-detects `.js` as Node.js)
- POST `/api/chat` handles two payload shapes:
  1. `{name, email, ...}` → lead capture (acknowledges form submission)
  2. `{message, conversationId, product?}` → AI chat (calls NVIDIA Nemotron-3 30B via fetch)
- `product` field selects system prompt ('cs-agent' or 'ai-agent')
- CORS headers on all responses
- Graceful fallback: if NVIDIA API fails, returns a friendly canned response
- No state (serverless — best-effort conversation continuity)
- MaxDuration: 30s (configured in vercel.json)

## Deployment

1. Push to GitHub (`main` branch)
2. Vercel auto-deploys (connected via GitHub integration)
3. Production URL: `https://sylvesterailab.vercel.app`
4. Env vars needed in Vercel dashboard: `NVIDIA_API_KEY`
5. Can also deploy via API: `POST /v13/deployments` with gitSource
6. Alias assignment: `POST /v1/deployments/{uid}/aliases` with `{"alias":"sylvesterailab.vercel.app"}`

## n8n Template Store

| Product | Gumroad | Price Range | Demo |
|---------|---------|-------------|------|
| AI Customer Support Agent | `/l/ai-customer-support-pro` | $29 | Chat on landing page |
| Missed Call SMS Text-Back | `/l/missed-call-sms-pro` | $29 | — |
| Patient Records System | `/l/patient-records-n8n` | $49–$197 | Pulse website |
| AI Agent with Memory & Tools | `/l/ai-agent-n8n` | $29–$149 | Chat on landing page (product=ai-agent) |

## History

- **Render (June–July 2026)**: Python `server.py` served everything from one process. 30s cold starts on free tier.
- **Vercel Python (July 2026)**: `api/index.py` (Flask) — worked initially but Python runtime on Vercel was unreliable (hanging/timeout during deployment).
- **Vercel Node.js (current)**: `api/chat.js` (CommonJS) — clean, fast, reliable. Minimal function that calls NVIDIA API via `fetch`.

**Migration pain points:**
- Vercel project was initially configured as `python` framework — had to PATCH to `null` for auto-detection
- Root directory `products/` requires `api/` inside it, not at repo root
- Empty `requirements.txt` triggered Python setup even with Node.js files — deleted
- Added `package.json` in `products/` to signal Node.js environment
- `vercel.json` `functions` block needed to match the actual file path (`api/chat.js`)
