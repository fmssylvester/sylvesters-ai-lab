import React from 'react';
import { AbsoluteFill, useCurrentFrame, interpolate } from 'remotion';

// Scene 3: Esmile style — clean text with blue accent
export const Scene3TechMono: React.FC = () => {
  const frame = useCurrentFrame();

  // Simple stagger fade in for 3 lines
  const line1Opacity = interpolate(frame, [0, 8], [0, 1], { extrapolateRight: 'clamp' });
  const line1Y = interpolate(frame, [0, 8], [15, 0], { extrapolateRight: 'clamp' });

  const line2Opacity = interpolate(frame, [8, 16], [0, 1], { extrapolateRight: 'clamp' });
  const line2Y = interpolate(frame, [8, 16], [15, 0], { extrapolateRight: 'clamp' });

  const line3Opacity = interpolate(frame, [16, 24], [0, 1], { extrapolateRight: 'clamp' });
  const line3Y = interpolate(frame, [16, 24], [15, 0], { extrapolateRight: 'clamp' });

  return (
    <AbsoluteFill style={{ background: '#212121', overflow: 'hidden' }}>
      <AbsoluteFill style={{
        display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: 12,
      }}>
        {/* Line 1 — white, bold */}
        <div style={{
          color: '#FFFFFF', fontSize: 48, fontFamily: 'sans-serif', fontWeight: 'bold',
          opacity: line1Opacity, transform: `translateY(${line1Y}px)`,
        }}>
          ENTERS
        </div>

        {/* Line 2 — blue accent */}
        <div style={{
          color: '#4567B7', fontSize: 48, fontFamily: 'sans-serif', fontWeight: 'bold',
          opacity: line2Opacity, transform: `translateY(${line2Y}px)`,
        }}>
          WITH SPEED
        </div>

        {/* Line 3 — white, smaller */}
        <div style={{
          color: '#FFFFFF', fontSize: 36, fontFamily: 'sans-serif', fontWeight: 'bold',
          opacity: line3Opacity, transform: `translateY(${line3Y}px)`,
        }}>
          AND CLARITY
        </div>
      </AbsoluteFill>

      {/* Bottom label */}
      <div style={{
        position: 'absolute', bottom: 60, left: 0, right: 0, textAlign: 'center',
        opacity: interpolate(frame, [30, 40], [0, 0.5], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }),
      }}>
        <span style={{
          color: '#FFFFFF', fontSize: 12, fontFamily: 'sans-serif', fontWeight: 'bold',
          letterSpacing: 4, textTransform: 'uppercase',
        }}>
          MOTION BLUR
        </span>
      </div>
    </AbsoluteFill>
  );
};

export default Scene3TechMono;
