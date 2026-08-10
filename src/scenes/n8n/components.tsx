import React from 'react';
import { Img, interpolate, spring, staticFile, useCurrentFrame } from 'remotion';
import { COLORS, FONT, SPRINGS } from './theme';

/* High-end glassmorphism sheen used inside cards */
export const specular =
  'linear-gradient(135deg, rgba(255,255,255,0.22) 0%, rgba(255,255,255,0.04) 40%, rgba(255,255,255,0.0) 70%)';

interface GlassCardProps {
  children: React.ReactNode;
  appear?: number;
  delay?: number;
  depth?: number;
  rotate?: number;
  width?: number;
  padding?: number;
  radius?: number;
  borderColor?: string;
  style?: React.CSSProperties;
}

/*
 * The signature "buttery" glass card that overshoots when it arrives.
 * Composes a generous box-shadow + inset highlight + soft top sheen so it
 * reads as floating glass rather than a flat rectangle.
 */
export function GlassCard({
  children,
  appear = 0,
  delay = 0,
  depth = 0,
  rotate = 0,
  width,
  padding = 34,
  radius = 28,
  borderColor = COLORS.border,
  style,
}: GlassCardProps) {
  const frame = useCurrentFrame();
  const s = spring({ frame: frame - appear - delay, fps: 30, config: SPRINGS.card });
  const scale = interpolate(s, [0, 1], [0.82, 1], { extrapolateLeft: 'clamp' });
  const opacity = interpolate(s, [0, 1], [0, 1], { extrapolateLeft: 'clamp' });
  const tilt = interpolate(s, [0, 1], [12, 0], { extrapolateLeft: 'clamp' });

  return (
    <div
      style={{
        position: 'relative',
        borderRadius: radius,
        overflow: 'hidden',
        width,
        padding,
        background: COLORS.glass,
        border: `1px solid ${borderColor}`,
        boxShadow:
          '0 40px 120px rgba(0,0,0,0.55), 0 12px 40px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.20)',
        backdropFilter: 'blur(18px)',
        WebkitBackdropFilter: 'blur(18px)',
        transform: `perspective(1200px) translateZ(${depth}px) scale(${scale}) rotateX(${tilt}deg) rotateY(${rotate}deg)`,
        opacity,
        ...style,
      }}
    >
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: specular,
          pointerEvents: 'none',
          borderRadius: radius,
        }}
      />
      {children}
    </div>
  );
}

/* ---------- Icon chip that sits inside cards / nodes ---------- */
export function IconChip({
  src,
  size = 46,
  color = COLORS.cyan,
  invert = false,
}: {
  src: string;
  size?: number;
  color?: string;
  invert?: boolean;
}) {
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: 14,
        background: `${color}22`,
        border: `1px solid ${color}66`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: `0 0 20px ${color}44`,
        flexShrink: 0,
      }}
    >
      <Img src={staticFile(src)} style={{ width: size * 0.52, height: size * 0.52, filter: invert ? 'invert(1)' : 'none' }} />
    </div>
  );
}

interface KineticWordsProps {
  words: { text: string; accent?: boolean }[];
  appear?: number;
  stagger?: number;
  size?: number;
  gap?: number;
  rotateX?: number;
  style?: React.CSSProperties;
}

/*
 * The high-energy kinetic word-roll used for punchline hooks.
 * Every word overshoots in from negative Z toward the viewer, with a slight
 * rotateX. Key words flash in the accent color with a soft glow.
 */
export function KineticWords({
  words,
  appear = 0,
  stagger = 4,
  size = 60,
  gap = 14,
  rotateX = 18,
  style,
}: KineticWordsProps) {
  const frame = useCurrentFrame();
  return (
    <div
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'center',
        maxWidth: 1500,
        gap,
        fontFamily: FONT.display,
        fontWeight: 900,
        fontSize: size,
        lineHeight: 1.08,
        perspective: 1200,
        color: COLORS.white,
        ...style,
      }}
    >
      {words.map((w, i) => {
        const s = spring({ frame: frame - appear - i * stagger, fps: 30, config: SPRINGS.text });
        const z = interpolate(s, [0, 1], [-90, 0], { extrapolateLeft: 'clamp' });
        const rx = interpolate(s, [0, 1], [rotateX, 0], { extrapolateLeft: 'clamp' });
        return (
          <span
            key={i}
            style={{
              display: 'inline-block',
              opacity: interpolate(s, [0, 1], [0, 1], { extrapolateLeft: 'clamp' }),
              transform: `perspective(1200px) translateZ(${z}px) rotateX(${rx}deg)`,
              color: w.accent ? COLORS.accent : COLORS.white,
              textShadow: w.accent ? `0 0 40px ${COLORS.accent}99` : '0 0 24px rgba(0,0,0,0.6)',
              whiteSpace: 'pre',
            }}
          >
            {w.text}
          </span>
        );
      })}
    </div>
  );
}

/* Small mono "eyebrow" label used as section tag */
export function Eyebrow({ children, color = COLORS.cyan }: { children: React.ReactNode; color?: string }) {
  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 8,
        fontFamily: FONT.mono,
        fontSize: 14,
        fontWeight: 700,
        letterSpacing: '0.18em',
        color,
        textTransform: 'uppercase',
      }}
    >
      <span style={{ width: 8, height: 8, borderRadius: '50%', background: color, boxShadow: `0 0 12px ${color}` }} />
      {children}
    </div>
  );
}