import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, Easing } from 'remotion';
import { GlassCard, Prop, riseIn, popIn, Words, SceneBackdrop, FilmGrade } from '../kit';
import { CYAN, GOLD, WHITE, MUTED, FONT, hexA, breath } from '../theme';

export const S9Handoff: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // device frame scales up and fills screen by the end (hard cut to screen recording)
  const grow = interpolate(frame, [10, 400], [0.62, 1.42], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.inOut(Easing.cubic) });
  const cardO = interpolate(frame, [0, 20], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  // cursor moves in and clicks
  const cursorX = interpolate(frame, [80, 190], [300, 720], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.inOut(Easing.cubic) });
  const cursorY = interpolate(frame, [80, 190], [300, 430], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.inOut(Easing.cubic) });
  const cursorClick = frame > 190 && frame < 196 ? 0.85 : 1;

  const badgePulse = 1 + 0.08 * (0.5 + 0.5 * Math.sin(frame * 0.1));

  return (
    <AbsoluteFill style={{ fontFamily: FONT, overflow: 'hidden' }}>
      <SceneBackdrop frame={frame} tint={GOLD} />
      <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center' }}>
        <div style={{ transform: `scale(${grow})`, position: 'relative', opacity: cardO }}>
          {/* browser window */}
          <div style={{ width: 1180, borderRadius: 26, overflow: 'hidden', background: '#0B0E14', border: '1px solid rgba(255,255,255,0.14)', boxShadow: '0 80px 200px rgba(0,0,0,0.7)' }}>
            {/* chrome bar */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '18px 24px', borderBottom: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.03)' }}>
              <div style={{ display: 'flex', gap: 8 }}>
                <div style={{ width: 14, height: 14, borderRadius: '50%', background: '#FF5F57' }} />
                <div style={{ width: 14, height: 14, borderRadius: '50%', background: '#FEBC2E' }} />
                <div style={{ width: 14, height: 14, borderRadius: '50%', background: '#28C840' }} />
              </div>
              <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 10, marginLeft: 14 }}>
                <Prop file="03_UI_ELEMENTS/Browser/chrome-logo.svg" size={22} />
                <span style={{ color: MUTED, fontSize: 18 }}>yourbusiness.com</span>
              </div>
            </div>
            {/* page mockup */}
            <div style={{ height: 560, position: 'relative', background: 'linear-gradient(160deg, #0d1320 0%, #0a0e16 60%)', overflow: 'hidden' }}>
              {/* fake landing blocks */}
              <div style={{ position: 'absolute', top: 70, left: 90, width: 420, height: 30, background: 'rgba(255,255,255,0.10)', borderRadius: 6 }} />
              <div style={{ position: 'absolute', top: 118, left: 90, width: 260, height: 16, background: 'rgba(255,255,255,0.06)', borderRadius: 6 }} />
              <div style={{ position: 'absolute', top: 180, left: 90, width: 180, height: 46, borderRadius: 10, background: `${CYAN}22`, border: `1px solid ${CYAN}55`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: CYAN, fontSize: 18, fontWeight: 700 }}>
                Chat with us
              </div>
              {/* chat widget bubble */}
              <div style={{ position: 'absolute', right: 60, bottom: 50, display: 'flex', alignItems: 'center', gap: 12, padding: '16px 22px', borderRadius: 18, background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.14)', backdropFilter: 'blur(10px)' }}>
                <Prop file="02_ICONS/lucide/message-circle.svg" size={24} color="cyan" />
                <span style={{ color: WHITE, fontSize: 17 }}>Hi! How can we help? 😊</span>
              </div>
            </div>
          </div>

          {/* LIVE DEMO badge */}
          <div style={{ position: 'absolute', top: 30, right: 40, transform: `scale(${badgePulse})`, display: 'flex', alignItems: 'center', gap: 10, padding: '14px 26px', borderRadius: 26, background: `${GOLD}14`, border: `1px solid ${GOLD}44` }}>
            <div style={{ width: 12, height: 12, borderRadius: '50%', background: GOLD, boxShadow: `0 0 14px ${GOLD}` }} />
            <span style={{ color: GOLD, fontSize: 24, fontWeight: 800, letterSpacing: '0.06em' }}>LIVE DEMO</span>
          </div>

          {/* cursor */}
          <div style={{ position: 'absolute', left: cursorX, top: cursorY, transform: `scale(${cursorClick})`, filter: `drop-shadow(0 0 10px ${CYAN}${hexA(0.8)})` }}>
            <Prop file="02_ICONS/lucide/mouse-pointer.svg" size={44} color="white" />
          </div>
        </div>

        {/* headline above frame */}
        <div style={{ position: 'absolute', top: 64, left: 0, right: 0, textAlign: 'center' }}>
          <div style={{ color: WHITE, fontSize: 60, fontWeight: 800, letterSpacing: '-0.02em' }}>
            <Words text="watch this" frame={frame} start={4} fps={fps} gap={3} />
          </div>
          <div style={{ color: MUTED, fontSize: 21, marginTop: 8 }}>
            live demo — landing page
          </div>
        </div>
      </AbsoluteFill>
      <FilmGrade frame={frame} />
    </AbsoluteFill>
  );
};
