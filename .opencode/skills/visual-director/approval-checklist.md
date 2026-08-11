# Visual Director — Approval Checklist

Run this against every scene before marking a storyboard AWAITING APPROVAL.
Any ❌ → revise the plan, do not ship it.

## Structure
- [ ] Scene durations sum to total duration; frame ranges match fps.
- [ ] Hook ≤ 5s. Visual state change every 3–5s. No dead frame > 2s.
- [ ] All 16 schema fields present in every scene (template: `storyboard-template.md`).
- [ ] Narrative arc complete: hook → problem → agitate → solution → credibility → CTA.

## Props layer (real assets, no code-drawn logos)
- [ ] Every scene lists real SVG/prop file paths under `assets/` for its visuals.
- [ ] Logos/wordmarks (n8n, OpenAI, Gmail) come from `01_LOGOS/*`, never drawn in code.
- [ ] Icons come from `02_ICONS/lucide|tabler/*`; UI chrome from `03_UI_ELEMENTS/*`.
- [ ] Backgrounds from `06_BACKGROUNDS/*` + `07_TEXTURES/Noise/*` — never flat.
- [ ] All referenced paths verified to exist (`ls`); missing ones flagged `PROP-NEEDED`.

## Visual layer
- [ ] Exactly ONE primary visual per scene; ≤ 3 secondary elements.
- [ ] Text is never the hero — always anchored to a visual element.
- [ ] Two text sizes max; 1–2 keyword colors (cyan `#00D9FF` / gold `#E7B84D`).
- [ ] Background is never flat: gradient + bloom, noise, or gradient mesh.
- [ ] Palette from visual-direction.md only: `#07090D #00D9FF #E7B84D #8A8F98`.

## Motion layer
- [ ] Every element has: source direction, spring physics (params), settle point.
- [ ] Timings in frames at the declared fps (Remotion frame-synchronized — no CSS anims).
- [ ] Element entry 10–15f settle; exit slide+fade 8–12f; transitions from allowed vocabulary.

## Sound layer
- [ ] Every scene has ≥ 1 SFX event mapped to a frame.
- [ ] Every scene has ≥ 1 real Freesound query (freesound.py syntax + duration constraints).
- [ ] SFX builds with emotional intent, not decoration.

## Emotion
- [ ] Emotional intent stated per scene and plausible given the visuals.
- [ ] Visual objective phrased as a viewer understanding, not a shot description.

## Gate
- [ ] STATUS: AWAITING APPROVAL, VERSION, HISTORY block present.
- [ ] No code, no React, no implementation artifacts in the plan.
- [ ] Version history retained on revisions (v2+ with CHANGES list).
