// Reusable audio-reactive building block (motion-graphics primitive).
//
// Drives scale / glow / brightness from a per-frame amplitude signal. In the
// production pipeline the `levels` array comes from audio analysis (e.g.
// WhisperX / ffmpeg RMS); for standalone scenes it falls back to a BPM pulse so
// the engine is still usable without an audio track. Pure and frame-driven —
// no Web Audio, no state, safe for headless export.
//
// This is the "beat" hook that lets motion feel musically motivated rather
// than arbitrarily timed.

import React, { ReactNode } from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";

export interface AudioReactiveProps {
  frame: number;
  fps: number;
  levels?: number[]; // per-frame amplitude 0..1
  fallbackBpm?: number; // pulse rate when no levels supplied
  sensitivity?: number; // scale multiplier at full amplitude
  glow?: string;
  children: ReactNode;
  style?: React.CSSProperties;
  className?: string;
}

export const AudioReactive: React.FC<AudioReactiveProps> = ({
  frame,
  fps,
  levels,
  fallbackBpm = 120,
  sensitivity = 0.4,
  glow = "rgba(0,217,255,0.6)",
  children,
  style,
  className,
}) => {
  let amp: number;
  if (levels && levels.length) {
    const idx = Math.min(levels.length - 1, Math.max(0, Math.round(frame)));
    amp = levels[idx] ?? 0;
  } else {
    const beatsPerSec = fallbackBpm / 60;
    const phase = (frame / fps) * beatsPerSec;
    amp = Math.abs(Math.sin(phase * Math.PI)); // 0..1 pulse
  }
  const scale = 1 + amp * sensitivity;

  return (
    <AbsoluteFill
      className={className}
      style={{
        ...style,
        transform: `scale(${scale})`,
        boxShadow: `0 0 ${amp * 40}px ${glow}`,
        filter: `brightness(${1 + amp * 0.3})`,
      }}
    >
      {children}
    </AbsoluteFill>
  );
};
