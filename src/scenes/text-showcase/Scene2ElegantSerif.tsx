import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, Sequence } from 'remotion';
import { CardFlip, CharReveal, ease } from '../../components/text/TextAnimations';

// Scene 2: Card Flip — characters rotate on Y-axis with perspective
export const Scene2ElegantSerif: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill style={{ background: '#07080F', overflow: 'hidden' }}>
      {/* Perspective grid lines */}
      {[...Array(12)].map((_, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            left: `${8 + i * 8}%`,
            top: 0,
            bottom: 0,
            width: 1,
            background: `linear-gradient(to bottom, transparent 20%, rgba(0,217,255,${0.02 + Math.abs(i - 5.5) * 0.003}) 50%, transparent 80%)`,
          }}
        />
      ))}

      {/* Gold glow */}
      <div
        style={{
          position: 'absolute',
          width: 500,
          height: 500,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(231,184,77,0.08) 0%, transparent 70%)',
          left: '50%',
          top: '50%',
          transform: 'translate(-50%, -50%)',
          filter: 'blur(50px)',
        }}
      />

      {/* Card flip text */}
      <AbsoluteFill style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <CardFlip
          text="FLIP"
          mode="center"
          staggerMs={80}
          durationMs={500}
          perspective={900}
          charStyle={{
            color: '#FFFFFF',
            fontSize: 160,
            fontFamily: 'Switzer, sans-serif',
            fontWeight: 900,
            letterSpacing: -4,
            textShadow: '0 0 80px rgba(231,184,77,0.3)',
          }}
        />
      </AbsoluteFill>

      {/* Subtitle */}
      <Sequence from={35} durationInFrames={55}>
        <div style={{ position: 'absolute', bottom: 140, left: 0, right: 0, textAlign: 'center' }}>
          <CharReveal
            text="CHARACTERS"
            mode="center"
            staggerMs={35}
            durationMs={300}
            translateY={20}
            scaleFrom={0.9}
            blurFrom={4}
            easing={ease.out}
            charStyle={{
              color: '#E7B84D',
              fontSize: 28,
              fontFamily: 'Switzer, sans-serif',
              fontWeight: 700,
              letterSpacing: 12,
            }}
          />
        </div>
      </Sequence>

      {/* Label */}
      <Sequence from={50} durationInFrames={40}>
        <div style={{ position: 'absolute', bottom: 70, left: 0, right: 0, textAlign: 'center' }}>
          <CharReveal
            text="3D CARD FLIP"
            mode="center"
            staggerMs={25}
            durationMs={250}
            translateY={10}
            scaleFrom={0.95}
            blurFrom={3}
            easing={ease.out}
            charStyle={{
              color: 'rgba(255,255,255,0.4)',
              fontSize: 16,
              fontFamily: 'Switzer, sans-serif',
              fontWeight: 700,
              letterSpacing: 8,
            }}
          />
        </div>
      </Sequence>
    </AbsoluteFill>
  );
};

export default Scene2ElegantSerif;
