// CodeOverlay — Floating code snippet on dark background.
// Syntax-highlighted, tilted at slight angle, with glow.
// Used when showing prompt examples or code.

import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring } from "remotion";

interface CodeLine {
  text: string;
  color?: string;
}

interface CodeOverlayProps {
  lines: CodeLine[];
  title?: string;
  delay?: number;
  tilt?: number;
  accent?: string;
}

export const CodeOverlay: React.FC<CodeOverlayProps> = ({
  lines,
  title,
  delay = 0,
  tilt = -3,
  accent = "#00D9FF",
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const local = frame - delay;

  if (local < 0) return null;

  const scale = spring({
    frame: local,
    fps,
    config: { stiffness: 200, damping: 22 },
  });

  const opacity = interpolate(local, [0, 6], [0, 1], {
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          transform: `scale(${scale}) rotate(${tilt}deg)`,
          opacity,
          background: "rgba(10, 12, 18, 0.92)",
          border: `1px solid ${accent}44`,
          borderRadius: 16,
          padding: "32px 40px",
          maxWidth: 900,
          boxShadow: `0 0 80px ${accent}11, 0 40px 100px rgba(0,0,0,0.6)`,
        }}
      >
        {title && (
          <div
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 16,
              color: accent,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              marginBottom: 20,
            }}
          >
            {title}
          </div>
        )}
        {lines.map((line, i) => {
          const lineDelay = delay + 4 + i * 3;
          const lineLocal = frame - lineDelay;
          if (lineLocal < 0) return null;

          const lineOpacity = interpolate(lineLocal, [0, 4], [0, 1], {
            extrapolateRight: "clamp",
          });

          return (
            <div
              key={i}
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 26,
                lineHeight: 1.6,
                color: line.color ?? "#EAF1F8",
                opacity: lineOpacity,
              }}
            >
              {line.text}
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
