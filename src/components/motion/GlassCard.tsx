import { useCurrentFrame, useVideoConfig, spring, interpolate } from "remotion";

interface GlassCardProps {
  children: React.ReactNode;
  width?: number;
  height?: number;
  padding?: number;
  glowColor?: string;
  glowIntensity?: number;
  enterDelay?: number;
  enterFrom?: "bottom" | "left" | "right" | "top" | "scale";
  style?: React.CSSProperties;
}

export default function GlassCard({
  children,
  width = 400,
  height = 300,
  padding = 32,
  glowColor = "rgba(0,217,255,0.15)",
  glowIntensity = 1,
  enterDelay = 0,
  enterFrom = "bottom",
  style = {},
}: GlassCardProps) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const pop = spring({
    frame: frame - enterDelay,
    fps,
    config: { damping: 14, stiffness: 120, mass: 0.8 },
  });

  const exits = {
    bottom: { x: 0, y: 60 * (1 - pop) },
    top: { x: 0, y: -60 * (1 - pop) },
    left: { x: -60 * (1 - pop), y: 0 },
    right: { x: 60 * (1 - pop), y: 0 },
    scale: { x: 0, y: 0 },
  };
  const offset = exits[enterFrom];
  const scale = enterFrom === "scale" ? 0.7 + 0.3 * pop : 1;

  return (
    <div
      style={{
        width,
        height,
        padding,
        borderRadius: 20,
        background: "rgba(255,255,255,0.06)",
        ...(process.env.REMOTION_LIGHT_RENDER
          ? {}
          : {
              backdropFilter: "blur(12px)",
              WebkitBackdropFilter: "blur(12px)",
            }),
        border: "1px solid rgba(255,255,255,0.08)",
        boxShadow: `
          0 8px 32px rgba(0,0,0,0.4),
          inset 0 1px 0 rgba(255,255,255,0.06),
          0 0 ${40 * glowIntensity}px ${glowColor}
        `,
        transform: `translate(${offset.x}px, ${offset.y}px) scale(${scale})`,
        opacity: pop,
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        overflow: "hidden",
        position: "relative",
        ...style,
      }}
    >
      {children}
    </div>
  );
}
