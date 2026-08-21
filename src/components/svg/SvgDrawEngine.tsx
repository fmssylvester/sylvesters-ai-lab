// Reusable SVG motion building blocks (Asset Vault: "SVGs").
//
// Turns static SVG path assets into animated, drawn-on graphics — the motion
// layer for the lab's icon / diagram / logo library. Uses SVG `pathLength`
// normalisation (no DOM measurement, safe for headless export) so any path
// draws on consistently regardless of its real length. Optionally fades a fill
// in after the stroke completes, so a line-art asset can resolve into a solid.
//
// Frame-driven and reusable: drop it into any scene that needs an asset to
// "draw itself" (logos, wiring diagrams, HUD reticles, signature marks).

import React from "react";
import { useCurrentFrame, useVideoConfig, interpolate } from "remotion";
import { sampleCurve, CurveName } from "../../core/motion/AnimationCurves";

export interface SvgDrawProps {
  d: string | string[];
  frame: number;
  fps: number;
  start?: number;
  duration: number;
  curve?: CurveName;
  stroke?: string;
  strokeWidth?: number;
  fill?: string;
  fillAfter?: number; // 0..1 progress at which fill begins (default 1 = no fill)
  viewBox?: string;
  style?: React.CSSProperties;
  className?: string;
}

export const SvgDraw: React.FC<SvgDrawProps> = ({
  d,
  frame,
  fps,
  start = 0,
  duration,
  curve = "smooth",
  stroke = "#00D9FF",
  strokeWidth = 2,
  fill,
  fillAfter = 1,
  viewBox = "0 0 100 100",
  style,
  className,
}) => {
  const paths = Array.isArray(d) ? d : [d];
  const p = interpolate((frame - start) / Math.max(1, duration), [0, 1], [0, 1], {
    easing: (t) => sampleCurve(curve, t),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const fillOpacity =
    fill && fillAfter < 1 && p > fillAfter
      ? (p - fillAfter) / (1 - fillAfter)
      : fill && fillAfter >= 1
      ? 0
      : 0;

  return (
    <svg
      viewBox={viewBox}
      width="100%"
      height="100%"
      preserveAspectRatio="xMidYMid meet"
      className={className}
      style={{ overflow: "visible", ...style }}
    >
      {paths.map((path, i) => (
        <path
          key={i}
          d={path}
          pathLength={1}
          fill="none"
          stroke={stroke}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray={1}
          strokeDashoffset={1 - p}
        />
      ))}
      {fill && fillOpacity > 0 && (
        <path d={paths[paths.length - 1]} fill={fill} stroke="none" opacity={fillOpacity} />
      )}
    </svg>
  );
};
