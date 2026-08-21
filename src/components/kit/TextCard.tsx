// TextCard — Bold text on dark background.
// Section headers, key statements, one or two words max.
// Massive typography, clean entrance.

import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring } from "remotion";

interface TextCardProps {
  text: string;
  subtitle?: string;
  delay?: number;
  color?: string;
  bg?: string;
  fontSize?: number;
}

export const TextCard: React.FC<TextCardProps> = ({
  text,
  subtitle,
  delay = 0,
  color = "#FFFFFF",
  bg = "#07080F",
  fontSize = 120,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const local = frame - delay;

  if (local < 0) return null;

  const scale = spring({
    frame: local,
    fps,
    config: { stiffness: 200, damping: 20 },
  });

  const opacity = interpolate(local, [0, 4], [0, 1], {
    extrapolateRight: "clamp",
  });

  const subtitleOpacity = interpolate(local, [6, 12], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        background: bg,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 16,
      }}
    >
      <div
        style={{
          fontFamily: "'Melodrama', 'Switzer', sans-serif",
          fontWeight: 700,
          fontSize,
          color,
          textTransform: "uppercase",
          letterSpacing: "-0.02em",
          lineHeight: 1,
          textAlign: "center",
          transform: `scale(${scale})`,
          opacity,
        }}
      >
        {text}
      </div>
      {subtitle && (
        <div
          style={{
            fontFamily: "'Switzer', sans-serif",
            fontWeight: 400,
            fontSize: 28,
            color: "#94A3B8",
            letterSpacing: "0.04em",
            textAlign: "center",
            opacity: subtitleOpacity,
          }}
        >
          {subtitle}
        </div>
      )}
    </AbsoluteFill>
  );
};
