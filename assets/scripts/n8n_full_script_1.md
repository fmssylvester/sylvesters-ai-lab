# Video Script: n8n AI Customer Support Agent (Full) — n8n_full_script_1

> VO source: `assets/kiki.mp3` (90.9s, Kiki voice) · transcript: `transcripts/kiki.json`
> NOTE: The 90s voiceover was made from this script — it covers the avatar narration
> through the handoff at 01:30.9. Sections beyond that (node walkthroughs, live demo,
> recap) are screen-recording segments without VO.

## Intro — Hook (0:00 - 0:30)
VO: "What if every customer message your business received got an instant intelligent reply — even at 3am — without you lifting a finger? That's exactly what I built with n8n. In this video I'm going to show you step by step how I built it from scratch — every node, every configuration, every mistake I made along the way. My name is Sylvester. Welcome to Sylvester's AI Lab — where we build real AI automations, not theory."

## The Problem & The Solution (0:30 - 1:00)
VO: "Most small businesses lose customers simply because they reply too slow. Someone sends a message at 11pm and gets a reply the next morning. By then they've already gone to a competitor who responded faster. The solution isn't hiring more staff. The solution is automation. An AI agent that never sleeps, never misses a message, and knows when to escalate to a human."

VO: "Today we're building an AI Customer Support Agent using n8n and OpenAI. It receives customer messages through a webhook, processes them through an AI agent, detects sensitive requests like billing disputes or deletions, sends an escalation alert to your email, and returns a clean response — all in under 3 seconds."

## Handoff to Screen / Demo (1:00 - 1:30)
VO: "Before I show you how to build this let me show you what the finished product looks like in action. I'm switching to my screen now to show you a live demo on my landing page. Watch carefully — this is the exact workflow we're about to build together."

`[SCREEN RECORDING — Landing page demo]`
`[SCREEN RECORDING — n8n canvas]`

VO: "This is n8n. If you haven't used it before it's a free open source automation tool — think of it like Zapier but significantly more powerful and flexible. You can use n8n Cloud which has a free tier or self host it on your own server. Link is in the description. Let me walk you through each node one by one."

## Walkthrough - Node 1: Webhook (1:30 - 2:00)
VO: "This first node is the Webhook node. This is our entry point — the door that receives every incoming message. When someone sends a POST request to this URL from a website, a mobile app, a contact form, anything — this workflow instantly wakes up and starts processing. I've set the path to customer-support and configured it to only accept POST requests."

## Walkthrough - Node 2: AI Agent (2:00 - 2:45)
VO: "This is the AI Agent node — the brain of the entire workflow. It's connected to OpenAI's GPT model and this is where all the intelligence lives. Inside here is the system prompt — the instructions I gave the AI about how to behave. I told it to be a professional customer support agent, keep all responses under 100 words, be warm and concise, and never attempt to handle billing disputes, security issues, or account deletion requests itself. This system prompt is what separates a smart agent from a generic chatbot. You can customize it for any business just by changing the instructions."

## Walkthrough - Node 3: IF Node (2:45 - 3:15)
VO: "After the AI generates its response I added an IF node — the escalation detector. It checks the original customer message for sensitive keywords — delete, billing, security, refund, cancel, hack. If any of those words appear the TRUE branch fires. If it's a normal message the FALSE branch fires and the customer just receives the AI response directly. This is what makes the workflow intelligent rather than just automated."

## Walkthrough - Node 4: Gmail (3:15 - 3:45)
VO: "When the TRUE branch fires this Gmail node activates. It sends an immediate alert email to the business owner containing the customer's original message, the timestamp, and a note to follow up within 24 hours. The business owner only gets notified when something actually needs their attention. Everything else runs automatically."

## Walkthrough - Node 5: Webhook Response (3:45 - 4:15)
VO: "And finally this last node sends the response back to whoever called the webhook. It returns clean JSON — success true, the AI response, a conversation ID, and a timestamp. Ready to plug into any frontend or messaging platform."

`[SCREEN RECORDING — Live test in Hoppscotch]`

VO: "I'm going to send a normal message first — Hi what are your business hours. Status 200 — instant response. Clean professional reply under 100 words. Now the escalation test — I want to cancel my subscription immediately. Status 200 again — but this time the escalation message. And if I check Gmail right now the alert email arrived automatically with the full customer message inside. All green nodes on the canvas. Everything working exactly as designed."

## Summary & Outro (4:15 - End)
`[SWITCH BACK TO AVATAR]`

VO: "So let's recap what we just built together. A webhook that receives customer messages from any platform. An AI agent that processes them intelligently with a custom system prompt. An IF node that detects sensitive requests automatically. A Gmail alert that notifies the business owner instantly. And a webhook response that returns the answer in clean JSON. Five nodes. Built from scratch. Works 24 hours a day seven days a week without any human involvement."

VO: "If you want to skip the build and just import the ready-made version directly into your n8n account I've packaged this as a complete template. The link is in the description below. You can have this running in your business in under 5 minutes."

VO: "If you found this video useful please subscribe — I'm dropping new automation tutorials every week. Next video I'm building a Smart Booking Bot for music artists that automatically checks availability and replies to promoters with open dates. That one is going to be very interesting."

VO: "If you have questions about this workflow or want me to build a custom version for your specific business drop a comment below or reach out through the link in the description. See you in the next one."
