import React from 'react';
import { AbsoluteFill, useCurrentFrame, interpolate } from 'remotion';

// Scene 5: Esmile style — staggered words with yellow accent
export const Scene5Kinetic: React.FC = () => {
  const frame = useCurrentFrame();

  const w1Opacity = interpolate(frame, [0, 8], [0, 1], { extrapolateRight: 'clamp' });
  const w1Y = interpolate(frame, [0, 8], [15, 0], { extrapolateRight: 'clamp' });

  const w2Opacity = interpolate(frame, [10, 18], [0, 1], { extrapolateRight: 'clamp' });
  const w2Y = interpolate(frame, [10, 18], [15, 0], { extrapolateRight: 'clamp' });

  const w3Opacity = interpolate(frame, [20, 28], [0, 1], { extrapolateRight: 'clamp' });
  const w3Y = interpolate(frame, [20, 28], [15, 0], { extrapolateRight: 'clamp' });

  return (
    <AbsoluteFill style={{ background: '#212121', overflow: 'hidden' }}>
      <AbsoluteFill style={{
        display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: 12,
      }}>
        {/* Word 1 — white */}
        <div style={{
          color: '#FFFFFF', fontSize: 48, fontFamily: 'sans-serif', fontWeight: 'bold',
          opacity: w1Opacity, transform: `translateY(${w1Y}px)`,
        }}>
          ARCS
        </div>

        {/* Word 2 — yellow accent */}
        <div style={{
          color: '#F7DC6F', fontSize: 48, fontFamily: 'sans-serif', fontWeight: 'bold',
          opacity: w2Opacity, transform: `translateY(${w2Y}px)`,
        }}>
          NOT
        </div>

        {/* Word 3 — white */}
        <div style={{
          color: '#FFFFFF', fontSize: 48, fontFamily: 'sans-serif', fontWeight: 'bold',
          opacity: w3Opacity, transform: `translateY(${w3Y}px)`,
        }}>
          LINES
        </div>
      </AbsoluteFill>

      {/* Bottom label */}
      <div style={{
        position: 'absolute', bottom: 60, left: 0, right: 0, textAlign: 'center',
        opacity: interpolate(frame, [35, 45], [0, 0.5], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }),
      }}>
        <span style={{
          color: '#FFFFFF', fontSize: 12, fontFamily: 'sans-serif', fontWeight: 'bold',
          letterSpacing: 4, textTransform: 'uppercase',
        }}>
          ARC MOTION
        </span>
      </div>
    </AbsoluteFill>
  );
};

export default Scene5Kinetic;
