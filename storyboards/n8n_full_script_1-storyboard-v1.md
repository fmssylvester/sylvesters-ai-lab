# Storyboard: n8n AI Customer Support Agent — Avatar Segment (90s Kiki VO)

- Script: `assets/scripts/n8n_full_script_1.md`
- Voiceover: `assets/kiki.mp3` (90.94s) · transcript: `transcripts/kiki.json`
- Scope: this storyboard covers the **avatar narration** 00:00.000 → 01:30.940 only.
  The screen-recording walkthrough segments (01:30+ in the script) are produced
  separately as screen-capture footage and stitched in after.
- fps: `30` | resolution: `1920x1080` | duration: 90.94s / 2728 frames
- Design system: `visual-direction.md` v1.0
- Director: Visual Director sub-agent

---

## Scene 01 — The Question (Hook)

| Field | Content |
|---|---|
| 1. Timestamp | `00:00.000 → 00:10.560` (frame 0–317) |
| 2. Voiceover | "What if every customer message your business received got an instant intelligent reply — even at 3am — without you lifting a finger? That's exactly what I built with n8n." |
| 3. Narrative purpose | `hook` |
| 4. Visual objective | The viewer now understands: a message arriving in the dark gets answered instantly — by automation. |
| 5. Primary visual | Glassmorphic chat message card entering screen (signature card, 16-24px radius, blur(12px), 1px rgba(255,255,255,0.08) border) |
| 6. Secondary elements | (1) small avatar bubble with "3:00 AM" clock chip; (2) cyan "✓ replied" chip that snaps in; (3) drifting ambient particles behind |
| 7. Action | Card springs in from lower-left (up + right, 12f settle); text inside types word-by-word; clock chip ticks 11:00 PM → 3:00 AM; "✓ replied" chip pops in with spring overshoot at "without you lifting a finger" |
| 8. Camera & composition | Static wide frame, card center-left (rule of thirds). Parallax: bg radial bloom 0.3x, particles 0.7x, card 1.0x. Subtle push-in (1.02x) during "exactly what I built" |
| 9. Motion | Card entry: spring stiffness 180, damping 20, direction from (0, +60px), settle 12f, overshoot 4px. Clock chip flip at 8.5s. "✓ replied": spring stiffness 240, damping 14, scale 0→1.08→1.0, 8f |
| 10. Transition | In: `hard cut` (video start) · Out: `cross-dissolve + parallax` (16f) |
| 11. Text | Headline (72px): "instant reply, even at 3 AM" — "3 AM" in cyan `#00D9FF`. Caption (20px) inside card: "what if every message got answered?" — no other highlights. Text anchored to card, never center-float |
| 12. Sound design | VO carries; "notification ding" at 8.5s (reply arrives); soft riser 0–2s under hook; whoosh at 10.5s leading into cut. Music: minimal, low energy |
| 13. Freesound search | `search "notification ding" --min-dur 0 --max-dur 3 --limit 5` → **id=571511** (0.7s LowDing) + `search "riser whoosh" --min-dur 0 --max-dur 4 --limit 5` → **id=511863** |
| 14. Emotional intent | Curiosity → the glimmer of "that could be me" relief |
| 15. Design compliance | Signature glassmorphic card; palette Void `#07090D` + Signal `#00D9FF` only; bg = radial gradient + cyan bloom (never flat); text has visual anchor; layer order z-0 bg / z-10 particles / z-50 card / z-100 text |

---

## Scene 02 — The Promise

