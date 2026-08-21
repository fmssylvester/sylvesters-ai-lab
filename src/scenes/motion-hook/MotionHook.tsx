import React from 'react';
import {
  AbsoluteFill,
  Audio,
  Sequence,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
} from 'remotion';
import {
  CinematicBackdrop,
  Grade,
  GlassPanel,
  cameraTransform,
  breath,
  hexA,
  EASE,
  INK,
  WHITE,
  MUTED,
  FAINT,
  ACCENT,
  TEAL,
} from './cinematic';

// ══════════════════════════════════════════════════════════════════════════
//  MOTION HOOK — transcript-synced MOTION GRAPHICS, now cinematic.
//  Depicted visuals (inbox, chat, clock, workflow) rendered on real frosted
//  glass, over a graded backdrop, with a slow camera push-in, split-tone
//  grade, film grain, and constant micro-life. Timed to kiki.mp3 + SFX.
// ══════════════════════════════════════════════════════════════════════════

const FONT = "'Switzer', system-ui, -apple-system, 'Segoe UI', sans-serif";
const MONO = "'Fragment Mono', 'SF Mono', ui-monospace, monospace";
const TOTAL = 330;

// Glass-like fill for elements that sit ON a panel (no nested backdrop-blur).
const glassFill: React.CSSProperties = {
  background:
    'linear-gradient(155deg, rgba(255,255,255,0.11), rgba(255,255,255,0.035))',
  border: '1px solid rgba(255,255,255,0.13)',
  boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.22)',
};

// Act windows (absolute frames @30fps).
const A1 = [0, 83];
const A2 = [83, 137];
const A3 = [137, 205];
const A4 = [205, 272];
const A5 = [272, 330];

const win = (f: number, s: number, e: number, fade = 12) =>
  interpolate(f, [s, s + fade, e - fade, e], [0, 1, 1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: EASE,
  });

const appear = (f: number, start: number, dur = 12) =>
  interpolate(f, [start, start + dur], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: EASE,
  });

// Per-act slow push-in (scale) so each beat has its own inward drift.
const pushIn = (local: number, dur: number, to = 1.05) =>
  interpolate(local, [0, dur], [1.0, to], { extrapolateRight: 'clamp' });

// Soft bloom disc behind a focal element.
const Bloom: React.FC<{ opacity: number; color?: string; size?: number }> = ({
  opacity,
  color = ACCENT,
  size = 900,
}) => (
  <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center' }}>
    <div
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        background: `radial-gradient(circle, ${color}${hexA(0.22)} 0%, transparent 60%)`,
        filter: 'blur(30px)',
        opacity,
      }}
    />
  </AbsoluteFill>
);

// ════════════════ ACT 1 — message flood ════════════════════════════════════
const MESSAGES = [
  { a: 'JM', t: "Where's my order?" },
  { a: 'AR', t: 'Do you ship internationally?' },
  { a: 'KP', t: "I'd like a refund, please." },
  { a: 'LT', t: 'Is the blue one back in stock?' },
  { a: 'DN', t: "My discount code won't apply." },
  { a: 'S•', t: 'Can I change my address?' },
];
const MSG_AT = [6, 18, 30, 42, 54, 66];

