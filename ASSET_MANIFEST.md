# Asset Manifest — Sylvester's AI Lab

This file is the single index of every asset in the project. Any agent needing
an asset should look here first, then read the file from the `Path` column.

Canonical store: `assets/` (configured as Remotion `publicDir` via `remotion.config.ts`).
Runtime access: `staticFile("<Path>")` — paths are relative to `assets/`.

Updated: 2026-07-11 (added guard-verified asset pipeline: verify-asset / capture-page / extract-frames)

---

## Approved assets

| Asset | Path | Category | Source | License | Used by |
|---|---|---|---|---|---|
| sparkles.svg | `icons/sparkles.svg` | icons / decorative | Lucide (`lucide-static`, jsDelivr) | ISC | `DecoSVG` (Text A/C) |
| orbit.svg | `icons/orbit.svg` | icons / decorative | Lucide | ISC | `DecoSVG` (Text A/C) |
| atom.svg | `icons/atom.svg` | icons / decorative | Lucide | ISC | `DecoSVG` (Text B/C) |
| waves.svg | `icons/waves.svg` | icons / decorative | Lucide | ISC | `DecoSVG` (Text A) |
| hexagon.svg | `icons/hexagon.svg` | icons / decorative | Lucide | ISC | `DecoSVG` (Text B) |
| aperture.svg | `icons/aperture.svg` | icons / decorative | Lucide | ISC | `DecoSVG` (Text A) |
| triangle.svg | `icons/triangle.svg` | icons / decorative | Lucide | ISC | `DecoSVG` (Text B) |
| pexels-34110027.jpg | `backgrounds/pexels-34110027.jpg` | backgrounds / footage plate | Pexels (photo 34110027, "Moody Workspace with Keyboard and Gadgets") | Pexels License (free commercial, no attribution) | `CollectorScene` environment plate | 2026-07-11 |
| pexels-18293808.jpg | `backgrounds/pexels-18293808.jpg` | backgrounds / footage plate | Pexels (photo 18293808, "Modern Dark Computer Setup") | Pexels License (free commercial, no attribution) | (library reserve) | 2026-07-11 |
| playfair.ttf | `fonts/playfair.ttf` | typography / display serif | Google Fonts (Playfair Display, OFL) | SIL Open Font License (free, commercial OK, must keep license) | `CollectorScene` authoritative kinetic-type face | 2026-07-12 |

### Real stock footage

| Asset | Path | Category | Source | License | Used by |
|---|---|---|---|---|---|
| dark-desk-4069295.mp4 | `footage/dark-desk-4069295.mp4` | footage | Pexels (video 4069295, "A man sitting at a desk in a dark room"), 1080p | Pexels License (free commercial, no attribution) | `CollectorScene` environment (source) |
| darkdesk/f-001..393.jpg | `footage/darkdesk/` | footage / frame sequence | derived from dark-desk-4069295.mp4 via ffmpeg (30fps) | Pexels License (derived) | (reserve — was CollectorScene, replaced by browser-UI rebuild) |
| website-scroll-7872722.mp4 | `footage/website-scroll-7872722.mp4` | footage | Pexels (video 7872722, "Close-Up Video of Person Scrolling Through a Website") | Pexels License (free commercial) | (reserve) |
| webscroll/f-001..393.jpg | `footage/webscroll/` | footage / frame sequence | derived from website-scroll-7872722.mp4 via ffmpeg (30fps) | Pexels License (derived) | (reserve — was CollectorScene, replaced by browser-UI rebuild) |
| screen-mouse-855001.mp4 | `footage/screen-mouse-855001.mp4` | footage | Pexels (video 855001, "Video Of Man Scrolling Down And Typing", CC0) | CC0 / Pexels License | (library reserve) |

### Real web page screenshots (microlink API capture, 2560×1600, guard-verified)

Captured via `scripts/capture-page.sh` (microlink API — reliable on Termux) and
gated through `scripts/verify-asset.sh`. Only PASS captures are kept; blank /
near-empty results are auto-rejected (never saved).

