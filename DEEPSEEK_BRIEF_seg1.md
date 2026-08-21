# Brief for DeepSeek (opencode) — Redesign Segment 1 in the Clay + Liquid-Glass language

## 0. Mission (TL;DR)
You are working in the repo at `/mnt/ai-lab-internal`. Rebuild the visuals for the **first voiceover segment** of the explainer video in a new visual language — matte **"clay"** + **"liquid glass"** — keeping the exact narrative beats, timing, and SFX. Deliver a **new** Remotion scene + composition, render it, and **self-verify every render with `scripts/vision.py`** before you call it done.

Non-negotiable constraints:
- **Remotion 3.3.103 (NOT 4.x).** Match the APIs used in the existing scenes — don't invent 4.x calls.
- **Depicted VISUALS synced to the voiceover** — objects, UI, metaphor. **NOT kinetic typography** (no words flying around the screen).
- Everything renders **headless on-device** via Chromium. **Use only local assets** (no remote URLs).
- **Additive only:** do not modify `MotionHook.tsx`, do not add dependencies, do not touch `remotion.config.ts`.

## 1. The segment ("the first audio clip")
- Audio: `assets/kiki.mp3` (the full VO). This segment = **frames 0–137 @ 30fps = 0.00s–4.57s**.
- Transcript (segment 1, verbatim):
  > "What if every customer message your business received got an instant, intelligent reply,"
- Word timing (frame index within the clip, 30fps):
  `What` 4 · `if` 6 · `every` 9 · `customer` 17 · `message` 31 · `your` 40 · `business` 47 · `received` 60 · `got` 74 · `an` 79 · **`instant` 83 (key)** · **`intelligent` 96 (key)** · **`reply,` 124 (key)**
- Two beats:
  - **Beat A** (frames 0–~83): *"every customer message … received"* → the flood of incoming customer messages.
  - **Beat B** (frames ~83–137): *"got an instant, intelligent reply"* → the AI answers, instantly.
- Source of truth for timing: `src/scenes/explainer-poc/captions.ts` (segment index 0). **Do not change these numbers.**

## 2. What exists today (the thing you are re-skinning)
- `src/scenes/motion-hook/MotionHook.tsx` renders this as **Act1** (a frosted-glass "Customer inbox" panel, messages popping in) + **Act2** (typing dots → AI reply bubble → "replied in 0.4s"). Dark ink background, coral accent, frosted glass.
- That version **works** and is your functional reference for **timing + SFX**. You are **re-skinning it into the new language, not changing the story.**
- **Keep `MotionHook.tsx` untouched.** Build a NEW scene so the two can be compared side by side.

## 3. The new visual language (study this first)
**Reference implementation is already in the repo — READ IT before writing anything:**
`src/scenes/design-lab/DesignLab.tsx` (composition id `DesignLab`). It contains working, headless-safe implementations of both looks. Copy its techniques; don't reinvent them.

### Palette (ash + dark-purple)
```
ASH_HI = '#DAD8E2'   // light silver ash
ASH    = '#B7B4C2'   // mid ash
ASH_LO = '#8E8A9E'   // shaded ash
PURPLE = '#2A1B47'   // dark purple (the requested tweak — bleed it into the bg)
PURPLE_GLOW = '#7C5CFF'
CLAY   = '#FCFCFF'   // matte clay white
INK    = '#1C1830'   // near-black ink, for text on the light bg
```
Background = the `AshBackdrop` recipe from DesignLab: ash radial-gradient base + two blurred dark-purple radial bleeds (`mixBlendMode:'multiply'`) + a soft vignette. Reuse it.

### CLAY (for the customer messages — matte, soft, tactile)
- Fill: `linear-gradient(180deg, #FCFCFF 0%, #EDECF3 100%)`.
- Shadow recipe (`clayShadow()` in DesignLab): a soft double drop-shadow in purple-tinted rgba PLUS two inset highlights (bright top inset + darker bottom inset). This is what makes it read as pressed clay, not a flat card.
- Rounded pills / bubbles, generous padding, `INK` text.

