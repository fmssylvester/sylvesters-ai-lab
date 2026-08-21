import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, Sequence } from 'remotion';
import { DepthParallax, CharReveal, ease } from '../../components/text/TextAnimations';

// Scene 7: Depth Parallax — atmospheric misty background with depth layers
export const Scene7DepthParallax: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill style={{ background: '#07080F', overflow: 'hidden' }}>
      {/* Atmospheric gradient layers */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(180deg, #050810 0%, #0a1428 30%, #0d1a30 60%, #07080F 100%)',
        }}
      />

      {/* Static mist layers */}
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            width: '120%',
            height: 200,
            left: '-10%',
            top: `${30 + i * 20}%`,
            background: `radial-gradient(ellipse at 50% 50%, rgba(0,217,255,${0.04 - i * 0.01}) 0%, transparent 60%)`,
            filter: `blur(${40 + i * 20}px)`,
          }}
        />
      ))}

      {/* Gold accent glow */}
      <div
        style={{
          position: 'absolute',
          width: 400,
          height: 400,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(231,184,77,0.08) 0%, transparent 70%)',
          right: '10%',
          top: '15%',
          filter: 'blur(60px)',
        }}
      />

      {/* Horizontal lines for depth */}
      {[0, 1, 2, 3, 4].map((i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            left: '20%',
            right: '20%',
            top: `${35 + i * 8}%`,
            height: 1,
            background: `linear-gradient(to right, transparent, rgba(255,255,255,${0.03 + i * 0.005}), transparent)`,
          }}
        />
      ))}

      {/* Depth parallax text */}
      <AbsoluteFill style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '0 100px' }}>
        <DepthParallax
          text="Depth of meaning layered upon layer"
          staggerMs={55}
          durationMs={500}
          maxBlur={12}
          scaleRange={[0.85, 1]}
          yRange={[30, 0]}
          easing={ease.out}
          wordStyle={{
            color: '#FFFFFF',
            fontSize: 72,
            fontFamily: 'Melodrama, serif',
            fontWeight: 700,
            letterSpacing: -1,
            textShadow: '0 0 40px rgba(0,217,255,0.2)',
          }}
        />
      </AbsoluteFill>

      {/* Gold accent line */}
      <Sequence from={45} durationInFrames={45}>
        <div
          style={{
            position: 'absolute',
            bottom: 120,
            left: '50%',
            transform: 'translateX(-50%)',
            height: 2,
            background: 'linear-gradient(to right, transparent, #E7B84D, transparent)',
            width: interpolate(frame - 45, [0, 25], [0, 200], {
              extrapolateLeft: 'clamp',
              extrapolateRight: 'clamp',
              easing: ease.out,
            }),
          }}
        />
      </Sequence>

      {/* Label */}
      <Sequence from={55} durationInFrames={35}>
        <div
          style={{
            position: 'absolute',
            bottom: 70,
            left: 0,
            right: 0,
            textAlign: 'center',
            opacity: interpolate(frame - 55, [0, 12], [0, 1], { extrapolateRight: 'clamp' }),
          }}
        >
          <CharReveal
            text="DEPTH PARALLAX"
            mode="center"
            staggerMs={25}
            durationMs={250}
            translateY={10}
            scaleFrom={0.95}
            blurFrom={3}
            easing={ease.out}
            charStyle={{
              color: '#E7B84D',
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

export default Scene7DepthParallax;
