## Template 1: AI Customer Support Agent

**Title:** AI Customer Support Agent — GPT-Powered Webhook Chatbot

**Category:** Customer Support / AI & Chat

**Short Description:** Deploy an AI customer support agent in minutes. Handles common inquiries, knows when to escalate, and responds via webhook. Powered by GPT (gpt-5-mini). (198 chars)

**Tags:** customer-support, ai-agent, chatbot, gpt, webhook

**Full Description:**
> Replace your basic FAQ bot with an intelligent support agent. This workflow receives customer messages via webhook, processes them through a GPT-powered AI agent with a professional support system prompt, and returns a helpful response.
>
> **Features:**
> - Webhook trigger (POST /customer-support) — easy integration with any platform
> - Professional AI agent with escalation logic (billing, security, account deletion)
> - Responds within seconds using OpenAI GPT-5-mini (free credits via n8n-managed API)
> - Clean JSON response ready for your frontend or messaging platform
> - Under 150-word responses — concise and on-brand
>
> **Use Cases:**
> - SaaS customer support automation
> - FAQ deflection for landing pages
> - Pre-sales inquiry handling
> - After-hours support triage
>
> **Requirements:**
> - n8n Cloud (0.1.0+) or n8n self-hosted (2.31+)
> - OpenAI API key (or use n8n's free managed credits — no key needed on n8n Cloud)
>
> **Setup:**
> 1. Import the JSON into n8n
> 2. Activate the webhook
> 3. Point your app to `https://your-n8n/webhook/customer-support`
> 4. Done

**Screenshot Suggestion:** Take a screenshot of the n8n canvas showing the 4-node workflow layout (Webhook → AI Agent → OpenAI Model → Respond to Webhook).

---

## Template 2: Missed Call SMS Text-Back for Appointment Businesses

**Title:** Missed Call SMS Text-Back — AI-Powered Appointment Reply

**Category:** SMS / Appointment Reminders

**Short Description:** Automatically send a warm SMS reply when you miss a call. AI generates the message, Twilio sends it. Perfect for dentists, salons, clinics. (159 chars)

**Tags:** sms, twilio, missed-call, appointments, ai-agent

**Full Description:**
> Never leave a missed call hanging. This workflow detects missed calls via webhook, formats the caller data, generates a friendly SMS reply using AI, and sends it through Twilio — all automatically.
>
> **Features:**
> - Webhook trigger (POST /missed-call) — works with any phone system
> - AI-generated SMS replies — warm, professional, under 160 characters
> - Auto-formats caller data (phone, business name, timestamp)
> - Twilio SMS delivery built in
> - JSON response for logging
>
> **Use Cases:**
> - Dental and medical clinics
> - Hair salons and barbershops
> - Auto repair shops
> - Any appointment-based business
>
> **Requirements:**
> - n8n Cloud (0.1.0+) or n8n self-hosted (2.31+)
> - OpenAI API key (or n8n's free managed credits on n8n Cloud)
> - Twilio account with SMS-enabled number
>
> **Setup:**
> 1. Import the JSON into n8n
> 2. Connect your Twilio number in the Send SMS node
> 3. Point your phone system to `https://your-n8n/webhook/missed-call`
> 4. Test with a sample missed-call payload

**Screenshot Suggestion:** Screenshot of the 5-node workflow (Webhook → Format Data → AI Agent → OpenAI Model → Respond to Webhook). Optionally show a sample SMS response.
