import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, Easing } from 'remotion';
import { GlassCard, Prop, riseIn, Caption, SceneBackdrop, FilmGrade } from '../kit';
import { GOLD, SOFT, WHITE, MUTED, CREAM, NEUTRAL } from '../theme';

// staff route dims away, automation route takes over
export const S5Solution: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const staffDim = interpolate(frame, [40, 90], [1, 0.3], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.in(Easing.cubic) });
  const staffScale = 1 - (1 - staffDim) * 0.12;
  const moneyFade = interpolate(frame, [30, 60], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  const staff = riseIn(frame, 6, fps, 40, { stiffness: 150, damping: 18 });
  const autoCard = riseIn(frame, 66, fps, 50, { stiffness: 160, damping: 17 });

  return (
    <AbsoluteFill>
      <SceneBackdrop frame={frame} />
      <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center', padding: '0 140px' }}>
        <div style={{ width: '100%', maxWidth: 1150 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 36, alignItems: 'center' }}>
            <GlassCard frame={frame} radius={26} style={{ ...staff, width: 560, padding: '34px 46px', opacity: staffDim, transform: `scale(${staffScale})` }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, justifyContent: 'center' }}>
                <Prop file="02_ICONS/lucide/dollar-sign.svg" size={32} color="gray" />
                <span style={{ color: CREAM, fontSize: 30, fontWeight: 700 }}>hire more staff</span>
              </div>
              <div style={{ display: 'flex', gap: 14, justifyContent: 'center', marginTop: 18, opacity: moneyFade }}>
                <Prop file="02_ICONS/lucide/coins.svg" size={26} color="gray" />
                <span style={{ color: NEUTRAL, fontSize: 19 }}>$ per hire · expensive · sleeps at night</span>
              </div>
            </GlassCard>

            <GlassCard frame={frame} radius={28} style={{ ...autoCard, width: 640, padding: '40px 56px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 20, justifyContent: 'center' }}>
                <div style={{ width: 72, height: 72, borderRadius: 22, background: `${SOFT}16`, border: `1px solid ${SOFT}44`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Prop file="02_ICONS/lucide/bot.svg" size={40} color="soft" />
                </div>
                <div>
                  <div style={{ color: WHITE, fontSize: 34, fontWeight: 800 }}>the solution is <span style={{ color: GOLD }}>automation</span></div>
                  <Caption style={{ marginTop: 8, display: 'block', fontSize: 20 }}>one workflow, every reply</Caption>
                </div>
                <Prop file="02_ICONS/lucide/zap.svg" size={36} color="brass" />
              </div>
            </GlassCard>
          </div>
        </div>
      </AbsoluteFill>
      <FilmGrade frame={frame} />
    </AbsoluteFill>
  );
};