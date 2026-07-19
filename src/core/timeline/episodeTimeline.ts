// Episode timeline — single source of truth for pacing.
// 30fps. Audio is muxed in post-render (render_trigger.py), so the
// narration window begins after INTRO and ends before OUTRO.
import { motionTokens } from "../motion/motionTokens";

export const EPISODE = {
  FPS: 30,
  INTRO: 75, // cold-open frames before narration
  OUTRO: 90, // CTA frames after narration
  TRANSITION: 14, // cross-fade frames between spoken beats
  spring: motionTokens.spring,
  easing: motionTokens.easing,
} as const;
