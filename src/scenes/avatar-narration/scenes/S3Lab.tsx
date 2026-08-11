import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, Easing } from 'remotion';
import { GlassCard, Prop, riseIn, slideIn, popIn, Caption, SceneBackdrop, FilmGrade } from '../kit';
import { GOLD, SOFT, WHITE, CREAM, MUTED, breath, hexA } from '../theme';

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
    <AbsoluteFill>
      <SceneBackdrop frame={frame} />
      <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center' }}>
        <GlassCard frame={frame} radius={34} style={{ ...card, padding: '70px 90px', transform: `scale(${breathe})` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 30, marginBottom: 38 }}>
            <Prop file="02_ICONS/lucide/atom.svg" size={64} color="soft" style={{ transform: `scale(${atomPulse})` }} />
            <div style={{ fontSize: 92, fontWeight: 800, letterSpacing: '0.01em', lineHeight: 1.05, color: CREAM }}>
              SYLVESTER'S <span style={{ color: GOLD }}>AI LAB</span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 24, justifyContent: 'center' }}>
            <div style={{ ...real, display: 'flex', alignItems: 'center', gap: 12, padding: '16px 30px', borderRadius: 26, background: `${SOFT}12`, border: `1px solid ${SOFT}40` }}>
              <Prop file="02_ICONS/lucide/circle-check-big.svg" size={28} color="soft" />
              <span style={{ color: SOFT, fontSize: 24, fontWeight: 700 }}>real AI automations</span>
            </div>
            <div style={{ ...theory, position: 'relative', display: 'flex', alignItems: 'center', gap: 12, padding: '16px 30px', borderRadius: 26, background: 'rgba(244,237,224,0.05)', border: '1px solid rgba(244,237,224,0.12)' }}>
              <Prop file="02_ICONS/lucide/alert-triangle.svg" size={28} color="brass" />
              <span style={{ color: MUTED, fontSize: 24, fontWeight: 600 }}>not theory</span>
              <div style={{ position: 'absolute', left: 12, right: 12, top: '50%', height: 3, background: GOLD, transform: `scaleX(${strike})`, transformOrigin: 'left' }} />
            </div>
          </div>
        </GlassCard>

        {/* sparkles accents */}
        <div style={{ position: 'absolute', top: '18%', left: '16%', opacity: popIn(frame, 50, fps).opacity }}>
          <Prop file="02_ICONS/lucide/sparkles.svg" size={40} color="soft" style={{ transform: `rotate(${breath(frame, 0.03, 6)}deg)` }} />
        </div>
        <div style={{ position: 'absolute', bottom: '16%', right: '18%', opacity: popIn(frame, 60, fps).opacity }}>
          <Prop file="02_ICONS/lucide/sparkles.svg" size={30} color="brass" style={{ transform: `rotate(${breath(frame, 0.04, 8, 1)}deg)` }} />
        </div>
      </AbsoluteFill>
      <FilmGrade frame={frame} />
    </AbsoluteFill>
  );
};