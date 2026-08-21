import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, Easing } from 'remotion';

// TitleCard — clean, minimalist, high-contrast title card.
// Pure black background, stark white bold type, smooth fade-in over the first second.
export const TitleCard: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Smooth fade-in during the first second (0 → 1s), eased for a soft landing.
  const opacity = interpolate(frame, [0, fps], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.bezier(0.16, 1, 0.3, 1),
  });

  // Subtle upward drift pairs with the fade for a polished, minimal entrance.
  const translateY = interpolate(frame, [0, fps], [16, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.bezier(0.16, 1, 0.3, 1),
  });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: '#000000',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <div
        style={{
          opacity,
          transform: `translateY(${translateY}px)`,
          color: '#FFFFFF',
          fontFamily: "'Switzer', system-ui, -apple-system, 'Segoe UI', sans-serif",
          fontSize: 96,
          fontWeight: 800,
          letterSpacing: '-0.02em',
          lineHeight: 1.1,
          textAlign: 'center',
          // Keep text within a generous safe area (>80px from the 1920px-wide edges).
          maxWidth: 1600,
          padding: '0 80px',
        }}
      >
        Welcome to Sylvester'S Ai Lab
      </div>
    </AbsoluteFill>
  );
};

export default TitleCard;
