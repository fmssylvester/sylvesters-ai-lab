import React from 'react';
import { useCurrentFrame, useVideoConfig, interpolate } from 'remotion';

// ── Typography tokens ──
export const FONTS = {
  heading: 'Melodrama, serif',
  body: 'Switzer, sans-serif',
  mono: 'JetBrains Mono, monospace',
  ui: 'Switzer, sans-serif',
};

export const COLORS = {
  bg: '#07080F',
  bgGradientStart: '#0D1B2A',
  bgGradientEnd: '#07080F',
  text: '#FFFFFF',
  textSecondary: 'rgba(255, 255, 255, 0.7)',
  accent: '#00D9FF',
  accentGlow: 'rgba(0, 217, 255, 0.4)',
  gold: '#E7B84D',
  goldGlow: 'rgba(231, 184, 77, 0.4)',
  highlight: '#00D9FF',
  surface: 'rgba(255, 255, 255, 0.05)',
  surfaceBorder: 'rgba(255, 255, 255, 0.1)',
};

// ── Gradient backgrounds ──
export const GradientBg: React.FC<{
  children: React.ReactNode;
  style?: React.CSSProperties;
}> = ({ children, style }) => (
  <div
    style={{
      position: 'absolute',
      inset: 0,
      background: `linear-gradient(135deg, ${COLORS.bgGradientStart} 0%, ${COLORS.bgGradientEnd} 100%)`,
      ...style,
    }}
  >
    {children}
  </div>
);

// ── Glow circle (for talking head, accents) ──
export const GlowCircle: React.FC<{
  size: number;
  color?: string;
  x: number;
  y: number;
  blur?: number;
}> = ({ size, color = COLORS.accent, x, y, blur = 80 }) => (
  <div
    style={{
      position: 'absolute',
      left: x - size / 2,
      top: y - size / 2,
      width: size,
      height: size,
      borderRadius: '50%',
      background: color,
      filter: `blur(${blur}px)`,
      opacity: 0.3,
    }}
  />
);

// ── Animated text with glow ──
export const GlowText: React.FC<{
  text: string;
  size?: number;
  color?: string;
  glowColor?: string;
  delay?: number;
  duration?: number;
  style?: React.CSSProperties;
}> = ({
  text,
  size = 64,
  color = COLORS.text,
  glowColor = COLORS.accentGlow,
  delay = 0,
  duration = 30,
  style,
}) => {
  const frame = useCurrentFrame();
  const localFrame = frame - delay;

  if (localFrame < 0 || localFrame > duration) return null;

  const opacity = interpolate(localFrame, [0, 8, duration - 8, duration], [0, 1, 1, 0], {
    extrapolateRight: 'clamp',
  });
  const translateY = interpolate(localFrame, [0, 8], [15, 0], {
    extrapolateRight: 'clamp',
  });

  return (
    <div
      style={{
        opacity,
        transform: `translateY(${translateY}px)`,
        textAlign: 'center',
        ...style,
      }}
    >
      <span
        style={{
          color,
          fontSize: size,
          fontFamily: FONTS.heading,
          fontWeight: 700,
          textShadow: `0 0 30px ${glowColor}, 0 0 60px ${glowColor}`,
          letterSpacing: 2,
          lineHeight: 1.1,
        }}
      >
        {text}
      </span>
    </div>
  );
};

// ── Highlight text (blue accent word) ──
export const HighlightText: React.FC<{
  before: string;
  highlight: string;
  after?: string;
  size?: number;
  delay?: number;
  duration?: number;
}> = ({ before, highlight, after, size = 48, delay = 0, duration = 60 }) => {
  const frame = useCurrentFrame();
  const localFrame = frame - delay;

  if (localFrame < 0 || localFrame > duration) return null;

  const opacity = interpolate(localFrame, [0, 10, duration - 10, duration], [0, 1, 1, 0], {
    extrapolateRight: 'clamp',
  });
  const translateY = interpolate(localFrame, [0, 10], [20, 0], {
    extrapolateRight: 'clamp',
  });

  return (
    <div
      style={{
        opacity,
        transform: `translateY(${translateY}px)`,
        textAlign: 'center',
      }}
    >
      <span
        style={{
          color: COLORS.text,
          fontSize: size,
          fontFamily: FONTS.body,
          fontWeight: 700,
          letterSpacing: 1,
        }}
      >
        {before}{' '}
      </span>
      <span
        style={{
          color: COLORS.accent,
          fontSize: size,
          fontFamily: FONTS.body,
          fontWeight: 700,
          letterSpacing: 1,
          textShadow: `0 0 20px ${COLORS.accentGlow}`,
        }}
      >
        {highlight}
      </span>
      {after && (
        <span
          style={{
            color: COLORS.text,
            fontSize: size,
            fontFamily: FONTS.body,
            fontWeight: 700,
            letterSpacing: 1,
          }}
        >
          {' '}{after}
        </span>
      )}
    </div>
  );
};

