import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, Sequence } from 'remotion';
import { AnticipationSpring, CharReveal, ease } from '../../components/text/TextAnimations';

// Scene 4: Anticipation Spring — scale down, then spring in with overshoot
export const Scene4MixedType: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill style={{ background: '#07080F', overflow: 'hidden' }}>
      {/* Radial burst lines */}
      {[...Array(16)].map((_, i) => {
        const angle = (i / 16) * 360;
        const length = interpolate(frame, [5, 40], [0, 300], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: ease.out });
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: '50%',
              top: '50%',
              width: 1,
              height: length,
              background: `linear-gradient(to bottom, rgba(0,217,255,0.15), transparent)`,
              transform: `rotate(${angle}deg)`,
              transformOrigin: 'top center',
            }}
          />
        );
      })}

      {/* Anticipation spring texts — staggered */}
      <AbsoluteFill style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: 30 }}>
        <AnticipationSpring delay={5} anticipationScale={0.82} anticipationFrames={10} config={{ damping: 10, stiffness: 180 }}>
          <span style={{
            color: '#FFFFFF',
            fontSize: 110,
            fontFamily: 'Switzer, sans-serif',
            fontWeight: 900,
            letterSpacing: -3,
            textShadow: '0 0 60px rgba(0,217,255,0.4)',
          }}>
            ANTICIPATE
          </span>
        </AnticipationSpring>

        <AnticipationSpring delay={20} anticipationScale={0.85} anticipationFrames={8} config={{ damping: 12, stiffness: 200 }}>
          <span style={{
            color: '#E7B84D',
            fontSize: 60,
            fontFamily: 'Melodrama, serif',
            fontWeight: 700,
            fontStyle: 'italic',
            textShadow: '0 0 40px rgba(231,184,77,0.3)',
          }}>
            then Spring
          </span>
        </AnticipationSpring>

        <AnticipationSpring delay={35} anticipationScale={0.88} anticipationFrames={6} config={{ damping: 8, stiffness: 160 }}>
          <span style={{
            color: '#00D9FF',
            fontSize: 40,
            fontFamily: 'Switzer, sans-serif',
            fontWeight: 700,
            letterSpacing: 6,
          }}>
            WITH OVERSHOOT
          </span>
        </AnticipationSpring>
      </AbsoluteFill>

      {/* Label */}
      <Sequence from={60} durationInFrames={30}>
        <div style={{ position: 'absolute', bottom: 60, left: 0, right: 0, textAlign: 'center' }}>
          <CharReveal
            text="ANTICIPATION SPRING"
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
            }}
          />
        </div>
      </Sequence>
    </AbsoluteFill>
  );
};

export default Scene4MixedType;
