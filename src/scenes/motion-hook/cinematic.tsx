import React from 'react';
import { AbsoluteFill, interpolate, spring, Easing, random } from 'remotion';

// ══════════════════════════════════════════════════════════════════════════
//  CINEMATIC LAYER — the "expensive" toolkit.
//  Turns flat, hardcoded-looking scenes into graded, dimensional, living ones.
//    · CinematicBackdrop — graded base (lifted cool-indigo blacks) + drifting
//      warm/cool bokeh blobs that read as real light in the room.
//    · Grade          — vignette + teal/orange split-tone + animated film grain.
//    · GlassPanel     — real frosted glass: backdrop-blur, top specular edge,
//      a moving diagonal glint, and colored light bleeding through from behind.
//    · cameraTransform — a slow perspective push-in so nothing is ever still.
//    · breath / enter  — constant micro-life + spring-overshoot entrances.
//  Reused across every segment so the whole film shares one graded language.
// ══════════════════════════════════════════════════════════════════════════

// ── Graded palette (warm accent vs cool shadow = the classic film split-tone) ─
export const INK = '#04050A';      // near-black, cool
export const INK2 = '#0C1122';     // lifted indigo (blacks pushed toward blue)
export const WHITE = '#FFFFFF';
export const MUTED = 'rgba(233,238,255,0.52)';
export const FAINT = 'rgba(233,238,255,0.15)';
export const ACCENT = '#FF5D73';   // warm — AI-active / n8n
export const ACCENT_WARM = '#FFB27A'; // warm highlight partner
export const TEAL = '#37E3C8';     // cool counter-accent

export const EASE = Easing.bezier(0.16, 1, 0.3, 1);

// 0..1 → 2-digit hex alpha, so `${ACCENT}${hexA(0.3)}` = a tinted color.
export const hexA = (o: number) =>
  Math.round(Math.max(0, Math.min(1, o)) * 255)
    .toString(16)
    .padStart(2, '0');

// ── Constant micro-life: a gentle sine the scene is never without ──────────
export const breath = (frame: number, speed: number, amp: number, phase = 0) =>
  Math.sin(frame * speed + phase) * amp;

// ── Spring entrance with a touch of overshoot (arrives with weight) ────────
export const enter = (frame: number, start: number, fps: number, cfg?: object) =>
  spring({
    frame: frame - start,
    fps,
    config: cfg ?? { damping: 12, stiffness: 120, mass: 0.85 },
  });

// ── Slow camera push-in + drift — the frame always breathes a little ───────
export const cameraTransform = (frame: number, total: number) => {
  const s = interpolate(frame, [0, total], [1.0, 1.04], {
    extrapolateRight: 'clamp',
  });
  const x = Math.cos(frame * 0.011) * 5;
  const y = Math.sin(frame * 0.015) * 6;
  return `scale(${s}) translate(${x}px, ${y}px)`;
};

// ── Graded backdrop: base gradient + two slow bokeh light sources ──────────
export const CinematicBackdrop: React.FC<{ frame: number }> = ({ frame }) => {
  const ax = 26 + breath(frame, 0.006, 5);
  const ay = 24 + breath(frame, 0.008, 4, 1.5);
  const bx = 74 + breath(frame, 0.005, 6, 2.2);
  const by = 78 + breath(frame, 0.007, 5, 0.6);
  const pulse = 0.42 + 0.08 * (0.5 + 0.5 * Math.sin(frame * 0.03));
  return (
    <AbsoluteFill style={{ background: INK, overflow: 'hidden' }}>
      {/* lifted cool base — blacks toward indigo, darker at the edges */}
      <AbsoluteFill
        style={{
          background: `radial-gradient(120% 90% at 50% 38%, ${INK2} 0%, ${INK} 68%)`,
        }}
      />
      {/* warm bokeh light (top-left-ish) */}
      <div
        style={{
          position: 'absolute',
          left: `${ax}%`,
          top: `${ay}%`,
          width: 900,
          height: 900,
          marginLeft: -450,
          marginTop: -450,
          borderRadius: '50%',
          background: `radial-gradient(circle, ${ACCENT}${hexA(pulse * 0.5)}, transparent 62%)`,
          filter: 'blur(90px)',
        }}
      />
      {/* cool bokeh light (bottom-right-ish) */}
      <div
        style={{
          position: 'absolute',
          left: `${bx}%`,
          top: `${by}%`,
          width: 820,
          height: 820,
          marginLeft: -410,
          marginTop: -410,
          borderRadius: '50%',
          background: `radial-gradient(circle, ${TEAL}${hexA(pulse * 0.4)}, transparent 62%)`,
          filter: 'blur(96px)',
        }}
      />
    </AbsoluteFill>
  );
};