const Act1: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => {
  const op = win(frame, A1[0], A1[1] + 6);
  const local = frame - A1[0];
  const count = MSG_AT.filter((a) => frame >= a).length;
  const card = spring({ frame: local, fps, config: { damping: 14, stiffness: 110, mass: 0.9 } });
  const tiltY = breath(frame, 0.011, 2.4);
  const tiltX = breath(frame, 0.014, 1.6, 1.2) - 3;
  const scale = 0.94 + 0.06 * card;
  return (
    <AbsoluteFill
      style={{ justifyContent: 'center', alignItems: 'center', opacity: op, perspective: 1800 }}
    >
      <GlassPanel
        frame={frame}
        radius={30}
        tint={ACCENT}
        tintOpacity={0.42}
        style={{
          width: 860,
          transform: `scale(${scale * pushIn(local, 83, 1.04)}) rotateY(${tiltY}deg) rotateX(${tiltX}deg)`,
          transformStyle: 'preserve-3d',
        }}
      >
        <div style={{ padding: '30px 34px' }}>
          {/* header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 22 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#2ED47A', boxShadow: '0 0 12px #2ED47A' }} />
              <span style={{ color: WHITE, fontSize: 25, fontWeight: 700, letterSpacing: '-0.01em' }}>Customer inbox</span>
            </div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 9,
                padding: '8px 16px',
                borderRadius: 20,
                background: `${ACCENT}${hexA(0.16)}`,
                border: `1px solid ${ACCENT}${hexA(0.4)}`,
                boxShadow: `0 0 24px ${ACCENT}${hexA(0.22)}`,
              }}
            >
              <div style={{ width: 7, height: 7, borderRadius: '50%', background: ACCENT }} />
              <span style={{ color: ACCENT, fontSize: 19, fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>
                {count} new
              </span>
            </div>
          </div>
          {/* stack */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 13, minHeight: 430, justifyContent: 'flex-end' }}>
            {MESSAGES.map((m, i) => {
              const ml = frame - MSG_AT[i];
              const pop = spring({ frame: ml, fps, config: { damping: 13, stiffness: 150, mass: 0.7 } });
              const o = appear(frame, MSG_AT[i], 8);
              const x = interpolate(pop, [0, 1], [-40, 0]);
              // newest row sits brightest; older rows recede slightly (depth)
              const depth = Math.max(0, count - 1 - i);
              const recede = Math.max(0.55, 1 - depth * 0.09);
              return (
                <div
                  key={i}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 14,
                    opacity: o * recede,
                    transform: `translateX(${x}px) scale(${0.98 + 0.02 * pop})`,
                  }}
                >
                  <div
                    style={{
                      width: 46,
                      height: 46,
                      borderRadius: '50%',
                      ...glassFill,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: MUTED,
                      fontSize: 17,
                      fontWeight: 700,
                      flexShrink: 0,
                    }}
                  >
                    {m.a}
                  </div>
                  <div
                    style={{
                      ...glassFill,
                      borderRadius: 16,
                      borderTopLeftRadius: 5,
                      padding: '15px 22px',
                      color: WHITE,
                      fontSize: 24,
                      fontWeight: 500,
                    }}
                  >
                    {m.t}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </GlassPanel>
    </AbsoluteFill>
  );
};

// ════════════════ ACT 2 — instant intelligent reply ════════════════════════
const Act2: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => {
  const op = win(frame, A2[0], A2[1]);
  const local = frame - A2[0];
  const custO = appear(frame, 85, 10);
  const dotsOn = frame >= 89 && frame < 98;
  const replyStart = 98;
  const replyPop = spring({ frame: frame - replyStart, fps, config: { damping: 13, stiffness: 130, mass: 0.7 } });
  const ring = interpolate(frame, [replyStart, replyStart + 24], [0.55, 2.0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: EASE });
  const ringO = interpolate(frame, [replyStart, replyStart + 24], [0.55, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const badgeO = appear(frame, 108, 10);
  const dot = (i: number) => 0.3 + 0.7 * (0.5 + 0.5 * Math.sin((frame - 89) * 0.55 - i * 0.9));
  const tiltY = breath(frame, 0.012, 1.8);

  return (
    <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center', opacity: op, perspective: 1800 }}>
      <Bloom opacity={replyPop * 0.9} size={1150} />
      <div
        style={{
          width: 900,
          display: 'flex',
          flexDirection: 'column',
          gap: 24,
          transform: `scale(${pushIn(local, 54, 1.05)}) rotateY(${tiltY}deg)`,
          transformStyle: 'preserve-3d',
        }}
      >
        {/* customer message (left) */}
        <div style={{ display: 'flex', gap: 14, opacity: custO, alignSelf: 'flex-start', maxWidth: '78%' }}>
          <div
            style={{
              width: 48, height: 48, borderRadius: '50%', ...glassFill,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: MUTED, fontSize: 17, fontWeight: 700, flexShrink: 0,
            }}
          >
            JM
          </div>
          <div
            style={{
              ...glassFill,
              borderRadius: 18, borderTopLeftRadius: 5,
              padding: '18px 24px', color: WHITE, fontSize: 26,
            }}
          >
            Hi — I'm locked out of my account.
          </div>
        </div>

        {/* AI side (right) */}
        <div style={{ alignSelf: 'flex-end', maxWidth: '84%', position: 'relative' }}>
          {dotsOn && (
            <div
              style={{
                display: 'flex', gap: 8, padding: '20px 26px',
                background: `${ACCENT}${hexA(0.14)}`, border: `1px solid ${ACCENT}${hexA(0.36)}`,
                borderRadius: 18, borderTopRightRadius: 5, width: 'fit-content', marginLeft: 'auto',
              }}
            >
              {[0, 1, 2].map((i) => (
                <div key={i} style={{ width: 11, height: 11, borderRadius: '50%', background: ACCENT, opacity: dot(i) }} />
              ))}
            </div>
          )}
          {frame >= replyStart && (
            <div style={{ display: 'flex', gap: 14, justifyContent: 'flex-end', position: 'relative', alignItems: 'center' }}>
              {/* expanding ring */}
              <div
                style={{
                  position: 'absolute', right: 26, top: '50%',
                  width: 120, height: 120, marginTop: -60, borderRadius: '50%',
                  border: `2px solid ${ACCENT}`, transform: `scale(${ring})`, opacity: ringO,
                }}
              />
              <GlassPanel
                frame={frame}
                radius={18}
                tint={ACCENT}
                tintOpacity={0.7}
                blur={14}
                style={{
                  transform: `scale(${0.82 + 0.18 * replyPop})`,
                  transformOrigin: 'right center',
                  opacity: replyPop,
                  maxWidth: 640,
                }}
              >
                <div style={{ padding: '18px 24px', color: WHITE, fontSize: 26, lineHeight: 1.45 }}>
                  <div style={{ color: ACCENT, fontSize: 18, fontWeight: 700, marginBottom: 7, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Spark size={16} /> AI Agent
                  </div>
                  You're back in — I've reset your password and emailed a secure link. Anything else?
                </div>
              </GlassPanel>
              <div
                style={{
                  width: 48, height: 48, borderRadius: '50%', background: ACCENT,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                  opacity: replyPop, boxShadow: `0 0 34px ${ACCENT}${hexA(0.5)}`,
                }}
              >
                <Spark size={22} dark />
              </div>
            </div>
          )}
          {/* "replied in 0.4s" */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 14, marginRight: 62, opacity: badgeO }}>
            <div
              style={{
                display: 'flex', alignItems: 'center', gap: 8, padding: '7px 15px',
                borderRadius: 16, ...glassFill, color: MUTED, fontSize: 17, fontFamily: MONO,
              }}
            >
              <ClockGlyph size={15} /> replied in 0.4s
            </div>
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ════════════════ ACT 3 — 3 AM, hands-off ══════════════════════════════════
const Act3: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => {
  const op = win(frame, A3[0], A3[1]);
  const local = frame - A3[0];
  const secDeg = interpolate(local, [0, 68], [0, 720], { extrapolateRight: 'clamp' });
  const clockPop = spring({ frame: local, fps, config: { damping: 14, stiffness: 110, mass: 0.9 } });
  const tiltY = breath(frame, 0.01, 2);
  const ticks = Array.from({ length: 12 }, (_, i) => {
    const th = (Math.PI / 6) * i;
    return {
      x1: 160 + 138 * Math.sin(th), y1: 160 - 138 * Math.cos(th),
      x2: 160 + 150 * Math.sin(th), y2: 160 - 150 * Math.cos(th),
    };
  });
  const pulses = [
    { at: 150, ox: -190 },
    { at: 170, ox: 0 },
    { at: 190, ox: 190 },
  ];
  return (
    <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center', opacity: op, perspective: 1600 }}>
      <div
        style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 26,
          opacity: clockPop,
          transform: `scale(${(0.92 + 0.08 * clockPop) * pushIn(local, 68, 1.04)}) rotateY(${tiltY}deg)`,
          transformStyle: 'preserve-3d',
        }}
      >
        {/* glass watch face */}
        <GlassPanel frame={frame} radius={210} tint={ACCENT} tintOpacity={0.4} style={{ width: 340, height: 340 }}>
          <div style={{ width: 340, height: 340, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width={320} height={320} viewBox="0 0 320 320">
              <circle cx={160} cy={160} r={150} fill="none" stroke={FAINT} strokeWidth={2} />
              {ticks.map((t, i) => (
                <line key={i} x1={t.x1} y1={t.y1} x2={t.x2} y2={t.y2} stroke={i % 3 === 0 ? MUTED : FAINT} strokeWidth={i % 3 === 0 ? 3 : 2} />
              ))}
              <line x1={160} y1={160} x2={232} y2={160} stroke={WHITE} strokeWidth={7} strokeLinecap="round" />
              <line x1={160} y1={160} x2={160} y2={54} stroke={WHITE} strokeWidth={5} strokeLinecap="round" />
              <line x1={160} y1={176} x2={160} y2={64} stroke={ACCENT} strokeWidth={2.5} strokeLinecap="round" transform={`rotate(${secDeg} 160 160)`} />
              <circle cx={160} cy={160} r={7} fill={ACCENT} />
            </svg>
          </div>
        </GlassPanel>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 12 }}>
          <span style={{ fontFamily: MONO, fontSize: 58, color: WHITE, fontWeight: 700, letterSpacing: 4, textShadow: `0 0 30px ${ACCENT}${hexA(0.3)}` }}>03:00</span>
          <span style={{ fontFamily: MONO, fontSize: 26, color: MUTED, fontWeight: 600 }}>AM</span>
        </div>
        <div style={{ position: 'relative', height: 60, width: 720 }}>
          {pulses.map((p, i) => {
            const o = interpolate(frame, [p.at, p.at + 10, p.at + 26, p.at + 36], [0, 1, 1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
            const rise = interpolate(frame, [p.at, p.at + 12], [22, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: EASE });
            return (
              <div
                key={i}
                style={{
                  position: 'absolute', left: '50%', top: 0,
                  transform: `translateX(calc(-50% + ${p.ox}px)) translateY(${rise}px)`,
                  opacity: o, display: 'flex', alignItems: 'center', gap: 10,
                  padding: '11px 20px', borderRadius: 18,
                  background: `${ACCENT}${hexA(0.13)}`, border: `1px solid ${ACCENT}${hexA(0.34)}`,
                  boxShadow: `0 0 26px ${ACCENT}${hexA(0.2)}`, whiteSpace: 'nowrap',
                }}
              >
                <Spark size={15} /> <span style={{ color: WHITE, fontSize: 19, fontWeight: 600 }}>Auto-replied</span>
              </div>
            );
          })}
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ════════════════ ACT 4 — build-up / converge ══════════════════════════════
const Act4: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => {
  const op = win(frame, A4[0], A4[1], 10);
  const local = frame - A4[0];
  const coreScale = interpolate(local, [0, 55, 67], [0.2, 1, 2.6], { extrapolateRight: 'clamp', easing: EASE });
  const coreO = interpolate(local, [0, 10, 55, 67], [0, 1, 1, 0], { extrapolateRight: 'clamp' });
  const rays = 10;
  return (
    <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center', opacity: op }}>
      <Bloom opacity={coreO * 0.95} size={900} />
      {Array.from({ length: rays }).map((_, i) => {
        const ang = (360 / rays) * i;
        const dist = interpolate(local, [0, 50], [440, 40], { extrapolateRight: 'clamp', easing: EASE });
        const o = interpolate(local, [0, 12, 46, 56], [0, 0.7, 0.7, 0], { extrapolateRight: 'clamp' });
        return (
          <div
            key={i}
            style={{
              position: 'absolute', width: 3, height: 130,
              background: `linear-gradient(${ACCENT}, transparent)`, opacity: o,
              transform: `rotate(${ang}deg) translateY(${-dist}px)`, transformOrigin: 'center center',
            }}
          />
        );
      })}
      <div
        style={{
          width: 120, height: 120, borderRadius: '50%',
          background: `radial-gradient(circle, ${WHITE}, ${ACCENT})`,
          transform: `scale(${coreScale})`, opacity: coreO,
          boxShadow: `0 0 90px ${ACCENT}, 0 0 160px ${ACCENT}${hexA(0.6)}`,
        }}
      />
    </AbsoluteFill>
  );
};

// ════════════════ ACT 5 — n8n workflow reveal ══════════════════════════════
const NODES = [
  { at: 278, label: 'Webhook', sub: 'message in', glyph: 'in' as const, accent: false },
  { at: 290, label: 'AI Agent', sub: 'understands', glyph: 'ai' as const, accent: true },
  { at: 302, label: 'Reply', sub: 'sent back', glyph: 'send' as const, accent: false },
];

const Act5: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => {
  const op = interpolate(frame, [A5[0], A5[0] + 12], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: EASE });
  const local = frame - A5[0];
  const packetX = interpolate(frame, [298, 320], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: EASE });
  const wmO = appear(frame, 298, 12);
  const wmPop = spring({ frame: frame - 298, fps, config: { damping: 12, stiffness: 140, mass: 0.6 } });
  const tiltY = breath(frame, 0.011, 1.6);
  return (
    <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center', opacity: op, perspective: 1900 }}>
      <Bloom opacity={0.5} size={1000} />
      <div
        style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 64,
          transform: `scale(${pushIn(local, 58, 1.04)}) rotateY(${tiltY}deg)`,
          transformStyle: 'preserve-3d',
        }}
      >
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
          {NODES.map((n, i) => {
            const pop = spring({ frame: frame - n.at, fps, config: { damping: 13, stiffness: 120, mass: 0.7 } });
            const float = breath(frame, 0.05, 4, i * 1.3);
            return (
              <React.Fragment key={i}>
                {i > 0 && <Connector frame={frame} at={NODES[i].at - 6} />}
                <GlassPanel
                  frame={frame}
                  radius={28}
                  tint={n.accent ? ACCENT : TEAL}
                  tintOpacity={n.accent ? 0.7 : 0.3}
                  style={{
                    transform: `scale(${0.72 + 0.28 * pop}) translateY(${float}px)`,
                    opacity: pop,
                    width: 200,
                    height: 200,
                  }}
                >
                  <div
                    style={{
                      width: 200, height: 200,
                      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 14,
                      border: n.accent ? `1px solid ${ACCENT}${hexA(0.5)}` : 'none',
                      borderRadius: 28,
                      boxShadow: n.accent ? `inset 0 0 40px ${ACCENT}${hexA(0.18)}` : 'none',
                    }}
                  >
                    <div
                      style={{
                        width: 66, height: 66, borderRadius: 18,
                        background: n.accent ? ACCENT : 'rgba(255,255,255,0.08)',
                        border: n.accent ? 'none' : '1px solid rgba(255,255,255,0.14)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        boxShadow: n.accent ? `0 0 30px ${ACCENT}${hexA(0.5)}` : 'none',
                      }}
                    >
                      {n.glyph === 'in' && <ArrowIn size={30} />}
                      {n.glyph === 'ai' && <Spark size={30} dark />}
                      {n.glyph === 'send' && <Send size={28} />}
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ color: n.accent ? ACCENT : WHITE, fontSize: 23, fontWeight: 700 }}>{n.label}</div>
                      <div style={{ color: MUTED, fontSize: 16, marginTop: 3 }}>{n.sub}</div>
                    </div>
                  </div>
                </GlassPanel>
              </React.Fragment>
            );
          })}
          {/* traveling packet */}
          <div
            style={{
              position: 'absolute', left: `${packetX * 100}%`, top: '50%',
              width: 16, height: 16, marginLeft: -8, marginTop: -8, borderRadius: '50%',
              background: WHITE, boxShadow: `0 0 26px ${ACCENT}, 0 0 12px ${WHITE}`,
              opacity: packetX > 0 && packetX < 1 ? 1 : 0,
            }}
          />
        </div>
        {/* n8n wordmark */}
        <div style={{ textAlign: 'center', opacity: wmO }}>
          <div style={{ color: MUTED, fontSize: 22, fontWeight: 500, marginBottom: 6, letterSpacing: 1 }}>Built with</div>
          <div
            style={{
              fontFamily: FONT, fontSize: 92, fontWeight: 800, color: ACCENT,
              letterSpacing: '-0.03em', transform: `scale(${0.9 + 0.1 * wmPop})`,
              textShadow: `0 0 50px ${ACCENT}${hexA(0.5)}`,
            }}
          >
            n8n
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

const Connector: React.FC<{ frame: number; at: number }> = ({ frame, at }) => {
  const w = interpolate(frame, [at, at + 12], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: EASE });
  return (
    <div style={{ width: 90, height: 2, background: 'rgba(255,255,255,0.12)', margin: '0 6px', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', inset: 0, background: ACCENT, transform: `scaleX(${w})`, transformOrigin: 'left', boxShadow: `0 0 10px ${ACCENT}` }} />
    </div>
  );
};

// ── glyphs ──────────────────────────────────────────────────────────────────
const Spark: React.FC<{ size?: number; dark?: boolean }> = ({ size = 20, dark }) => (
  <svg width={size} height={size} viewBox="0 0 24 24">
    <path d="M12 1.5 L14 9 L21.5 12 L14 15 L12 22.5 L10 15 L2.5 12 L10 9 Z" fill={dark ? INK : ACCENT} />
  </svg>
);
const ClockGlyph: React.FC<{ size?: number }> = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={MUTED} strokeWidth={2}>
    <circle cx={12} cy={12} r={9} />
    <path d="M12 7 V12 L15.5 14" strokeLinecap="round" />
  </svg>
);
const ArrowIn: React.FC<{ size?: number }> = ({ size = 28 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={WHITE} strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 12 H15" />
    <path d="M11 8 L15 12 L11 16" />
    <circle cx={19.5} cy={12} r={2} fill={WHITE} stroke="none" />
  </svg>
);
const Send: React.FC<{ size?: number }> = ({ size = 26 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={WHITE}>
    <path d="M2.5 11.5 L21 3 L12.8 21 L10.6 13.4 Z" />
  </svg>
);

// ── SFX (placed on motion beats; low volume so voice dominates) ──────────────
const Sfx: React.FC<{ from: number; file: string; volume: number }> = ({ from, file, volume }) => (
  <Sequence from={from} durationInFrames={40} layout="none">
    <Audio src={staticFile(`sfx/${file}`)} volume={volume} />
  </Sequence>
);

export const MotionHook: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <AbsoluteFill style={{ background: INK, fontFamily: FONT }}>
      <Audio src={staticFile('kiki.mp3')} />

      {/* SFX bed */}
      {MSG_AT.map((f, i) => (
        <Sfx key={i} from={f} file="pop.wav" volume={0.14} />
      ))}
      <Sfx from={89} file="whoosh.wav" volume={0.22} />
      <Sfx from={98} file="ding.wav" volume={0.3} />
      <Sfx from={150} file="click.wav" volume={0.5} />
      <Sfx from={150} file="pop.wav" volume={0.16} />
      <Sfx from={170} file="pop.wav" volume={0.16} />
      <Sfx from={190} file="pop.wav" volume={0.16} />
      <Sfx from={208} file="riser.wav" volume={0.4} />
      <Sfx from={278} file="pop.wav" volume={0.28} />
      <Sfx from={290} file="pop.wav" volume={0.3} />
      <Sfx from={302} file="pop.wav" volume={0.3} />
      <Sfx from={298} file="ding.wav" volume={0.32} />

      {/* graded backdrop (behind everything) */}
      <CinematicBackdrop frame={frame} />

      {/* acts, under a slow global camera drift */}
      <AbsoluteFill style={{ transform: cameraTransform(frame, TOTAL) }}>
        {frame < A1[1] + 8 && <Act1 frame={frame} fps={fps} />}
        {frame >= A2[0] - 8 && frame < A2[1] + 8 && <Act2 frame={frame} fps={fps} />}
        {frame >= A3[0] - 8 && frame < A3[1] + 8 && <Act3 frame={frame} fps={fps} />}
        {frame >= A4[0] - 8 && frame < A4[1] + 8 && <Act4 frame={frame} fps={fps} />}
        {frame >= A5[0] - 8 && <Act5 frame={frame} fps={fps} />}
      </AbsoluteFill>

      {/* cinematic grade on top of the whole frame */}
      <Grade frame={frame} />
    </AbsoluteFill>
  );
};

export default MotionHook;