### LIQUID GLASS (for the AI reply — the hero moment, real refraction)
This is the money shot. It is **not** a flat translucent div. The DesignLab `GlassKnob` does it — replicate its structure:
1. A `borderRadius:50%; overflow:hidden` body (a sphere) OR a rounded-pill glass surface.
2. Inside, absolutely-position a **duplicate of the content behind the glass**, offset by `left:r-cx, top:r-cy`, magnified with `transform:scale(~1.5)` + `transformOrigin:${cx}px ${cy}px`, wrapped in `filter:url(#dl-liquid)` — that filter is an SVG `feTurbulence`+`feDisplacementMap` that physically bends the copy. Keep it translucent (`opacity ~0.88`) so the frosted background still reads at the rim = real glass.
3. `backdropFilter: 'blur(2px) saturate(165%) brightness(1.05)'` on the clipped interior.
4. **Fresnel rim** via inset box-shadows; a **broad specular arc** across the top + a small drifting **hot dot**.
5. **Chromatic dispersion:** two blurred offset colored border-rings (cyan `hsla(200,100%,72%,0.6)` translated up-left, magenta `hsla(322,100%,70%,0.6)` translated down-right, both `mixBlendMode:'screen'`).
- The SVG filters (`#dl-liquid`, `#dl-goo`) are defined in DesignLab's `LiquidFilters` component — copy that component into your scene (rename the filter ids to avoid collisions, e.g. `#s1-liquid`).

### Motion (the "expensive finish" — applies to both)
- Never fully still: constant sine `breath()` micro-drift on focal elements; spring entrances with slight overshoot (never a flat ease-to-freeze).
- `breath`, `enter`, `hexA` are exported from `src/scenes/motion-hook/cinematic.tsx` — import and reuse them (DesignLab already does).
- A slow global scale/drift over the clip. Bloom discs behind bright elements.

## 4. Creative direction for THIS segment (the metaphor — build this)
Use the two materials to carry the meaning. **Matte clay = the mundane pile of human messages. Liquid glass = the intelligent AI.** The contrast is the point.

**Beat A — "every customer message your business received" (frames ~0–83):**
- Clay chat bubbles drop/pop into a soft clay inbox tray on the ash+purple background. One bubble per customer message, landing on the beat (see SFX below). They stack up — a growing, slightly overwhelming pile of matte pills. Short realistic snippets are fine ("Where's my order?", "Refund please", "Ship to the UK?", etc.) — keep them SHORT; they are props, not the subject.
- Feeling: soft, tactile, a little relentless — the pile keeps coming.

**Beat B — "got an instant, intelligent reply" (frames ~83–137):**
- On **`instant` (frame 83)**: a **liquid-glass** form sweeps in (a refractive sphere, or a glass reply-pill) — it literally bends/magnifies the clay pile seen through it. This is the AI arriving.
- On **`intelligent` (96) → `reply,` (124)**: the glass emits a single clean reply — the reply bubble itself is liquid glass (glossy, refractive), visually distinct from the matte clay customer messages. Optionally a small spark/AI glyph inside the glass.
- Feeling: calm, premium, instant. One glossy answer resolving the matte chaos.

Keep one clear focal point per beat. This is ~4.6s — don't overcrowd it.

## 5. SFX (exact — reuse the working pattern from MotionHook.tsx)
Local files live in `assets/sfx/`. Available: `pop.wav`, `whoosh.wav`, `ding.wav`, `click.wav`, `riser.wav`, `sil.wav`. **Load via `staticFile('sfx/<name>')`** exactly like MotionHook does (Config sets publicDir to `assets`, so `staticFile('sfx/pop.wav')` → `assets/sfx/pop.wav`; `staticFile('kiki.mp3')` → `assets/kiki.mp3`). Do NOT use `https://remotion.media/...` URLs — this renders offline.

Cue sheet for frames 0–137 (keep voice dominant — low SFX volume):
| frame | file | vol | on |
|------|------|-----|----|
| 6, 18, 30, 42, 54, 66 | `pop.wav` | 0.14 | each clay message landing |
| 89 | `whoosh.wav` | 0.22 | glass sweeps in (just after "instant") |
| 98 | `ding.wav` | 0.30 | the reply resolves ("intelligent") |

Pattern to copy (from MotionHook.tsx):
```tsx
const Sfx: React.FC<{from:number; file:string; volume:number}> = ({from,file,volume}) => (
  <Sequence from={from} durationInFrames={40} layout="none">
    <Audio src={staticFile(`sfx/${file}`)} volume={volume} />
  </Sequence>
);
// and the full VO once at the scene root:
<Audio src={staticFile('kiki.mp3')} />
```
Since your composition is only the first clip, trim the VO to this segment with `<Sequence>` or an `endAt`, OR just play `kiki.mp3` from 0 and set the composition duration to 137 frames — it will naturally only contain segment 1's audio.

