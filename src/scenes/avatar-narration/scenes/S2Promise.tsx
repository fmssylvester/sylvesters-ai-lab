import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, Easing } from 'remotion';
import { GlassCard, Prop, riseIn, popIn, Words, SceneBackdrop, FilmGrade } from '../kit';
import { CYAN, GOLD, WHITE, MUTED, FONT } from '../theme';

const NODES = [
  { name: 'Node 1', sub: 'the hook', icon: '02_ICONS/lucide/webhook.svg' },
  { name: 'Node 2', sub: 'the brain', icon: '02_ICONS/lucide/zap.svg' },
  { name: 'Node 3', sub: 'the gate', icon: '02_ICONS/lucide/badge-check.svg' },
];

export const S2Promise: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill style={{ fontFamily: FONT }}>
      <SceneBackdrop frame={frame} tint={CYAN} />
      <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center', padding: '0 140px' }}>
        <div style={{ width: '100%', maxWidth: 1200 }}>
          <div style={{ color: WHITE, fontSize: 62, fontWeight: 800, letterSpacing: '-0.02em', marginBottom: 16 }}>
            <Words text="step by step," frame={frame} start={4} fps={fps} gap={2.6} />
            {' '}
            <span style={{ color: GOLD }}>
              <Words text="from scratch" frame={frame} start={22} fps={fps} gap={3} />
            </span>
          </div>
          <div style={{ color: MUTED, fontSize: 22, marginBottom: 60 }}>
            every node · every config · every mistake
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            {NODES.map((n, i) => {
              const at = 34 + i * 22;
              const card = riseIn(frame, at, fps, 40, { stiffness: 150, damping: 18 });
              const lineW = interpolate(frame, [at + 8, at + 22], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic) });
              return (
                <React.Fragment key={i}>
                  {i > 0 && (
                    <div style={{ width: 70, height: 3, background: 'rgba(255,255,255,0.10)', borderRadius: 2, overflow: 'hidden' }}>
                      <div style={{ width: '100%', height: '100%', background: CYAN, transform: `scaleX(${lineW})`, transformOrigin: 'left', boxShadow: `0 0 12px ${CYAN}` }} />
                    </div>
                  )}
                  <GlassCard frame={frame} tint={i === 2 ? GOLD : CYAN} radius={22} style={{ ...card, padding: '34px 38px', minWidth: 210 }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
                      <Prop file={n.icon} size={40} color={i === 2 ? 'gold' : 'cyan'} />
                      <div style={{ color: WHITE, fontSize: 24, fontWeight: 700 }}>{n.name}</div>
                      <div style={{ color: MUTED, fontSize: 17 }}>{n.sub}</div>
                    </div>
                  </GlassCard>
                </React.Fragment>
              );
            })}
          </div>

          {/* avatar chip */}
          <div style={{ ...popIn(frame, 105, fps), display: 'inline-flex', alignItems: 'center', gap: 14, marginTop: 56, padding: '16px 30px', borderRadius: 30, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.14)' }}>
            <Prop file="02_ICONS/lucide/user.svg" size={28} color="white" />
            <span style={{ color: WHITE, fontSize: 26, fontWeight: 700 }}>My name is Sylvester</span>
          </div>
        </div>
      </AbsoluteFill>
      <FilmGrade frame={frame} />
    </AbsoluteFill>
  );
};
