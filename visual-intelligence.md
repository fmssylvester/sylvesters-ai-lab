# Visual Intelligence — Reusable Design Knowledge

Captured from references and from our own builds. Append automatically with:
`python3 scripts/research.py extract <image1> <image2> ...`

Goal: the studio never relearns a principle it has already discovered.

---

## Principles (evergreen)

- **Text is never the hero.** Visuals first, motion second, text last. A scene must communicate before its caption is read.
- **One focal point per frame.** A single dominant element; everything else supports it.
- **Negative space is composition.** Let elements breathe; use density only when the idea demands it (e.g., overload/clutter as the message).
- **Depth via blur + scale, not perspective hacks.** Foreground sharp/large, background soft/small.
- **Spring physics over linear.** Entrances settle with overshoot; motion has mass and weight.
- **Keyword-highlight discipline.** 1–2 words per sentence in an accent color; everything else white.
- **Text anchored to a visual.** Captions live inside/next to a panel or element — never floating alone in the void.
- **Every frame could be a poster.** Composition quality before animation quality.

## Case study — CollectorCinematic (logo swarm)

- **Idea:** AI-tool overload → accumulation → one tool pulled to focus.
- **Metaphor:** real brand logos fly in from all directions, fill the frame (the "fortieth"), then ACT4 pulls one sharp logo to center while the rest recede and blur.
- **Why it works:** the swarm *is* the message (literally too many tools); the climax uses depth-of-field to isolate the hero without any text.
- **Lesson:** a literal, physical metaphor beats abstract text for an emotional beat.

## Technical notes (verified on this device)

- `remotion still` frame is a **FLAG**: `--frame=N`. A positional frame argument is ignored and silently renders **frame 0** (looks black). Always use `--frame`.
- Verify stills with a pixel check: avg luminance ≈ 8.3 means pure void (`#07090D`); content is present when avg > 8.3 and/or colored pixels (max channel) > 140.
- `vision.py` best backend is `github` (requires `. ./.env`). `openrouter` may refuse image-analysis tasks.
- `staticFile('logos/x')` resolves against `assets/` (configured via `remotion.config.ts` → `setPublicDir`).
- Full mp4 render: `npm run render -- CollectorCinematic out/name.mp4` (includes audio). Partial: add `--frames=START-END`. A 390-frame render took ~21 min on this device.


## Reference analysis — 2026-07-13

### v4-170.png
[github] ### Composition
- Balanced layout with central focus on text and UI elements.
- Icons scattered in the background create visual depth and suggest context.
- Clarity is maintained despite a busy background due to the dark overlay and prominent focal points.

### Visual Hierarchy
- Strong hierarchy with bold, large typography for the main message, followed by a contrasting secondary number (37) and smaller supporting text.
- Bright and vibrant colors on "fortieth" and "37" draw immediate attention.

### Spacing/Negative Space
- Effective use of spacing ensures main elements are not crowded.
- Sufficient breathing room between background elements and text ensures readability.

### Lighting/Color
- Background color grading uses soft glows and gradients, adding subtle visual interest without overpowering graphics.
- Foreground text leverages high-contrast colors (white, yellow, blue) against a dark background to enhance readability.

### Motion Implied
- The scattered icons and subtle blurring suggest movement within a layered 3D space.
- Overlapping elements, such as the faint green highlight, hint at dynamic interaction or transitions.

### Transitions/Layering
- Background elements are layered with varying sizes and degrees of blur to create depth.
- The semi-transparent rectangle behind the main text transitions focus effectively without obscuring background details.

### Typography
- Sans-serif typeface used for clarity and contemporary appeal.
- Weight contrast (bold for prominent text, regular for secondary text) clearly guides the user’s eye.

### Reusable Principles
1. **Depth Through Layering**: Use a combination of element sizes, blur, and transparency to create a sense of depth that immerses the viewer in a 3D-like scene.  
2. **Contrast for Hierarchy**: Employ strong color and weight differences in text to effectively highlight key information.  
3. **Focus Through Overlays**: Incorporate semi-transparent overlays to separate foreground text from a busy background, enhancing readability while retaining visual context.

---

## Reference analysis — 2026-07-13 (round 2: industry design languages)

Synthesized from Stripe Design Language, Modern-SaaS-aesthetic (awesome-design-md),
Apple Fluid Interfaces, StyleSeed motion vocabulary, Awwwards checklist, DesignMD
benchmarks, and 16 product case studies (Blake Crosley). These are the *shared language*
of "expensive" motion graphics — apply to every future scene.

