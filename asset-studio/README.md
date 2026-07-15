# Asset Studio — Cinematic Asset Intelligence & Art Direction

A reusable, studio-grade asset pipeline for Sylvester's AI Lab. Operates like a
professional motion-design studio: art-direct *before* downloading, gather many
candidates, score them objectively, get human approval, then bank approved assets
into a permanent, categorized, preference-aware library.

## The 10 principles (see founder brief)

1. Art-direct before downloading (emotion, story, metaphor, pacing, palette, camera, hero/support)
2. Download multiple candidates (10 videos / 10 SVGs / multiple logos, textures, gradients)
3. Score every candidate objectively (resolution, fps, lighting, camera, palette, relevance, cleanliness, licensing…)
4. Prefer cinematic assets (shallow DoF, premium grade, smooth motion, strong composition)
5. Human approval loop (present top candidate, approve/reject, then bank+tag+categorize, never re-search)
6. Permanent asset library (categories: AI, Robotics, Programming, Servers, Data, Browsers, Finance, Mobile, Space, Medical, Security, Maps, UI, Abstract, Technology)
7. Learn user preferences (record why approved, build preference DB, prioritize in future searches)
8. Blend motion graphics with reality (footage foundation + typography/SVG/particles/lighting/UI overlays)
9. Verify every scene (loads, not blank, resolution, license, framing, readable type, consistent color, story-supporting, cinematic not slideshow)
10. Improve the engine (every gain becomes a reusable engine component)

## Directory layout

```
asset-studio/
  README.md            this file (the system)
  lib/
    art-direct.js      build an art-direction brief
    score.js           objective candidate scoring
    download.js        download + frame-extract + score a candidate
    approve.js         bank an approved asset (tag, categorize, record preference)
    verify-scene.js    scene-completion checklist
    preferences.json   learned user preferences (weight overrides + liked traits)
  specs/               art-direction briefs per scene/line (*.spec.json)
  candidates/          harvested candidate metadata (per search, scored)
  library/             APPROVED assets, organized by category (the permanent library)
```

## Workflow

```
node lib/art-direct.cjs <scene>            # (re)write specs/<scene>.spec.json
node lib/download.cjs <spec.json>          # harvest 10+ candidates, score, save to candidates/
node lib/approve.cjs <candidate.json>      # bank approved asset -> library/<category>/ + prefs
node lib/verify-scene.cjs <render.png>     # run the scene checklist
```

No Pexels API key is required: the harvester searches the public Pexels site and
collects real, license-safe candidate URLs, then scores each by downloading a
probe frame / metadata. Approved assets are tagged and never re-searched.
