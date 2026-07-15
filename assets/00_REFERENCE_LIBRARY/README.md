# Reference Library — Index

Curated study targets for the Sylvester AI Lab visual system. Each subfolder is a
live study area; this file is the master index. Pull reference captures into the
matching subfolder and run `python3 scripts/vision.py "<question>" <img>` on a
*representative sample* (not all) to extract principles into `visual-intelligence.md`.

> Rule (BRAIN.md): never download the same reference twice — search
> `assets/LIBRARY_INDEX/library_index.csv` first. References are study material,
> not drop-in assets; extract the *principle*, don't copy the pixel.

## Study targets

| Folder | What to study | Primary URLs |
|---|---|---|
| `Apple/` | Restraint, cinematic product heroes, scroll-driven motion, depth, optical typography (SF Pro). | apple.com, apple.com/design/human-interface-guidelines, developer.apple.com/design |
| `Stripe/` | Gradient meshes, interactive demos, precise micro-interactions, dark+gradient, signature easing `cubic-bezier(.25,1,.5,1)`. | stripe.com, stripe.design, stripe.com/blog |
| `Linear/` | Dark UI, speed, keyboard-first, subtle gradients, motion ease, bento. | linear.app, linear.app/design, @linear |
| `Raycast/` | Playful-but-precise macOS chrome, quick motion, extension UI. | raycast.com, raycast.com/gallery, @raycast |
| `Framer/` | Scroll animations, site templates, spring motion, design-forward. | framer.com, framer.com/sites, @framer |
| `Figma/` | Collaborative presence UI, bright product marketing motion. | figma.com, figma.com/blog, @figma |
| `LottieFiles/` | Lightweight vector motion, icon animation vocabulary. | lottiefiles.com, @LottieFiles |
| `Motionographer/` | Motion craft, title sequences, industry bar. | motionographer.com |
| `Behance/` | Showreels, style diversity, motion collections. | behance.net (motion graphics) |
| `Dribbble/` | UI micro-interactions, trends. | dribbble.com (motion/topic) |
| `Pinterest/` | Moodboards, atmospheric direction. | pinterest.com (motion graphics) |
| `AI-SaaS-Launches/` | Launch motion, hero loops, current AI-product visual language. | producthunt.com, theresanaiforthat.com, @ranga_lithesh / AI dev feeds |

## Curated external study troves (for principle mining)
- **Stripe Design Language** study (stripe.design) — palette %, Söhne type scale, 4px grid,
  shadow tokens, motion easing table.
- **Modern SaaS aesthetic** (awesome-design-md) — grid backgrounds, bento grids, micro-interaction
  rules, named CSS easing vars.
- **Apple Fluid Interfaces** skill — springs, interruptible motion, respond-on-press, four human needs.
- **StyleSeed motion vocabulary** — 5 seeds (Spring/Silk/Snap/Float/Pulse) + named moves
  (tilt-3d, magnetic, glow-pulse, gradient-sweep, blob-morph, spotlight, reveal-blur, shimmer).
- **Awwwards checklist** — staggered scroll reveals, custom cursor, grain overlay, atmospheric
  backgrounds, 60fps, reduced-motion.
- **DesignMD benchmarks** — real fonts per site (SF Pro, Inter, Figma Sans, Geist, Söhne, Mona Sans…).

## How to add a reference
1. `mkdir assets/00_REFERENCE_LIBRARY/<Target>` if missing.
2. Save captures (png/jpg) + a `notes.md` with source URLs.
3. `python3 scripts/asset_library.py register <file> 00_REFERENCE_LIBRARY/<Target> --source <url> --tags reference`.
4. Distill the principle into `visual-intelligence.md` (not the raw image).
