import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, Easing } from 'remotion';
import { GlassCard, Prop, popIn, Caption, SceneBackdrop, FilmGrade } from '../kit';
import { GOLD, SOFT, WHITE, MUTED, CREAM, DEEP, hexA } from '../theme';

// the speed scene: brass stopwatch ring, 5.0s → 2.8s, JSON chip
export const S8Speed: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const ring = interpolate(frame, [10, 130], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic) });
  const R = 300;
  const circ = 2 * Math.PI * R;
  const t = interpolate(frame, [14, 100], [5.0, 2.8], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic) });

  const card = popIn(frame, 110, fps);

  return (
    <AbsoluteFill>
      <SceneBackdrop frame={frame} />
      <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center' }}>
        <div style={{ position: 'relative', width: 760, height: 760, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {/* speed lines */}
          <div style={{ position: 'absolute', inset: -140, opacity: 0.35 }}>
            {[0, 45, 90, 135, 180, 225, 270, 315].map((a, i) => {
              const len = 60 + 40 * (0.5 + 0.5 * Math.sin(frame * 0.08 + i * 1.7));
              return (
                <div key={i} style={{
                  position: 'absolute', left: '50%', top: '50%', width: 4, height: len, borderRadius: 2,
                  background: `linear-gradient(180deg, rgba(143,168,200,0), ${SOFT})`,
                  transform: `translate(-50%, -100%) rotate(${a}deg) translateY(${-420 - len * 0.5}px)`,
                  transformOrigin: 'center',
                }} />
              );
            })}
          </div>

          {/* stopwatch ring */}
          <svg width={700} height={700} viewBox="0 0 700 700" style={{ position: 'absolute' }}>
            <circle cx={350} cy={350} r={R} fill="none" stroke="rgba(244,237,224,0.08)" strokeWidth={14} />
            <circle
              cx={350} cy={350} r={R} fill="none" stroke={GOLD} strokeWidth={14} strokeLinecap="round"
              strokeDasharray={circ}
              strokeDashoffset={circ * (1 - ring)}
              transform="rotate(-90 350 350)"
              style={{ filter: `drop-shadow(0 0 18px rgba(201,162,75,0.7))` }}
            />
          </svg>

          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 190, fontWeight: 800, color: GOLD, lineHeight: 1, fontVariantNumeric: 'tabular-nums', textShadow: '0 0 60px rgba(201,162,75,0.45)' }}>
              {t.toFixed(1)}<span style={{ fontSize: 90 }}>s</span>
            </div>
            <Caption style={{ marginTop: 22, display: 'block', fontSize: 24 }}>webhook in → reply out</Caption>
          </div>

          {/* JSON chip */}
          <div style={{ ...card, position: 'absolute', right: -40, bottom: 30, padding: '22px 34px', borderRadius: 22, background: DEEP, border: `1px solid ${GOLD}40`, boxShadow: `0 0 30px rgba(201,162,75,0.18)` }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <Prop file="02_ICONS/lucide/circle-check-big.svg" size={26} color="brass" />
              <span style={{ color: GOLD, fontSize: 22, fontWeight: 700, fontFamily: "'JetBrains Mono', monospace" }}>{'{ success: true }'}</span>
            </div>
          </div>
        </div>
      </AbsoluteFill>
      <FilmGrade frame={frame} />
    </AbsoluteFill>
  );
};