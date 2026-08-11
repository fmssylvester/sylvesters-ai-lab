# Storyboard: n8n AI Customer Support Agent — Avatar Segment (90s Kiki VO) — v2

- Script: `assets/scripts/n8n_full_script_1.md`
- Voiceover: `assets/kiki.mp3` (90.94s) · transcript: `transcripts/kiki.json`
- Scope: avatar narration 00:00.000 → 01:30.940. Screen-recording segments (01:30+
  in the script) are separate capture footage, stitched after frame 2728.
- fps: `30` | resolution: `1920x1080` | duration: 90.94s / 2728 frames
- Design system: `visual-direction.md` v1.0
- Props discipline: ALL logos/icons/UI elements are REAL asset-library SVGs.
  No logo or icon is drawn in code. Every path below was verified with `ls`.
- Director: Visual Director sub-agent

---

## Scene 01 — The Question (Hook)

| Field | Content |
|---|---|
| 1. Timestamp | `00:00.000 → 00:10.560` (frame 0–317) |
| 2. Voiceover | "What if every customer message your business received got an instant intelligent reply — even at 3am — without you lifting a finger? That's exactly what I built with n8n." |
| 3. Narrative purpose | `hook` |
| 4. Visual objective | The viewer now understands: a message arriving in the dark gets answered instantly — by automation. |
| 5. Primary visual | Glassmorphic chat message card (feature-card skin) with a message bubble + "3:00 AM" clock chip |
| 6. Secondary elements | (1) avatar bubble with `lucide/message-circle` icon; (2) "✓ replied" chip with `lucide/circle-check-big`; (3) `lucide/clock-3` chip flipping 11PM → 3AM; (4) n8n logo chip (in-card, small) |
| 7. Action | Card springs in from lower-left (up + right, 12f settle); text inside types word-by-word; clock chip flips 11:00 PM → 3:00 AM; "✓ replied" chip pops with spring overshoot at "without you lifting a finger" |
| 8. Camera & composition | Static wide frame, card center-left (rule of thirds). Parallax: bg 0.3x, particles 0.7x, card 1.0x. Subtle push-in (1.02x) during "exactly what I built" |
| 9. Props & assets | `assets/03_UI_ELEMENTS/Cards/feature-card.svg` · `assets/02_ICONS/lucide/message-circle.svg` · `assets/02_ICONS/lucide/circle-check-big.svg` · `assets/02_ICONS/lucide/clock-3.svg` · `assets/01_LOGOS/brand/n8n.svg` · bg: `assets/06_BACKGROUNDS/Dark/bg-dark-01.svg` + `assets/07_TEXTURES/Noise/noise.svg` |
| 10. Motion | Card entry: spring stiffness 180, damping 20, from (0,+60px), settle 12f, overshoot 4px. Clock flip at 8.5s. "✓ replied": spring stiffness 240, damping 14, scale 0→1.08→1.0, 8f |
| 11. Transition | In: `hard cut` · Out: `cross-dissolve + parallax` (16f) |
| 12. Text | Headline (72px): "instant reply, even at 3 AM" — "3 AM" cyan `#00D9FF`. Caption (20px) in card: "what if every message got answered?" No other highlights. Text anchored to card |
| 13. Sound design | "notification ding" at 8.5s (reply arrives); soft riser 0–2s; whoosh at 10.5s into the cut. Music: minimal, low energy |
| 14. Freesound search | `search "notification ding" --min-dur 0 --max-dur 3 --limit 5` → **id=571511** + `search "riser whoosh" --min-dur 0 --max-dur 4 --limit 5` → **id=511863** |
| 15. Emotional intent | Curiosity → the glimmer of "that could be me" relief |
| 16. Design compliance | Signature glassmorphic card; Void `#07090D` + Signal `#00D9FF` only; bg = gradient + bloom + noise (never flat); text anchored; z-order 0/10/50/100 |

---

## Scene 02 — The Promise

