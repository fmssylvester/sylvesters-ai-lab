// Reusable parallax building block (motion-graphics primitive).
//
// Realises the "Parallax on camera movement" principle from visual-direction.md:
// layers at different `depth` travel by depth × camera motion, so background
// drifts slowly and foreground rushes — genuine spatial feel without CSS
// perspective tricks. Frame-driven and pure; each layer is an arbitrary node.
//
// Pairs with CameraEngine (which moves the "camera"); Parallax moves the
// content planes in response.

import React, { ReactNode } from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate } from "remotion";
import { sampleCurve, CurveName } from "../../core/motion/AnimationCurves";

export interface ParallaxLayer {
  depth: number; // 0 = locked, 1 = full travel
  children: ReactNode;
}

export interface ParallaxProps {
  layers: ParallaxLayer[];
  frame: number;
  fps: number;
  start?: number;
  duration: number;
  curve?: CurveName;
  axis?: "x" | "y";
  distance?: number; // px travel at depth=1
  style?: React.CSSProperties;
  className?: string;
}

export const Parallax: React.FC<ParallaxProps> = ({
  layers,
  frame,
  fps,
  start = 0,
  duration,
  curve = "smooth",
  axis = "y",
  distance = 120,
  style,
  className,
}) => {
  const p = interpolate((frame - start) / Math.max(1, duration), [0, 1], [0, 1], {
    easing: (t) => sampleCurve(curve, t),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const travel = (p - 0.5) * 2; // -1..1 around centre

  return (
    <AbsoluteFill className={className} style={{ ...style, overflow: "hidden" }}>
      {layers.map((l, i) => {
        const off = l.depth * travel * distance;
        const transform = axis === "y" ? `translateY(${off}px)` : `translateX(${off}px)`;
        return (
          <AbsoluteFill key={i} style={{ transform }}>
            {l.children}
          </AbsoluteFill>
        );
      })}
    </AbsoluteFill>
  );
};
