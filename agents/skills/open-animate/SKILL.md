---
name: open-animate
description: Open Animate — the creative suite for AI agents. Create professional motion graphics, generate images, and render MP4 videos. Use when the user wants to make videos, animations, motion graphics, social clips, product launches, explainers, or any visual content.
license: Apache-2.0
---

# Open Animate Skill

Create polished motion graphics and MP4 videos by generating assets, composing scenes, and rendering with Remotion-based workflows.

## Quick Start

```bash
# Install oanim CLI
npm install -g oanim

# Initialize a new project
oanim init my-video

# Start Remotion Studio for preview
npx remotion studio

# Render to MP4
oanim render
```

## Agent Workflow

1. Read the user's brief. If no brief, ask what they want to create.
2. Follow the workflow in `references/workflow.md`.
3. Use `@oanim/core` components and presets — see `references/animation-cookbook.md`.
4. Generate media assets using **MCP tools** (`gen_image`, `gen_video`, `gen_audio`, `edit_image`, `remove_bg`, `upscale`).
5. Preview with `npx remotion studio` and render with `npx oanim render`.

## Capabilities

| Capability | Tool |
|------------|------|
| Project scaffolding | `oanim init` |
| Animation presets (fadeUp, popIn, springs) | `@oanim/core` |
| Components (Terminal, Card, Badge, GlowOrb) | `@oanim/core` |
| Scene transitions (fadeBlur, clipCircle, wipe) | `@oanim/core` |
| Typography (AnimatedCharacters, TypewriterText, CountUp) | `@oanim/core` |
| Design tokens (5 palettes, fonts, spacing) | `@oanim/core` |
| Rendering to video | `oanim render` |
| Cloud rendering | `oanim render --cloud` |
| AI image generation | `oanim assets gen-image` |
| AI video generation | `oanim assets run` (kling, minimax, hunyuan models) |
| AI audio generation | `oanim assets run` (stable-audio model) |
| Media compositing | `<Img>`, `<Video>`, `<Audio>` via `staticFile()` |
| Image editing | `oanim assets edit-image` |
| Background removal | `oanim assets remove-bg` |
| Image upscaling | `oanim assets upscale` |
| Any fal.ai model | `oanim assets run` |

## MCP Tools

| Tool | Description |
|------|-------------|
| `gen_image` | Generate image from text prompt |
| `edit_image` | Edit existing image with prompt |
| `remove_bg` | Remove background from image |
| `upscale` | Upscale image 2x |
| `gen_video` | Generate video from text (async) |
| `gen_audio` | Generate audio from text (async) |
| `run_model` | Run any fal.ai model |

## Templates

- `launch-video.md` — Product launch (5s)
- `explainer.md` — Step-based explainer (20s)
- `logo-reveal.md` — Logo animation (5s)
- `meme-caption.md` — Social clip (6s)
- `investor-update.md` — Metrics dashboard (15s)

## Design System

- 5 color palettes (warm, cool, vibrant, muted, neon)
- Font stacks optimized for video
- Spacing scale for 1920x1080
- Animation presets with spring easing

## Links

- GitHub: https://github.com/jacobcwright/open-animate
- npm: https://www.npmjs.com/package/oanim
- OpenCode skill: https://github.com/jacobcwright/skills
