import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, Easing } from 'remotion';
import { GlassCard, Prop, riseIn, Caption, SceneBackdrop, FilmGrade } from '../kit';
import { GOLD, SOFT, WHITE, MUTED, CREAM, NEUTRAL } from '../theme';

const STAGES = [
  { label: 'Webhook', sub: 'receives', icon: '02_ICONS/lucide/webhook.svg', text: SOFT, color: 'soft' as const },
  { label: 'AI Agent', sub: 'processes', icon: '01_LOGOS/AI/openai.svg', text: SOFT, color: undefined },
  { label: 'Escalate?', sub: 'detects', icon: '02_ICONS/lucide/shield-alert.svg', text: GOLD, color: 'brass' as const },
  { label: 'Email', sub: 'alerts', icon: '01_LOGOS/brand/gmail.svg', text: NEUTRAL, color: undefined },
  { label: 'Reply', sub: 'clean JSON', icon: '02_ICONS/lucide/send.svg', text: GOLD, color: 'brass' as const },
];

// the pipeline: five stage cards, one traveling packet
export const S7Pipeline: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const packet = interpolate(frame, [60, 240], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.inOut(Easing.cubic) });
  const packetX = 6 + packet * 88;
  const packetVis = frame > 60 && frame < 245 ? 1 : 0;

  return (
    <AbsoluteFill>
      <SceneBackdrop frame={frame} />
      <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center', padding: '0 120px' }}>
        <div style={{ width: '100%', maxWidth: 1500 }}>
          <div style={{ marginBottom: 68 }}>
            <div style={{ color: CREAM, fontSize: 60, fontWeight: 800, letterSpacing: '-0.02em' }}>
              the build: <span style={{ color: GOLD }}>4 stages</span>
            </div>
            <Caption style={{ marginTop: 14, display: 'block', fontSize: 20 }}>one connection walks the whole line</Caption>
          </div>

          <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 10, justifyContent: 'space-between' }}>
            {STAGES.map((n, i) => {
              const at = 30 + i * 20;
              const card = riseIn(frame, at, fps, 40, { stiffness: 150, damping: 18 });
              const lineW = interpolate(frame, [at + 8, at + 20], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic) });
              return (
                <React.Fragment key={i}>
                  {i > 0 && (
                    <div style={{ width: 26, height: 3, background: 'rgba(244,237,224,0.10)', borderRadius: 2, overflow: 'hidden' }}>
                      <div style={{ width: '100%', height: '100%', background: i === 2 || i === 4 ? GOLD : SOFT, transform: `scaleX(${lineW})`, transformOrigin: 'left' }} />
                    </div>
                  )}
                  <GlassCard frame={frame} radius={24} style={{ ...card, width: 240, padding: '30px 26px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
                      <div style={{ height: 64, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Prop file={n.icon} size={44} color={n.color} />
                      </div>
                      <div style={{ color: WHITE, fontSize: 25, fontWeight: 800 }}>{n.label}</div>
                      <Caption style={{ fontSize: 16 }}>{n.sub}</Caption>
                    </div>
                  </GlassCard>
                </React.Fragment>
              );
            })}

            <div style={{
              position: 'absolute', left: `${packetX}%`, top: '42%', width: 18, height: 18, marginLeft: -9, marginTop: -9,
              borderRadius: '50%', background: WHITE, boxShadow: `0 0 26px rgba(201,162,75,0.85), 0 0 12px ${WHITE}`,
              opacity: packetVis,
            }} />
          </div>
        </div>
      </AbsoluteFill>
      <FilmGrade frame={frame} />
    </AbsoluteFill>
  );
};