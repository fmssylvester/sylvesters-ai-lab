import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, Easing } from 'remotion';
import { GlassCard, Prop, riseIn, popIn, SceneBackdrop, FilmGrade } from '../kit';
import { CYAN, GOLD, WHITE, MUTED, FONT, hexA } from '../theme';

export const S5Solution: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // "hire more staff" card: dims + scales down
  const staffDim = interpolate(frame, [40, 90], [1, 0.3], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.in(Easing.cubic) });
  const staffScale = 1 - (1 - staffDim) * 0.12;

  // automation card: springs up with glow
  const autoCard = riseIn(frame, 66, fps, 50, { stiffness: 160, damping: 17 });
  const glowPulse = 0.45 + 0.35 * (0.5 + 0.5 * Math.sin(frame * 0.04));
  const moneyFade = interpolate(frame, [30, 60], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  const staff = riseIn(frame, 6, fps, 40, { stiffness: 150, damping: 18 });

  return (
    <AbsoluteFill style={{ fontFamily: FONT }}>
      <SceneBackdrop frame={frame} tint={CYAN} />
      <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center', padding: '0 140px' }}>
        <div style={{ width: '100%', maxWidth: 1150 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 36, alignItems: 'center' }}>
            {/* staff card */}
            <GlassCard frame={frame} tint={NEUTRAL_LIGHT} tintOpacity={0.2} radius={26} style={{ ...staff, width: 560, padding: '34px 46px', opacity: staffDim, transform: `scale(${staffScale})` }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, justifyContent: 'center' }}>
                <Prop file="02_ICONS/lucide/dollar-sign.svg" size={32} color="gray" />
                <span style={{ color: '#e8ecf4', fontSize: 30, fontWeight: 700 }}>hire more staff</span>
              </div>
              <div style={{ display: 'flex', gap: 14, justifyContent: 'center', marginTop: 18, opacity: moneyFade }}>
                <Prop file="02_ICONS/lucide/coins.svg" size={26} color="gray" />
                <span style={{ color: MUTED, fontSize: 19 }}>$ per hire · expensive · sleeps at night</span>
              </div>
            </GlassCard>

            {/* automation card */}
            <div style={{ position: 'relative', ...autoCard }}>
              <div style={{
                position: 'absolute', inset: '-18% -14%', borderRadius: 34,
                background: `radial-gradient(circle at 50% 30%, ${CYAN}${hexA(glowPulse * 0.5)}, transparent 64%)`,
                filter: 'blur(50px)',
              }} />
              <GlassCard frame={frame} tint={CYAN} tintOpacity={0.55} radius={28} style={{ position: 'relative', width: 640, padding: '40px 56px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 18, justifyContent: 'center' }}>
                  <div style={{ width: 72, height: 72, borderRadius: 22, background: `${CYAN}16`, border: `1px solid ${CYAN}44`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Prop file="02_ICONS/lucide/bot.svg" size={40} color="cyan" />
                  </div>
                  <div>
                    <div style={{ color: WHITE, fontSize: 34, fontWeight: 800 }}>the solution is <span style={{ color: CYAN }}>automation</span></div>
                    <div style={{ color: MUTED, fontSize: 20, marginTop: 6 }}>not more staff · never sleeps · never misses</div>
                  </div>
                  <Prop file="02_ICONS/lucide/zap.svg" size={36} color="gold" />
                </div>
              </GlassCard>
            </div>
          </div>
        </div>
      </AbsoluteFill>
      <FilmGrade frame={frame} />
    </AbsoluteFill>
  );
};

const NEUTRAL_LIGHT = '#9aa0aa';
