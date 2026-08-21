// WordByWord — Words appear one at a time, each on beat.
// Used for voiceover-synced text. Each word is large, bold, centered.
// Word appears, holds, then disappears before next word.

import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring } from "remotion";

interface WordConfig {
  word: string;
  color?: string;
}

interface WordByWordProps {
  words: WordConfig[];
  framesPerWord?: number;
  bg?: string;
  fontSize?: number;
}

export const WordByWord: React.FC<WordByWordProps> = ({
  words,
  framesPerWord = 12,
  bg = "#07080F",
  fontSize = 140,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const currentIndex = Math.floor(frame / framesPerWord);
  const localFrame = frame % framesPerWord;

  if (currentIndex >= words.length) return null;

  const config = words[currentIndex];
  const color = config.color ?? "#FFFFFF";

  // Scale spring
  const scale = spring({
    frame: localFrame,
    fps,
    config: { stiffness: 300, damping: 25 },
  });

  // Opacity: fade in fast, hold, fade out in last 3 frames
  const opacity = interpolate(
    localFrame,
    [0, 2, framesPerWord - 3, framesPerWord - 1],
    [0, 1, 1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  return (
    <AbsoluteFill
      style={{
        background: bg,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
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
          transform: `scale(${scale})`,
          opacity,
          textShadow: `0 0 80px ${color}22`,
        }}
      >
        {config.word}
      </div>
    </AbsoluteFill>
  );
};
