# n8n Template Store Strategy

## Market Overview

| Source | Scope | Avg Price |
|--------|-------|-----------|
| **n8n official library** | 10,700+ templates (July 2026) — 70% AI-categorized | Free |
| **n8n.markets** | 850+ paid templates | $29–$99 |
| **Gumroad** | Massive bundles (2k–8k templates) | $5–$30 (bundles) |
| **Reddit r/n8n** | Daily requests for specific automations | N/A |

### Key Insight
The market is bifurcated: **cheap bundles** (thousands of templates for <$30) and **premium single templates** ($49–$249). The middle ground is crowded. Our strategy: **premium-tier, well-documented, business-ready templates** at $49–$197.

---

## Top-Selling Categories (highest demand)

### 1. AI & LLM (70% of n8n official templates)
- **AI Agents** with memory, tools, multi-step reasoning
- **RAG chatbots** (PDF/website → vector DB → LLM)
- **Document processing** (OCR → classify → extract → route)
- **Content generation** (blog, social, email, product descriptions)
- **Summarization** (meetings, articles, reports, transcripts)
- **AI email triage** (auto-respond, categorize, route)

### 2. Lead Generation (most consistently requested)
- **Scraping + enrichment** (Apollo, LinkedIn, Hunter, Clearbit)
- **LinkedIn outreach** (profile scrape → qualify → sequence)
- **Google Maps lead finder** (scrape → CSV → CRM)
- **Website visitor ID** → email finder → outreach
- **Reddit monitoring** → leads → CRM

### 3. Customer Support
- **AI email triage** (auto-categorize + respond + escalate)
- **Multi-channel support** (email + WhatsApp + chat → unified inbox)
- **FAQ bot** (website scrape → vector store → auto-answer)
- **Support ticket routing** (sentiment + urgency + department)

### 4. Sales & CRM
- **Lead enrichment** (email → company data → score)
- **Deal stage tracking** (activity → stage update → notify)
- **HubSpot/Salesforce sync** with spreadsheets
- **Meeting scheduling** (Calendly → confirm → remind → follow-up)

### 5. Marketing
- **Content repurposing** (blog → social posts → email → podcast script)
- **Social media scheduling** (cross-platform posting)
- **Email campaigns** (segment → personalize → send → track)
- **Review monitoring** (scrape → alert → respond)

### 6. E-commerce
- **Abandoned cart recovery** (trigger → email/SMS sequence)
- **Order processing** (Shopify → email → inventory → tracking)
- **Review monitoring** (product reviews → sentiment → alerts)
- **Post-purchase follow-up** (delivery tracking → feedback request)

### 7. Document Ops
- **Invoice processing** (email → extract → accounting software)
- **PDF classification + routing** (OCR → classify → send to team)
- **Contract review** (upload → LLM clauses → redline)
- **Resume parser** (email → extract → rank → CRM)

### 8. Real Estate
- **Lead follow-up** (inquiry → auto-respond → schedule showing)
- **Property listing automation** (MLS → website → social)
- **Client nurturing** (buyer criteria → matching listings → alerts)

### 9. Healthcare (high value, niche)
- **Patient records lookup** ✅ *(we have this)*
- **Appointment reminders** (schedule → SMS/email confirm → follow-up)
- **Referral management** (provider → patient → insurance)

### 10. Local Business
- **Review request automation** (post-service → SMS review link)
- **Google Maps scrape** (leads → CRM)
- **Appointment booking** (web → calendar → confirm → remind)

---

## Reddit r/n8n — Specific Requests (unserved or underserved)

