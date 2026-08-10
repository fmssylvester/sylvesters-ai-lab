import React from 'react';
import { useCurrentFrame, interpolate, spring, useVideoConfig } from 'remotion';

interface HighlightSweepProps {
  text: string;
  highlightColor?: string;
  textColorBefore?: string;
  textColorAfter?: string;
  fontSize?: number;
  startFrame?: number;
  sweepDuration?: number;
  fontFamily?: string;
}

export const HighlightSweep: React.FC<HighlightSweepProps> = ({
  text,
  highlightColor = '#00D9FF',
  textColorBefore = '#FFFFFF',
  textColorAfter = '#07090D',
  fontSize = 72,
  startFrame = 0,
  sweepDuration = 18,
  fontFamily = 'Inter, system-ui, sans-serif',
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const relFrame = Math.max(0, frame - startFrame);

  const progress = spring({
    frame: relFrame,
    fps,
    config: { damping: 14, stiffness: 120 },
  });

  const widthPercent = interpolate(progress, [0, 1], [0, 100], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <div
      style={{
        position: 'relative',
        display: 'inline-block',
        fontSize,
        fontFamily,
        fontWeight: 800,
        letterSpacing: '-0.02em',
        lineHeight: 1.2,
      }}
    >
      {/* Base Layer: White text */}
      <span
        style={{
          color: textColorBefore,
          position: 'relative',
          zIndex: 1,
          display: 'inline-block',
          padding: '0.1em 0.2em',
        }}
      >
        {text}
      </span>

      {/* Highlight Box & Flipped Text Overlay */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          bottom: 0,
          width: `${widthPercent}%`,
          overflow: 'hidden',
          zIndex: 2,
          borderRadius: '8px',
          backgroundColor: highlightColor,
          boxShadow: `0 0 25px ${highlightColor}88`,
          transition: 'width 0.05s ease-out',
        }}
      >
        <span
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            color: textColorAfter,
            fontWeight: 800,
            fontSize,
            fontFamily,
            letterSpacing: '-0.02em',
            lineHeight: 1.2,
            padding: '0.1em 0.2em',
            whiteSpace: 'nowrap',
          }}
        >
          {text}
        </span>
      </div>
    </div>
  );
};

export default HighlightSweep;
