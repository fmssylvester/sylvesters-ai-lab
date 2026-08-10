# BRAIN.md — Visual Design Standard
Sylvester's AI Lab | YouTube Motion Graphics System

This file is the single source of truth for all visual decisions in this pipeline.
Every agent, every scene, every frame must conform to this standard without exception.
When in doubt, refer here before generating anything.

## MASTER VISUAL IDENTITY
This channel produces motion graphics that look like they were made by a $50,000 budget motion design studio for a top-tier YouTube AI explainer channel with over 1 million subscribers. Every frame must feel modern, expensive, and intentional — the kind of visuals that make viewers stop scrolling and say "what channel is this?"

This is premium 3D SaaS-meets-cinematic motion design. Think Linear.app launch video crossed with a Vercel keynote crossed with a high-budget Kurzgesagt sequence — but for AI and tech content. Nothing should look like it was made in Canva, PowerPoint, Adobe Express, or any template tool. Every element must feel custom-built and deliberate.

## COLOR SYSTEM
- **Background**: Deep Navy / Charcoal gradient (#07090D to #0B0E14)
- **Primary Accent**: Cyan (#00D9FF)
- **Secondary Accent**: Electric Violet (#8A2BE2)
- **Warning/Alert Accent**: Sunset Red / Coral (#FF4F58)
- **Text Primary**: Polar White (#FFFFFF)
- **Text Secondary**: Slate Gray (#94A3B8)

### Rules:
- Maximum 3 colors in any single scene
- Gradients only on accent elements — never on backgrounds
- Pick ONE accent color (cyan OR violet) per video and use it throughout
- Never introduce new colors mid-video

## TYPOGRAPHY
- **Main Font**: Inter or custom premium Sans-Serif
- **Code/Mono Font**: JetBrains Mono

### Animation Rules:
- Text reveals word-by-word, perfectly synced to voiceover
- Never display full sentences all at once
- Key terms get a brief luminous glow on emphasis
- Never use underline, outline, or drop shadow on text
- Progressive reveal only — text builds with purpose

## 3D & SPATIAL DESIGN
- **Floating Elements**: All UI cards, panels, and components float with slight z-axis tilt on entry. Never flat — always depth.
- **Glassmorphism**: frosted transparency, soft inner glow, realistic depth
- **Dashboard interfaces**: assemble piece by piece as if built in real time

### Materials & Surfaces:
- Frosted glass: 15-20% opacity white fill, 1px luminous border
- Metallic accents on edges and dividers
- Gradient fills: cyan-to-violet or warm-white-to-electric-blue on key components
- Subtle specular highlights from single light source (top-left)

### Lighting:
- Single key light source, top-left
- Subtle bloom/glow on accent elements and connection lines
- Background elements: slight depth-of-field blur
- Hero elements: crisp and sharp in foreground
- Overall feel: holographic interface in a dark room

### Shadows:
- Subtle ambient occlusion beneath all floating elements
- Soft directional shadows from top-left light source
- Never hard shadows

## MOTION & ANIMATION SYSTEM
- **Physics**: All movement uses spring physics exclusively. Fast initial velocity, smooth deceleration, slight overshoot on arrival. Never linear easing — ever.
- **Entry Animations**: Elements enter from depth (z-axis push forward) OR from a deliberate direction. Never random directions. Sequential assembly — never all elements at once.
- **Camera**: Slow, cinematic, purposeful movement only. Gentle drift or subtle zoom to add dimension. Never whip-pan, never shake, never rapid cuts within a scene.
- **Transitions**: Clean flash-cut OR smooth depth pull between scenes. Never: wipe, spin, zoom burst, or any PowerPoint-style transition.
- **Timing**: tight — no element static for more than 2 seconds without micro-animation.
- **Data Flow**: Connection lines between nodes have animated particles travelling along them. Glowing edges on all diagram connections. Data appears to flow from source to destination.

## DIAGRAM & CONCEPT STYLE
- Node-and-connection flowcharts with glowing edges
- Animated data flow particles on connection lines
- Icons: minimal, monochrome, geometric — no clipart, no emoji
- Concept cards: floating labeled panels connected by thin luminous lines
- Architecture diagrams: look like actual engineering documentation but beautiful
- Labels: clean, white, small — never crowded

## BACKGROUND
- Deep Navy / Charcoal (#07090D to #0B0E14)
- Subtle background grid or slow-moving ambient particles
- Depth blur on everything except the main subject

## THE FORBIDDEN LIST
These elements are permanently banned from this pipeline. Any agent generating content must reject outputs containing these:
❌ White or light backgrounds
❌ Comic Sans or any decorative/display fonts
❌ Clipart, cartoon icons, or stock illustration style
❌ Text walls appearing all at once
❌ Zoom-in-zoom-out on static images
❌ Bullet point reveals
❌ Stock footage that doesn't match narration
❌ Rainbow or multi-color schemes
❌ Neon overload (more than one accent color)
❌ Anything that looks like a template
❌ Cheap particle explosions
❌ Lens flares
❌ Cheesy lower thirds
❌ Any transition from iMovie or PowerPoint
❌ Mixed fonts
❌ Drop shadows on text
❌ Outlined text
❌ Hard shadows
❌ Linear easing on any animation
❌ Random entry directions
❌ Flat 2D slides with no depth

## QUALITY STANDARD
Every single frame must be screenshot-worthy.
If paused at any random moment, it should look like premium product design artwork.
The viewer should feel like they are watching content from a channel that costs serious money to produce — because visually, it does.
Ask before generating: "If this frame was posted as a still image on Twitter/X, would it get engagement from designers?" If the answer is no, regenerate.

## MOTION GRAPHICS TYPE
This pipeline produces a combination of:
1. **3D SaaS Animation** — floating UI, glassmorphism, depth
2. **Kinetic Typography** — word-synced text reveals
3. **UI/UX Screen Animation** — simulated interface interactions
4. **Data Visualization Animation** — flowing data, animated diagrams

All four types must feel cohesive within a single video.

## TECHNICAL STACK
- **Remotion** — React-based video rendering, kinetic typography, scene composition
- **Three.js** — 3D elements, floating cards, depth effects
- **WhisperX** — word-level timestamp extraction for text sync
- **GitHub Actions** — automated rendering pipeline
- **Cloudflare R2** — asset storage
