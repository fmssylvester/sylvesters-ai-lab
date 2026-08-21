import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, Sequence } from 'remotion';
import { StackedReveal, CharReveal, ease } from '../../components/text/TextAnimations';

// Scene 6: Stacked Reveal — words behind each other, revealed one by one
// Background: Deep layered cards/panels suggesting depth and stack
export const Scene6StackedReveal: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill style={{ background: '#07080F', overflow: 'hidden' }}>
      {/* Depth layers — stacked translucent panels */}
      {[0, 1, 2, 3, 4].map((i) => {
        const delay = i * 8;
        const opacity = interpolate(frame - delay, [0, 20], [0, 0.06 + i * 0.01], {
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
        });
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: '15%',
              right: '15%',
              top: `${25 + i * 6}%`,
              height: 180,
              background: `linear-gradient(135deg, rgba(0,217,255,${opacity}) 0%, rgba(231,184,77,${opacity * 0.5}) 100%)`,
              borderRadius: 20,
              border: `1px solid rgba(255,255,255,${opacity * 0.8})`,
              transform: `perspective(800px) rotateX(${2 - i * 0.5}deg) translateZ(${-i * 30}px)`,
              filter: `blur(${i * 1.5}px)`,
            }}
          />
        );
      })}

      {/* Main glow */}
      <div
        style={{
          position: 'absolute',
          width: 600,
          height: 600,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(0,217,255,0.1) 0%, transparent 70%)',
          left: '50%',
          top: '40%',
          transform: 'translate(-50%, -50%)',
          filter: 'blur(50px)',
        }}
      />

      {/* Stacked reveal — hero text */}
      <AbsoluteFill style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <StackedReveal
          text="Behind Every Word Lives Another"
          staggerMs={280}
          revealMs={380}
          revealDistance={90}
          maxBlur={10}
          easing={ease.out}
          wordStyle={{
            color: '#FFFFFF',
            fontSize: 88,
            fontFamily: 'Switzer, sans-serif',
            fontWeight: 900,
            letterSpacing: -3,
            textShadow: '0 0 60px rgba(0,217,255,0.3)',
          }}
        />
      </AbsoluteFill>

      {/* Bottom label */}
      <Sequence from={70} durationInFrames={20}>
        <div
          style={{
            position: 'absolute',
            bottom: 60,
            left: 0,
            right: 0,
            textAlign: 'center',
            opacity: interpolate(frame - 70, [0, 12], [0, 1], { extrapolateRight: 'clamp' }),
          }}
        >
          <CharReveal
            text="STACKED REVEAL"
            mode="center"
            staggerMs={25}
            durationMs={250}
            translateY={10}
            scaleFrom={0.95}
            blurFrom={3}
            easing={ease.out}
            charStyle={{
              color: '#00D9FF',
              fontSize: 18,
              fontFamily: 'Switzer, sans-serif',
              fontWeight: 700,
              letterSpacing: 8,
              textTransform: 'uppercase',
            }}
          />
        </div>
      </Sequence>
    </AbsoluteFill>
  );
};

export default Scene6StackedReveal;
