import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, Sequence } from 'remotion';
import { BlurCascade, CharReveal, ease } from '../../components/text/TextAnimations';

// Scene 10: Blur Cascade — ethereal gradient from blurry to sharp
export const Scene10BlurCascade: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill style={{ background: '#07080F', overflow: 'hidden' }}>
      {/* Ethereal gradient — transitions from blur to clarity */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(135deg, #050810 0%, #0a1020 25%, #101830 50%, #0a1020 75%, #050810 100%)',
        }}
      />

      {/* Animated bokeh circles */}
      {[0, 1, 2, 3, 4].map((i) => {
        const x = interpolate(frame, [0, 100], [20 + i * 15, 25 + i * 15], { extrapolateRight: 'clamp' });
        const y = interpolate(frame, [0, 100], [30 + i * 10, 35 + i * 10], { extrapolateRight: 'clamp' });
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              width: 80 + i * 30,
              height: 80 + i * 30,
              borderRadius: '50%',
              background: `radial-gradient(circle, rgba(${i % 2 === 0 ? '0,217,255' : '231,184,77'},${0.04 + i * 0.005}) 0%, transparent 70%)`,
              left: `${x}%`,
              top: `${y}%`,
              filter: `blur(${30 + i * 15}px)`,
            }}
          />
        );
      })}

      {/* Horizontal scan lines */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(255,255,255,0.008) 3px, rgba(255,255,255,0.008) 4px)',
          pointerEvents: 'none',
        }}
      />

      {/* Blur cascade — words emerge from blur */}
      <AbsoluteFill style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '0 120px' }}>
        <BlurCascade
          text="From blur to clarity each word emerges"
          staggerMs={160}
          durationMs={480}
          startBlur={16}
          startOpacity={0.08}
          easing={ease.out}
          wordStyle={{
            color: '#FFFFFF',
            fontSize: 78,
            fontFamily: 'Melodrama, serif',
            fontWeight: 700,
            letterSpacing: -1,
            textShadow: '0 0 30px rgba(0,217,255,0.15)',
          }}
        />
      </AbsoluteFill>

      {/* Label */}
      <Sequence from={60} durationInFrames={40}>
        <div
          style={{
            position: 'absolute',
            bottom: 70,
            left: 0,
            right: 0,
            textAlign: 'center',
            opacity: interpolate(frame - 60, [0, 12], [0, 1], { extrapolateRight: 'clamp' }),
          }}
        >
          <CharReveal
            text="BLUR CASCADE"
            mode="center"
            staggerMs={25}
            durationMs={250}
            translateY={10}
            scaleFrom={0.95}
            blurFrom={3}
            easing={ease.out}
            charStyle={{
              color: 'rgba(255,255,255,0.4)',
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

export default Scene10BlurCascade;