// ── Step label (numbered step) ──
export const StepLabel: React.FC<{
  number: number;
  text: string;
  delay?: number;
  duration?: number;
}> = ({ number, text, delay = 0, duration = 60 }) => {
  const frame = useCurrentFrame();
  const localFrame = frame - delay;

  if (localFrame < 0 || localFrame > duration) return null;

  const opacity = interpolate(localFrame, [0, 10, duration - 10, duration], [0, 1, 1, 0], {
    extrapolateRight: 'clamp',
  });
  const scale = interpolate(localFrame, [0, 10], [0.9, 1], {
    extrapolateRight: 'clamp',
  });

  return (
    <div
      style={{
        position: 'absolute',
        top: 60,
        left: 60,
        opacity,
        transform: `scale(${scale})`,
        display: 'flex',
        alignItems: 'center',
        gap: 16,
      }}
    >
      <div
        style={{
          width: 48,
          height: 48,
          borderRadius: '50%',
          background: COLORS.accent,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: `0 0 20px ${COLORS.accentGlow}`,
        }}
      >
        <span
          style={{
            color: COLORS.bg,
            fontSize: 24,
            fontFamily: FONTS.mono,
            fontWeight: 700,
          }}
        >
          {number}
        </span>
      </div>
      <span
        style={{
          color: COLORS.text,
          fontSize: 32,
          fontFamily: FONTS.body,
          fontWeight: 600,
          letterSpacing: 1,
          textShadow: `0 2px 10px rgba(0, 0, 0, 0.5)`,
        }}
      >
        {text}
      </span>
    </div>
  );
};

// ── Tool label (bottom-left badge) ──
export const ToolLabel: React.FC<{
  name: string;
  delay?: number;
}> = ({ name, delay = 0 }) => {
  const frame = useCurrentFrame();
  const localFrame = frame - delay;

  if (localFrame < 0) return null;

  const opacity = interpolate(localFrame, [0, 10], [0, 1], {
    extrapolateRight: 'clamp',
  });

  return (
    <div
      style={{
        position: 'absolute',
        bottom: 40,
        left: 40,
        opacity,
        background: 'rgba(0, 0, 0, 0.6)',
        backdropFilter: 'blur(10px)',
        padding: '10px 20px',
        borderRadius: 8,
        border: `1px solid ${COLORS.surfaceBorder}`,
        display: 'flex',
        alignItems: 'center',
        gap: 8,
      }}
    >
      <div
        style={{
          width: 8,
          height: 8,
          borderRadius: '50%',
          background: COLORS.accent,
          boxShadow: `0 0 8px ${COLORS.accentGlow}`,
        }}
      />
      <span
        style={{
          color: COLORS.text,
          fontSize: 18,
          fontFamily: FONTS.ui,
          fontWeight: 500,
          letterSpacing: 0.5,
        }}
      >
        {name}
      </span>
    </div>
  );
};

// ── Lower third (text bar at bottom) ──
export const LowerThird: React.FC<{
  title: string;
  subtitle?: string;
  delay?: number;
  duration?: number;
}> = ({ title, subtitle, delay = 0, duration = 90 }) => {
  const frame = useCurrentFrame();
  const localFrame = frame - delay;

  if (localFrame < 0 || localFrame > duration) return null;

  const opacity = interpolate(localFrame, [0, 10, duration - 10, duration], [0, 1, 1, 0], {
    extrapolateRight: 'clamp',
  });
  const slideX = interpolate(localFrame, [0, 10], [-30, 0], {
    extrapolateRight: 'clamp',
  });

  return (
    <div
      style={{
        position: 'absolute',
        bottom: 80,
        left: 60,
        opacity,
        transform: `translateX(${slideX}px)`,
      }}
    >
      <div
        style={{
          background: 'rgba(0, 0, 0, 0.7)',
          backdropFilter: 'blur(10px)',
          padding: '16px 24px',
          borderLeft: `3px solid ${COLORS.accent}`,
          borderRadius: '0 8px 8px 0',
        }}
      >
        <div
          style={{
            color: COLORS.text,
            fontSize: 28,
            fontFamily: FONTS.body,
            fontWeight: 600,
            letterSpacing: 0.5,
          }}
        >
          {title}
        </div>
        {subtitle && (
          <div
            style={{
              color: COLORS.textSecondary,
              fontSize: 18,
              fontFamily: FONTS.ui,
              fontWeight: 400,
              marginTop: 4,
            }}
          >
            {subtitle}
          </div>
        )}
      </div>
    </div>
  );
};
