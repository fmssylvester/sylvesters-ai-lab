import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, Easing } from 'remotion';
import { GlassCard, Prop, riseIn, popIn, Words, SceneBackdrop, FilmGrade } from '../kit';
import { CYAN, GOLD, WHITE, MUTED, FONT, NEUTRAL } from '../theme';

// two-column counters: your business (slow) vs competitor (fast)
export const S4Problem: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const ours = riseIn(frame, 8, fps, 40, { stiffness: 150, damping: 18 });
  const theirs = riseIn(frame, 26, fps, 40, { stiffness: 150, damping: 18 });

  // dim our card as competitor brightens (11pm → morning drift)
  const dim = interpolate(frame, [100, 200], [1, 0.35], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const bright = interpolate(frame, [100, 200], [0.8, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  // avatar drifts right toward competitor
  const drift = interpolate(frame, [120, 260], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.inOut(Easing.cubic) });
  const avatarX = 460 + drift * 360;

  // counter counts up 0 → 12 hrs
  const hrs = Math.round(interpolate(frame, [30, 90], [0, 12], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic) }));

  const clockFlip = interpolate(frame, [30, 90], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  return (
    <AbsoluteFill style={{ fontFamily: FONT }}>
      <SceneBackdrop frame={frame} tint={CYAN} />
      <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center', padding: '0 140px' }}>
        <div style={{ width: '100%', maxWidth: 1280 }}>
          <div style={{ color: WHITE, fontSize: 58, fontWeight: 800, letterSpacing: '-0.02em', marginBottom: 14 }}>
            slow reply = <span style={{ color: GOLD }}>lost customer</span>
          </div>
          <div style={{ color: MUTED, fontSize: 22, marginBottom: 64 }}>
            11:00 PM sent → <span style={{ color: CYAN, fontWeight: 700 }}>{clockFlip > 0.5 ? '9:00 AM' : '11:00 PM'} reply</span>
          </div>

          <div style={{ position: 'relative', display: 'flex', gap: 90, justifyContent: 'center', alignItems: 'center' }}>
            {/* our business */}
            <GlassCard frame={frame} tint={NEUTRAL} tintOpacity={0.25} radius={26} style={{ ...ours, width: 420, padding: '38px 44px', opacity: dim }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 22 }}>
                <Prop file="02_ICONS/lucide/clock-3.svg" size={30} color="gray" />
                <span style={{ color: WHITE, fontSize: 26, fontWeight: 700 }}>Your business</span>
              </div>
              <div style={{ fontSize: 84, fontWeight: 800, color: NEUTRAL, fontVariantNumeric: 'tabular-nums', lineHeight: 1 }}>
                {hrs}<span style={{ fontSize: 40, fontWeight: 700 }}> hrs</span>
              </div>
              <div style={{ color: MUTED, fontSize: 20, marginTop: 10 }}>to reply</div>
            </GlassCard>

            {/* competitor */}
            <GlassCard frame={frame} tint={CYAN} tintOpacity={0.4} radius={26} style={{ ...theirs, width: 420, padding: '38px 44px', opacity: bright, transform: `translateX(${(1 - bright) * -30}px)` }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 22 }}>
                <Prop file="02_ICONS/lucide/trending-up.svg" size={30} color="cyan" />
                <span style={{ color: WHITE, fontSize: 26, fontWeight: 700 }}>Competitor</span>
              </div>
              <div style={{ fontSize: 84, fontWeight: 800, color: CYAN, fontVariantNumeric: 'tabular-nums', lineHeight: 1 }}>
                2<span style={{ fontSize: 40, fontWeight: 700 }}> min</span>
              </div>
              <div style={{ color: MUTED, fontSize: 20, marginTop: 10 }}>responded faster</div>
            </GlassCard>

            {/* drifting customer avatar */}
            <div style={{ position: 'absolute', top: -70, left: avatarX, transition: 'none', opacity: popIn(frame, 60, fps).opacity }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 84, height: 84, borderRadius: '50%', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Prop file="02_ICONS/lucide/user.svg" size={40} color="white" />
                </div>
                <div style={{ fontSize: 17, color: MUTED, fontWeight: 600 }}>customer</div>
              </div>
            </div>
          </div>
        </div>
      </AbsoluteFill>
      <FilmGrade frame={frame} />
    </AbsoluteFill>
  );
};