| Field | Content |
|---|---|
| 1. Timestamp | `00:11.520 → 00:22.080` (frame 346–662) |
| 2. Voiceover | "In this video I'm going to show you step by step how I built it from scratch — every node, every configuration, every mistake I made along the way. My name is Sylvester." |
| 3. Narrative purpose | `hook` (promise of value) |
| 4. Visual objective | The viewer now understands: this is a real build, transparently shown, mistakes included. |
| 5. Primary visual | n8n-style node diagram: 3 glassmorphic node cards (stat-card skin) connected by self-drawing lines, n8n logo as the workflow icon |
| 6. Secondary elements | (1) "step by step" numbered chips 01/02/03 (`lucide/badge-check` on each); (2) avatar chip with `lucide/user` + "Sylvester"; (3) `lucide/hourglass` chip (mistakes → time) |
| 7. Action | Node cards assemble left→right with spring stagger; connection lines draw themselves; chips pop in per step mention; avatar chip slides in at "My name is Sylvester" |
| 8. Camera & composition | Medium frame, diagram center. Slow parallax: bg 0.3x, diagram 0.7x. Slight zoom-out (1.05→1.0) as diagram completes |
| 9. Props & assets | `assets/03_UI_ELEMENTS/Cards/stat-card.svg` (×3) · `assets/01_LOGOS/brand/n8n.svg` · `assets/02_ICONS/lucide/badge-check.svg` · `assets/02_ICONS/lucide/user.svg` · `assets/02_ICONS/lucide/hourglass.svg` · bg: `assets/06_BACKGROUNDS/Abstract/bg-abstract-01.svg` + noise |
| 10. Motion | Line draw: strokeDashoffset 24f, Easing.out. Node cards: spring stiffness 150, damping 18, rise from (0,+40px), 12f, stagger 6f. Chips: spring stiffness 200, damping 22, 10f, stagger 4f |
| 11. Transition | In: `cross-dissolve + parallax` (16f) · Out: `hard cut` |
| 12. Text | Headline (64px): "step by step, from scratch" — "scratch" gold `#E7B84D`. Caption (18px): "every node · every config · every mistake". Avatar chip: "Sylvester" white |
| 13. Sound design | Typewriter ticks per connection (3, staggered); pop per chip; "digital pop" on completion; music lifts slightly |
| 14. Freesound search | `search "typewriter click" --min-dur 0 --max-dur 3 --limit 5` → **id=752747** + `search "digital pop" --min-dur 0 --max-dur 3 --limit 5` → **id=89535** |
| 15. Emotional intent | Anticipation + trust (he's showing everything) |
| 16. Design compliance | Diagram/flow signature (self-drawing connections, glassmorphic nodes); gold highlight rule; two text sizes; parallax 0.3/0.7/1.0 |

---

## Scene 03 — The Lab (Credibility)

| Field | Content |
|---|---|
| 1. Timestamp | `00:23.040 → 00:28.480` (frame 691–854) |
| 2. Voiceover | "Welcome to Sylvester's AI Lab, where we build real AI automations — not theory." |
| 3. Narrative purpose | `credibility` (brand open) |
| 4. Visual objective | The viewer now understands: this channel ships working automations. |
| 5. Primary visual | Brand lockup card (feature-card skin) with "AI LAB" wordmark + `lucide/atom` pulse icon |
| 6. Secondary elements | (1) "real builds" badge with `lucide/circle-check-big` (cyan); (2) "theory" badge with `lucide/alert-triangle` (gold, struck through); (3) `lucide/sparkles` accent |
| 7. Action | Lockup card springs from top (drop + settle); badges slide in from left/right; strikethrough line draws over "theory"; atom icon pulses (scale 1→1.15→1, 2s loop) |
| 8. Camera & composition | Centered symmetric frame (brand moment). Breathing zoom 1.0→1.03 over 5s; particles 0.7x |
| 9. Props & assets | `assets/03_UI_ELEMENTS/Cards/feature-card.svg` · `assets/02_ICONS/lucide/atom.svg` · `assets/02_ICONS/lucide/circle-check-big.svg` · `assets/02_ICONS/lucide/alert-triangle.svg` · `assets/02_ICONS/lucide/sparkles.svg` · bg: `assets/06_BACKGROUNDS/Mesh/bg-mesh-01.svg` + noise |
| 10. Motion | Card: spring stiffness 120, damping 14, from (0,-80px), settle 14f, overshoot 6px. Badges: spring stiffness 220, damping 20, 9f. Strikethrough: scaleX 0→1, 12f, Easing.out |
| 11. Transition | In: `hard cut` · Out: `cross-dissolve + parallax` (16f) |
| 12. Text | Headline (80px): "SYLVESTER'S AI LAB" — "AI" cyan. Caption (20px): "real AI automations, not theory" — "real" gold. Anchored in lockup card |
| 13. Sound design | "whoosh" on card drop; "digital pop" per badge; music resolves briefly (brand stinger) |
| 14. Freesound search | `search "whoosh" --min-dur 0 --max-dur 3 --limit 5` → **id=168119** + `search "digital pop" --min-dur 0 --max-dur 3 --limit 5` → **id=89535** |
| 15. Emotional intent | Trust + belonging |
| 16. Design compliance | Signature card; cyan/gold highlights; 2 sizes; gradient-mesh bg (never flat); z-order respected |

---

## Scene 04 — The Problem (Agitation)

| Field | Content |
|---|---|
| 1. Timestamp | `00:29.440 → 00:42.160` (frame 883–1265) |
| 2. Voiceover | "Most small businesses lose customers simply because they reply too slow. Someone sends a message at 11pm and gets a reply the next morning. By then they've already gone to a competitor who responded faster." |
| 3. Narrative purpose | `problem` + `agitate` |
| 4. Visual objective | The viewer now understands: slow replies are silently costing customers — this is uncomfortable. |
| 5. Primary visual | Data viz: two counter cards (stat-card) "replied in 12 hours" (gray) vs "replied in 2 min" (cyan) + a customer avatar drifting away |
| 6. Secondary elements | (1) `lucide/clock-3` chip "11:00 PM → 9:00 AM"; (2) competitor card with `lucide/trending-up` (green→cyan bar); (3) `lucide/user` customer avatar drifting right |
| 7. Action | Clock chip ticks; "12 hrs" counter counts up with heavy spring; customer avatar drifts right toward competitor card; your-business card dims (1→0.35) as competitor brightens |
| 8. Camera & composition | Two-column: business left / competitor right. Camera pushes left→right during "gone to a competitor"; bg 0.3x, counters 0.7x |
| 9. Props & assets | `assets/03_UI_ELEMENTS/Cards/stat-card.svg` (×2) · `assets/02_ICONS/lucide/clock-3.svg` · `assets/02_ICONS/lucide/trending-up.svg` · `assets/02_ICONS/lucide/user.svg` · bg: `assets/06_BACKGROUNDS/Dark/bg-dark-02.svg` + noise |
| 10. Motion | Counter: digit spring stiffness 90, damping 16, 15f per digit. Avatar drift: translateX 0→260px, 24f, Easing.inOut. Dim: opacity 1→0.35, 20f |
| 11. Transition | In: `cross-dissolve + parallax` (16f) · Out: `hard cut` at "responded faster" |
| 12. Text | Headline (60px): "slow reply = lost customer" — "lost" gold. Caption (18px): "11:00 PM sent → 9:00 AM reply". ≤2 highlights per sentence |
| 13. Sound design | Clock tick per tick; soft descending "error beep" at "lost customer"; whoosh on avatar drift; music: tension pulse |
| 14. Freesound search | `search "clock tick" --min-dur 0 --max-dur 3 --limit 5` → **id=534094** + `search "error beep alert" --min-dur 0 --max-dur 3 --limit 5` → **id=497710** |
| 15. Emotional intent | Alarm / mild discomfort (this is THEM) |
| 16. Design compliance | Spring data-viz counters (signature); gray=inactive, cyan/gold=active; text anchored; camera parallax |

---

## Scene 05 — The Solution

| Field | Content |
|---|---|
| 1. Timestamp | `00:43.040 → 00:48.720` (frame 1291–1462) |
| 2. Voiceover | "The solution isn't hiring more staff. The solution is automation." |
| 3. Narrative purpose | `solution` |
| 4. Visual objective | The viewer now understands: the fix is automation, not headcount. |
| 5. Primary visual | Two stacked cards (feature-card): "hire more staff" (gray, dims) vs "automation" (cyan glow, `lucide/bot` orb) |
| 6. Secondary elements | (1) `lucide/dollar-sign` chip "$ per hire" fading; (2) `lucide/zap` bolt on automation card; (3) `lucide/coins` chip |
| 7. Action | "staff" card dims + scales 0.9x with thud; "automation" card springs up, glow intensifies; money chips fade; particles converge on winning card |
| 8. Camera & composition | Stacked composition, lower card emphasized. Push-in 1.0→1.06 on automation card; bg 0.3x |
| 9. Props & assets | `assets/03_UI_ELEMENTS/Cards/feature-card.svg` (×2) · `assets/02_ICONS/lucide/bot.svg` · `assets/02_ICONS/lucide/zap.svg` · `assets/02_ICONS/lucide/dollar-sign.svg` · `assets/02_ICONS/lucide/coins.svg` · bg: `assets/06_BACKGROUNDS/Abstract/bg-abstract-02.svg` + noise |
| 10. Motion | Staff card: scale 1→0.9, opacity 1→0.3, 16f, Easing.in. Automation card: spring stiffness 160, damping 17, rise (0,+40px), 14f; glow opacity 0.4→0.9 loop |
| 11. Transition | In: `hard cut` · Out: `cross-dissolve + parallax` (16f) |
| 12. Text | Headline (64px): "the solution is automation" — "automation" cyan. Caption (18px): "not more staff" — struck through, gray |
| 13. Sound design | Low whoosh (thud) on staff dim; riser 8f into automation pop; pop on arrival; music lifts to hope |
| 14. Freesound search | `search "riser whoosh" --min-dur 0 --max-dur 4 --limit 5` → **id=511865** + `search "whoosh" --min-dur 0 --max-dur 3 --limit 5` → **id=168118** |
| 15. Emotional intent | Relief + hope |
| 16. Design compliance | Icon-in-card with brand-color glow; dimming via opacity; radial bg + bloom; 2 sizes; keyword rule |

---

## Scene 06 — The Agent's Promise

| Field | Content |
|---|---|
| 1. Timestamp | `00:48.720 → 00:54.480` (frame 1462–1634) |
| 2. Voiceover | "An AI agent that never sleeps, never misses a message, and knows when to escalate to a human." |
| 3. Narrative purpose | `solution` (value props) |
| 4. Visual objective | The viewer now understands the agent's three superpowers: awake, flawless, human-aware. |
| 5. Primary visual | Icon-in-card: `lucide/bot` core orb with 3 orbiting trait chips (`lucide/moon`, `lucide/circle-check-big`, `lucide/user`) |
| 6. Secondary elements | (1) "24/7" pulsing chip (`lucide/clock-3`); (2) "never misses" ticker (999 received / 0 missed); (3) `lucide/arrow-right` handoff arrow to human chip |
| 7. Action | Trait chips orbit into position with stagger; "24/7" pulses (scale 1.05, 2s loop); ticker counts 0→999 with spring; arrow draws from bot to human icon; human chip fades in |
| 8. Camera & composition | Centered, bot mid-frame. Slow zoom 1.0→1.04; bg particles 0.7x; glow bloom behind bot |
| 9. Props & assets | `assets/02_ICONS/lucide/bot.svg` · `assets/02_ICONS/lucide/moon.svg` · `assets/02_ICONS/lucide/circle-check-big.svg` · `assets/02_ICONS/lucide/user.svg` · `assets/02_ICONS/lucide/clock-3.svg` · `assets/02_ICONS/lucide/arrow-right.svg` · bg: `assets/06_BACKGROUNDS/Aurora/bg-aurora-01.svg` + noise |
| 10. Motion | Chips: spring stiffness 140, damping 16, orbit arc 24f each, stagger 8f. Ticker: digit spring stiffness 120, damping 15, 2f per count tick. Arrow: scaleX 0→1, 16f |
| 11. Transition | In: `cross-dissolve + parallax` (16f) · Out: `cross-dissolve + parallax` (16f) |
| 12. Text | Headline (60px): "never sleeps. never misses." — "never misses" cyan. Caption (18px): "knows when to escalate to a human" — "escalate" gold |
| 13. Sound design | Soft robot-glitch blip per chip; "notification ding" at 999; whoosh on arrow draw; music: confident mid-energy |
| 14. Freesound search | `search "robot voice glitch" --min-dur 0 --max-dur 4 --limit 5` → **id=365195** + `search "notification ding" --min-dur 0 --max-dur 3 --limit 5` → **id=466425** |
| 15. Emotional intent | Reassurance + capability |
| 16. Design compliance | Icon-in-card signature; cyan glow bot; gold on "escalate"; 2 sizes; never-flat bg; micro-interactions |

---

## Scene 07 — What We're Building (Pipeline Overview)

| Field | Content |
|---|---|
| 1. Timestamp | `00:55.440 → 01:09.840` (frame 1663–2095) |
| 2. Voiceover | "Today we're building an AI customer support agent using n8n and OpenAI. It receives customer messages through a webhook, processes them through an AI agent, detects sensitive requests like billing disputes or deletions, sends an escalation alert to your email..." |
| 3. Narrative purpose | `solution` (build roadmap) |
| 4. Visual objective | The viewer now understands the 4-stage pipeline and each node's role. |
| 5. Primary visual | Diagram/flow: horizontal pipeline [Webhook] → [AI Agent] → [Escalate?] → [Email] with REAL brand logos |
| 6. Secondary elements | (1) `lucide/webhook` node card (webhook); (2) OpenAI orb card (`01_LOGOS/AI/openai.svg`); (3) Gmail card (`01_LOGOS/brand/gmail.svg`); (4) animated packet dot on the line |
| 7. Action | Nodes assemble left→right with spring stagger; lines draw between; packet dot travels once at "receives → processes → detects"; escalate branch glows gold at "billing disputes or deletions"; email card pops at "alert to your email" |
| 8. Camera & composition | Wide horizontal frame; camera pans slowly left→right with packet travel; bg 0.3x, pipeline 0.7x |
| 9. Props & assets | `assets/02_ICONS/lucide/webhook.svg` · `assets/01_LOGOS/AI/openai.svg` · `assets/01_LOGOS/brand/gmail.svg` · `assets/01_LOGOS/brand/n8n.svg` · `assets/03_UI_ELEMENTS/Cards/stat-card.svg` (×5) · `assets/02_ICONS/lucide/zap.svg` · bg: `assets/06_BACKGROUNDS/Grid/bg-grid-01.svg` + noise |
| 10. Motion | Node entry: spring stiffness 150, damping 18, rise (0,+40px), 12f, stagger 6f. Lines: stroke draw 18f each. Packet: translateX 60f, Easing.inOut, glow trail |
| 11. Transition | In: `cross-dissolve + parallax` (16f) · Out: `cross-dissolve + parallax` (16f) |
| 12. Text | Headline (56px): "the build: 4 stages" — "4 stages" cyan. Node labels (20px captions): "webhook" · "AI agent" · "escalate?" · "email" · "reply" |
| 13. Sound design | Pop per node (5 staggered); soft whoosh per line draw; glitch blip at escalate; email ding at "alert to your email"; music builds |
| 14. Freesound search | `search "digital pop" --min-dur 0 --max-dur 3 --limit 5` → **id=89535** + `search "email notification pop" --min-dur 0 --max-dur 3 --limit 5` → **id=853892** |
| 15. Emotional intent | Clarity + growing excitement |
| 16. Design compliance | Diagram/flow signature; REAL brand logos (never drawn); cyan/gold on active; parallax; z-order |

---

## Scene 08 — Speed

| Field | Content |
|---|---|
| 1. Timestamp | `01:09.840 → 01:15.680` (frame 2095–2270) |
| 2. Voiceover | "...and returns a clean response, all in under 3 seconds." |
| 3. Narrative purpose | `solution` (closing proof) |
| 4. Visual objective | The viewer now understands: the pipeline is FAST — under 3 seconds, total. |
| 5. Primary visual | Data viz: giant count-up timer "2.8s" with stopwatch ring (`lucide/timer`) |
| 6. Secondary elements | (1) JSON chip popping "success: true" (`lucide/circle-check-big`); (2) 5-node mini diagram flashing complete; (3) `lucide/zap` speed lines |
| 7. Action | Ring draws (strokeDashoffset 60f); timer counts 5.0 → 2.8 with spring; JSON chip pops at "returns a clean response"; speed lines whoosh across bg; mini nodes flash green sequentially |
| 8. Camera & composition | Centered timer, push-in 1.0→1.05; speed lines 0.3x parallax |
| 9. Props & assets | `assets/02_ICONS/lucide/timer.svg` · `assets/02_ICONS/lucide/zap.svg` · `assets/02_ICONS/lucide/circle-check-big.svg` · `assets/03_UI_ELEMENTS/Cards/stat-card.svg` (mini nodes) · bg: `assets/06_BACKGROUNDS/Dark/bg-dark-03.svg` + noise |
| 10. Motion | Ring: 60f Easing.out. Digits: spring stiffness 200, damping 14, 4f per digit flip. JSON chip: spring stiffness 240, damping 13, scale 0→1.1→1.0, 8f |
| 11. Transition | In: `cross-dissolve + parallax` (16f) · Out: `cross-dissolve + parallax` (16f) |
| 12. Text | Headline (96px): "2.8 s" — cyan, biggest moment of the segment. Caption (20px): "webhook in → reply out" white |
| 13. Sound design | Fast clock ticks (6); riser into "2.8s" landing; big ding on JSON pop; whoosh after; music peak → calm |
| 14. Freesound search | `search "clock tick" --min-dur 0 --max-dur 3 --limit 5` → **id=57211** + `search "notification ding" --min-dur 0 --max-dur 3 --limit 5` → **id=571511** |
| 15. Emotional intent | Awe / "wow" (proof moment) |
| 16. Design compliance | Data-viz signature (spring counter); cyan headline; text over timer ring; speed lines texture; never-flat bg |

---

## Scene 09 — Handoff to Screen (Bridge)

| Field | Content |
|---|---|
| 1. Timestamp | `01:15.680 → 01:30.940` (frame 2270–2728) |
| 2. Voiceover | "Before I show you how to build this, let me show you what the finished product looks like in action. I'm switching to my screen now to show you a live demo on my landing page. Watch carefully — this is the exact workflow we're about to build together." |
| 3. Narrative purpose | `CTA` (transition to demo) |
| 4. Visual objective | The viewer now understands: the next segment is a real demo on a real landing page — watch closely. |
| 5. Primary visual | Device frame (desktop) showing the landing page with a chat widget bubble; cursor arrow entering |
| 6. Secondary elements | (1) "LIVE DEMO" gold pulsing badge; (2) `lucide/cursor` arrow; (3) browser chrome bar (`03_UI_ELEMENTS/Browser/chrome-logo.svg`) |
| 7. Action | Device frame scales up 0.6→1.0 filling screen by end; badge pulses; cursor moves in and clicks; at "watch carefully" frame edge-shrinks (out-grab for screen recording cut) |
| 8. Camera & composition | Device frame center; push-in 1.0→1.25 so frame fills view at end — preparing hard cut to real screen recording |
| 9. Props & assets | `assets/04_DEVICE_FRAMES/Desktop/desktop.svg` · `assets/03_UI_ELEMENTS/Browser/chrome-logo.svg` · `assets/02_ICONS/lucide/cursor.svg` · `assets/02_ICONS/lucide/message-circle.svg` · `assets/pages/openai_com.png` (page mockup — swap for the real landing page screenshot when available) · bg: `assets/06_BACKGROUNDS/Grid/bg-grid-02.svg` + noise |
| 10. Motion | Frame: spring stiffness 110, damping 15, scale 0.6→1.0, 30f. Cursor: translate to (200,120), 40f, Easing.inOut; click scale-down 3f |
| 11. Transition | In: `cross-dissolve + parallax` (16f) · Out: `hard cut` into screen recording at frame 2728 |
| 12. Text | Headline (60px): "watch this" — "watch" gold. Caption (18px): "live demo — landing page". Badge: "LIVE DEMO" gold, pulsing |
| 13. Sound design | Whoosh into frame; click SFX at cursor click; pulsing tick on badge; music: suspenseful, stops at hard cut |
| 14. Freesound search | `search "whoosh" --min-dur 0 --max-dur 3 --limit 5` → **id=168119** + `search "digital pop" --min-dur 0 --max-dur 3 --limit 5` → **id=89535** |
| 15. Emotional intent | Focus + anticipation |
| 16. Design compliance | Device frame from asset lib; gold emphasis only on badge; text anchored; push-in with parallax; planned hard cut seam |

---

## Props manifest (master list — all verified on disk)

| Scene | Element | Asset path |
|---|---|---|
| 01 | chat card | `assets/03_UI_ELEMENTS/Cards/feature-card.svg` |
| 01 | message icon | `assets/02_ICONS/lucide/message-circle.svg` |
| 01 | check icon | `assets/02_ICONS/lucide/circle-check-big.svg` |
| 01 | clock chip | `assets/02_ICONS/lucide/clock-3.svg` |
| 01,07 | n8n logo | `assets/01_LOGOS/brand/n8n.svg` |
| 02 | node cards | `assets/03_UI_ELEMENTS/Cards/stat-card.svg` |
| 02 | step badge | `assets/02_ICONS/lucide/badge-check.svg` |
| 02 | user chip | `assets/02_ICONS/lucide/user.svg` |
| 02 | hourglass | `assets/02_ICONS/lucide/hourglass.svg` |
| 03 | lab icon | `assets/02_ICONS/lucide/atom.svg` |
| 03 | alert icon | `assets/02_ICONS/lucide/alert-triangle.svg` |
| 03 | sparkles | `assets/02_ICONS/lucide/sparkles.svg` |
| 04 | counters | `assets/03_UI_ELEMENTS/Cards/stat-card.svg` |
| 04 | trend icon | `assets/02_ICONS/lucide/trending-up.svg` |
| 05 | bot orb | `assets/02_ICONS/lucide/bot.svg` |
| 05 | bolt | `assets/02_ICONS/lucide/zap.svg` |
| 05 | money chips | `assets/02_ICONS/lucide/dollar-sign.svg`, `assets/02_ICONS/lucide/coins.svg` |
| 06 | moon chip | `assets/02_ICONS/lucide/moon.svg` |
| 06 | handoff arrow | `assets/02_ICONS/lucide/arrow-right.svg` |
| 07 | webhook node | `assets/02_ICONS/lucide/webhook.svg` |
| 07 | OpenAI logo | `assets/01_LOGOS/AI/openai.svg` |
| 07 | Gmail logo | `assets/01_LOGOS/brand/gmail.svg` |
| 08 | timer ring | `assets/02_ICONS/lucide/timer.svg` |
| 09 | device frame | `assets/04_DEVICE_FRAMES/Desktop/desktop.svg` |
| 09 | browser chrome | `assets/03_UI_ELEMENTS/Browser/chrome-logo.svg` |
| 09 | cursor | `assets/02_ICONS/lucide/cursor.svg` |
| 09 | page mockup | `assets/pages/openai_com.png` (PROP-SWAP: replace with real landing page screenshot) |
| all | backgrounds | `assets/06_BACKGROUNDS/Dark/bg-dark-01..03.svg`, `Abstract/bg-abstract-01..02.svg`, `Mesh/bg-mesh-01.svg`, `Aurora/bg-aurora-01.svg`, `Grid/bg-grid-01..02.svg` |
| all | grain | `assets/07_TEXTURES/Noise/noise.svg` |

PROP-NEEDED (0): none — every path verified with `ls`.
PROP-SWAP (1): scene 09 page mockup → the real landing page screenshot from the screen recording.

---

## Production notes for the Remotion implementation

- fps 30 everywhere; `useCurrentFrame()` + `interpolate()`/`spring()` for ALL motion; register each scene composition in `src/Root.tsx`; `AbsoluteFill` root.
- Import SVGs via `@remotion/media` / `<Img src={staticFile('...')}>` — copy needed SVGs to `public/` (or use `staticFile`) — do NOT re-draw any logo or icon.
- Brand SVGs are simple-icons style (single color) → tint with `fill: #fff` and apply cyan/gold per design rules; n8n logo keeps its native color.
- Scene 09's out-cut is the seam to the screen recording: render scenes 01–09 as one composition (`AvatarNarration90s`), then splice `assets/screen/` footage after frame 2728.
- SFX download before render: `source /root/.freesound.env && python3 scripts/freesound.py download <id> assets/audio/sfx/<name>.mp3` for every id in the Freesound fields.
- Music: single bed, low-key ambient, energy ramps 01→08, resolves into suspense before the scene-09 cut.

---

STATUS: AWAITING APPROVAL
VERSION: v2
HISTORY:
- v1 (2026-08-11): initial storyboard — 9 scenes, code-drawn visuals described loosely.
- v2 (2026-08-11): props layer added — every scene now references REAL SVG assets from
  the library (logos, icons, cards, device frames, backgrounds); schema upgraded to 16
  fields with `Props & assets`; visual-director skill + checklist updated to enforce the
  no-code-drawn-props rule; all 25+ prop paths verified on disk.
