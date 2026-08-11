import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, Easing } from 'remotion';
import { GlassCard, Prop, riseIn, SceneBackdrop, FilmGrade } from '../kit';
import { CYAN, GOLD, WHITE, MUTED, FONT, hexA } from '../theme';

const STAGES = [
  { label: 'Webhook', sub: 'receives', icon: '02_ICONS/lucide/webhook.svg', tint: CYAN, color: 'cyan' as const },
  { label: 'AI Agent', sub: 'processes', icon: '01_LOGOS/AI/openai.svg', tint: CYAN, color: undefined },
  { label: 'Escalate?', sub: 'detects', icon: '02_ICONS/lucide/shield-alert.svg', tint: GOLD, color: 'gold' as const },
  { label: 'Email', sub: 'alerts', icon: '01_LOGOS/brand/gmail.svg', tint: GOLD, color: undefined },
  { label: 'Reply', sub: 'clean JSON', icon: '02_ICONS/lucide/send.svg', tint: CYAN, color: 'cyan' as const },
];

export const S7Pipeline: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // packet travels the line once between frame ~60 and ~220 (after nodes appear)
  const packet = interpolate(frame, [60, 240], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.inOut(Easing.cubic) });
  const packetX = 6 + packet * 88; // % across the row
  const packetVis = frame > 60 && frame < 245 ? 1 : 0;

  return (
    <AbsoluteFill style={{ fontFamily: FONT }}>
      <SceneBackdrop frame={frame} tint={CYAN} />
      <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center', padding: '0 120px' }}>
        <div style={{ width: '100%', maxWidth: 1500 }}>
          <div style={{ color: WHITE, fontSize: 54, fontWeight: 800, letterSpacing: '-0.02em', marginBottom: 12 }}>
            the build: <span style={{ color: CYAN }}>4 stages</span>
          </div>
          <div style={{ color: MUTED, fontSize: 21, marginBottom: 64 }}>
            webhook → AI agent → escalate? → email · then reply
          </div>

          <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 10, justifyContent: 'space-between' }}>
            {STAGES.map((n, i) => {
              const at = 26 + i * 20;
              const card = riseIn(frame, at, fps, 40, { stiffness: 150, damping: 18 });
              const lineW = interpolate(frame, [at + 8, at + 20], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic) });
              return (
                <React.Fragment key={i}>
                  {i > 0 && (
                    <div style={{ width: 26, height: 3, background: 'rgba(255,255,255,0.10)', borderRadius: 2, overflow: 'hidden' }}>
                      <div style={{ width: '100%', height: '100%', background: n.tint, transform: `scaleX(${lineW})`, transformOrigin: 'left' }} />
                    </div>
                  )}
                  <GlassCard frame={frame} tint={n.tint} tintOpacity={i === 2 ? 0.55 : 0.35} radius={24} style={{ ...card, width: 240, padding: '30px 26px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
                      <div style={{ height: 64, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Prop file={n.icon} size={44} color={n.color} style={i === 2 ? { filter: 'brightness(0) invert(1) sepia(1) saturate(3000%) hue-rotate(350deg) brightness(0.92)' } : undefined} />
                      </div>
                      <div style={{ color: n.tint, fontSize: 25, fontWeight: 800 }}>{n.label}</div>
                      <div style={{ color: MUTED, fontSize: 17 }}>{n.sub}</div>
                    </div>
                  </GlassCard>
                </React.Fragment>
              );
            })}

            {/* traveling packet */}
            <div style={{
              position: 'absolute', left: `${packetX}%`, top: '42%', width: 18, height: 18, marginLeft: -9, marginTop: -9,
              borderRadius: '50%', background: WHITE, boxShadow: `0 0 26px ${CYAN}, 0 0 12px ${WHITE}`,
              opacity: packetVis,
            }} />
          </div>
        </div>
      </AbsoluteFill>
      <FilmGrade frame={frame} />
    </AbsoluteFill>
  );
};
