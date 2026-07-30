# Sylvester's AI Lab — Agent Guide

> **SESSION START — REQUIRED READING (BEFORE ANY TOOL USE OR QUESTIONS)**
> Read ALL of these files every session, in order:
> 1. `/data/data/com.termux/files/home/lightning-ai/SESSION_MEMORY.md` — session memory
> 2. `/data/data/com.termux/files/home/lightning-ai/STATUS.md` — account table, gotchas, rebuild recipe
> 3. `/data/data/com.termux/files/home/lightning-ai/SETUP_STATE.md` — software stack, weights, commands
>
> Do NOT probe accounts, check balances, or ask about things already documented in these files.
> The account balance table in STATUS.md is the ground truth — accounts.json balances are stale.

## Commands

| Action | Command |
|---|---|
| Install all deps | `npm install && npm install framer-motion` |
| Vite dev server | `node node_modules/.bin/vite` |
| Remotion studio | `npm run studio` (v3.3 uses `preview` command) |
| Render composition | `npm run render -- <compositionId> out/<name>.mp4` |
| List compositions | `npm run compositions` |
| Build for prod | `node node_modules/.bin/vite build` |

> `framer-motion` is used throughout but absent from `package.json`. Install it manually after every `npm install`.

## Entrypoints

- **Remotion compositions**: `src/index.ts` → `src/Root.tsx` (register with `<Composition>`)
- **Vite dev app**: `src/main.tsx` → `src/App.tsx` (live preview in browser)
- Both share the same `src/` tree. New scenes go into `src/scenes/<scene-name>/`.

## Architecture

- **CSS design tokens**: `src/styles/global.css` (`--bg: #07090D`, `--cyan: #00D9FF`, `--gold: #E7B84D`)
- **Motion tokens**: `src/core/motion/motionTokens.ts` — durations, easing curves, spring configs
- **Z-index system**: `src/core/layout/layers.ts` (background=0 → transition=100)
- **Timeline pattern**: Per-scene frame constants in `src/core/timeline/<scene>Timeline.ts` (30fps). Components use `useCurrentFrame()` + `interpolate()` from Remotion. Timeline files are the single source of truth for pacing.
- **Scene pattern**: Scene orchestrator in `src/scenes/<name>/` + timeline constants. Reusable components in `src/components/<category>/`.
- **Browser UI**: `src/components/browser/BrowserWindow.tsx` — reusable browser shell for the channel
- **Module registry**: `src/modules/moduleRegistry.ts` maps names to components (BROWSER, STACK, WORKFLOW)

## Conventions

- **All components use inline styles** (no CSS modules, no styled-components). Pattern: `BrowserWindow.tsx`.
- **Animation delays are frame-based** (30fps). Timeline exports frame constants; components check against them.
- **No decorative animation** — the Motion Design Constitution requires every movement to reveal, guide, explain, connect, transform, or emphasize.
- **Scene creation workflow**: Creative direction → component architecture → timeline → orchestrator → register in `Root.tsx` → verify with `vite build`.
- **File naming**: `PascalCase.tsx` for components, `camelCase.ts` for utilities and constants.

## Motion Design Constitution (summary)

- Animate ideas, not words. Visuals before text.
- Every frame could be a poster — composition quality before animation quality.
- One focal point per frame. Dominant primary, single secondary, minimal supporting.
- Negative space is a design element. Objects must breathe.
- Progressive storytelling: beginning → escalation → payoff. Never jump to the final state.
- No generic scale/fade/slide as primary animation language. Motion must feel physically motivated.
- Build reusable components. Never hardcode one-off animations.

## Vision for image/screenshot reading

Use `scripts/vision.py` to read images when the user shares screenshots. Supports multiple backends (ollama, Gemini, NVIDIA, GitHub Models, Cloudflare, OpenRouter). Env vars for all backends are already set. Usage:
```bash
python3 scripts/vision.py "<question>" <image_path>
```

