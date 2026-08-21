# html-video Skill

HTML becomes video — on your laptop. Turn HTML, CSS & data into real MP4 with pluggable rendering engines, 21 templates, AI soundtrack.

## Overview

html-video is a programmatic video framework for coding agents. Describe a video, or paste an article link / GitHub repo, and the agent turns it into a multi-frame, fully animated video — then renders it to a real MP4 right on your machine.

## Features

- **Real MP4 render** — Headless Chromium records animated HTML and ffmpeg encodes it (libx264)
- **21 templates** — Data viz, product promos, social shorts, explainers, kinetic type, transitions
- **Multi-frame storyboards** — Content-graph drives multi-scene videos
- **AI soundtrack** — Optional background music + narration via MiniMax
- **Pluggable engines** — Hyperframes (shipped), Remotion/Motion Canvas (planned)

## Quick Start

```bash
# Install html-video CLI
npm install -g html-video

# Create a new video project
html-video init my-video

# Start the studio (browser-based editor)
html-video studio

# Render to MP4
html-video render
```

## Agent Integration (OpenCode)

html-video works with OpenCode via `opencode run`:

```bash
# Describe what you want
opencode run "Create a 30-second product promo video with kinetic typography"

# Or paste a URL to convert
opencode run "Turn this article into a video: https://example.com/article"
```

## Template Types

| Type | Use Case | Example |
|------|----------|---------|
| `data-viz` | Charts, graphs, infographics | NYT-style animated charts |
| `product-promo` | Product reveals, ads | 15s/30s multi-scene promos |
| `social-short` | TikTok, Reels, Shorts | 9:16 vertical videos |
| `explainer` | How-to, educational | Decision-tree explainers |
| `kinetic-type` | Text animations | Typewriter, glitch, morph |
| `transition` | Scene transitions | Crossfades, wipes, reveals |

## Composition Structure

```html
<!doctype html>
<html>
<head>
  <style>
    /* CSS for styling */
  </style>
</head>
<body>
  <div data-composition-id="my-video"
       data-start="0"
       data-duration="5"
       data-width="1920"
       data-height="1080">
    <!-- Animated content here -->
  </div>
  
  <script src="https://cdn.jsdelivr.net/npm/gsap@3/dist/gsap.min.js"></script>
  <script>
    // GSAP animations timeline
    const tl = gsap.timeline();
    tl.from(".title", { opacity: 0, y: 50, duration: 1 });
    tl.to(".title", { opacity: 1, y: 0, duration: 1 });
  </script>
</body>
</html>
```

## CLI Commands

```bash
html-video init [name]        # Scaffold new project
html-video studio             # Start browser studio
html-video render             # Render to MP4
html-video render --watch     # Watch mode
html-video templates          # List available templates
html-video template [name]    # Use a template
```

## Rendering Options

```bash
# Basic render
html-video render -o output.mp4

# With options
html-video render -o output.mp4 --fps 30 --width 1920 --height 1080

# With AI soundtrack
html-video render -o output.mp4 --music "upbeat electronic" --narration "Welcome to our product"
```

## AI Soundtrack

```bash
# Generate narration
html-video tts "Welcome to the future of technology" -o narration.mp3

# Generate background music
html-video music "upbeat corporate electronic" -o music.mp3

# Mix into video
html-video render -o output.mp4 --narration narration.mp3 --music music.mp3
```

## License

Apache-2.0 — no per-render fees, no seat caps, no contributor agreements.

## Links

- GitHub: https://github.com/nexu-io/html-video
- Open Design: https://github.com/nexu-io/open-design
- Templates: https://github.com/nexu-io/html-video/tree/main/templates
