---
name: motion-anything
description: Motion router — the agentic motion layer. Generate animated pages and launch videos from one sentence. Edit motion on running pages, component by component. 403 curated motion recipes, 8 coding-agent engines, export to JSON, CSS, React, Lottie, MP4, GIF.
license: Apache-2.0
---

# motion-anything

Describe the feeling — your AI ships the animation. A local-first, chat-native motion engine with 403 curated motion recipes.

## Quick Start

```bash
# Install motion-anything CLI
npm install -g motion-anything

# Initialize a project
motion init my-project

# Start the workbench (browser-based editor)
motion start

# Export to MP4
motion export video
```

## Features

- **403 curated motion recipes** — searchable by intent, with live card previews
- **4 triggers × 13 motion verbs** — entrance, emphasis, attention, exit
- **Spring easing** — physics-based motion, not CSS timing
- **Full keyframe editor** — 6-track timeline with scrub + auto-keyframe
- **Export to anything** — JSON, CSS, React, Lottie, MP4, GIF, portable skills

## Motion Verbs

| Category | Verbs |
|----------|-------|
| Entrance | fadeIn, slideUp, scaleIn, rotateIn, morphIn |
| Emphasis | pulse, bounce, shake, glow, highlight |
| Attention | spotlight, cursor, magnify, zoom |
| Exit | fadeOut, slideDown, scaleOut, rotateOut, morphOut |

## Recipe Structure

```
recipes/
├── web/
│   ├── _fx/
│   │   ├── shaderbg.js      # WebGL shader backgrounds
│   │   ├── liquid.js        # Liquid transitions
│   │   └── particle.js      # Particle effects
│   ├── entrance/
│   │   ├── fadeUp/
│   │   │   ├── recipe.motion.yaml
│   │   │   ├── SKILL.md
│   │   │   ├── preview.html
│   │   │   └── fadeUp.js
│   │   └── ...
│   └── ...
├── interaction/
│   ├── hover/
│   ├── scroll/
│   └── drag/
└── video/
    ├── transition/
    ├── text/
    └── shape/
```

## Agent Integration (OpenCode)

```bash
# Use the motion router
opencode run "Add a fade-in entrance to my hero section"
opencode run "Create a product launch video with kinetic typography"
opencode run "Make this dashboard animate on load"
```

## Design System Integration

59 brand packs in Open Design's `DESIGN.md` format:
- Color architecture
- Typography scale
- Spacing rhythm
- Motion personality (Subtle → Cinematic)

## Export Formats

| Format | Use Case |
|--------|----------|
| JSON | Portable motion data |
| CSS | Web animations |
| React | Component animations |
| Lottie | After Effects / mobile |
| MP4 | Video export |
| GIF | Social media |
| SKILL.md | Portable agent skill |

## Links

- GitHub: https://github.com/heyxianggao/motion-anything
- Open Design: https://github.com/nexu-io/open-design
- Gallery: https://motion-anything.gallery
