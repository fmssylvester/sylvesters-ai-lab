# Sylvester's AI Lab — Visual Direction v1.0

## The Core Idea

**Physical Motion Design.** Every element on screen has mass, momentum, and spatial presence. Nothing floats — everything MOVES with purpose. The viewer should feel like they're looking into a physical space, not at a flat screen.

## What We Are NOT

- Not EsmileAi (gradient + glassmorphic cards + presenter)
- Not MalvaAi (dark green cinematic + AI B-roll showcase)
- Not "kinetic typography on dark void" (our old approach)
- Not fake 3D (CSS perspective tricks on flat elements)

## What We ARE

**Programmatic cinema.** We use Remotion's strengths — procedural generation, spring physics, frame-precise timing — to create motion that would be tedious in After Effects but feels alive in code.

## Color System

### Primary palette
- **Void**: `#07090D` — deep black, NOT flat. Always has a subtle radial gradient or noise texture.
- **Signal**: `#00D9FF` — electric cyan. Used for highlights, active elements, glow.
- **Weight**: `#E7B84D` — warm gold. Used for emphasis, warnings, value indicators.
- **Neutral**: `#8A8F98` — cool gray. Used for secondary text, inactive elements.

### Background treatment
NEVER flat `#07090D`. Always one of:
1. Radial gradient with subtle cyan/teal bloom at 5-10% opacity
2. Noise-textured gradient (fine grain, 3-5% opacity)
3. Gradient mesh with 2-3 overlapping radial gradients at different positions

### Accent usage
- Cyan: 1-2 elements per frame max. Must glow.
- Gold: 0-1 elements per frame max. Must feel warm/important.
- Everything else: white or gray.

## Typography System

### Fonts
- **Display**: `'Inter'` or system sans-serif, weight 800-900
- **Body**: `'Inter'` or system sans-serif, weight 400-500
- NO serif fonts (we're a tech lab, not a luxury brand)

### Rules
1. **Text is NEVER the hero.** Every frame must have a visual element (icon, card, diagram, B-roll) that carries the story. Text labels, explains, or emphasizes.
2. **Two sizes only**: Headline (60-120px) and caption (18-24px). No medium.
3. **Keyword highlighting**: Only the most important 1-2 words per sentence get color (cyan or gold). Everything else is white.
4. **Text always has a visual anchor**: It sits next to, below, or inside a visual element. Never alone in the center of the frame.

## Visual Elements

### The Glassmorphic Card (our signature element)
- `backdrop-filter: blur(12px)` over a semi-transparent background
- Rounded corners (16-24px)
- Subtle border: 1px solid `rgba(255,255,255,0.08)`
- Box shadow: soft, spread, low opacity — creates depth
- Can contain: icons, text, small diagrams, mini UI mockups
- Animation: enters with spring physics (not linear fade)

### The Icon-in-Card
- Glassmorphic card containing a centered SVG icon
- Icon glows with its brand color (cyan or gold)
- Card has a subtle inner glow matching the icon color
- Used for: tool logos, concept symbols, chapter markers

### The Data Visualization
- Charts, counters, progress bars — all built with CSS/SVG
- Animated with spring physics on entry
- Use our color palette: cyan bars, gold highlights, gray backgrounds
- Numbers count up/down with spring easing

### The Diagram/Flow
- Connected nodes showing relationships or processes
- Nodes: glassmorphic circles or rounded rectangles
- Connections: animated lines that draw themselves
- Used for: workflow explanations, architecture diagrams

## Motion Principles

### 1. Physical momentum
Every element that enters or exits must have:
- A source direction (where it came from)
- Acceleration/deceleration (spring physics, not linear)
- A settle point (slight overshoot, then rest)

### 2. Depth through blur
- Elements closer to camera: slightly larger, sharper
- Elements further: smaller, slightly blurred (2-4px)
- This creates genuine 3D space without CSS perspective tricks

### 3. Parallax on camera movement
When the "camera" pans or zooms:
- Background layer moves at 0.3x speed
- Midground at 0.7x
- Foreground at 1.0x
- This makes every scene feel like a physical space

### 4. Micro-interactions
Small details that sell the physical feel:
- Hover states on cards (scale 1.02, shadow deepens)
- Number counters that bounce on settle
- Lines that wiggle slightly after drawing
- Particles that drift with subtle noise

## Scene Structure

Every scene follows this layer order (back to front):
1. `z-0`: Background (gradient + noise)
2. `z-10`: Ambient particles (tiny dots, slow drift)
3. `z-50`: B-roll or main visual (AI-generated footage, diagrams, cards)
4. `z-100`: Typography
5. `z-150`: UI chrome (counters, labels, small elements)
6. `z-200`: Post-FX (vignette, grain, glow)

## Transition Language

### Between scenes
- **Cross-dissolve with parallax**: Current scene recedes (scales down, blurs), new scene enters from depth (scales up from small, sharpens). 15-20 frames.
- **Hard cut**: For emphasis or rhythm change. 0 frames.

### Within scenes
- **Element entry**: Spring physics from below or side. 10-15 frames to settle.
- **Element exit**: Slide in direction of travel + fade. 8-12 frames.
- **Text reveal**: Word-by-word with stagger. No blur, no scale — just opacity fade with slight Y offset.

## What We Can't Do (and shouldn't try)

- Real presenter footage (no camera)
- Complex 3D modeling (no Three.js dependency)
- Screen recordings of live software (no browser automation)
- Stock footage (no licensed content)

## What We CAN Do (and should excel at)

- Procedural visual metaphors (node graphs, data flows, abstract representations)
- Programmatic typography that responds to content
- Generated patterns and textures (noise, grids, constellations)
- Physics-based motion that feels organic
- Precise frame-by-frame sync with narration
- Visual storytelling through abstract elements that REPRESENT concepts
