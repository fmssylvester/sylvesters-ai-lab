import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, Sequence } from 'remotion';
import { WaveText, CharReveal, ease } from '../../components/text/TextAnimations';

export const Scene8WaveText: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill style={{ background: '#0A1628', overflow: 'hidden' }}>
      {/* Deep ocean gradient — warm-cool blend */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'linear-gradient(180deg, #0A1628 0%, #0D1B30 30%, #0F2240 60%, #0A1628 100%)',
      }} />

      {/* Noise texture */}
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.03'/%3E%3C/svg%3E")`,
        backgroundSize: '256px 256px', opacity: 0.4,
      }} />

      {/* Animated wave layers */}
      {[0, 1, 2, 3].map((i) => {
        const offset = frame * (0.8 + i * 0.3);
        const y = Math.sin(offset * 0.05 + i * 1.2) * 20;
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: '-20%',
              right: '-20%',
              top: `${40 + i * 12}%`,
              height: 120,
              background: `linear-gradient(90deg, transparent 0%, rgba(0,217,255,${0.025 + i * 0.006}) 30%, rgba(0,217,255,${0.04 + i * 0.008}) 50%, rgba(0,217,255,${0.025 + i * 0.006}) 70%, transparent 100%)`,
              borderRadius: '50%',
              transform: `translateY(${y}px) scaleY(${0.3 + i * 0.1})`,
              filter: `blur(${20 + i * 10}px)`,
            }}
          />
        );
      })}

      {/* Subtle light rays — depth */}
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            left: `${30 + i * 20}%`,
            top: 0,
            width: 2,
            height: '100%',
            background: `linear-gradient(to bottom, transparent, rgba(0,217,255,${0.015 + i * 0.004}) 40%, transparent 80%)`,
            transform: `rotate(${-5 + i * 5}deg)`,
            transformOrigin: 'top center',
          }}
        />
      ))}

      {/* Wave text — continuous ripple */}
      <AbsoluteFill style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <WaveText
          text="RIPPLE IN MOTION"
          frequency={0.22}
          amplitude={18}
          speed={0.1}
          phaseOffset={0.4}
          style={{
            color: '#00D9FF',
            fontSize: 120,
            fontFamily: 'Switzer, sans-serif',
            fontWeight: 900,
            letterSpacing: -3,
            textShadow: '0 0 80px rgba(0,217,255,0.4), 0 0 120px rgba(0,217,255,0.15)',
          }}
        />
      </AbsoluteFill>

      {/* Subtitle */}
      <Sequence from={15} durationInFrames={75}>
        <div style={{ position: 'absolute', bottom: 120, left: 0, right: 0, textAlign: 'center' }}>
          <CharReveal
            text="Characters move as one"
            mode="center"
            staggerMs={30}
            durationMs={400}
            translateY={20}
            scaleFrom={0.9}
            blurFrom={3}
            easing={ease.out}
            charStyle={{
              color: 'rgba(255,255,255,0.4)',
              fontSize: 20,
              fontFamily: 'Switzer, sans-serif',
              fontWeight: 600,
              letterSpacing: 6,
              textTransform: 'uppercase',
            }}
          />
        </div>
      </Sequence>
    </AbsoluteFill>
  );
};

export default Scene8WaveText;
