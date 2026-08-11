import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, Easing } from 'remotion';
import { GlassCard, Prop, popIn, SceneBackdrop, FilmGrade } from '../kit';
import { GOLD, SOFT, WHITE, MUTED, CREAM } from '../theme';

const TRAITS = [
  { file: '02_ICONS/lucide/moon.svg', label: 'never sleeps', color: 'soft' as const, text: SOFT },
  { file: '02_ICONS/lucide/circle-check-big.svg', label: 'never misses', color: 'soft' as const, text: SOFT },
  { file: '02_ICONS/lucide/user.svg', label: 'escalates to human', color: 'brass' as const, text: GOLD },
];

// the agent: quiet bot card, three behavior chips, 24/7 + live counter
export const S6Agent: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const bot = popIn(frame, 8, fps);
  const pulse24 = 1 + 0.06 * (0.5 + 0.5 * Math.sin(frame * 0.09));
  const received = Math.round(interpolate(frame, [80, 160], [0, 999], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic) }));

  return (
    <AbsoluteFill>
      <SceneBackdrop frame={frame} />
      <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center' }}>
        <div style={{ position: 'relative', width: 900, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <GlassCard frame={frame} radius={40} style={{ ...bot, width: 180, height: 180, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Prop file="02_ICONS/lucide/bot.svg" size={86} color="soft" />
          </GlassCard>

          <div style={{ display: 'flex', gap: 36, marginTop: 54 }}>
            {TRAITS.map((t, i) => {
              const c = popIn(frame, 36 + i * 18, fps);
              return (
                <div key={i} style={{ ...c, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, padding: '22px 30px', borderRadius: 24, background: 'rgba(244,237,224,0.05)', border: '1px solid rgba(244,237,224,0.12)' }}>
                  <Prop file={t.file} size={34} color={t.color} />
                  <span style={{ color: t.text, fontSize: 22, fontWeight: 700 }}>{t.label}</span>
                </div>
              );
            })}
          </div>

          <div style={{ display: 'flex', gap: 24, marginTop: 44, alignItems: 'center' }}>
            <div style={{ ...popIn(frame, 95, fps), display: 'flex', alignItems: 'center', gap: 10, padding: '12px 24px', borderRadius: 24, background: `${SOFT}12`, border: `1px solid ${SOFT}40`, transform: `scale(${pulse24})` }}>
              <Prop file="02_ICONS/lucide/clock-3.svg" size={24} color="soft" />
              <span style={{ color: SOFT, fontSize: 24, fontWeight: 800 }}>24/7</span>
            </div>
            <div style={{ ...popIn(frame, 105, fps), display: 'flex', alignItems: 'center', gap: 10, padding: '12px 24px', borderRadius: 24, background: 'rgba(244,237,224,0.05)', border: '1px solid rgba(244,237,224,0.12)' }}>
              <span style={{ color: MUTED, fontSize: 20 }}>received</span>
              <span style={{ color: WHITE, fontSize: 26, fontWeight: 800, fontVariantNumeric: 'tabular-nums', minWidth: 74, textAlign: 'right' }}>{received}</span>
              <span style={{ color: MUTED, fontSize: 20 }}>· missed</span>
              <span style={{ color: GOLD, fontSize: 26, fontWeight: 800 }}>0</span>
            </div>
          </div>
        </div>
      </AbsoluteFill>
      <FilmGrade frame={frame} />
    </AbsoluteFill>
  );
};