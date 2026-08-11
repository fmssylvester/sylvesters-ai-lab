import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate } from 'remotion';
import { GlassCard, Prop, riseIn, popIn, Words, SceneBackdrop, FilmGrade } from '../kit';
import { CYAN, GOLD, WHITE, MUTED, FONT, EASE, hexA, NEUTRAL } from '../theme';

export const S1Question: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const LOCAL = 318;

  // clock flip 11PM → 3AM across the scene
  const clockFlip = interpolate(frame, [150, 175], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: EASE });
  const card = riseIn(frame, 6, fps, 60, { stiffness: 180, damping: 20, mass: 0.85 });
  const checked = popIn(frame, 190, fps);

  return (
    <AbsoluteFill style={{ fontFamily: FONT }}>
      <SceneBackdrop frame={frame} tint={CYAN} />
      <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center', padding: '0 140px' }}>
        <div style={{ width: '100%', maxWidth: 1180, display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 40 }}>
          <GlassCard frame={frame} tint={CYAN} tintOpacity={0.5} radius={30} style={{ ...card, width: '100%', padding: '42px 52px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 18, marginBottom: 26 }}>
              <div style={{ width: 64, height: 64, borderRadius: 20, background: `${CYAN}18`, border: `1px solid ${CYAN}44`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Prop file="02_ICONS/lucide/message-circle.svg" size={34} color="cyan" />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ color: WHITE, fontSize: 30, fontWeight: 800, letterSpacing: '-0.01em' }}>New message</div>
                <div style={{ color: MUTED, fontSize: 20, marginTop: 2 }}>landing page · contact form</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 22px', borderRadius: 22, background: '#0d0f16', border: '1px solid rgba(255,255,255,0.10)' }}>
                <Prop file="02_ICONS/lucide/clock-3.svg" size={24} color="gray" />
                <span style={{ color: clockFlip > 0.5 ? CYAN : NEUTRAL, fontSize: 24, fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>
                  {clockFlip > 0.5 ? '3:00 AM' : '11:00 PM'}
                </span>
              </div>
            </div>
            <div style={{ fontSize: 30, lineHeight: 1.5, color: '#e8ecf4' }}>
              <Words text="What if every customer message got an instant intelligent reply?" frame={frame} start={14} fps={fps} gap={2.4} />
            </div>
          </GlassCard>

          <div style={{ ...checked, display: 'flex', alignItems: 'center', gap: 14, padding: '16px 30px', borderRadius: 26, background: `${GOLD}10`, border: `1px solid ${GOLD}33` }}>
            <Prop file="02_ICONS/lucide/circle-check-big.svg" size={30} color="gold" />
            <span style={{ color: GOLD, fontSize: 26, fontWeight: 700 }}>Replied instantly — built with n8n</span>
          </div>
        </div>
      </AbsoluteFill>

      {/* headline top-left, anchored small */}
      <div style={{ position: 'absolute', top: 90, left: 150 }}>
        <div style={{ color: WHITE, fontSize: 58, fontWeight: 800, letterSpacing: '-0.02em' }}>
          instant reply, <span style={{ color: CYAN }}>even at 3 AM</span>
        </div>
        <div style={{ color: MUTED, fontSize: 20, marginTop: 10 }}>
          what if every message got answered?
        </div>
      </div>
      <FilmGrade frame={frame} />
    </AbsoluteFill>
  );
};
