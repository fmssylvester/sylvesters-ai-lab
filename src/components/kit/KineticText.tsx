// KineticText — Large words, beat-synced, readable on any device.
// Each word appears on its own beat. No sentences. Few words.
// Font: Melodrama (display) at massive size. White on black.

import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring } from "remotion";

export interface Beat {
  word: string;
  frame: number;       // frame when this word appears
  duration?: number;   // frames to hold (default: 15 = 0.5s)
  color?: string;      // override color (default: white)
  size?: number;       // override font size (default: 140)
}

interface KineticTextProps {
  beats: Beat[];
  bg?: string;
  fontSize?: number;
  fontFamily?: string;
}

export const KineticText: React.FC<KineticTextProps> = ({
  beats,
  bg = "#07080F",
  fontSize = 140,
  fontFamily = "'Melodrama', 'Switzer', sans-serif",
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill
      style={{
        background: bg,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {beats.map((beat, i) => {
        const localFrame = frame - beat.frame;
        const hold = beat.duration ?? 15;
        const color = beat.color ?? "#FFFFFF";
        const size = beat.size ?? fontSize;

        if (localFrame < 0 || localFrame > hold) return null;

        // Spring entrance: scale from 0 to 1
        const scale = spring({
          frame: localFrame,
          fps,
          config: { stiffness: 200, damping: 20 },
        });

        // Fade out in last 4 frames
        const opacity = interpolate(
          localFrame,
          [0, 2, hold - 4, hold],
          [0, 1, 1, 0],
          { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
        );

        return (
          <div
            key={i}
            style={{
              position: "absolute",
              fontFamily,
              fontWeight: 700,
              fontSize: size,
              color,
              textTransform: "uppercase",
              letterSpacing: "-0.02em",
              lineHeight: 1,
              textAlign: "center",
              transform: `scale(${scale})`,
              opacity,
              // Text shadow for depth
              textShadow: `0 0 60px ${color}22`,
            }}
          >
            {beat.word}
          </div>
        );
      })}
    </AbsoluteFill>
  );
};