## n8n Template Store — Build Strategy

> **Mission**: Build premium n8n workflow templates one at a time. Each must work 100%. Quality over quantity. We deliver quality and difference — a rising force.

### Workflow (per template)
1. **Build the n8n workflow** — fully functional JSON (importable into n8n)
2. **Create 5 product images** — workflow diagram, features, dashboard, mobile, cover
3. **Create Remotion demo video** — 540 frames @ 30fps (18s), 5 sections: INTRO → WORKFLOW → DEMO → FEATURES → CTA
4. **Add live demo to landing page** — if the template allows it (like CS Agent chat demo posting to `/`)
5. **Upload to Gumroad** — via `scripts/upload_gumroad.py` or API, with variant tiers
6. **Update landing page** — add hero card, tab, panel with workflow viz, live demo, features, pricing
7. **Update server.py** — if live demo needs backend handling
8. **Commit + push to GitHub** — Render auto-deploys

### Product Directory Structure
```
products/<product-name>/
├── template.json          # n8n workflow (importable)
├── SETUP.md               # Setup guide
├── gumroad-listing.md     # Gumroad copy
├── n8nmarkets-listing.md  # n8n.markets copy
└── images/                # product images (5+)
```

### Landing Page Pattern
- **Hero cards** in `products/ai-customer-support-agent/index.html` (links to Gumroad)
- **Tabs** for each product (CS Agent, SMS Bot, Patient Records, ...)
- **Panel sections**: Demo Video → Workflow Viz → Features Grid → Live Demo → Pricing → Setup Steps
- **Live demo**: Chat demo posts to `/` (handled by `server.py`), phone mockup for SMS, static images for Patient Records

### Demo Video Pattern (Remotion)
- Scene in `src/scenes/<name>-demo/<Name>Demo.tsx` + `<name>Timeline.ts`
- 540 frames, 30fps, 1920x1080
- Timeline constants: INTRO, WORKFLOW_SHOW, CHAT_DEMO, FEATURES, CTA
- Register in `src/Root.tsx` with `<Composition>`
- Render: `npm run render -- <CompositionId> out/<name>.mp4`
- Output goes to `products/media/<name>-demo.mp4`

### Gumroad Product Structure
- 3-tier variants: Essentials (+$0), Professional (+$48), Enterprise (+$148) — "Edition" category
- OR: License variants: Basic, Pro, Agency
- Product fields: name, price (cents), description, custom_summary, tags
- File upload: manual via Gumroad dashboard

### Pricing Strategy
| Tier | Price | What's Included |
|------|-------|-----------------|
| Essentials | $14–$49 | Workflow JSON, basic README |
| Professional | $49–$97 | JSON + guide + screenshots + video |
| Enterprise | $97–$249 | All above + white-label + priority support |

### Market Demand (Top Categories)
1. AI Agents with memory & tools ← **NEXT TO BUILD**
2. Multi-Channel Communication Hub (WhatsApp + Telegram + SMS)
3. Lead Enrichment + Outreach Engine
4. Invoice Processing Pipeline
5. Content Repurposing Machine

### Key Files
- `scripts/upload_gumroad.py` — product definitions + Gumroad API upload/update
- `products/server.py` — Render server (root → index.html, `/media/` → media, `/pulse/` → patient website)
- `scripts/STRATEGY.md` — full market research + template build recommendations

## Gotchas

- No `tsconfig.json` — Vite handles TS internally. New files may hit strict errors without explicit types.
- ESLint config references `tsconfig.node.json` and `tsconfig.app.json` which don't exist yet.
- No test framework configured (`npm test` echoes only).
- `type: "commonjs"` in `package.json` — use `node ./node_modules/.bin/<tool>` instead of `npx`.
- On Termux/Android, Remotion needs `--browser-executable=/data/data/com.termux/files/usr/bin/chromium-browser` flag (already set in `package.json` scripts). On standard Linux/macOS/Windows, remove this flag.