### Motion — easing & timing (the single biggest quality lever)
- **Never use default `ease`/`ease-in`/`ease-out`/`linear`.** Always define custom cubic-beziers.
- Signature curves to keep as tokens (add to `src/core/motion/motionTokens.ts`):
  - `--ease-out-quint: cubic-bezier(.23,1,.32,1)` — enter/rest.
  - `--ease-stripe: cubic-bezier(.2,1,.2,1)` — Stripe's dominant curve (~387 uses in the wild).
  - `cubic-bezier(.165,.84,.44,1)` and `cubic-bezier(.25,1,.5,1)` — transform/long moves.
- **Durations:** micro 150–200ms ease-out; base 220ms; coordinated transforms up to 0.8s; **never >500ms** for a single micro-interaction.
- **Animate only cheap props:** `transform` + `opacity` (GPU). Avoid animating layout, width/height, box-shadow, filter (except blur for depth). Use `will-change` sparingly.
- **Springs for interactive elements** (buttons, modals, tabs): stiffness ~200, damping ~20, bounce < 0.1 (bouncier reads *playful*, not pro). **Fixed tweens for coordinated/scroll** things (reveals, progress).
- **Always honor `prefers-reduced-motion`**; keep transitions interruptible.

### Apple — fluid, physical motion
- Motion starts from the *current on-screen value*, inherits the user's velocity, projects momentum, and can be grabbed/reversed at any instant. **Springs are the tool** — inherently interruptible & velocity-aware.
- **Respond on press, not release.** Feedback must be continuous *during* the interaction, not just at the end.
- Four human needs design serves: safety/predictability, understanding, achievement, joy. **Restraint is the signature.**

### Layout — bento & grids & space
- **Bento grids** (Apple 2023 → ~67% of B2B SaaS by 2026): hero cell top-left (F-pattern), alternate *outcome* cards ("Cut cycle 30%") with *feature* cards, **size maps to importance**, ≤12–15 cells, never all-equal (that's just a rounded grid).
- **Grid backgrounds:** radial-mask fade + ~24px line grid at low opacity (`rgba(255,255,255,.06)`). Our library has 6 generated variants in `06_BACKGROUNDS/Grid`.
- **4px spacing grid**; generous negative space is composition, not emptiness.

### Typography — hierarchy without color
- **Weight + size do the work color usually does.** Negative tracking on large headings (e.g. -0.96px on 48px). Keep our void/cyan/gold accents for *emphasis only* (already a rule).
- Use **distinctive self-hosted type**, not generic Inter/Roboto, for a premium read. (Project uses Space Grotesk + JetBrains Mono + Inter — fine; lead with Space Grotesk for display.)
- Real-world reference fonts: SF Pro (Apple), Söhne (Stripe), Inter (Linear), Geist (Vercel), Figma Sans, Mona Sans (GitHub).

### Micro-interaction / polish checklist (Awwwards bar)
Staggered scroll reveals · custom easing everywhere · hover states on all interactive
elements · grain/texture overlay · atmospheric gradient backgrounds · **60fps** ·
reduced-motion support · fast load · no layout shift. Our postfx (LightLeaks,
Vignette, FilmGrain) already cover grain/atmosphere — reuse, don't reinvent.

### Named motion vocabulary (studio shared language)
Adopt StyleSeed's framing so motion is intentional, not "default fade":
- **5 seeds (personality):** Spring (bouncy/Arc/Toss), **Silk (smooth/Stripe/Linear)**,
  Snap (instant/Raycast/Linear), Float (weightless/Apple), Pulse (rhythmic/Discord).
- **Named moves:** tilt-3d, magnetic, glow-pulse, gradient-sweep, blob-morph, spotlight,
  reveal-blur, pop-in, shimmer, toggle-flip. → Use these keywords when briefing a scene.

### Four cross-cutting product patterns (from 16 case studies)
1. **Constraint-driven design** — deliberate limits become distinctive identity.
2. **Typography-first hierarchy** — font weight/size, not color, carry meaning.
3. **Platform-native investment** — use the medium's real capabilities (here: Chromium/Remotion spring + blur).
4. **Documentation-as-product** — treat every scene's brief with production rigor (our CD pipeline).

### Forbidden (anti-patterns)
- Default easing; animating layout/box-shadow/filter; bounce > 0.1; >12–15 bento cells or
  all-equal cells; generic Inter/Roboto as the "hero" face; text floating alone in the void;
  more than 1–2 accent words per sentence.

### Action items
- [ ] Add the 4 easing curves + duration tokens to `src/core/motion/motionTokens.ts`.
- [ ] Tag the 6 generated `06_BACKGROUNDS/Grid` variants for reuse; add 2–3 "bento frame"
      SVG scaffolds to `03_UI_ELEMENTS` for explainer layouts.
- [ ] Use the named-motion vocabulary when briefing every future scene.
