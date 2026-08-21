import { AbsoluteFill, useCurrentFrame, interpolate } from "remotion";
import { layers } from "../../core/layout/layers";
import type { CSSProperties } from "react";

const CYAN = "#00D9FF";
const RED = "#FF5A5A";

// datamosh / glitch transition driven by progress 0..1
export const GlitchTransition = ({ progress, color = RED }: { progress: number; color?: string }) => {
  const p = Math.min(1, Math.max(0, progress));
  if (p <= 0) return null;
  const s = Math.floor(p * 60);
  const shift = Math.sin(s / 2) * 14 * p;
  const blockY = (s * 13) % 100;
  const blockOn = s % 5 < 2;
  const rgb = 0.5 + 0.5 * Math.sin(s / 3);
  return (
    <AbsoluteFill style={{ zIndex: layers.transition, pointerEvents: "none", mixBlendMode: "screen" }}>
      <AbsoluteFill
        style={{
          backgroundImage:
            "repeating-linear-gradient(0deg, rgba(255,255,255,0.06) 0px, rgba(255,255,255,0.06) 1px, transparent 2px, transparent 4px)",
          backgroundPosition: `0 ${(s * 6) % 40}px`,
          opacity: 0.6 * p,
        }}
      />
      <AbsoluteFill
        style={{
          boxShadow: `inset ${shift}px 0 0 rgba(0,217,255,${0.3 * rgb * p}), inset ${-shift}px 0 0 rgba(255,90,90,${0.3 * (1 - rgb) * p})`,
        }}
      />
      {blockOn && (
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: `${blockY}%`,
            height: 18,
            background: `rgba(0,217,255,${0.2 * p})`,
            transform: `translateX(${shift * 2}px)`,
          }}
        />
      )}
    </AbsoluteFill>
  );
};

// solid color bar wipe (covers then reveals depending on how progress is used)
export const SliceWipe = ({
  progress,
  color = CYAN,
  direction = "left",
}: {
  progress: number;
  color?: string;
  direction?: "left" | "right" | "up" | "down";
}) => {
  const p = Math.min(1, Math.max(0, progress));
  if (p <= 0) return null;
  const horizontal = direction === "left" || direction === "right";
  const style: CSSProperties = horizontal
    ? { width: `${p * 100}%`, height: "100%", top: 0, [direction === "left" ? "left" : "right"]: 0 }
    : { height: `${p * 100}%`, width: "100%", left: 0, [direction === "up" ? "top" : "bottom"]: 0 };
  return (
    <AbsoluteFill style={{ zIndex: layers.transition, pointerEvents: "none" }}>
      <div
        style={{
          position: "absolute",
          ...style,
          background: `linear-gradient(${direction === "left" ? "90deg" : "270deg"}, ${color}, transparent)`,
          boxShadow: `0 0 40px ${color}88`,
        }}
      />
    </AbsoluteFill>
  );
};

// circular iris close/open, progress 0(open) -> 1(closed)
export const IrisTransition = ({ progress, color = CYAN }: { progress: number; color?: string }) => {
  const p = Math.min(1, Math.max(0, progress));
  if (p <= 0) return null;
  const r = (1 - p) * 78;
  return (
    <AbsoluteFill
      style={{
        zIndex: layers.transition,
        pointerEvents: "none",
        background: `radial-gradient(circle at 50% 50%, transparent 0%, transparent ${r}%, ${color} ${r + 0.4}%)`,
      }}
    />
  );
};

// RGB-split flash
export const ChromaticTransition = ({ progress, intensity = 0.5 }: { progress: number; intensity?: number }) => {
  const p = Math.min(1, Math.max(0, progress));
  if (p <= 0) return null;
  const off = p * 36 * intensity;
  return (
    <AbsoluteFill
      style={{
        zIndex: layers.transition,
        pointerEvents: "none",
        mixBlendMode: "screen",
        boxShadow: `inset ${off}px 0 0 rgba(255,0,90,${0.5 * p}), inset ${-off}px 0 0 rgba(0,200,255,${0.5 * p})`,
      }}
    />
  );
};
