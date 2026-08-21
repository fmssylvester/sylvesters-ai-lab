// Reusable trail building block (motion-graphics primitive).
//
// Stamps fading "ghost" copies of a layer along a path defined by a pure
// `sample(t)` function (t in 0..1). Because sampling is functional and
// frame-driven, it is safe for headless export and composes with MotionPath's
// point model. Use for cursors, projectiles, comets, or any element that should
// leave a sense of speed.
//
// Note: trails read PAST positions (t < current), so they never depend on
// React state — fully deterministic per frame.

import React, { ReactNode } from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate } from "remotion";
import { sampleCurve, CurveName } from "../../core/motion/AnimationCurves";

export interface TrailSample {
  x: number; // 0..1 of parent
  y: number; // 0..1 of parent
  scale?: number;
  rotate?: number;
}

export interface TrailProps {
  sample: (t: number) => TrailSample;
  frame: number;
  fps: number;
  start?: number;
  duration: number;
  curve?: CurveName;
  count?: number; // number of ghost copies
  spacing?: number; // frames between ghosts
  baseOpacity?: number;
  children: ReactNode;
  style?: React.CSSProperties;
  className?: string;
}

export const Trail: React.FC<TrailProps> = ({
  sample,
  frame,
  fps,
  start = 0,
  duration,
  curve = "smooth",
  count = 6,
  spacing = 2,
  baseOpacity = 0.5,
  children,
  style,
  className,
}) => {
  const q = interpolate((frame - start) / Math.max(1, duration), [0, 1], [0, 1], {
    easing: (t) => sampleCurve(curve, t),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const ghosts: React.ReactNode[] = [];
  for (let k = 1; k <= count; k++) {
    const tq = q - (k * spacing) / Math.max(1, duration);
    if (tq <= 0) continue;
    const s = sample(tq);
    const op = baseOpacity * (1 - k / (count + 1));
    ghosts.push(
      <div
        key={k}
        style={{
          position: "absolute",
          left: `${s.x * 100}%`,
          top: `${s.y * 100}%`,
          transform: `translate(-50%, -50%) scale(${(s.scale ?? 1) * (1 - k * 0.04)}) rotate(${s.rotate ?? 0}deg)`,
          opacity: op,
        }}
      >
        {children}
      </div>
    );
  }

  const cur = sample(q);
  return (
    <AbsoluteFill className={className} style={{ pointerEvents: "none" }}>
      {ghosts}
      <div
        style={{
          position: "absolute",
          left: `${cur.x * 100}%`,
          top: `${cur.y * 100}%`,
          transform: `translate(-50%, -50%) scale(${cur.scale ?? 1}) rotate(${cur.rotate ?? 0}deg)`,
          ...style,
        }}
      >
        {children}
      </div>
    </AbsoluteFill>
  );
};
