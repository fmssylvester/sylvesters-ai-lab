// Reusable scanline / CRT overlay (feeds the "Neon Environment Pack").
//
// Animated horizontal scanlines plus an optional travelling scan beam — the
// cyber/SaaS surface treatment. Pure CSS gradients, frame-driven, no WebGL.
// Used as a top overlay layer above dashboards, HUDs, or terminal scenes to
// imply a live screen. Complements GridEngine (grid) and Shader (glitch).

import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";

export interface ScanlineProps {
  frame: number;
  color?: string;
  opacity?: number;
  lineGap?: number; // px between scanlines
  speed?: number; // px/frame beam travel
  beam?: boolean; // travelling bright band
  style?: React.CSSProperties;
  className?: string;
}

export const Scanline: React.FC<ScanlineProps> = ({
  frame,
  color = "rgba(0,217,255,0.10)",
  opacity = 0.5,
  lineGap = 4,
  speed = 3,
  beam = true,
  style,
  className,
}) => {
  const scan = `repeating-linear-gradient(0deg, transparent 0, transparent ${lineGap - 1}px, ${color} ${lineGap - 1}px, ${color} ${lineGap}px)`;
  const beamPos = ((frame * speed) % 200) - 100; // -100%..100%
  const beamGrad = `linear-gradient(0deg, transparent 0%, rgba(0,217,255,0.18) 50%, transparent 100%)`;
  const mask = "linear-gradient(0deg, transparent 0%, #000 20%, #000 80%, transparent 100%)";

  return (
    <AbsoluteFill
      className={className}
      style={{
        ...style,
        opacity,
        pointerEvents: "none",
        backgroundImage: beam ? `${beamGrad}, ${scan}` : scan,
        backgroundSize: beam ? `100% 40%, 100% ${lineGap}px` : `100% ${lineGap}px`,
        backgroundPosition: beam ? `0 ${beamPos}%, 0 0` : "0 0",
        backgroundRepeat: "no-repeat, repeat",
        maskImage: mask,
        WebkitMaskImage: mask,
      }}
    />
  );
};