// ── Animated film grain (deterministic per frame via remotion random) ──────
const GRAIN =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='150' height='150'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.82' numOctaves='2' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.55'/%3E%3C/svg%3E\")";

// ── Grade: vignette + split-tone + grain, laid over everything ─────────────
export const Grade: React.FC<{ frame: number }> = ({ frame }) => {
  const gx = Math.floor(random(`gx${frame}`) * 150);
  const gy = Math.floor(random(`gy${frame}`) * 150);
  return (
    <AbsoluteFill style={{ pointerEvents: 'none' }}>
      {/* split-tone: warm in the highlights, cool in the shadows */}
      <AbsoluteFill
        style={{
          background: `radial-gradient(circle at 68% 22%, ${ACCENT_WARM}1A, transparent 55%)`,
          mixBlendMode: 'soft-light',
        }}
      />
      <AbsoluteFill
        style={{
          background: `radial-gradient(circle at 22% 84%, ${TEAL}1F, transparent 55%)`,
          mixBlendMode: 'soft-light',
        }}
      />
      {/* vignette — pulls the eye to center */}
      <AbsoluteFill
        style={{
          background:
            'radial-gradient(ellipse at center, transparent 52%, rgba(0,0,0,0.30) 82%, rgba(0,0,0,0.6) 100%)',
        }}
      />
      {/* film grain */}
      <AbsoluteFill
        style={{
          top: '-25%',
          left: '-25%',
          width: '150%',
          height: '150%',
          backgroundImage: GRAIN,
          backgroundSize: '150px 150px',
          opacity: 0.05,
          mixBlendMode: 'overlay',
          transform: `translate(${gx}px, ${gy}px)`,
        }}
      />
    </AbsoluteFill>
  );
};

// ── GlassPanel: a real pane of frosted glass with depth and moving light ───
export const GlassPanel: React.FC<{
  children: React.ReactNode;
  frame: number;
  style?: React.CSSProperties;
  radius?: number;
  tint?: string;
  tintOpacity?: number;
  blur?: number;
}> = ({ children, frame, style, radius = 26, tint = ACCENT, tintOpacity = 0.5, blur = 16 }) => {
  const glint = 18 + ((Math.sin(frame * 0.02) + 1) / 2) * 62; // sweeping highlight 18→80%
  return (
    <div style={{ position: 'relative', ...style }}>
      {/* colored light bleeding through from behind the glass */}
      <div
        style={{
          position: 'absolute',
          inset: '-16% -12%',
          background: `radial-gradient(circle at 32% 24%, ${tint}${hexA(tintOpacity)}, transparent 62%)`,
          filter: 'blur(48px)',
          borderRadius: radius,
          zIndex: 0,
        }}
      />
      {/* the pane */}
      <div
        style={{
          position: 'relative',
          zIndex: 1,
          borderRadius: radius,
          background:
            'linear-gradient(155deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0.05) 42%, rgba(255,255,255,0.02) 100%)',
          backdropFilter: `blur(${blur}px) saturate(150%)`,
          WebkitBackdropFilter: `blur(${blur}px) saturate(150%)`,
          border: '1px solid rgba(255,255,255,0.16)',
          boxShadow:
            '0 50px 130px rgba(0,0,0,0.62), inset 0 1px 0 rgba(255,255,255,0.38), inset 0 0 40px rgba(255,255,255,0.03)',
          overflow: 'hidden',
        }}
      >
        {/* top-edge light catch */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '46%',
            background: 'linear-gradient(180deg, rgba(255,255,255,0.10), transparent)',
            pointerEvents: 'none',
          }}
        />
        {/* moving diagonal glint */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: `radial-gradient(150% 90% at ${glint}% -12%, rgba(255,255,255,0.16), transparent 46%)`,
            mixBlendMode: 'screen',
            pointerEvents: 'none',
          }}
        />
        <div style={{ position: 'relative' }}>{children}</div>
      </div>
    </div>
  );
};
