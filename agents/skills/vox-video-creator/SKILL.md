---
name: vox-video-creator
description: Create Vox-style explainer videos with paper-collage aesthetic. Generates storyboard, images, videos, and stitches them together. Use when asked to make explainer videos, educational content, or editorial-style motion graphics.
---

# Vox-Style Video Creator

Create professional explainer videos in the Vox editorial style — paper-collage aesthetic, bold typography, clean design.

## Workflow

1. **Research** — Use Gemini to analyze topic and create storyboard
2. **Images** — Generate scene images with Pollinations.ai (free)
3. **Videos** — Convert images to videos with Ken Burns effect
4. **Stitch** — Combine all scenes with FFmpeg
5. **Audio** — Add narration (optional)

## Quick Start

```bash
python vox_video.py "Your topic here"
```

## Storyboard Format

The script creates a JSON storyboard:

```json
{
  "title": "Video Title",
  "scenes": [
    {
      "scene_number": 1,
      "narration": "What the narrator says",
      "visual_description": "Detailed description for image generation",
      "animation_direction": "Camera movement and element animation",
      "duration_seconds": 5
    }
  ],
  "style_prompt": "Vox editorial style, paper collage, bold colors",
  "color_palette": ["#FF6B6B", "#4ECDC4", "#45B7D1"]
}
```

## Style Guide (from video)

### Visual Language
- Paper-collage aesthetic
- Hand-cut paper look
- Bold flat colors
- Big cut-out headlines
- Torn edges, tape, halftone dots

### Animation Style
- Measured, slightly choppy
- Editorial feel
- Information-focused
- No flashy transitions
- Progressive reveal

### Typography
- Bold sans-serif
- Large scale
- High contrast
- Minimal text per frame

## Example Prompts

```
Create a Vox-style video about the history of the internet
Make an explainer video about climate change in Vox style
Generate a 30-second video about AI using paper-collage aesthetic
```

## Output

- `vox_output/storyboard.json` — Scene breakdown
- `vox_output/temp/scene_*.png` — Generated images
- `vox_output/temp/video_*.mp4` — Scene videos
- `vox_output/final_*.mp4` — Final stitched video
- `vox_output/vox_*.mp4` — Final with audio (if added)

## Dependencies

- FFmpeg (for video processing)
- Python 3.8+
- requests library
- Gemini API key (free tier)

## Advanced Usage

### Custom Style
Edit the `style_prompt` in the storyboard to change the visual style:
- `"minimalist, black and white"`
- `"vibrant, neon colors"`
- `"vintage, film grain"`

### Longer Videos
Increase `duration_seconds` in each scene, or add more scenes to the storyboard.

### Better Quality
- Use `gemini-3-pro-image` for higher quality images
- Increase FFmpeg `-crf` value (lower = better quality, larger file)
