import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate } from 'remotion';
import { GlassCard, Prop, riseIn, popIn, Words, Caption, SceneBackdrop, FilmGrade } from '../kit';
import { GOLD, SOFT, NEUTRAL, WHITE, CREAM, MUTED, EASE } from '../theme';

export const S1Question: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const LOCAL = 318;

  // clock flip 11PM → 3AM across the scene
  const clockFlip = interpolate(frame, [150, 175], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: EASE });
  const card = riseIn(frame, 6, fps, 60, { stiffness: 180, damping: 20, mass: 0.85 });
  const checked = popIn(frame, 190, fps);

  return (
    <AbsoluteFill style={{ background: 'transparent' }}>
      <SceneBackdrop frame={frame} />
      <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center', padding: '0 140px' }}>
        <div style={{ width: '100%', maxWidth: 1180, display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 40 }}>
          <GlassCard frame={frame} radius={30} style={{ ...card, width: '100%', padding: '42px 52px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 18, marginBottom: 26 }}>
              <div style={{ width: 64, height: 64, borderRadius: 20, background: `${SOFT}1a`, border: `1px solid ${SOFT}44`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Prop file="02_ICONS/lucide/message-circle.svg" size={34} color="soft" />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ color: CREAM, fontSize: 30, fontWeight: 700 }}>New message</div>
                <Caption style={{ fontSize: 19 }}>landing page · contact form</Caption>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 22px', borderRadius: 22, background: DEEP, border: `1px solid ${clockFlip > 0.5 ? GOLD : SOFT}44` }}>
                <Prop file="02_ICONS/lucide/clock-3.svg" size={24} color={clockFlip > 0.5 ? 'brass' : 'soft'} />
                <span style={{ color: clockFlip > 0.5 ? GOLD : NEUTRAL, fontSize: 24, fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>
                  {clockFlip > 0.5 ? '3:00 AM' : '11:00 PM'}
                </span>
              </div>
            </div>
          </GlassCard>

          <div style={{ ...checked, display: 'flex', alignItems: 'center', gap: 14, padding: '16px 30px', borderRadius: 26, background: `${GOLD}10`, border: `1px solid ${GOLD}33` }}>
            <Prop file="02_ICONS/lucide/circle-check-big.svg" size={30} color="brass" />
            <span style={{ color: GOLD, fontSize: 26, fontWeight: 700 }}>Replied instantly — built with n8n</span>
          </div>
        </div>
      </AbsoluteFill>

      {/* the hook — one line, Playfair, brass on the payoff */}
      <div style={{ position: 'absolute', top: 90, left: 150 }}>
        <div style={{ color: CREAM, fontSize: 72, fontWeight: 800, letterSpacing: '-0.01em', lineHeight: 1.1 }}>
          <Words text="instant reply," frame={frame} start={8} fps={fps} gap={3} />
          <br />
          <span style={{ color: GOLD }}>
            <Words text="even at 3 AM" frame={frame} start={26} fps={fps} gap={3} />
          </span>
        </div>
      </div>
      <FilmGrade frame={frame} />
    </AbsoluteFill>
  );
};

const DEEP = '#0A1626';