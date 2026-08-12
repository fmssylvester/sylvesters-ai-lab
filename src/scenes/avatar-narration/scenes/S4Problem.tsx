import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, Easing } from 'remotion';
import { GlassCard, Prop, riseIn, popIn, Caption, SceneBackdrop, FilmGrade } from '../kit';
import { GOLD, SOFT, NEUTRAL, WHITE, CREAM, MUTED } from '../theme';

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

  return (
    <AbsoluteFill>
      <SceneBackdrop frame={frame} />
      <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center', padding: '0 140px' }}>
        <div style={{ width: '100%', maxWidth: 1280 }}>
          <div style={{ color: CREAM, fontSize: 66, fontWeight: 800, letterSpacing: '-0.01em', marginBottom: 64 }}>
            slow reply = <span style={{ color: GOLD }}>lost customer</span>
          </div>

          <div style={{ position: 'relative', display: 'flex', gap: 90, justifyContent: 'center', alignItems: 'center' }}>
            {/* our business */}
            <GlassCard frame={frame} radius={26} style={{ ...ours, width: 420, padding: '38px 44px', opacity: dim }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 22 }}>
                <Prop file="02_ICONS/lucide/clock-3.svg" size={30} color="gray" />
                <span style={{ color: WHITE, fontSize: 26, fontWeight: 700 }}>Your business</span>
              </div>
              <div style={{ fontSize: 84, fontWeight: 800, color: NEUTRAL, fontVariantNumeric: 'tabular-nums', lineHeight: 1 }}>
                {hrs}<span style={{ fontSize: 40, fontWeight: 700 }}> hrs</span>
              </div>
              <Caption style={{ marginTop: 10, display: 'block' }}>to reply</Caption>
            </GlassCard>

            {/* competitor */}
            <GlassCard frame={frame} radius={26} style={{ ...theirs, width: 420, padding: '38px 44px', opacity: bright, transform: `translateX(${(1 - bright) * -30}px)` }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 22 }}>
                <Prop file="02_ICONS/lucide/trending-up.svg" size={30} color="soft" />
                <span style={{ color: WHITE, fontSize: 26, fontWeight: 700 }}>Competitor</span>
              </div>
              <div style={{ fontSize: 84, fontWeight: 800, color: SOFT, fontVariantNumeric: 'tabular-nums', lineHeight: 1 }}>
                2<span style={{ fontSize: 40, fontWeight: 700 }}> min</span>
              </div>
              <Caption style={{ marginTop: 10, display: 'block' }}>responded faster</Caption>
            </GlassCard>

            {/* drifting customer avatar */}
            <div style={{ position: 'absolute', top: -70, left: avatarX, opacity: popIn(frame, 60, fps).opacity }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 84, height: 84, borderRadius: '50%', background: 'rgba(244,237,224,0.08)', border: '1px solid rgba(244,237,224,0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Prop file="02_ICONS/lucide/user.svg" size={40} color="white" />
                </div>
                <Caption style={{ fontSize: 17 }}>customer</Caption>
              </div>
            </div>
          </div>
        </div>
      </AbsoluteFill>
      <FilmGrade frame={frame} />
    </AbsoluteFill>
  );
};