import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, Easing } from 'remotion';
import { GlassCard, Prop, riseIn, popIn, Words, Caption, SceneBackdrop, FilmGrade } from '../kit';
import { GOLD, SOFT, WHITE, CREAM, MUTED } from '../theme';

const NODES = [
  { name: 'Node 1', sub: 'the hook', icon: '02_ICONS/lucide/webhook.svg', color: 'soft' as const },
  { name: 'Node 2', sub: 'the brain', icon: '02_ICONS/lucide/zap.svg', color: 'soft' as const },
  { name: 'Node 3', sub: 'the gate', icon: '02_ICONS/lucide/badge-check.svg', color: 'brass' as const },
];

export const S2Promise: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill>
      <SceneBackdrop frame={frame} />
      <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center', padding: '0 140px' }}>
        <div style={{ width: '100%', maxWidth: 1200 }}>

          <div style={{ marginBottom: 64 }}>
            <div style={{ color: CREAM, fontSize: 78, fontWeight: 800, letterSpacing: '-0.01em', lineHeight: 1.12 }}>
              <Words text="step by step," frame={frame} start={4} fps={fps} gap={3} />
              {' '}
              <span style={{ color: GOLD }}>
                <Words text="from scratch" frame={frame} start={22} fps={fps} gap={3.4} />
              </span>
            </div>
            <Caption style={{ marginTop: 18, display: 'block' }}>the build — 3 nodes, no code</Caption>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 26 }}>
            {NODES.map((n, i) => {
              const at = 34 + i * 22;
              const card = riseIn(frame, at, fps, 40, { stiffness: 150, damping: 18 });
              const lineW = interpolate(frame, [at + 8, at + 22], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic) });
              return (
                <React.Fragment key={i}>
                  {i > 0 && (
                    <div style={{ width: 90, height: 3, background: 'rgba(244,237,224,0.10)', borderRadius: 2, overflow: 'hidden' }}>
                      <div style={{ width: '100%', height: '100%', background: i === 2 ? GOLD : SOFT, transform: `scaleX(${lineW})`, transformOrigin: 'left' }} />
                    </div>
                  )}
                  <GlassCard frame={frame} radius={22} style={{ ...card, padding: '38px 44px', minWidth: 230 }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
                      <Prop file={n.icon} size={44} color={n.color} />
                      <div style={{ color: WHITE, fontSize: 26, fontWeight: 700 }}>{n.name}</div>
                      <Caption style={{ fontSize: 18 }}>{n.sub}</Caption>
                    </div>
                  </GlassCard>
                </React.Fragment>
              );
            })}
          </div>

          {/* avatar chip */}
          <div style={{ ...popIn(frame, 105, fps), display: 'inline-flex', alignItems: 'center', gap: 14, marginTop: 64, padding: '16px 30px', borderRadius: 30, background: 'rgba(244,237,224,0.06)', border: '1px solid rgba(244,237,224,0.14)' }}>
            <Prop file="02_ICONS/lucide/user.svg" size={28} color="white" />
            <span style={{ color: WHITE, fontSize: 26, fontWeight: 700 }}>My name is Sylvester</span>
          </div>
        </div>
      </AbsoluteFill>
      <FilmGrade frame={frame} />
    </AbsoluteFill>
  );
};