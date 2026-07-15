# Permanent Asset Library

Approved assets are permanent studio resources. This index supplements
`ASSET_MANIFEST.md` (per-asset details) and `BRAIN.md` → Permanent Asset Library.

## Selection pipeline (mandatory — see BRAIN.md §4)

1. Search **multiple** candidates for every required asset.
2. Rank by measurable properties: resolution, orientation, frame quality,
   brightness, motion richness, compression quality, metadata, captions,
   subject relevance, color compatibility, aspect ratio, licensing,
   technical quality.
3. Run `python3 scripts/vision.py "<rank question>" <candidate>` on **every**
   candidate. Reject poor assets.
4. Present only the strongest option for approval.
5. On approval, store permanently under `assets/...` and record in
   `ASSET_MANIFEST.md`. Never download the same asset twice.

## Current library

> Live total: **11,509 indexed assets** (`assets/LIBRARY_INDEX/library_index.csv`).
> Always query the CSV via `python3 scripts/asset_library.py search <term>` — this file
> is a human summary only.

### Logos — `01_LOGOS/`
- **Brand (3,449)** CC0 from Simple Icons → `01_LOGOS/brand/` (openai, figma, notion…).
- **Curated (17)** real company marks categorized AI / Coding / Design / Productivity /
  Marketing (openai, anthropic, figma, notion, vercel, canva, github, perplexity, zapier,
  n8n, googlegemini, adobephotoshop, make + 4 favicons). Used in `CollectorCinematic`.

### Icons — `02_ICONS/`
- **Lucide (1,995)** ISC → `02_ICONS/lucide/`.
- **Tabler (5,093)** MIT → `02_ICONS/tabler/`.
- **Curated (33)** → `02_ICONS/` root.

### Backgrounds — `06_BACKGROUNDS/`
- **Procedural (36)** on-brand SVGs (Dark/Gradient/Mesh/Grid/Aurora/Abstract) from
  `scripts/gen_backgrounds.py`. Plus 3 sourced dark stills.

### Footage — `05_FOOTAGE/`
- 873 jpg sequence frames + 3 mp4 (dark-desk, screen-mouse, website-scroll) across
  Coding / Workspace / Technology. Long-term target (3,500 clips) deferred pending storage
  + Pexels/Pixabay API keys.

### Textures / UI / References
- Textures: 2 (noise). UI captures: 5 (browser + thumbs). Reference libraries
  (`00_REFERENCE_LIBRARY/`) and remaining categories (`03_UI_ELEMENTS`, `04_DEVICE_FRAMES`,
  `07_TEXTURES`, `08_PARTICLES` … `17_SCENE_REFERENCES`) are scaffolded and empty — to be
  filled incrementally per the MASTER ACQUISITION PLAN.

### Narration VO
`assets/audio/collector/line1.wav` … `line4.wav` — the four opening sentences,
synced to `CollectorCinematic` acts 1–4 (see `collectorTimeline.ts`).

## How to extend
When a new asset class is approved (footage, icons, UI captures, textures…), add
a section here and a manifest entry. Keep the library the single source of truth
so future projects assemble scenes instead of re-sourcing.
