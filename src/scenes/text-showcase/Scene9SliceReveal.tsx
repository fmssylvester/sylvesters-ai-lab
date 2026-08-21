import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, Sequence } from 'remotion';
import { TextSliceReveal, CharReveal, ease } from '../../components/text/TextAnimations';

// Scene 9: Text Slice Reveal — sharp geometric background with sliced elements
export const Scene9SliceReveal: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill style={{ background: '#07080F', overflow: 'hidden' }}>
      {/* Geometric background slices */}
      {[0, 1, 2, 3, 4, 5].map((i) => {
        const delay = i * 5;
        const width = interpolate(frame - delay, [0, 25], [0, 100], {
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
          easing: ease.out,
        });
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: i % 2 === 0 ? 0 : 'auto',
              right: i % 2 === 1 ? 0 : 'auto',
              top: `${15 + i * 13}%`,
              height: 80,
              width: `${width * 0.4}%`,
              background: `linear-gradient(${i % 2 === 0 ? 'to right' : 'to left'}, rgba(255,107,107,${0.04 + i * 0.005}) 0%, transparent 100%)`,
            }}
          />
        );
      })}

      {/* Center glow */}
      <div
        style={{
          position: 'absolute',
          width: 500,
          height: 500,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255,107,107,0.08) 0%, transparent 70%)',
          left: '50%',
          top: '50%',
          transform: 'translate(-50%, -50%)',
          filter: 'blur(40px)',
        }}
      />

      {/* Slice reveal — main title */}
      <AbsoluteFill style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <TextSliceReveal
          text="SLICED"
          slices={6}
          staggerMs={55}
          durationMs={320}
          style={{
            width: 700,
            height: 140,
            color: '#FFFFFF',
            fontSize: 140,
            fontFamily: 'Switzer, sans-serif',
            fontWeight: 900,
            letterSpacing: -4,
            textAlign: 'center',
            textShadow: '0 0 60px rgba(255,107,107,0.4)',
          }}
        />
      </AbsoluteFill>

      {/* Bottom label */}
      <Sequence from={25} durationInFrames={65}>
        <div
          style={{
            position: 'absolute',
            bottom: 120,
            left: 0,
            right: 0,
            textAlign: 'center',
          }}
        >
          <CharReveal
            text="REVEAL"
            mode="edges"
            staggerMs={35}
            durationMs={300}
            translateY={25}
            scaleFrom={0.7}
            blurFrom={5}
            easing={ease.backOut}
            charStyle={{
              color: '#FF6B6B',
              fontSize: 72,
              fontFamily: 'Switzer, sans-serif',
              fontWeight: 900,
              letterSpacing: 12,
              textShadow: '0 0 40px rgba(255,107,107,0.3)',
            }}
          />
        </div>
      </Sequence>

      {/* Bottom bar */}
      <Sequence from={40} durationInFrames={50}>
        <div
          style={{
            position: 'absolute',
            bottom: 60,
            left: '50%',
            transform: 'translateX(-50%)',
            height: 2,
            background: '#FF6B6B',
            width: interpolate(frame - 40, [0, 20], [0, 120], {
              extrapolateLeft: 'clamp',
              extrapolateRight: 'clamp',
              easing: ease.out,
            }),
          }}
        />
      </Sequence>
    </AbsoluteFill>
  );
};

export default Scene9SliceReveal;
