// Reusable mask building blocks (Asset Vault: "Masks").
//
// A "mask" here is a named, frame-driven reveal applied to any layer via a
// wrapping component. All simple shapes use responsive percentage clip-paths
// (no SVG measurement). The "shape" preset uses an SVG <clipPath> in
// objectBoundingBox units so caller-supplied paths stay resolution-independent.
//
// Pairs with MotionPresets: a mask is the "what is revealed", a preset is the
// "how the layer moves". Together they compose the reveal language.

import React, { ReactNode, useId } from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate } from "remotion";
import { sampleCurve, CurveName } from "../../core/motion/AnimationCurves";

export type MaskPreset =
  | "iris"
  | "wipeRight"
  | "wipeLeft"
  | "wipeUp"
  | "wipeDown"
  | "zoom"
  | "diamond"
  | "shape";

export const MASK_PRESETS: MaskPreset[] = [
  "iris",
  "wipeRight",
  "wipeLeft",
  "wipeUp",
  "wipeDown",
  "zoom",
  "diamond",
  "shape",
];

// Default star in objectBoundingBox (0..1) space for the "shape" preset.
const DEFAULT_STAR =
  "M0.5 0.02 L0.61 0.35 L0.96 0.35 L0.68 0.57 L0.78 0.91 L0.5 0.7 L0.22 0.91 L0.32 0.57 L0.04 0.35 L0.39 0.35 Z";

export interface MaskProps {
  preset?: MaskPreset;
  frame: number;
  fps: number;
  start?: number;
  duration: number;
  curve?: CurveName;
  shapePath?: string; // 0..1 coords for preset "shape"
  children: ReactNode;
  style?: React.CSSProperties;
  className?: string;
}

function clipFor(preset: MaskPreset, p: number): string {
  const r = (v: number) => v.toFixed(2);
  switch (preset) {
    case "iris":
      return `circle(${r(p * 71)}% at 50% 50%)`;
    case "wipeRight":
      return `inset(0 ${r((1 - p) * 100)}% 0 0)`;
    case "wipeLeft":
      return `inset(0 0 0 ${r((1 - p) * 100)}%)`;
    case "wipeUp":
      return `inset(${r((1 - p) * 100)}% 0 0 0)`;
    case "wipeDown":
      return `inset(0 0 ${r((1 - p) * 100)}% 0)`;
    case "zoom":
      return `inset(${r((1 - p) * 50)}% ${r((1 - p) * 50)}% ${r((1 - p) * 50)}% ${r((1 - p) * 50)}%)`;
    case "diamond":
      return `polygon(50% ${r(50 - p * 50)}%, ${r(50 + p * 50)}% 50%, 50% ${r(50 + p * 50)}%, ${r(50 - p * 50)}% 50%)`;
    default:
      return "none";
  }
}

export const Mask: React.FC<MaskProps> = ({
  preset = "iris",
  frame,
  fps,
  start = 0,
  duration,
  curve = "smooth",
  shapePath = DEFAULT_STAR,
  children,
  style,
  className,
}) => {
  const raw = useId();
  const clipId = "msk-" + raw.replace(/:/g, "");
  const p = interpolate((frame - start) / Math.max(1, duration), [0, 1], [0, 1], {
    easing: (t) => sampleCurve(curve, t),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  if (preset === "shape") {
    return (
      <>
        <svg width="0" height="0" style={{ position: "absolute" }} aria-hidden>
          <defs>
            <clipPath id={clipId} clipPathUnits="objectBoundingBox">
              <path
                d={shapePath}
                transform={`translate(0.5 0.5) scale(${p}) translate(-0.5 -0.5)`}
              />
            </clipPath>
          </defs>
        </svg>
        <AbsoluteFill className={className} style={{ ...style, clipPath: `url(#${clipId})` }}>
          {children}
        </AbsoluteFill>
      </>
    );
  }

  return (
    <AbsoluteFill className={className} style={{ ...style, clipPath: clipFor(preset, p) }}>
      {children}
    </AbsoluteFill>
  );
};