| Request | Frequency | Gap |
|---------|-----------|-----|
| Service-based business automation (clinics, auto shops, agencies) | High | No focused template — requires HIPAA/industry adaptation |
| Multi-channel communication (WhatsApp + Telegram + SMS) | High | Twilio API setup is complex — template would save hours |
| AI agents with persistent memory | Medium | Complex setup — requires vector store + session management |
| Document classification + routing | High | Very few good templates; everyone builds custom |
| Invoice/expense processing | High | Lots of partial solutions, no polished complete template |
| Content repurposing pipeline | Medium | Blog→social→email—lots of pieces, no turnkey solution |
| Reddit monitoring for leads | Medium | Niche but very specific ask |
| Real estate lead follow-up | Medium | Many RE agents on n8n, few templates |

---

## Pricing Strategy

| Tier | Price | What's Included | Target |
|------|-------|-----------------|--------|
| **Essentials** | $14–$49 | Workflow JSON, basic README | Beginners, single use-case |
| **Professional** | $49–$97 | JSON + setup guide + screenshots + video | Small businesses |
| **Enterprise** | $97–$249 | All above + custom branding + priority support + Zapier/make comparison | Agencies, power users |

### Bundle Strategy
Consider a **"Complete n8n AI Toolkit"** bundle of 10 premium templates for $197 — positioned against $5-for-8000-template bundles with the promise of *quality, documentation, and support*.

---

## Recommendation: Next 5 Templates to Build

Ranked by demand × differentiation × build effort:

### 1. AI Agent with Memory & Tools
- **Why**: 70% of n8n library, #1 Reddit request, massive search volume
- **What**: OpenAI Agents SDK + vector store memory + web search tool + calculator
- **Tier**: Professional ($79) / Enterprise ($149)
- **Differentiation**: Complete setup guide, pre-configured Pinecone/Qdrant, custom knowledge base loading

### 2. Multi-Channel Communication Hub
- **Why**: High Reddit demand, complex setup barrier, recurring need
- **What**: WhatsApp Business API + Telegram + SMS (Twilio) → unified inbox → AI auto-respond
- **Tier**: Professional ($97) / Enterprise ($197)
- **Differentiation**: Single webhook receiver, message history DB, AI triage per channel

### 3. Lead Enrichment + Outreach Engine
- **Why**: Lead gen is #2 category; pays for itself immediately
- **What**: Website form/email → Apollo/LeadIQ enrichment → score → personalized outreach sequence
- **Tier**: Professional ($97) / Enterprise ($197)
- **Differentiation**: Pre-built email templates, A/B subject lines, reply detection

### 4. Invoice Processing Pipeline
- **Why**: Consistent Reddit requests, document ops is underserved
- **What**: Email attachment → OCR (LLM vision) → extract fields → accounting software (QuickBooks/Xero) → folder organize
- **Tier**: Essentials ($49) / Professional ($79)
- **Differentiation**: Works with any accounting software via webhook, error handling for bad scans

### 5. Content Repurposing Machine
- **Why**: Marketers pay for this, n8n makes it easy, existing templates are basic
- **What**: Blog post → LLM rewrite → LinkedIn/Twitter threads → email newsletter → podcast script
- **Tier**: Professional ($49) / Enterprise ($97)
- **Differentiation**: Brand voice configuration, platform-optimized formatting, scheduled posting

---

## Distribution Strategy

1. **Gumroad** — primary sales channel (existing setup)
2. **n8n.markets** — list every template for discoverability (n8n community searches here)
3. **sylvesterlab.onrender.com** — landing page hub (existing)
4. **Reddit** — share workflow screenshots + free snippet → link to paid template (don't spam — genuine value posts)
5. **YouTube short** — 60s walkthrough of each template (drives Gumroad traffic)
6. **Free lead magnet** — 1 simple template (e.g., "AI Email Summarizer") requiring email → upsell to paid

---

## Immediate Action Items

- [ ] Finalize next template to build (recommendation: **AI Agent with Memory**)
- [ ] Build template in n8n + documentation
- [ ] Record demo video (Remotion pattern)
- [ ] Upload to Gumroad with edition tiers
- [ ] List on n8n.markets
- [ ] Add to landing page
- [ ] Post on Reddit r/n8n with workflow screenshot + value walkthrough
