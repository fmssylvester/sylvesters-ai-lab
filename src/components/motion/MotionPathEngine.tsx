// Reusable motion-path building block (extends the Asset Vault engine set).
//
// Moves any layer along a path with eased progress and optional tangent
// rotation — the object-level counterpart to CameraEngine (which moves the
// camera) and MotionPresets (which only do simple transforms). Paths are
// supplied as normalised 0..1 points, so no DOM measurement is required and it
// is safe for headless export. Positioning uses left/top percentages, so it
// works inside any relatively-positioned parent.
//
// Use for: cursors tracing a route, nodes flying along a workflow, a logo
// arcing into place, a reticle sweeping a scan path.

import React, { ReactNode } from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate } from "remotion";
import { sampleCurve, CurveName } from "../../core/motion/AnimationCurves";

export interface PathPoint {
  x: number; // 0..1 of parent width
  y: number; // 0..1 of parent height
}

export interface MotionPathProps {
  points: PathPoint[]; // 2+ points, normalised 0..1
  frame: number;
  fps: number;
  start?: number;
  duration: number;
  curve?: CurveName;
  rotateToTangent?: boolean; // orient element along direction of travel
  children: ReactNode;
  style?: React.CSSProperties;
  className?: string;
}

function samplePath(points: PathPoint[], q: number): { x: number; y: number; angle: number } {
  if (points.length === 1) return { ...points[0], angle: 0 };
  // cumulative chord lengths
  const segLen: number[] = [];
  let total = 0;
  for (let i = 0; i < points.length - 1; i++) {
    const dx = points[i + 1].x - points[i].x;
    const dy = points[i + 1].y - points[i].y;
    const l = Math.hypot(dx, dy);
    segLen.push(l);
    total += l;
  }
  if (total === 0) return { ...points[0], angle: 0 };

  let target = q * total;
  let i = 0;
  while (i < segLen.length - 1 && target > segLen[i]) {
    target -= segLen[i];
    i++;
  }
  const seg = segLen[i] || 1;
  const local = seg === 0 ? 0 : target / seg;
  const a = points[i];
  const b = points[i + 1];
  const x = a.x + (b.x - a.x) * local;
  const y = a.y + (b.y - a.y) * local;
  const angle = (Math.atan2(b.y - a.y, b.x - a.x) * 180) / Math.PI;
  return { x, y, angle };
}

export const MotionPath: React.FC<MotionPathProps> = ({
  points,
  frame,
  fps,
  start = 0,
  duration,
  curve = "smooth",
  rotateToTangent = false,
  children,
  style,
  className,
}) => {
  const q = interpolate((frame - start) / Math.max(1, duration), [0, 1], [0, 1], {
    easing: (t) => sampleCurve(curve, t),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const { x, y, angle } = samplePath(points, q);

  return (
    <AbsoluteFill className={className} style={{ pointerEvents: "none" }}>
      <div
        style={{
          position: "absolute",
          left: `${x * 100}%`,
          top: `${y * 100}%`,
          transform: `translate(-50%, -50%)${rotateToTangent ? ` rotate(${angle}deg)` : ""}`,
          ...style,
        }}
      >
        {children}
      </div>
    </AbsoluteFill>
  );
};