| Asset | Path | Category | Source | License | mean/stddev | Used by |
|---|---|---|---|---|---|---|
| openai_com.png | `pages/openai_com.png` | screenshots / real pages | openai.com | editorial/nominative use — third-party content & trademarks; NOT relicensed | 0.852 / 0.319 | `CollectorScene` (source) |
| huggingface_co.png | `pages/huggingface_co.png` | screenshots / real pages | huggingface.co | editorial use | 0.309 / 0.395 | `CollectorScene` (source) |
| claude_ai.png | `pages/claude_ai.png` | screenshots / real pages | claude.ai | editorial use | 0.710 / 0.332 | `CollectorScene` (source) |
| midjourney_com.png | `pages/midjourney_com.png` | screenshots / real pages | midjourney.com | editorial use | 0.200 / 0.271 | `CollectorScene` (source, now deprecated for this scene) |
| thumbs/*.jpg | `pages/thumbs/` | derived thumbnails (640×400) | cropped from `pages/*.png` via ImageMagick | editorial (derived) | — | `CollectorScene` hero + tool grid |
| favicons/*.jpg | `pages/favicons/` | derived favicons (64×64) | cropped from `pages/*.png` via ImageMagick | editorial (derived) | — | `CollectorScene` tab + bookmark icons |

> REJECTED (guard SUSPECT, near-empty — auth/bot wall via microlink, NOT saved): `chat.openai.com` (mean 0.978), `perplexity.ai` (mean 0.990). Need an alternative capture route if these pages are required.

> NOTE: Website screenshots contain third-party content/trademarks. Fine for editorial/commentary (this explainer), but they are **not** CC0 assets — do not treat as freely relicensable studio assets. Flagged for founder review before broad commercial reuse.

> DEPRECATED: earlier `screenshots/*.png` (headless Chromium, 1440px) were blank/cookie-wall captures and have been removed. Do not use local headless Chromium for page capture on Termux — use `scripts/capture-page.sh`.

### Asset pipeline scripts

| Script | Purpose |
|---|---|
| `scripts/verify-asset.sh <img>` | Blank/near-empty guard. stddev<0.02=BLANK, <0.06 or mean>0.97/<0.03=SUSPECT, else PASS. |
| `scripts/capture-page.sh <url> <out.png> [full]` | Capture real web page via microlink API, keep only if it passes the guard. |
| `scripts/extract-frames.sh <video> <dir> [fps]` | Render-safe JPG frame sequence (OffthreadVideo is broken on Termux), spot-checked by the guard. |

All Lucide icons are stroke-based (`stroke="currentColor"`); recolor per use by
setting the `color` style on the `<Img>` element.

---

## Pending review (pre-existing, license unknown)

| Asset | Path | Category | Source | License | Used by | Action |
|---|---|---|---|---|---|---|
| car-bg.jpg | `backgrounds/car-bg.jpg` | backgrounds | unknown (pre-existed in repo) | unknown | `GoogleHomepage` (BrowserScene) | Verify source/license before commercial use; prefer a CC0/Pexels replacement |
| chrome-logo.svg | `browser/chrome-logo.svg` | browser | unknown (pre-existed in repo) | trademark (Google Chrome) | `BrowserTabBar` | Replace with a non-branded tab icon to avoid trademark issues |

---

## Asset Studio pipeline (cinematic asset intelligence)

Located in `asset-studio/`. Operates like a professional motion-design studio: art-direct before download, harvest 10+ scored candidates, human approval loop, permanent categorized library, learned preferences, scene verification.

| Component | Path | Purpose |
|---|---|---|
| Art-direction brief | `asset-studio/lib/art-direct.cjs` | emotion/story/metaphor/pacing/palette/camera/hero per beat |
| Scoring engine | `asset-studio/lib/score.cjs` | 13 weighted dimensions (resolution, fps, lighting, camera, palette, relevance, cleanliness, licensing…), preference-aware boost |
| Harvester | `asset-studio/lib/download.cjs` | gathers candidates (Pexels API if `PEXELS_API_KEY` set, else real on-disk assets), scores + ranks |
| Approval loop | `asset-studio/lib/approve.cjs` | banks approved asset -> `library/<category>/`, tags, records why-approved |
| Scene verify | `asset-studio/lib/verify-scene.cjs` | loads / not-blank / resolution / framing / readable type / color / not-slideshow |
| Preferences | `asset-studio/lib/preferences.json` | learned liked traits (boost future scores) |
| Reusable overlay | `src/components/compositing/BlendLayer.tsx` | footage foundation + motion-graphics overlays (principle 8) |

> NOTE: Pexels public search is bot-blocked (403) and the API needs a key; without one the harvester scores REAL on-disk assets (license-safe). Set `PEXELS_API_KEY` to harvest 10+ fresh candidates per beat.

### Approved library (permanent, categorized)
| Asset | Category | Tags | Why approved | Score |
|---|---|---|---|---|
| screen-mouse-855001.mp4 | Technology | dark,screen,cinematic,mouse,desk | dark cinematic look, smooth camera motion, premium lighting | 8.83 |

## Brand logo assets (used by `CollectorCinematic` + `OpeningSequence`)

Real AI-tool brand marks rendered as a white-inverted logo strip / bookmark grid
(the visual embodiment of "AI-tools-collected" overload). Sourced from Simple Icons
(monochrome, `viewBox 0 0 24 24`, CC0) except where noted.

| Asset | Path | Source | License | Status |
|---|---|---|---|---|
| openai.svg | `logos/openai.svg` | Wikimedia Commons (OpenAI wordmark) | trademark — nominative/editorial use | OK (recovered; Simple Icons removed it) |
| anthropic.svg | `logos/anthropic.svg` | Simple Icons | CC0 | OK |
| figma.svg | `logos/figma.svg` | Simple Icons | CC0 | OK |
| notion.svg | `logos/notion.svg` | Simple Icons | CC0 | OK |
| vercel.svg | `logos/vercel.svg` | Simple Icons | CC0 | OK |
| github.svg | `logos/github.svg` | Simple Icons | CC0 | OK |
| perplexity.svg | `logos/perplexity.svg` | Simple Icons | CC0 | OK |
| zapier.svg | `logos/zapier.svg` | Simple Icons | CC0 | OK |
| n8n.svg | `logos/n8n.svg` | Simple Icons | CC0 | OK |
| googlegemini.svg | `logos/googlegemini.svg` | Simple Icons | CC0 | OK |
| make.svg | `logos/make.svg` | Simple Icons | CC0 | OK |
| canva.png | `logos/canva.png` | Google favicon service (canva.com) | trademark | OK (vision APPROVE) |
| adobephotoshop.svg | `logos/adobephotoshop.svg` | Wikimedia Commons (Adobe Photoshop CC icon) | trademark | OK (vision APPROVE) |

> ALL 13 logos vision-verified APPROVE on 2026-07-13 (white-tile test via `scripts/vision.py`). Sources: 11 from Simple Icons (CC0); `canva.png` via Google favicon; `adobephotoshop.svg` via Wikimedia CC icon. Canva + Adobe Photoshop were trademark-removed from Simple Icons, so re-sourced from the internet per founder instruction ("get all assets you need from the internet").
> EDITORIAL USE ONLY: these are third-party trademarks, not relicensed studio
> assets. Fine for commentary/explainer (nominative use), NOT for broad commercial
> rebranding. Flag for founder review before monetized reuse. `CollectorCinematic`
> handles the two EMPTY files via a `BROKEN_LOGOS` text fallback (no broken-image
> render). Drop replacement PNG/SVG cuts into `assets/logos/` and remove them from
> `BROKEN_LOGOS` in `src/scenes/collector/CollectorCinematic.tsx` to restore.

---

## Conventions

- Add a row to this manifest for **every** asset added. Never download the same asset twice.
- Folder map (per Engine Constitution): `backgrounds/`, `icons/`, `browser/`,
  plus future `footage/`, `glass/`, `gradients/`, `textures/`, `particles/`,
  `typography/`, `logos/`, `illustrations/`, `transitions/`, `music/`, `sfx/`.
- Prefer CC0 / MIT / ISC / Apache / Public Domain / **OFL** (SIL Open Font License — free for commercial use, must retain the license file). Verify license before use.