## 6. Build steps (do these in order)
1. **Read** `src/scenes/design-lab/DesignLab.tsx` and `src/scenes/motion-hook/cinematic.tsx` fully. Read `src/scenes/motion-hook/MotionHook.tsx` for the SFX + timing pattern.
2. Create `src/scenes/seg1-clay-glass/Seg1ClayGlass.tsx`:
   - Copy the `LiquidFilters` (SVG `feTurbulence`/`feDisplacementMap` + goo) and `AshBackdrop` from DesignLab; rename filter ids (`#s1-liquid`, `#s1-goo`).
   - Import `breath, enter, hexA` from `../motion-hook/cinematic`.
   - Build Beat A (clay pile) and Beat B (liquid-glass reply) per §4, wired to the frames in §1.
   - Add the `<Audio>` VO + the SFX cues per §5.
   - Export a named `Seg1ClayGlass` React component (a plain `AbsoluteFill` scene, 1920×1080).
3. Register it in `src/Root.tsx` (mirror the existing `DesignLab` block exactly):
   ```tsx
   import { Seg1ClayGlass } from './scenes/seg1-clay-glass/Seg1ClayGlass';
   // ...inside <> …:
   <Composition id="Seg1ClayGlass" component={Seg1ClayGlass}
     durationInFrames={137} fps={30} width={1920} height={1080} />
   ```

## 7. Render + self-verify loop (MANDATORY — you are blind without this)
You cannot see the output, so **prove it with vision** on every iteration. `scripts/vision.py` describes a PNG for you. Force the best backend (GPT-4o via GitHub Models) and load the API keys from `.env` first:

**Render a check still** (fast, ~1 frame — cheap; do this, not full video, while iterating):
```bash
node ./node_modules/.bin/remotion still src/index.ts Seg1ClayGlass out/s1_100.png \
  --frame=100 --browser-executable=/data/data/com.termux/files/usr/bin/chromium-browser
```
Do a few frames across both beats, e.g. `--frame=40` (clay pile) and `--frame=110` (glass reply).

**Ask vision.py to judge it** (question FIRST, image path SECOND):
```bash
set -a; . ./.env 2>/dev/null; set +a
VISION_BACKEND=github python3 scripts/vision.py \
  'Describe this frame. Does the round/pill element read as translucent LIQUID GLASS that bends and magnifies what is behind it (not a solid opaque ball)? Are the smaller bubbles matte clay? Any rendering artifacts, clipping, or empty areas?' \
  out/s1_110.png
```
- If it prints `[github] …` you got GPT-4o (best). If it prints `[openrouter] …` you fell back to the weaker free model — re-check that `.env` has `GITHUB_MODELS_TOKEN` and was sourced.
- Iterate: read the critique → fix the code → re-render the still → re-ask. Repeat until glass reads as glass and clay reads as clay with no artifacts.

**Only when the stills pass, render the full clip:**
```bash
node ./node_modules/.bin/remotion render src/index.ts Seg1ClayGlass out/seg1_clay_glass.mp4 \
  --browser-executable=/data/data/com.termux/files/usr/bin/chromium-browser
```

## 8. Guardrails
- Remotion **3.3.103** APIs only (`AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring, Sequence, Audio, staticFile`). No `@remotion/three`/WebGL — SVG-filter refraction only.
- **Local assets only.** Never fetch remote URLs at render time.
- Don't add npm deps. Don't edit `remotion.config.ts`, `MotionHook.tsx`, or `captions.ts`.
- `out/` is gitignored — fine to write renders there.
- Don't print secret values from `.env`. Sourcing it into the env is fine; echoing keys is not.
- Keep it depicted-visual + metaphor, **not kinetic type**.

## 9. Definition of done
- `src/scenes/seg1-clay-glass/Seg1ClayGlass.tsx` exists and is registered as composition `Seg1ClayGlass` (137f, 30fps, 1920×1080).
- Clay pile (Beat A) and liquid-glass reply (Beat B) both render, on the ash+purple background, synced to §1 timing.
- SFX fire on the §5 frames; VO plays.
- A `vision.py` (github/GPT-4o) check on stills from both beats confirms: glass reads as translucent/refractive, clay reads as matte, no artifacts.
- `out/seg1_clay_glass.mp4` produced.
- Report back: the vision.py verdicts you got, and any spots you think still fall short of the Pinterest reference.



