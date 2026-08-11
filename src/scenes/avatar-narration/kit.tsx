// Shared primitives for AvatarNarration90s — approved storyboard v2.
// Physical motion design (visual-direction.md): spring entrances with overshoot,
// never-flat backgrounds, glassmorphic cards, cyan/gold keyword highlights.
import React from 'react';
import {
  AbsoluteFill,
  Img,
  staticFile,
  interpolate,
  spring,
  random,
} from 'remotion';
import { VOID, CYAN, GOLD, NEUTRAL, WHITE, FONT, EASE, hexA, breath } from './theme';

// ── Background: gradient + bloom + noise (NEVER flat) ───────────────────────
const GRAIN =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='150' height='150'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.82' numOctaves='2' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.55'/%3E%3C/svg%3E\")";

export const SceneBackdrop: React.FC<{ frame: number; tint?: string }> = ({
  frame,
  tint = CYAN,
}) => {
  const ax = 26 + breath(frame, 0.006, 5);
  const ay = 24 + breath(frame, 0.008, 4, 1.5);
  const bx = 74 + breath(frame, 0.005, 6, 2.2);
  const by = 78 + breath(frame, 0.007, 5, 0.6);
  const pulse = 0.42 + 0.08 * (0.5 + 0.5 * Math.sin(frame * 0.03));
  return (
    <AbsoluteFill style={{ background: VOID, overflow: 'hidden' }}>
      <AbsoluteFill
        style={{
          background: `radial-gradient(120% 90% at 50% 38%, #0C1118 0%, ${VOID} 68%)`,
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: `${ax}%`, top: `${ay}%`,
          width: 900, height: 900, marginLeft: -450, marginTop: -450, borderRadius: '50%',
          background: `radial-gradient(circle, ${tint}${hexA(pulse * 0.5)}, transparent 62%)`,
          filter: 'blur(90px)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: `${bx}%`, top: `${by}%`,
          width: 820, height: 820, marginLeft: -410, marginTop: -410, borderRadius: '50%',
          background: `radial-gradient(circle, ${GOLD}${hexA(pulse * 0.32)}, transparent 62%)`,
          filter: 'blur(96px)',
        }}
      />
    </AbsoluteFill>
  );
};

export const FilmGrade: React.FC<{ frame: number }> = ({ frame }) => {
  const gx = Math.floor(random(`agx${frame}`) * 150);
  const gy = Math.floor(random(`agy${frame}`) * 150);
  return (
    <AbsoluteFill style={{ pointerEvents: 'none' }}>
      <AbsoluteFill
        style={{
          background: `radial-gradient(circle at 68% 22%, ${CYAN}14, transparent 55%)`,
          mixBlendMode: 'soft-light',
        }}
      />
      <AbsoluteFill
        style={{
          background: `radial-gradient(circle at 22% 84%, ${GOLD}12, transparent 55%)`,
          mixBlendMode: 'soft-light',
        }}
      />
      <AbsoluteFill
        style={{
          background:
            'radial-gradient(ellipse at center, transparent 52%, rgba(0,0,0,0.30) 82%, rgba(0,0,0,0.6) 100%)',
        }}
      />
      <AbsoluteFill
        style={{
          top: '-25%', left: '-25%', width: '150%', height: '150%',
          backgroundImage: GRAIN, backgroundSize: '150px 150px',
          opacity: 0.045, mixBlendMode: 'overlay',
          transform: `translate(${gx}px, ${gy}px)`,
        }}
      />
    </AbsoluteFill>
  );
};

// ── Glassmorphic card (signature element of visual-direction.md) ────────────
export const GlassCard: React.FC<{
  children: React.ReactNode;
  frame: number;
  style?: React.CSSProperties;
  radius?: number;
  tint?: string;
  tintOpacity?: number;
  blur?: number;
}> = ({ children, frame, style, radius = 26, tint = CYAN, tintOpacity = 0.45, blur = 16 }) => {
  const glint = 18 + ((Math.sin(frame * 0.02) + 1) / 2) * 62;
  return (
    <div style={{ position: 'relative', ...style }}>
      <div
        style={{
          position: 'absolute', inset: '-16% -12%',
          background: `radial-gradient(circle at 32% 24%, ${tint}${hexA(tintOpacity)}, transparent 62%)`,
          filter: 'blur(48px)', borderRadius: radius, zIndex: 0,
        }}
      />
      <div
        style={{
          position: 'relative', zIndex: 1, borderRadius: radius,
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
        <div
          style={{
            position: 'absolute', top: 0, left: 0, right: 0, height: '46%',
            background: 'linear-gradient(180deg, rgba(255,255,255,0.10), transparent)',
            pointerEvents: 'none',
          }}
        />
        <div
          style={{
            position: 'absolute', inset: 0,
            background: `radial-gradient(150% 90% at ${glint}% -12%, rgba(255,255,255,0.16), transparent 46%)`,
            mixBlendMode: 'screen', pointerEvents: 'none',
          }}
        />
        <div style={{ position: 'relative' }}>{children}</div>
      </div>
    </div>
  );
};

// ── Real SVG prop (from the asset library) with optional tint ───────────────
export const Prop: React.FC<{
  file: string;
  size?: number;
  width?: number;
  height?: number;
  color?: string; // 'white' | 'cyan' | 'gold' | 'gray' | undefined (native)
  style?: React.CSSProperties;
}> = ({ file, size, width, height, color, style }) => {
  let filter: string | undefined;
  if (color === 'white') filter = 'brightness(0) invert(1)';
  else if (color === 'cyan') filter = 'brightness(0) invert(1) sepia(1) saturate(5000%) hue-rotate(160deg)';
  else if (color === 'gold') filter = 'brightness(0) invert(1) sepia(1) saturate(3000%) hue-rotate(350deg) brightness(0.92)';
  else if (color === 'gray') filter = 'brightness(0) invert(0.55)';
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
