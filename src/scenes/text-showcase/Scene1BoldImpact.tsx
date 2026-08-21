import React from 'react';
import { AbsoluteFill, useCurrentFrame, interpolate, spring, useVideoConfig } from 'remotion';

// Scene 1: Esmile style — clean text on dark grey, yellow accent
export const Scene1BoldImpact: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Simple fade in
  const opacity = interpolate(frame, [0, 8], [0, 1], { extrapolateRight: 'clamp' });
  const translateY = interpolate(frame, [0, 8], [20, 0], { extrapolateRight: 'clamp' });

  // "PROBLEM" fades out, "SOLUTION" fades in at frame 40
  const problemOpacity = interpolate(frame, [38, 42], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const solutionOpacity = interpolate(frame, [42, 50], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const solutionY = interpolate(frame, [42, 50], [15, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  return (
    <AbsoluteFill style={{ background: '#212121', overflow: 'hidden' }}>
      {/* "PROBLEM" — white, large, bold, centered */}
      <AbsoluteFill style={{
        display: 'flex', justifyContent: 'center', alignItems: 'center',
        opacity: problemOpacity,
      }}>
        <div style={{
          color: '#FFFFFF',
          fontSize: 48,
          fontFamily: 'sans-serif',
          fontWeight: 'bold',
          letterSpacing: 1,
          transform: `translateY(${translateY}px)`,
        }}>
          PROBLEM
        </div>
      </AbsoluteFill>

      {/* "SOLUTION" — yellow accent, large, bold, centered */}
      <AbsoluteFill style={{
        display: 'flex', justifyContent: 'center', alignItems: 'center',
        opacity: solutionOpacity,
      }}>
        <div style={{
          color: '#F7DC6F',
          fontSize: 48,
          fontFamily: 'sans-serif',
          fontWeight: 'bold',
          letterSpacing: 1,
          transform: `translateY(${solutionY}px)`,
        }}>
          SOLUTION
        </div>
      </AbsoluteFill>

      {/* Bottom label — small, subtle */}
      <div style={{
        position: 'absolute', bottom: 60, left: 0, right: 0, textAlign: 'center',
        opacity: interpolate(frame, [55, 65], [0, 0.5], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }),
      }}>
        <span style={{
          color: '#FFFFFF',
          fontSize: 12,
          fontFamily: 'sans-serif',
          fontWeight: 'bold',
          letterSpacing: 4,
          textTransform: 'uppercase',
        }}>
          MORPH TRANSITION
        </span>
      </div>
    </AbsoluteFill>
  );
};

export default Scene1BoldImpact;
