// Reusable animated grid backdrop (motion-graphics primitive).
//
// A scrolling tech-grid floor/wall built purely from CSS gradients — no SVG
// measurement, no WebGL, safe for headless export. Honours the "Neon
// Environment" / "Cyber Dashboard" pack language: subtle cyan lines on void,
// drifting to imply motion, edge-faded so it reads as depth rather than a flat
// texture. Compliments AtmosphereEngine as a background layer.
//
// Constitution note: this is a flat scrolling grid, NOT a CSS-perspective fake
// 3D floor — we keep motion physically motivated, not faked depth.

import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";

export interface GridProps {
  frame: number;
  cell?: number; // px between lines
  color?: string; // line colour
  glow?: string; // base background tint
  speed?: number; // px per frame scroll
  lineWidth?: number;
  angle?: number; // grid rotation in degrees
  fade?: boolean; // edge vignette mask
  vertical?: boolean; // scroll direction
  style?: React.CSSProperties;
  className?: string;
}

export const Grid: React.FC<GridProps> = ({
  frame,
  cell = 48,
  color = "rgba(0,217,255,0.18)",
  glow = "rgba(0,217,255,0.04)",
  speed = 0.6,
  lineWidth = 1,
  angle = 0,
  fade = true,
  vertical = true,
  style,
  className,
}) => {
  const offset = (frame * speed) % cell;
  const line = (deg: number) =>
    `repeating-linear-gradient(${deg}deg, transparent 0, transparent ${cell - lineWidth}px, ${color} ${cell - lineWidth}px, ${color} ${cell}px)`;
  const mask = fade
    ? "radial-gradient(ellipse at center, #000 35%, transparent 80%)"
    : "none";

  return (
    <AbsoluteFill
      className={className}
      style={{
        ...style,
        backgroundColor: glow,
        transform: `rotate(${angle}deg) scale(1.5)`,
        backgroundImage: `${line(90)}, ${line(0)}`,
        backgroundSize: `${cell}px ${cell}px`,
        backgroundPosition: vertical ? `0 ${offset}px` : `${offset}px 0`,
        maskImage: mask,
        WebkitMaskImage: mask,
      }}
    />
  );
};
