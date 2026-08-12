// Shared primitives for AvatarNarration90s — rich editorial redesign per client.
// Flat ink-navy background (no gradients / poster colors), Playfair Display +
// Inter typography, brass accent, graphics-led storytelling.
import React from 'react';
import {
  AbsoluteFill,
  Img,
  staticFile,
  interpolate,
  spring,
  random,
} from 'remotion';
import { VOID, GOLD, SOFT, NEUTRAL, WHITE, CREAM, FONT, BODY, EASE, hexA, breath } from './theme';

// ── Flat ink-navy background with a whisper of film grain (texture, not gradient)
const GRAIN =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='150' height='150'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.82' numOctaves='2' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.55'/%3E%3C/svg%3E\")";

export const SceneBackdrop: React.FC<{ frame: number; tint?: string }> = ({
  frame,
  tint = GOLD,
}) => {
  const gx = Math.floor(random(`agx${Math.floor(frame / 3)}`) * 150);
  const gy = Math.floor(random(`agy${Math.floor(frame / 3)}`) * 150);
  return (
    <AbsoluteFill style={{ background: VOID, overflow: 'hidden' }}>
      <div
        style={{
          position: 'absolute', inset: '-25%', width: '150%', height: '150%',
          backgroundImage: GRAIN, backgroundSize: '150px 150px',
          opacity: 0.05, mixBlendMode: 'overlay',
          transform: `translate(${gx}px, ${gy}px)`,
        }}
      />
    </AbsoluteFill>
  );
};

export const FilmGrade: React.FC<{ frame: number }> = ({ frame }) => {
  const gx = Math.floor(random(`fgx${Math.floor(frame / 3)}`) * 150);
  const gy = Math.floor(random(`fgy${Math.floor(frame / 3)}`) * 150);
  return (
    <AbsoluteFill style={{ pointerEvents: 'none', overflow: 'hidden' }}>
      <AbsoluteFill
        style={{
          top: '-25%', left: '-25%', width: '150%', height: '150%',
          backgroundImage: GRAIN, backgroundSize: '150px 150px',
          opacity: 0.05, mixBlendMode: 'soft-light',
          transform: `translate(${gx}px, ${gy}px)`,
        }}
      />
    </AbsoluteFill>
  );
};

// ── Rich glass card: ivory glass on ink navy, brass border light ────────────
export const GlassCard: React.FC<{
  children: React.ReactNode;
  frame: number;
  style?: React.CSSProperties;
  radius?: number;
  tint?: string;
  tintOpacity?: number;
  blur?: number;
}> = ({ children, frame, style, radius = 26, tint = GOLD, tintOpacity = 0.35, blur = 16 }) => {
  const glint = 18 + ((Math.sin(frame * 0.02) + 1) / 2) * 62;
  return (
    <div style={{ position: 'relative', ...style }}>
      <div
        style={{
          position: 'relative', zIndex: 1, borderRadius: radius,
          background:
            'linear-gradient(155deg, rgba(244,237,224,0.10) 0%, rgba(244,237,224,0.05) 45%, rgba(244,237,224,0.02) 100%)',
          backdropFilter: `blur(${blur}px)`,
          WebkitBackdropFilter: `blur(${blur}px)`,
          border: '1px solid rgba(244,237,224,0.14)',
          boxShadow:
            '0 40px 110px rgba(0,0,0,0.55), inset 0 1px 0 rgba(244,237,224,0.20)',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            position: 'absolute', inset: 0,
            background: `radial-gradient(130% 80% at ${glint}% -12%, rgba(201,162,75,0.10), transparent 46%)`,
            mixBlendMode: 'soft-light', pointerEvents: 'none',
          }}
        />
        <div style={{ position: 'relative' }}>{children}</div>
      </div>
    </div>
  );
};

// ── Real SVG prop (from the asset library) with premium tint ────────────────
export const Prop: React.FC<{
  file: string;
  size?: number;
  width?: number;
  height?: number;
  color?: string; // 'white' | 'brass' | 'soft' | 'gray' | undefined (native)
  style?: React.CSSProperties;
}> = ({ file, size, width, height, color, style }) => {
  let filter: string | undefined;
  if (color === 'white') filter = 'brightness(0) invert(1)';
  else if (color === 'brass') filter = 'brightness(0) invert(1) sepia(1) saturate(3500%) hue-rotate(340deg) brightness(0.85)';
  else if (color === 'soft') filter = 'brightness(0) invert(1) sepia(1) saturate(1200%) hue-rotate(170deg) brightness(0.85)';
  else if (color === 'gray') filter = 'brightness(0) invert(0.5)';
  return (
    <Img
      src={staticFile(file)}
      width={width ?? size}
      height={height ?? size}
      style={{ objectFit: 'contain', filter, ...style }}
    />
  );
};

// ── Spring entrance with overshoot (physical momentum) ──────────────────────
export const springIn = (
  frame: number,
  start: number,
  fps: number,
  cfg: { stiffness?: number; damping?: number; mass?: number } = {}
) =>
  spring({
    frame: frame - start,
    fps,
    config: { stiffness: 160, damping: 17, mass: 0.85, ...cfg },
  });

export const riseIn = (
  frame: number,
  start: number,
  fps: number,
  dist = 60,
  cfg?: { stiffness?: number; damping?: number; mass?: number }
) => {
  const s = springIn(frame, start, fps, cfg);
  return { opacity: s, transform: `translateY(${(1 - s) * dist}px)` };
};

export const slideIn = (
  frame: number,
  start: number,
  fps: number,
  dist = 80,
  cfg?: { stiffness?: number; damping?: number; mass?: number }
) => {
  const s = springIn(frame, start, fps, cfg);
  return { opacity: s, transform: `translateX(${(1 - s) * dist}px)` };
};

export const popIn = (frame: number, start: number, fps: number) => {
  const s = springIn(frame, start, fps, { stiffness: 240, damping: 13, mass: 0.7 });
  return { opacity: s, transform: `scale(${0 + 1.08 * s - 0.08 * s * s})` };
};

// ── Word-by-word type reveal (opacity + slight Y, no blur/scale) ────────────
export const Words: React.FC<{
  text: string;
  frame: number;
  start: number;
  fps: number;
  gap?: number; // frames between words
  style?: React.CSSProperties;
}> = ({ text, frame, start, fps, gap = 2.2, style }) => {
  const words = text.split(' ');
  return (
    <span style={style}>
      {words.map((w, i) => {
        const at = start + i * gap;
        const o = interpolate(frame, [at, at + 6], [0, 1], {
          extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
        });
        return (
          <span key={i} style={{ opacity: o, display: 'inline-block', transform: `translateY(${(1 - o) * 8}px)` }}>
            {w}&nbsp;
          </span>
        );
      })}
    </span>
  );
};

// ── Editorial caption: Inter, small, letterspaced — plays under Playfair ────
export const Caption: React.FC<{
  children: React.ReactNode;
  style?: React.CSSProperties;
}> = ({ children, style }) => (
  <span style={{ fontFamily: BODY, fontSize: 20, fontWeight: 500, letterSpacing: '0.04em', color: NEUTRAL, ...style }}>
    {children}
  </span>
);