import { AbsoluteFill } from "remotion";
import { layers } from "../../core/layout/layers";

// rectangular clip-path wipe (progress 0..1)
export const ClipWipe = ({
  progress,
  direction = "left",
  color = "rgba(7,9,13,1)",
}: {
  progress: number;
  direction?: "left" | "right" | "up" | "down";
  color?: string;
}) => {
  const p = Math.min(1, Math.max(0, progress));
  if (p <= 0) return null;
  const horizontal = direction === "left" || direction === "right";
  const style: Record<string, string | number> = horizontal
    ? { width: `${p * 100}%`, height: "100%", top: 0, [direction === "left" ? "left" : "right"]: 0 }
    : { height: `${p * 100}%`, width: "100%", left: 0, [direction === "up" ? "top" : "bottom"]: 0 };
  return (
    <AbsoluteFill style={{ zIndex: layers.transition, pointerEvents: "none" }}>
      <div style={{ position: "absolute", ...style, background: color }} />
    </AbsoluteFill>
  );
};

// circular reveal/close (progress 0 open -> 1 closed)
export const RadialReveal = ({ progress, color = "rgba(7,9,13,1)" }: { progress: number; color?: string }) => {
  const p = Math.min(1, Math.max(0, progress));
  if (p <= 0) return null;
  const r = (1 - p) * 80;
  return (
    <AbsoluteFill
      style={{
        zIndex: layers.transition,
        pointerEvents: "none",
        background: `radial-gradient(circle at 50% 50%, ${color} 0%, ${color} ${r}%, transparent ${r + 0.1}%)`,
      }}
    />
  );
};

// SVG path line-draw (stroke reveals with progress)
export const LineDraw = ({
  progress,
  d = "M10,90 C30,10 70,10 90,90",
  color = "#00D9FF",
  width = 300,
  height = 120,
  stroke = 3,
}: {
  progress: number;
  d?: string;
  color?: string;
  width?: number;
  height?: number;
  stroke?: number;
}) => {
  const p = Math.min(1, Math.max(0, progress));
  const len = 300;
  return (
    <AbsoluteFill style={{ zIndex: layers.particles, pointerEvents: "none", justifyContent: "center", alignItems: "center" }}>
      <svg width={width} height={height} viewBox="0 0 100 100">
        <path
          d={d}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeDasharray={len}
          strokeDashoffset={len * (1 - p)}
          strokeLinecap="round"
        />
      </svg>
    </AbsoluteFill>
  );
};
