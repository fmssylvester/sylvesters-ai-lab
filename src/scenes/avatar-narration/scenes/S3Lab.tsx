import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, Easing } from 'remotion';
import { GlassCard, Prop, riseIn, slideIn, popIn, SceneBackdrop, FilmGrade } from '../kit';
import { CYAN, GOLD, WHITE, MUTED, FONT, breath, hexA } from '../theme';

export const S3Lab: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const card = riseIn(frame, 4, fps, 80, { stiffness: 120, damping: 14 });
  const real = slideIn(frame, 30, fps, 70);
  const theory = slideIn(frame, 42, fps, -70);
  const strike = interpolate(frame, [58, 72], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic) });
  const atomPulse = 1 + 0.12 * Math.sin(frame * 0.05);
  const breathe = 1 + 0.015 * Math.sin(frame * 0.02);

  return (
    <AbsoluteFill style={{ fontFamily: FONT }}>
      <SceneBackdrop frame={frame} tint={GOLD} />
      <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center' }}>
        <GlassCard frame={frame} tint={GOLD} tintOpacity={0.4} radius={34} style={{ ...card, padding: '70px 90px', transform: `scale(${breathe})` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 26, marginBottom: 34 }}>
            <Prop file="02_ICONS/lucide/atom.svg" size={64} color="gold" style={{ transform: `scale(${atomPulse})` }} />
            <div style={{ fontSize: 84, fontWeight: 800, letterSpacing: '-0.02em', color: WHITE }}>
              SYLVESTER'S <span style={{ color: CYAN }}>AI LAB</span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 24, justifyContent: 'center' }}>
            <div style={{ ...real, display: 'flex', alignItems: 'center', gap: 12, padding: '16px 30px', borderRadius: 26, background: `${CYAN}12`, border: `1px solid ${CYAN}40` }}>
              <Prop file="02_ICONS/lucide/circle-check-big.svg" size={28} color="cyan" />
              <span style={{ color: CYAN, fontSize: 24, fontWeight: 700 }}>real AI automations</span>
            </div>
            <div style={{ ...theory, position: 'relative', display: 'flex', alignItems: 'center', gap: 12, padding: '16px 30px', borderRadius: 26, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.12)' }}>
              <Prop file="02_ICONS/lucide/alert-triangle.svg" size={28} color="gold" />
              <span style={{ color: MUTED, fontSize: 24, fontWeight: 600 }}>not theory</span>
              <div style={{ position: 'absolute', left: 12, right: 12, top: '50%', height: 3, background: GOLD, transform: `scaleX(${strike})`, transformOrigin: 'left', boxShadow: `0 0 10px ${GOLD}${hexA(0.7)}` }} />
            </div>
          </div>
        </GlassCard>

        {/* sparkles accents */}
        <div style={{ position: 'absolute', top: '18%', left: '16%', opacity: popIn(frame, 50, fps).opacity }}>
          <Prop file="02_ICONS/lucide/sparkles.svg" size={40} color="cyan" style={{ transform: `rotate(${breath(frame, 0.03, 6)}deg)` }} />
        </div>
        <div style={{ position: 'absolute', bottom: '16%', right: '18%', opacity: popIn(frame, 60, fps).opacity }}>
          <Prop file="02_ICONS/lucide/sparkles.svg" size={30} color="gold" style={{ transform: `rotate(${breath(frame, 0.04, 8, 1)}deg)` }} />
        </div>
      </AbsoluteFill>
      <FilmGrade frame={frame} />
    </AbsoluteFill>
  );
};
