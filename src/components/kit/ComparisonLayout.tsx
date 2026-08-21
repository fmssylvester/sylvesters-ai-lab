// ComparisonLayout — Side-by-side good vs bad, before vs after.
// Two panels with labels. Clean, high contrast.
// Red for bad, green/teal for good.

import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring } from "remotion";

interface ComparisonLayoutProps {
  leftLabel: string;
  rightLabel: string;
  left: React.ReactNode;
  right: React.ReactNode;
  leftColor?: string;
  rightColor?: string;
  delay?: number;
}

export const ComparisonLayout: React.FC<ComparisonLayoutProps> = ({
  leftLabel,
  rightLabel,
  left,
  right,
  leftColor = "#FF6B6B",
  rightColor = "#00D9FF",
  delay = 0,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const local = frame - delay;

  if (local < 0) return null;

  // Left slides in from left
  const leftX = spring({
    frame: local,
    fps,
    config: { stiffness: 180, damping: 20 },
  });
  const leftTranslate = interpolate(leftX, [0, 1], [-80, 0]);

  // Right slides in from right, slightly delayed
  const rightX = spring({
    frame: Math.max(0, local - 4),
    fps,
    config: { stiffness: 180, damping: 20 },
  });
  const rightTranslate = interpolate(rightX, [0, 1], [80, 0]);

  // VS appears last
  const vsScale = spring({
    frame: Math.max(0, local - 8),
    fps,
    config: { stiffness: 300, damping: 25 },
  });

  const panelStyle = (color: string): React.CSSProperties => ({
    flex: 1,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: 24,
    padding: "40px 32px",
    background: "rgba(10, 12, 18, 0.6)",
    border: `1px solid ${color}33`,
    borderRadius: 20,
    minHeight: 500,
  });

  const labelStyle = (color: string): React.CSSProperties => ({
    fontFamily: "'Switzer', sans-serif",
    fontWeight: 700,
    fontSize: 28,
    color,
    letterSpacing: "0.08em",
    textTransform: "uppercase",
  });

  return (
    <AbsoluteFill
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 24,
        padding: "0 80px",
      }}
    >
      {/* Left panel */}
      <div
        style={{
          ...panelStyle(leftColor),
          transform: `translateX(${leftTranslate}px)`,
          opacity: interpolate(local, [0, 6], [0, 1], { extrapolateRight: "clamp" }),
        }}
      >
        <div style={labelStyle(leftColor)}>{leftLabel}</div>
        {left}
      </div>

      {/* VS */}
      <div
        style={{
          fontFamily: "'Melodrama', serif",
          fontWeight: 700,
          fontSize: 48,
          color: "#FFFFFF",
          opacity: vsScale,
          transform: `scale(${vsScale})`,
        }}
      >
        VS
      </div>

      {/* Right panel */}
      <div
        style={{
          ...panelStyle(rightColor),
          transform: `translateX(${rightTranslate}px)`,
          opacity: interpolate(Math.max(0, local - 4), [0, 6], [0, 1], { extrapolateRight: "clamp" }),
        }}
      >
        <div style={labelStyle(rightColor)}>{rightLabel}</div>
        {right}
      </div>
    </AbsoluteFill>
  );
};
