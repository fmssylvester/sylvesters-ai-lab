// Reusable cinematic camera rig (feeds the "Camera Movement Pack").
//
// Named, reusable camera moves applied as a transform to any layer. This is the
// high-level "rig" on top of CameraEngine: directors pick a move by name
// (pushIn, dollyLeft, crane, orbit, handheld…) instead of hand-authoring
// transforms per scene. Frame-driven, pure, headless-safe. Pairs with
// Parallax (content planes) so a move + parallax together read as a real camera.

import React, { ReactNode } from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate } from "remotion";
import { sampleCurve, CurveName } from "../../core/motion/AnimationCurves";

export type CameraPreset =
  | "pushIn"
  | "pullBack"
  | "dollyLeft"
  | "dollyRight"
  | "craneUp"
  | "craneDown"
  | "orbit"
  | "handheld"
  | "zoom";

export interface CameraRigProps {
  preset?: CameraPreset;
  frame: number;
  fps: number;
  start?: number;
  duration: number;
  curve?: CurveName;
  intensity?: number; // 0..1 amount of the move
  children: ReactNode;
  style?: React.CSSProperties;
  className?: string;
}

export const CameraRig: React.FC<CameraRigProps> = ({
  preset = "pushIn",
  frame,
  fps,
  start = 0,
  duration,
  curve = "smooth",
  intensity = 0.15,
  children,
  style,
  className,
}) => {
  const p = interpolate((frame - start) / Math.max(1, duration), [0, 1], [0, 1], {
    easing: (t) => sampleCurve(curve, t),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  let transform = "scale(1)";
  switch (preset) {
    case "pushIn":
      transform = `scale(${1 + p * intensity})`;
      break;
    case "pullBack":
      transform = `scale(${1 - p * intensity * 0.4})`;
      break;
    case "dollyLeft":
      transform = `translateX(${p * intensity * 30}%)`;
      break;
    case "dollyRight":
      transform = `translateX(${-p * intensity * 30}%)`;
      break;
    case "craneUp":
      transform = `translateY(${-p * intensity * 30}%)`;
      break;
    case "craneDown":
      transform = `translateY(${p * intensity * 30}%)`;
      break;
    case "orbit":
      transform = `rotate(${p * intensity * 4}deg) scale(${1 + p * intensity * 0.1})`;
      break;
    case "zoom":
      transform = `scale(${1 + p * intensity * 1.5})`;
      break;
    case "handheld": {
      const s = Math.sin(frame * 0.5) * intensity * 8;
      const c = Math.cos(frame * 0.37) * intensity * 6;
      transform = `translate(${s}px, ${c}px) rotate(${Math.sin(frame * 0.3) * intensity * 1.5}deg)`;
      break;
    }
  }

  return (
    <AbsoluteFill
      className={className}
      style={{ ...style, transform, transformOrigin: "50% 50%", overflow: "hidden" }}
    >
      {children}
    </AbsoluteFill>
  );
};
