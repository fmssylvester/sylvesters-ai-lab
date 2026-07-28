# Patient Records Quick Access System — n8n Template

## The Problem
- Small clinics have patient files scattered across paper, PDFs, and basic spreadsheets
- Doctors waste 5-10 minutes per patient just finding records
- No quick way to check medical history, allergies, or medications from a phone

## The Solution
A workflow where a doctor types a patient's name (or phone number) and gets an instant summary of that patient's medical records.

## How It Works (Architecture)

```
Doctor's Phone → WhatsApp/Telegram/SMS/Webhook
        ↓
   n8n Workflow
        ↓
   Search Google Sheets / Airtable / Database
        ↓
   AI Agent formats response
        ↓
   Returns structured patient summary
```

## What the Response Looks Like

**Input:** "Show me John Doe" or text patient ID "PT-1024"

**Output:**
```
🩺 PATIENT: John Doe | M | 45
📋 ID: PT-1024
━━━━━━━━━━━━━━━━━
⚠ ALLERGIES: Penicillin
💊 MEDICATIONS: Metformin 500mg, Lisinopril 10mg
🩸 BLOOD TYPE: O+
📅 LAST VISIT: June 12, 2026 — Routine checkup
🔜 NEXT APPT: Aug 3, 2026
🏥 ONGOING: Type 2 Diabetes, Hypertension
━━━━━━━━━━━━━━━━━
📝 Dr. notes: BP stable. Continue current meds.
```

## Delivery Channels

| Channel | How It Works | Best For |
|---|---|---|
| **Telegram Bot** | Doctor texts patient name → gets records | Best UX, free |
| **WhatsApp** | Via WhatsApp Business API | Everyone has WhatsApp |
| **SMS** | Text name → get records | No smartphone needed |
| **Web Dashboard** | Simple web page with search bar | Desktop use |

## Tech Stack (n8n)

- **Trigger:** Webhook / Telegram Trigger / WhatsApp Trigger
- **Database:** Google Sheets (free, easy setup) or Airtable (richer data)
- **Logic:** IF node to parse name/ID, Switch for multi-clinic
- **AI:** GPT-4o-mini formats the response cleanly
- **Output:** Respond to Webhook / Telegram Send Message / Twilio SMS

## Target Market

- Solo doctors and small clinics (Nigeria, Kenya, India — where EHR adoption is low)
- Dental practices
- Physiotherapy clinics
- Small hospitals with paper-based records
- Pharmacies (quick patient history lookup)

## Pricing Ideas

| Tier | What They Get | Price |
|---|---|---|
| **Basic** | Google Sheets, up to 500 patients, Telegram/SMS | ₦150k / $99 |
| **Pro** | Airtable, unlimited patients, WhatsApp + Telegram, voice search | ₦350k / $249 |
| **Setup + Training** | Data migration, staff training, 1 month support | ₦500k / $349 |

## Why This Sells Itself

Compare to EHR systems that cost ₦2M+ and take months to implement:
- Setup in 1 day
- Works on any phone
- Zero training needed (just text a name)
- $99 vs ₦2M

## Expansion Ideas

- **Voice search:** "Show me patient John Doe" → speech-to-text → search → response
- **Auto-scheduler:** "Book John for next Tuesday" → creates appointment
- **Prescription generator:** "Give John his usual prescription" → generates PDF
- **Multi-clinic:** One dashboard across multiple locations
- **Patient self-check-in:** Patient sends "I'm here" → auto-checks them in