| Field | Content |
|---|---|
| 1. Timestamp | `00:11.520 → 00:22.080` (frame 346–662) |
| 2. Voiceover | "In this video I'm going to show you step by step how I built it from scratch — every node, every configuration, every mistake I made along the way. My name is Sylvester." |
| 3. Narrative purpose | `hook` (promise of value) |
| 4. Visual objective | The viewer now understands: this is a real build, transparently shown, mistakes included. |
| 5. Primary visual | Icon-in-card: n8n-style node diagram (3 glassmorphic rounded nodes connected by self-drawing lines) |
| 6. Secondary elements | (1) "step by step" numbered chips 01/02/03; (2) avatar chip with "Sylvester" label; (3) small "scratch → built" progress bar |
| 7. Action | Node diagram draws itself (lines stroke 0→1 width, 20f each, staggered); chips pop in one per step mention; progress bar fills 0→100% spring with bounce at "built it from scratch"; name chip slides in at "My name is Sylvester" |
| 8. Camera & composition | Medium frame, diagram center. Slow parallax drift: bg 0.3x, diagram 0.7x. Slight zoom-out (1.05→1.0) as diagram completes |
| 9. Motion | Line draw: strokeDashoffset animated 24f, Easing.out. Progress bar: spring stiffness 150, damping 18, fill 10f, bounce 2px on settle. Chips: spring stiffness 200, damping 22, rise 20px, 10f stagger 4f |
| 10. Transition | In: `cross-dissolve + parallax` (16f) · Out: `hard cut` |
| 11. Text | Headline (64px): "step by step, from scratch" — "scratch" in gold `#E7B84D`. Caption (18px): "every node · every config · every mistake". Name chip: "Sylvester" white, no color |
| 12. Sound design | Typewriter ticks per node connection (3 clicks, staggered); pop per chip; subtle "digital pop" on progress completion; music lifts slightly (promise energy) |
| 13. Freesound search | `search "typewriter click" --min-dur 0 --max-dur 3 --limit 5` → **id=752747** + `search "digital pop" --min-dur 0 --max-dur 3 --limit 5` → **id=89535** |
| 14. Emotional intent | Anticipation + trust (he's showing everything) |
| 15. Design compliance | Diagram/flow signature element; self-drawing connections per visual-direction.md; gold highlight rule (1-2 words max); two text sizes only; parallax on camera move 0.3/0.7/1.0 |

---

## Scene 03 — The Lab (Credibility)

| Field | Content |
|---|---|
| 1. Timestamp | `00:23.040 → 00:28.480` (frame 691–854) |
| 2. Voiceover | "Welcome to Sylvester's AI Lab, where we build real AI automations — not theory." |
| 3. Narrative purpose | `credibility` (brand open) |
| 4. Visual objective | The viewer now understands: this channel ships working automations. |
| 5. Primary visual | Brand lockup card: glassmorphic card with "AI LAB" wordmark + animated node pulse |
| 6. Secondary elements | (1) "real builds" badge with cyan check; (2) "theory" badge struck through, gold; (3) ambient particle field brightening |
| 7. Action | Lockup card springs in from top (drop + settle); "real builds" badge slides from left; "theory" badge slides from right, strikethrough line draws over it; node pulse: inner dot scales 1→1.4→1 every 2s |
| 8. Camera & composition | Centered symmetric frame (brand moment). Gentle breathing zoom 1.0→1.03 over 5s; particles 0.7x drift |
| 9. Motion | Card entry: spring stiffness 120, damping 14, from (0,-80px), settle 14f, overshoot 6px. Badges: spring stiffness 220, damping 20, 9f. Strikethrough: line scaleX 0→1, 12f, Easing.out |
| 10. Transition | In: `hard cut` · Out: `cross-dissolve + parallax` (16f) |
| 11. Text | Headline (80px): "SYLVESTER'S AI LAB" — "AI" in cyan. Caption (20px): "real AI automations, not theory" — "real" gold. Text inside lockup card, anchored |
| 12. Sound design | Single "whoosh" on card drop; "digital pop" per badge; music resolves briefly (brand stinger feel) |
| 13. Freesound search | `search "whoosh" --min-dur 0 --max-dur 3 --limit 5` → **id=168119** + `search "digital pop" --min-dur 0 --max-dur 3 --limit 5` → **id=89535** |
| 14. Emotional intent | Trust + belonging (you're in the right lab) |
| 15. Design compliance | Signature card; palette cyan/gold highlights on white text; 2 text sizes; never-flat bg (noise-textured gradient here); z-order respected |

---

## Scene 04 — The Problem (Agitation)

| Field | Content |
|---|---|
| 1. Timestamp | `00:29.440 → 00:42.160` (frame 883–1265) |
| 2. Voiceover | "Most small businesses lose customers simply because they reply too slow. Someone sends a message at 11pm and gets a reply the next morning. By then they've already gone to a competitor who responded faster." |
| 3. Narrative purpose | `problem` + `agitate` |
| 4. Visual objective | The viewer now understands: slow replies are silently costing them customers — this is uncomfortable. |
| 5. Primary visual | Data visualization: two counter rows "replied in 12 hours" (gray) vs "replied in 2 min" (cyan) + a customer avatar that walks away |
| 6. Secondary elements | (1) clock chip "11:00 PM" → "9:00 AM"; (2) competitor card with green "replied in 2 min" bar; (3) red-ish dust particles (desaturated, low opacity) |
| 7. Action | Clock chip ticks; "12 hrs" counter counts up with heavy spring; customer avatar drifts right toward competitor card; your-business card dims (opacity 1→0.35) as competitor brightens |
| 8. Camera & composition | Two-column layout, business left / competitor right. Camera pushes slowly left→right during "gone to a competitor"; bg parallax 0.3x, counters 0.7x |
| 9. Motion | Counter: digits roll via spring stiffness 90, damping 16, 15f per digit. Avatar drift: translateX 0→260px, 24f, Easing.inOut. Dim: opacity 1→0.35, 20f. All frame-synced |
| 10. Transition | In: `cross-dissolve + parallax` (16f) · Out: `hard cut` at "responded faster" |
| 11. Text | Headline (60px): "slow reply = lost customer" — "lost" in gold. Caption (18px): "11:00 PM sent → 9:00 AM reply". Keyword highlight max 2 per sentence |
| 12. Sound design | Clock tick SFX per tick; descending "error beep" at "lost customer" (soft); whoosh at avatar drift; music: tension, low pulse |
| 13. Freesound search | `search "clock tick" --min-dur 0 --max-dur 3 --limit 5` → **id=534094** + `search "error beep alert" --min-dur 0 --max-dur 3 --limit 5` → **id=497710** |
| 14. Emotional intent | Alarm / mild discomfort (this is THEM) |
| 15. Design compliance | Spring data-viz counters (signature); gray = inactive, cyan/gold = active per palette rules; text anchored to counters; camera parallax |

---

## Scene 05 — The Solution

| Field | Content |
|---|---|
| 1. Timestamp | `00:43.040 → 00:48.720` (frame 1291–1462) |
| 2. Voiceover | "The solution isn't hiring more staff. The solution is automation." |
| 3. Narrative purpose | `solution` |
| 4. Visual objective | The viewer now understands: the fix is automation, not headcount. |
| 5. Primary visual | Two stacked cards: "hire more staff" (gray, dims) vs "automation" (cyan, glows) — the automation card wins |
| 6. Secondary elements | (1) money chip "$ per hire" fading; (2) robot-orb icon (cyan glow) on automation card; (3) particles converging toward winning card |
| 7. Action | "staff" card dims + scales down (0.9x) with thud; "automation" card springs up, glow intensifies; money chip fades; particles converge |
| 8. Camera & composition | Stacked composition, lower card emphasized. Push-in 1.0→1.06 on automation card during second sentence; bg 0.3x |
| 9. Motion | Staff card: scale 1→0.9, opacity 1→0.3, 16f, Easing.in. Automation card: spring stiffness 160, damping 17, rise from (0,+40px), 14f, glow opacity 0.4→0.9 loop |
| 10. Transition | In: `hard cut` · Out: `cross-dissolve + parallax` (16f) |
| 11. Text | Headline (64px): "the solution is automation" — "automation" cyan. Caption (18px): "not more staff" — struck-through, gray |
| 12. Sound design | Thud (low whoosh) on staff-card dim; rising "riser" 8f into automation card pop; pop on card arrival; music shifts to hopeful lift |
| 13. Freesound search | `search "riser whoosh" --min-dur 0 --max-dur 4 --limit 5` → **id=511865** + `search "whoosh" --min-dur 0 --max-dur 3 --limit 5` → **id=168118** |
| 14. Emotional intent | Relief + hope (there IS a fix) |
| 15. Design compliance | Icon-in-card with brand-color glow (cyan); dimming = weight via opacity; bg radial gradient + bloom; 2 sizes; keyword rule |

---

## Scene 06 — The Agent's Promise

| Field | Content |
|---|---|
| 1. Timestamp | `00:48.720 → 00:54.480` (frame 1462–1634) |
| 2. Voiceover | "An AI agent that never sleeps, never misses a message, and knows when to escalate to a human." |
| 3. Narrative purpose | `solution` (value props) |
| 4. Visual objective | The viewer now understands the agent's three superpowers: awake, flawless, human-aware. |
| 5. Primary visual | Icon-in-card: robot-orb core with 3 orbiting trait chips (moon, checkmark, person) |
| 6. Secondary elements | (1) "24/7" pulsing chip; (2) "never misses" ticker row (0 missed / 999 received); (3) "escalate → human" handoff arrow |
| 7. Action | Three trait chips orbit into position with stagger; "24/7" chip pulses (scale 1.05 loop, 2s); ticker counts received 0→999 with spring; handoff arrow draws from bot to human icon; human icon fades in |
| 8. Camera & composition | Centered, bot mid-frame. Slow zoom 1.0→1.04; bg particles 0.7x; glow blooms behind bot |
| 9. Motion | Chips: spring stiffness 140, damping 16, orbit arc 24f each, stagger 8f. Ticker: digit spring stiffness 120, damping 15, 2f per count-up tick. Arrow: scaleX 0→1, 16f |
| 10. Transition | In: `cross-dissolve + parallax` (16f) · Out: `cross-dissolve + parallax` (16f) |
| 11. Text | Headline (60px): "never sleeps. never misses." — "never misses" cyan. Caption (18px): "knows when to escalate to a human" — "escalate" gold |
| 12. Sound design | Soft robot-glitch blip per chip; "notification ding" at 999 count; whoosh on arrow draw; music: confident mid-energy |
| 13. Freesound search | `search "robot voice glitch" --min-dur 0 --max-dur 4 --limit 5` → **id=365195** + `search "notification ding" --min-dur 0 --max-dur 3 --limit 5` → **id=466425** |
| 14. Emotional intent | Reassurance + capability (this thing WORKS) |
| 15. Design compliance | Icon-in-card signature; cyan glow bot; gold on "escalate" (emphasis); 2 sizes; never-flat bg; micro-interactions per motion principles |

---

## Scene 07 — What We're Building (Pipeline Overview)

| Field | Content |
|---|---|
| 1. Timestamp | `00:55.440 → 01:09.840` (frame 1663–2095) |
| 2. Voiceover | "Today we're building an AI customer support agent using n8n and OpenAI. It receives customer messages through a webhook, processes them through an AI agent, detects sensitive requests like billing disputes or deletions, sends an escalation alert to your email..." |
| 3. Narrative purpose | `solution` (build roadmap) |
| 4. Visual objective | The viewer now understands the 4-stage pipeline and each node's role. |
| 5. Primary visual | Diagram/flow: horizontal pipeline — [Webhook] → [AI Agent] → [Escalate?] → [Email] + [Reply] |
| 6. Secondary elements | (1) n8n-style node cards (glassmorphic, rounded); (2) OpenAI orb; (3) Gmail icon chip; (4) animated packet dot traveling the line |
| 7. Action | Nodes assemble left→right with stagger (spring); connection lines draw between them; packet dot travels line once at "receives → processes → detects"; escalate branch glows gold briefly at "billing disputes or deletions"; email chip pops at "alert to your email" |
| 8. Camera & composition | Wide horizontal frame; camera pans slowly left→right with packet travel; bg 0.3x, pipeline 0.7x |
| 9. Motion | Node entry: spring stiffness 150, damping 18, slide from (0,+40px), 12f stagger 6f. Lines: stroke draw 18f each. Packet: translateX across 60f, Easing.inOut, glow trail |
| 10. Transition | In: `cross-dissolve + parallax` (16f) · Out: `cross-dissolve + parallax` (16f) |
| 11. Text | Headline (56px): "the build: 4 stages" — "4 stages" cyan. Node labels: "webhook", "AI agent", "escalate?", "email", "reply" (20px captions, white) |
| 12. Sound design | Pop per node arrival (5 pops staggered); soft whoosh per line draw; glitch blip at escalate highlight; email notification ding at "alert to your email"; music: building momentum |
| 13. Freesound search | `search "digital pop" --min-dur 0 --max-dur 3 --limit 5` → **id=89535** + `search "email notification pop" --min-dur 0 --max-dur 3 --limit 5` → **id=853892** |
| 14. Emotional intent | Clarity + growing excitement (I can follow this) |
| 15. Design compliance | Diagram/flow signature (self-drawing connections, glassmorphic nodes); cyan/gold only for active elements; camera parallax; z-order |

---

## Scene 08 — Speed

| Field | Content |
|---|---|
| 1. Timestamp | `01:09.840 → 01:15.680` (frame 2095–2270) |
| 2. Voiceover | "...and returns a clean response, all in under 3 seconds." |
| 3. Narrative purpose | `solution` (closing proof) |
| 4. Visual objective | The viewer now understands the pipeline is FAST — under 3 seconds, total. |
| 5. Primary visual | Data visualization: giant count-up timer "2.8s" with stopwatch ring |
| 6. Secondary elements | (1) JSON chip popping "success: true" at end; (2) 5-node mini diagram that flashes complete; (3) cyan speed lines |
| 7. Action | Ring draws (strokeDashoffset 60f); timer digits count 5.0 → 2.8 with spring; JSON chip pops at "returns a clean response"; speed lines whoosh across bg; mini nodes flash green sequentially |
| 8. Camera & composition | Centered timer, slight push-in 1.0→1.05; speed lines 0.3x parallax in bg |
| 9. Motion | Ring: 60f Easing.out. Digits: spring stiffness 200, damping 14, each digit flip 4f. JSON chip: spring stiffness 240, damping 13, scale 0→1.1→1.0, 8f |
| 10. Transition | In: `cross-dissolve + parallax` (16f) · Out: `cross-dissolve + parallax` (16f) |
| 11. Text | Headline (96px): "2.8 s" — cyan, biggest moment of the segment. Caption (20px): "webhook in → reply out" white. No other text |
| 12. Sound design | Ticking clock fast (6 ticks); riser building to "2.8s" landing; big "notification ding" on JSON pop; whoosh after; music: peak then calm |
| 13. Freesound search | `search "clock tick" --min-dur 0 --max-dur 3 --limit 5` → **id=57211** + `search "notification ding" --min-dur 0 --max-dur 3 --limit 5` → **id=571511** |
| 14. Emotional intent | Awe / "wow" (proof moment) |
| 15. Design compliance | Data-viz signature (spring counter); cyan headline highlight; text anchored (over timer ring); speed lines = generated texture; never-flat bg |

---

## Scene 09 — Handoff to Screen (Bridge)

| Field | Content |
|---|---|
| 1. Timestamp | `01:15.680 → 01:30.940` (frame 2270–2728) |
| 2. Voiceover | "Before I show you how to build this, let me show you what the finished product looks like in action. I'm switching to my screen now to show you a live demo on my landing page. Watch carefully — this is the exact workflow we're about to build together." |
| 3. Narrative purpose | `CTA` (transition to demo) |
| 4. Visual objective | The viewer now understands: the next segment is a real demo on a real landing page — watch closely. |
| 5. Primary visual | Browser-frame mockup (device frame from asset lib) showing the landing page with a chat widget; cursor arrow moving to it |
| 6. Secondary elements | (1) "LIVE DEMO" pulsing gold badge; (2) cursor/arrow; (3) screen-capture transition wipe hint (grab corners) |
| 7. Action | Browser frame scales up from center (0.6→1.0) while zooming to fill screen by end; badge pulses; cursor moves into frame and clicks; at "watch carefully" frame begins edge-shrink (out-grab for screen recording cut) |
| 8. Camera & composition | Browser frame center; camera push-in 1.0→1.25 across scene so frame fills view at end — preparing the hard cut to real screen recording |
| 9. Motion | Frame: spring stiffness 110, damping 15, scale 0.6→1.0, 30f. Cursor: translate to (200,120) inside frame, 40f, Easing.inOut; click scale-down 3f |
| 10. Transition | In: `cross-dissolve + parallax` (16f) · Out: `hard cut` into screen recording at frame 2728 |
| 11. Text | Headline (60px): "watch this" — "watch" gold. Caption (18px): "live demo — landing page". "LIVE DEMO" badge: gold, pulsing |
| 12. Sound design | Whoosh into frame; click SFX at cursor click; pulsing tick on badge; music: suspenseful pre-demo, stops at hard cut |
| 13. Freesound search | `search "whoosh" --min-dur 0 --max-dur 3 --limit 5` → **id=168119** + `search "digital pop" --min-dur 0 --max-dur 3 --limit 5` → **id=89535** |
| 14. Emotional intent | Focus + anticipation (what you're about to see works) |
| 15. Design compliance | Device frame = asset-lib element; gold emphasis only on badge; text anchored to frame; push-in with parallax bg; ends with planned hard cut for the screen recording handoff |

---

## Production notes for the Remotion implementation

- fps 30 everywhere; `useCurrentFrame()` + `interpolate()`/`spring()` for ALL motion; register each scene composition in `src/Root.tsx`; `AbsoluteFill` root.
- Scene 09's out-cut is the seam to the screen recording: render scenes 01–09 as one composition (`AvatarNarration90s`), then the editor (or second composition) splices `assets/screen/` footage after frame 2728.
- SFX download before render: `source /root/.freesound.env && python3 scripts/freesound.py download <id> assets/audio/sfx/<name>.mp3` for every id listed above.
- Music: single bed, low-key ambient, energy ramps through scenes 01→08, resolves into suspense before the scene-09 cut.

---

STATUS: AWAITING APPROVAL
VERSION: v1
HISTORY:
- v1 (2026-08-11): initial storyboard — 9 scenes for the 90s Kiki VO (avatar narration 00:00→01:30.94)
