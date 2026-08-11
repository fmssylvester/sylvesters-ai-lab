import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, Easing } from 'remotion';
import { GlassCard, Prop, riseIn, popIn, SceneBackdrop, FilmGrade } from '../kit';
import { CYAN, GOLD, WHITE, MUTED, FONT, hexA } from '../theme';

const TRAITS = [
  { file: '02_ICONS/lucide/moon.svg', label: 'never sleeps', color: 'cyan' as const },
  { file: '02_ICONS/lucide/circle-check-big.svg', label: 'never misses', color: 'cyan' as const },
  { file: '02_ICONS/lucide/user.svg', label: 'escalates to human', color: 'gold' as const },
];

export const S6Agent: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const bot = popIn(frame, 8, fps);
  const glowPulse = 0.4 + 0.3 * (0.5 + 0.5 * Math.sin(frame * 0.035));
  const pulse24 = 1 + 0.06 * (0.5 + 0.5 * Math.sin(frame * 0.09));
  const received = Math.round(interpolate(frame, [80, 160], [0, 999], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic) }));

  return (
    <AbsoluteFill style={{ fontFamily: FONT }}>
      <SceneBackdrop frame={frame} tint={CYAN} />
      <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center' }}>
        <div style={{ position: 'relative', width: 900, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          {/* core bot */}
          <div style={{ position: 'relative' }}>
            <div style={{
              position: 'absolute', inset: -90, borderRadius: '50%',
              background: `radial-gradient(circle, ${CYAN}${hexA(glowPulse * 0.5)}, transparent 62%)`,
              filter: 'blur(48px)',
            }} />
            <GlassCard frame={frame} tint={CYAN} tintOpacity={0.6} radius={40} style={{ ...bot, width: 180, height: 180, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Prop file="02_ICONS/lucide/bot.svg" size={86} color="cyan" />
            </GlassCard>
          </div>

          {/* trait chips */}
          <div style={{ display: 'flex', gap: 36, marginTop: 54 }}>
            {TRAITS.map((t, i) => {
              const c = popIn(frame, 36 + i * 18, fps);
              return (
                <div key={i} style={{ ...c, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, padding: '22px 30px', borderRadius: 24, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.12)' }}>
                  <Prop file={t.file} size={34} color={t.color} />
                  <span style={{ color: t.color === 'gold' ? GOLD : CYAN, fontSize: 22, fontWeight: 700 }}>{t.label}</span>
                </div>
              );
            })}
          </div>

          {/* 24/7 + ticker row */}
          <div style={{ display: 'flex', gap: 24, marginTop: 44, alignItems: 'center' }}>
            <div style={{ ...popIn(frame, 95, fps), display: 'flex', alignItems: 'center', gap: 10, padding: '12px 24px', borderRadius: 24, background: `${CYAN}12`, border: `1px solid ${CYAN}40`, transform: `scale(${pulse24})` }}>
              <Prop file="02_ICONS/lucide/clock-3.svg" size={24} color="cyan" />
              <span style={{ color: CYAN, fontSize: 24, fontWeight: 800 }}>24/7</span>
            </div>
            <div style={{ ...popIn(frame, 105, fps), display: 'flex', alignItems: 'center', gap: 10, padding: '12px 24px', borderRadius: 24, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.12)' }}>
              <span style={{ color: MUTED, fontSize: 20 }}>received</span>
              <span style={{ color: WHITE, fontSize: 26, fontWeight: 800, fontVariantNumeric: 'tabular-nums', minWidth: 74, textAlign: 'right' }}>{received}</span>
              <span style={{ color: MUTED, fontSize: 20 }}>· missed</span>
              <span style={{ color: CYAN, fontSize: 26, fontWeight: 800 }}>0</span>
            </div>
          </div>
        </div>
      </AbsoluteFill>
      <FilmGrade frame={frame} />
    </AbsoluteFill>
  );
};
