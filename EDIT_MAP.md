# EDIT MAP — "AI Customer Support Agent" (Full Script, 0–400s)

**Assembly model:** Remotion-first. One master composition `FullVideo` (~12000 frames @ 30fps) with `kiki.mp3` as the spine. Every lane is a `<Sequence>` timed to the transcript. One render = the finished video.

**Three lanes:**
- **MG** — motion graphics B-roll (code-driven). Full-frame.
- **AVATAR** — talking head (recorded). Layered via `<OffthreadVideo>`.
- **SCREEN** — screen recording of the live demo/n8n (recorded). Layered via `<OffthreadVideo>`.

Frame in/out = `round(seconds × 30)`. `len` = duration in frames.

| # | in–out (f) | len | lane | line | what's on screen |
|--|-----------|----|------|------|------------------|
| 1 | 0–137 | 137 | **MG** | "…every customer message…got an instant intelligent reply," | clay message pile $\rightarrow$ liquid-glass AI reply (`Seg1ClayGlass`) |
| 2 | 137–317 | 180 | **MG** | "even at 3 am, without you lifting a finger? That's exactly what I built with n8n." | 3AM glass clock, auto-replies fire, n8n reveal |
| 3 | 317–470 | 153 | **AVATAR** | "In this video I'm going to show you step by step how I built it from scratch," | you, talking to camera |
| 4 | 470–662 | 192 | **AVATAR** | "every node, every configuration, every mistake…My name is Sylvester." | you; MG lower-third name card on "Sylvester" |
| 5 | 662–854 | 192 | **MG** | "Welcome to Sylvester's AI Lab…real AI automations, not theory." | animated channel title card (clay/glass brand) |
| 6 | 854–1003 | 149 | **MG** | "Most small businesses lose customers…they reply too slow." | slow-reply concept: a message waiting, a clock dragging |
| 7 | 1003–1159 | 156 | **MG** | "Someone sends a message at 11 pm and gets a reply the next morning," | 11pm $\rightarrow$ sunrise; unread message sitting overnight |
| 8 | 1159–1265 | 106 | **MG** | "By then they've already gone to a competitor who responded faster." | customer icon slides from you $\rightarrow$ competitor |
| 9 | 1265–1433 | 168 | **MG** | "The solution isn't hiring more staff. The solution is automation." | staff icons dissolve $\rightarrow$ one glowing automation node |
| 10 | 1433–1634 | 201 | **MG** | "An AI agent that never sleeps, never misses a message, and knows when to escalate to a human." | 3 capability tiles: never sleeps / never misses / escalates |
| 11 | 1634–1807 | 173 | **MG** | "Today we're building an AI Customer Support Agent using n8n and OpenAI." | tools title: n8n + OpenAI logos lock together |
| 12 | 1807–1987 | 180 | **MG** | "It receives customer messages through a webhook, processes them through an AI agent," | architecture diagram — build stage 1: Webhook $\rightarrow$ AI Agent |
| 13 | 1987–2095 | 108 | **MG** | "detects sensitive requests like billing disputes or deletions," | diagram stage 2: branch $\rightarrow$ "sensitive?" detector |
| 14 | 2095–2270 | 175 | **MG** | "sends an escalation alert to your email, and returns a clean response, all in under 3 seconds." | diagram stage 3: escalation email + reply, "< 3s" stat |
| 15 | 2270–2402 | 132 | **AVATAR** | "Before I show you how to build this let me show you what the finished product looks like in action." | you, talking to camera |
| 16 | 2402–2551 | 149 | **AVATAR$\rightarrow$SCREEN** | "I'm switching to my screen now to show you a live demo on my landing page." | you $\rightarrow$ cut/push to screen |
| 17 | 2551–2702 | 151 | **SCREEN** | "Watch carefully — this is the exact workflow we're about to build together." | live screen recording (landing page demo) |
| 18 | 2702–3100 | 398 | **SCREEN** | "This is n8n. If you haven't used it before... think of it like Zapier but significantly more powerful." | n8n Canvas Wide shot |
| 19 | 3100–3400 | 300 | **SCREEN** | "You can use n8n Cloud which has a free tier or self host it on your own server." | Screen recording: Cloud vs Self-host options |
| 20 | 3400–3800 | 400 | **SCREEN** | "Let me walk you through each node one by one." | Screen recording: panning across the workflow |
| 21 | 3800–4400 | 600 | **SCREEN** | "This first node is the Webhook node... this workflow instantly wakes up and starts processing." | Zoom-in on Webhook node + configuration |
| 22 | 4400–5300 | 900 | **SCREEN** | "This is the AI Agent node — the brain... separates a smart agent from a generic chatbot." | Zoom-in on AI Agent node + System Prompt editor |
| 23 | 5300–6100 | 800 | **SCREEN** | "After the AI generates its response I added an IF node... rather than just automated." | Zoom-in on IF node + Logic branch explanation |
| 24 | 6100–6700 | 600 | **SCREEN** | "When the TRUE branch fires this Gmail node activates... Everything else runs automatically." | Zoom-in on Gmail node + Alert email example |
| 25 | 6700–7300 | 600 | **SCREEN** | "And finally this last node sends the response back... plug into any frontend or messaging platform." | Zoom-in on Webhook Response node + JSON output |
| 26 | 7300–7800 | 500 | **SCREEN** | "I'm going to send a normal message first... Clean professional reply under 100 words." | Screen recording: Hoppscotch Normal Request $\rightarrow$ Response |
| 27 | 7800–8400 | 600 | **SCREEN** | "Now the escalation test... but this time the escalation message." | Screen recording: Hoppscotch Escalation $\rightarrow$ Response |
| 28 | 8400–9000 | 600 | **SCREEN** | "And if I check Gmail right now... Everything working exactly as designed." | Screen recording: Gmail Inbox $\rightarrow$ Alert Email |
| 29 | 9000–9800 | 800 | **AVATAR** | "So let's recap what we just built together... without any human involvement." | you; summary tiles appear (Webhook / AI / IF / Gmail / Response) |
| 30 | 9800–10500 | 700 | **AVATAR** | "If you want to skip the build... you can have this running in your business in under 5 minutes." | you; Template link / Gumroad graphic pop-up |
| 31 | 10500–11200 | 700 | **AVATAR** | "If you found this video useful please subscribe... That one is going to be very interesting." | you; Subscribe button + Next Video teaser |
| 32 | 11200–12000 | 800 | **AVATAR** | "If you have questions... See you in the next one." | you; Outro / Contact links |
| 33 | 12000 | - | **END** | - | Final frame |
