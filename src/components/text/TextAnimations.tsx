import React from 'react';
import { useCurrentFrame, useVideoConfig, interpolate, spring } from 'remotion';

// ── Easing presets ──
export const ease = {
  out: (t: number) => 1 - Math.pow(1 - t, 3),
  in: (t: number) => t * t * t,
  inOut: (t: number) => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2,
  expoOut: (t: number) => t === 1 ? 1 : 1 - Math.pow(2, -10 * t),
  backOut: (t: number) => {
    const c1 = 1.70158;
    const c3 = c1 + 1;
    return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
  },
  elasticOut: (t: number) => {
    if (t === 0 || t === 1) return t;
    return Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * (2 * Math.PI / 3)) + 1;
  },
};

// ── Stagger helpers ──
export type StaggerMode = 'left' | 'right' | 'center' | 'edges' | 'random';

function getStaggerOrder(count: number, mode: StaggerMode): number[] {
  const order: number[] = [];
  if (mode === 'center') {
    const center = (count - 1) / 2;
    for (let i = 0; i < count; i++) order.push(i);
    order.sort((a, b) => Math.abs(a - center) - Math.abs(b - center) || a - b);
  } else if (mode === 'edges') {
    let l = 0, r = count - 1;
    while (l <= r) {
      order.push(l);
      if (r !== l) order.push(r);
      l++; r--;
    }
  } else if (mode === 'right') {
    for (let i = count - 1; i >= 0; i--) order.push(i);
  } else {
    for (let i = 0; i < count; i++) order.push(i);
  }
  const ranks = Array.from({ length: count }, () => 0);
  order.forEach((index, rank) => { ranks[index] = rank; });
  return ranks;
}

// ══════════════════════════════════════════════════════
// 1. CHARACTER REVEAL — per-character stagger entrance
// ══════════════════════════════════════════════════════
interface CharRevealProps {
  text: string;
  mode?: StaggerMode;
  staggerMs?: number;
  durationMs?: number;
  /** Per-character transform: slide up */
  translateY?: number;
  /** Per-character transform: scale from */
  scaleFrom?: number;
  /** Per-character: blur to sharp */
  blurFrom?: number;
  /** Easing function */
  easing?: (t: number) => number;
  style?: React.CSSProperties;
  charStyle?: React.CSSProperties;
}

export const CharReveal: React.FC<CharRevealProps> = ({
  text,
  mode = 'left',
  staggerMs = 30,
  durationMs = 400,
  translateY = 60,
  scaleFrom = 0.7,
  blurFrom = 8,
  easing = ease.backOut,
  style,
  charStyle,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const chars = text.split('');
  const staggerFrames = (staggerMs / 1000) * fps;
  const durationFrames = (durationMs / 1000) * fps;
  const ranks = getStaggerOrder(chars.length, mode);

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', ...style }}>
      {chars.map((char, i) => {
        const delay = ranks[i] * staggerFrames;
        const progress = interpolate(frame - delay, [0, durationFrames], [0, 1], {
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
        });
        const eased = easing(progress);
        const y = interpolate(eased, [0, 1], [translateY, 0]);
        const s = interpolate(eased, [0, 1], [scaleFrom, 1]);
        const b = interpolate(eased, [0, 1], [blurFrom, 0]);
        const o = interpolate(progress, [0, 0.3], [0, 1], { extrapolateRight: 'clamp' });

        return (
          <span
            key={i}
            style={{
              display: 'inline-block',
              transform: `translateY(${y}px) scale(${s})`,
              filter: `blur(${b}px)`,
              opacity: o,
              whiteSpace: char === ' ' ? 'pre' : 'normal',
              ...charStyle,
            }}
          >
            {char}
          </span>
        );
      })}
    </div>
  );
};

// ══════════════════════════════════════════════════════
// 2. WORD REVEAL — per-word stagger entrance
// ══════════════════════════════════════════════════════
interface WordRevealProps {
  text: string;
  mode?: StaggerMode;
  staggerMs?: number;
  durationMs?: number;
  translateY?: number;
  scaleFrom?: number;
  blurFrom?: number;
  easing?: (t: number) => number;
  style?: React.CSSProperties;
  wordStyle?: React.CSSProperties;
}

export const WordReveal: React.FC<WordRevealProps> = ({
  text,
  mode = 'left',
  staggerMs = 60,
  durationMs = 500,
  translateY = 40,
  scaleFrom = 0.85,
  blurFrom = 4,
  easing = ease.out,
  style,
  wordStyle,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const words = text.split(' ');
  const staggerFrames = (staggerMs / 1000) * fps;
  const durationFrames = (durationMs / 1000) * fps;
  const ranks = getStaggerOrder(words.length, mode);

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3em', ...style }}>
      {words.map((word, i) => {
        const delay = ranks[i] * staggerFrames;
        const progress = interpolate(frame - delay, [0, durationFrames], [0, 1], {
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
        });
        const eased = easing(progress);
        const y = interpolate(eased, [0, 1], [translateY, 0]);
        const s = interpolate(eased, [0, 1], [scaleFrom, 1]);
        const b = interpolate(eased, [0, 1], [blurFrom, 0]);
        const o = interpolate(progress, [0, 0.3], [0, 1], { extrapolateRight: 'clamp' });

        return (
          <span
            key={i}
            style={{
              display: 'inline-block',
              transform: `translateY(${y}px) scale(${s})`,
              filter: `blur(${b}px)`,
              opacity: o,
              ...wordStyle,
            }}
          >
            {word}
          </span>
        );
      })}
    </div>
  );
};

// ══════════════════════════════════════════════════════
// 3. LINE MASK REVEAL — text slides up from clip boundary
// ══════════════════════════════════════════════════════
interface LineMaskRevealProps {
  text: string;
  staggerMs?: number;
  durationMs?: number;
  easing?: (t: number) => number;
  style?: React.CSSProperties;
  lineStyle?: React.CSSProperties;
}

export const LineMaskReveal: React.FC<LineMaskRevealProps> = ({
  text,
  staggerMs = 80,
  durationMs = 600,
  easing = ease.out,
  style,
  lineStyle,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const lines = text.split('\n');
  const staggerFrames = (staggerMs / 1000) * fps;
  const durationFrames = (durationMs / 1000) * fps;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', ...style }}>
      {lines.map((line, i) => {
        const delay = i * staggerFrames;
        const progress = interpolate(frame - delay, [0, durationFrames], [0, 1], {
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
        });
        const eased = easing(progress);
        const y = interpolate(eased, [0, 1], [110, 0]);

        return (
          <div
            key={i}
            style={{ overflow: 'hidden', ...lineStyle }}
          >
            <div style={{ transform: `translateY(${y}%)` }}>
              {line}
            </div>
          </div>
        );
      })}
    </div>
  );
};

// ══════════════════════════════════════════════════════
// 4. SPRING SCALE — organic spring physics entrance
// ══════════════════════════════════════════════════════
interface SpringScaleProps {
  children: React.ReactNode;
  delay?: number;
  config?: { damping: number; stiffness: number; mass?: number };
  style?: React.CSSProperties;
}

export const SpringScale: React.FC<SpringScaleProps> = ({
  children,
  delay = 0,
  config = { damping: 12, stiffness: 150, mass: 0.8 },
  style,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame: frame - delay, fps, config });
  const o = interpolate(frame - delay, [0, 8], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <div
      style={{
        transform: `scale(${s})`,
        opacity: o,
        ...style,
      }}
    >
      {children}
    </div>
  );
};

// ══════════════════════════════════════════════════════
// 5. TYPEWRITER — character-by-character string slicing
// ══════════════════════════════════════════════════════
interface TypewriterProps {
  text: string;
  charsPerFrame?: number;
  startFrame?: number;
  cursor?: boolean;
  style?: React.CSSProperties;
}

export const Typewriter: React.FC<TypewriterProps> = ({
  text,
  charsPerFrame = 0.5,
  startFrame = 0,
  cursor = true,
  style,
}) => {
  const frame = useCurrentFrame();
  const elapsed = Math.max(0, frame - startFrame);
  const visibleChars = Math.min(text.length, Math.floor(elapsed * charsPerFrame));
  const displayText = text.slice(0, visibleChars);
  const showCursor = cursor && elapsed % 16 < 10 && visibleChars < text.length;

  return (
    <span style={{ fontFamily: 'monospace', ...style }}>
      {displayText}
      {showCursor && <span style={{ opacity: 1 }}>|</span>}
    </span>
  );
};

// ══════════════════════════════════════════════════════
// 6. GLITCH REVEAL — text materializes from digital noise
// ══════════════════════════════════════════════════════
interface GlitchRevealProps {
  text: string;
  durationMs?: number;
  style?: React.CSSProperties;
}

export const GlitchReveal: React.FC<GlitchRevealProps> = ({
  text,
  durationMs = 800,
  style,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const durationFrames = (durationMs / 1000) * fps;
  const progress = interpolate(frame, [0, durationFrames], [0, 1], {
    extrapolateRight: 'clamp',
  });

  // Pseudo-random based on frame for glitch displacement
  const glitchAmount = progress < 0.7
    ? interpolate(progress, [0, 0.7], [20, 0])
    : 0;
  const seed = frame * 7.3;
  const offsetX = Math.sin(seed) * glitchAmount;
  const offsetY = Math.cos(seed * 1.3) * glitchAmount * 0.5;
  const clipY = interpolate(progress, [0, 1], [100, 0]);

  return (
    <div style={{ position: 'relative', ...style }}>
      {/* Glitch layers */}
      {progress < 0.7 && (
        <>
          <div
            style={{
              position: 'absolute',
              left: offsetX * 1.5,
              top: offsetY,
              color: '#00D9FF',
              opacity: 0.4 * (1 - progress),
              clipPath: `inset(${30 + clipY}% 0 ${Math.random() * 30}% 0)`,
              whiteSpace: 'nowrap',
            }}
          >
            {text}
          </div>
          <div
            style={{
              position: 'absolute',
              left: -offsetX,
              top: -offsetY,
              color: '#FF6B6B',
              opacity: 0.3 * (1 - progress),
              clipPath: `inset(${Math.random() * 40}% 0 ${20 + clipY}% 0)`,
              whiteSpace: 'nowrap',
            }}
          >
            {text}
          </div>
        </>
      )}
      {/* Main text */}
      <div
        style={{
          opacity: interpolate(progress, [0, 0.4, 1], [0, 0.5, 1]),
          transform: `translateX(${offsetX * 0.3}px)`,
          whiteSpace: 'nowrap',
        }}
      >
        {text}
      </div>
    </div>
  );
};

// ══════════════════════════════════════════════════════
// 7. HIGHLIGHT WIPE — colored background sweeps across text
// ══════════════════════════════════════════════════════
interface HighlightWipeProps {
  text: string;
  color?: string;
  delay?: number;
  durationMs?: number;
  style?: React.CSSProperties;
}

export const HighlightWipe: React.FC<HighlightWipeProps> = ({
  text,
  color = '#00D9FF',
  delay = 0,
  durationMs = 400,
  style,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const durationFrames = (durationMs / 1000) * fps;
  const scaleX = interpolate(frame - delay, [0, durationFrames], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: ease.out,
  });

  return (
    <div style={{ position: 'relative', display: 'inline-block', ...style }}>
      <div style={{ position: 'relative', zIndex: 1 }}>{text}</div>
      <div
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          width: '100%',
          height: '100%',
          background: color,
          transformOrigin: 'left center',
          transform: `scaleX(${scaleX})`,
          zIndex: 0,
        }}
      />
    </div>
  );
};

// ══════════════════════════════════════════════════════
// 8. TEXT MORPH — scale + rotate spring entrance
// ══════════════════════════════════════════════════════
interface TextMorphProps {
  children: React.ReactNode;
  delay?: number;
  fromScale?: number;
  fromRotation?: number;
  fromY?: number;
  config?: { damping: number; stiffness: number; mass?: number };
  style?: React.CSSProperties;
}

export const TextMorph: React.FC<TextMorphProps> = ({
  children,
  delay = 0,
  fromScale = 0.3,
  fromRotation = -15,
  fromY = 80,
  config = { damping: 14, stiffness: 120 },
  style,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame: frame - delay, fps, config });
  const o = interpolate(frame - delay, [0, 6], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const scale = interpolate(s, [0, 1], [fromScale, 1]);
  const rotation = interpolate(s, [0, 1], [fromRotation, 0]);
  const y = interpolate(s, [0, 1], [fromY, 0]);

  return (
    <div
      style={{
        transform: `translateY(${y}px) scale(${scale}) rotate(${rotation}deg)`,
        opacity: o,
        ...style,
      }}
    >
      {children}
    </div>
  );
};

// ══════════════════════════════════════════════════════
// 9. STACKED REVEAL — words stacked behind, revealed one by one
// ══════════════════════════════════════════════════════
interface StackedRevealProps {
  text: string;
  staggerMs?: number;
  revealMs?: number;
  /** How far the revealed word moves up (px) */
  revealDistance?: number;
  /** Max blur on words still hidden behind */
  maxBlur?: number;
  easing?: (t: number) => number;
  style?: React.CSSProperties;
  wordStyle?: React.CSSProperties;
}

export const StackedReveal: React.FC<StackedRevealProps> = ({
  text,
  staggerMs = 200,
  revealMs = 400,
  revealDistance = 80,
  maxBlur = 8,
  easing = ease.out,
  style,
  wordStyle,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const words = text.split(' ');
  const staggerFrames = (staggerMs / 1000) * fps;
  const revealFrames = (revealMs / 1000) * fps;

  return (
    <div style={{ position: 'relative', ...style }}>
      {words.map((word, i) => {
        const startFrame = i * staggerFrames;
        const progress = interpolate(frame - startFrame, [0, revealFrames], [0, 1], {
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
        });
        const eased = easing(progress);

        // Current word: moves up and becomes sharp
        const yOffset = interpolate(eased, [0, 1], [0, -revealDistance]);
        const opacity = interpolate(eased, [0, 0.3, 1], [0, 1, 1]);
        const blur = interpolate(eased, [0, 1], [maxBlur, 0]);
        const scale = interpolate(eased, [0, 1], [0.95, 1]);

        // After reveal: word moves further up and fades
        const exitStart = (i + 1) * staggerFrames;
        const exitProgress = interpolate(frame - exitStart, [0, revealFrames * 0.6], [0, 1], {
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
        });
        const exitY = i < words.length - 1 ? interpolate(exitProgress, [0, 1], [0, -revealDistance * 0.5]) : 0;
        const exitOpacity = i < words.length - 1 ? interpolate(exitProgress, [0, 1], [1, 0.3]) : 1;

        const finalY = yOffset + exitY;
        const finalOpacity = i === words.length - 1 ? opacity : (progress > 0 ? exitOpacity : opacity);

        return (
          <div
            key={i}
            style={{
              position: i === 0 ? 'relative' : 'absolute',
              left: 0,
              top: 0,
              width: '100%',
              transform: `translateY(${finalY}px) scale(${scale})`,
              opacity: finalOpacity,
              filter: `blur(${blur}px)`,
              whiteSpace: 'nowrap',
            }}
          >
            <span
              style={{
                color: '#FFFFFF',
                fontSize: 80,
                fontFamily: 'Switzer, sans-serif',
                fontWeight: 900,
                letterSpacing: -2,
                ...wordStyle,
              }}
            >
              {word}
            </span>
          </div>
        );
      })}
    </div>
  );
};

// ══════════════════════════════════════════════════════
// 10. DEPTH PARALLAX — words with depth-based blur + scale
// ══════════════════════════════════════════════════════
interface DepthParallaxProps {
  text: string;
  staggerMs?: number;
  durationMs?: number;
  maxBlur?: number;
  scaleRange?: [number, number];
  yRange?: [number, number];
  easing?: (t: number) => number;
  style?: React.CSSProperties;
  wordStyle?: React.CSSProperties;
}

export const DepthParallax: React.FC<DepthParallaxProps> = ({
  text,
  staggerMs = 40,
  durationMs = 500,
  maxBlur = 10,
  scaleRange = [0.88, 1],
  yRange = [24, 0],
  easing = ease.out,
  style,
  wordStyle,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const words = text.split(' ');
  const staggerFrames = (staggerMs / 1000) * fps;
  const durationFrames = (durationMs / 1000) * fps;

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0 0.28em', ...style }}>
      {words.map((word, i) => {
        const delay = i * staggerFrames;
        const progress = interpolate(frame - delay, [0, durationFrames], [0, 1], {
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
        });
        const eased = easing(progress);
        const y = interpolate(eased, [0, 1], yRange);
        const s = interpolate(eased, [0, 1], scaleRange);
        const b = interpolate(eased, [0, 1], [maxBlur, 0]);
        const o = interpolate(progress, [0, 0.4], [0, 1], { extrapolateRight: 'clamp' });

        return (
          <span
            key={i}
            style={{
              display: 'inline-block',
              transform: `translate3d(0, ${y}px, 0) scale(${s})`,
              filter: `blur(${b}px)`,
              opacity: o,
              ...wordStyle,
            }}
          >
            {word}
          </span>
        );
      })}
    </div>
  );
};

// ══════════════════════════════════════════════════════
// 11. WAVE TEXT — sine wave motion across characters
// ══════════════════════════════════════════════════════
interface WaveTextProps {
  text: string;
  /** Wave frequency (higher = more ripples) */
  frequency?: number;
  /** Wave amplitude (px) */
  amplitude?: number;
  /** Speed multiplier */
  speed?: number;
  /** Phase offset between chars */
  phaseOffset?: number;
  style?: React.CSSProperties;
}

export const WaveText: React.FC<WaveTextProps> = ({
  text,
  frequency = 0.35,
  amplitude = 12,
  speed = 0.15,
  phaseOffset = 0.35,
  style,
}) => {
  const frame = useCurrentFrame();
  const chars = text.split('');

  return (
    <div style={{ display: 'flex', ...style }}>
      {chars.map((char, i) => {
        const phase = frame * speed + i * phaseOffset;
        const y = Math.sin(phase * frequency * Math.PI * 2) * amplitude;
        const s = 1 + Math.sin(phase * frequency * Math.PI * 2) * 0.03;

        return (
          <span
            key={i}
            style={{
              display: 'inline-block',
              transform: `translateY(${y}px) scale(${s})`,
              whiteSpace: char === ' ' ? 'pre' : 'normal',
            }}
          >
            {char}
          </span>
        );
      })}
    </div>
  );
};

// ══════════════════════════════════════════════════════
// 12. TEXT SLICE REVEAL — horizontal slices slide in from alternating sides
// ══════════════════════════════════════════════════════
interface TextSliceRevealProps {
  text: string;
  /** Number of horizontal slices */
  slices?: number;
  staggerMs?: number;
  durationMs?: number;
  style?: React.CSSProperties;
}

export const TextSliceReveal: React.FC<TextSliceRevealProps> = ({
  text,
  slices = 5,
  staggerMs = 50,
  durationMs = 400,
  style,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const staggerFrames = (staggerMs / 1000) * fps;
  const durationFrames = (durationMs / 1000) * fps;

  return (
    <div style={{ position: 'relative', ...style }}>
      {Array.from({ length: slices }).map((_, i) => {
        const delay = i * staggerFrames;
        const progress = interpolate(frame - delay, [0, durationFrames], [0, 1], {
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
        });
        const eased = ease.backOut(progress);
        const fromLeft = i % 2 === 0;
        const x = interpolate(eased, [0, 1], [fromLeft ? -100 : 100, 0]);
        const sliceHeight = 100 / slices;

        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: 0,
              width: '100%',
              height: `${sliceHeight}%`,
              top: `${i * sliceHeight}%`,
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                position: 'absolute',
                left: 0,
                width: '100%',
                height: `${slices * 100}%`,
                top: `-${i * 100}%`,
                transform: `translateX(${x}%)`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                whiteSpace: 'nowrap',
              }}
            >
              {text}
            </div>
          </div>
        );
      })}
    </div>
  );
};

// ══════════════════════════════════════════════════════
// 13. BLUR CASCADE — words blur in from back to front (depth stack)
// ══════════════════════════════════════════════════════
interface BlurCascadeProps {
  text: string;
  staggerMs?: number;
  durationMs?: number;
  /** Starting blur for each word (higher = more blur) */
  startBlur?: number;
  /** Starting opacity for each word */
  startOpacity?: number;
  easing?: (t: number) => number;
  style?: React.CSSProperties;
  wordStyle?: React.CSSProperties;
}

export const BlurCascade: React.FC<BlurCascadeProps> = ({
  text,
  staggerMs = 120,
  durationMs = 500,
  startBlur = 12,
  startOpacity = 0.15,
  easing = ease.out,
  style,
  wordStyle,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const words = text.split(' ');
  const staggerFrames = (staggerMs / 1000) * fps;
  const durationFrames = (durationMs / 1000) * fps;

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0 0.3em', ...style }}>
      {words.map((word, i) => {
        const delay = i * staggerFrames;
        const progress = interpolate(frame - delay, [0, durationFrames], [0, 1], {
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
        });
        const eased = easing(progress);
        const b = interpolate(eased, [0, 1], [startBlur, 0]);
        const o = interpolate(eased, [0, 1], [startOpacity, 1]);
        const y = interpolate(eased, [0, 1], [8, 0]);

        return (
          <span
            key={i}
            style={{
              display: 'inline-block',
              filter: `blur(${b}px)`,
              opacity: o,
              transform: `translateY(${y}px)`,
              ...wordStyle,
            }}
          >
            {word}
          </span>
        );
      })}
    </div>
  );
};

// ══════════════════════════════════════════════════════
// 14. MORPH TEXT — one word smoothly transforms into another
// ══════════════════════════════════════════════════════
interface MorphTextProps {
  from: string;
  to: string;
  morphFrame?: number;
  morphDuration?: number;
  style?: React.CSSProperties;
}

export const MorphText: React.FC<MorphTextProps> = ({
  from,
  to,
  morphFrame = 30,
  morphDuration = 20,
  style,
}) => {
  const frame = useCurrentFrame();
  const progress = interpolate(frame, [morphFrame, morphFrame + morphDuration], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: ease.inOut,
  });

  const fromOpacity = interpolate(progress, [0, 0.5], [1, 0]);
  const toOpacity = interpolate(progress, [0.5, 1], [0, 1]);
  const fromScale = interpolate(progress, [0, 0.5], [1, 0.95]);
  const toScale = interpolate(progress, [0.5, 1], [0.95, 1]);
  const fromY = interpolate(progress, [0, 0.5], [0, -15]);
  const toY = interpolate(progress, [0.5, 1], [15, 0]);

  return (
    <div style={{ position: 'relative', ...style }}>
      <div style={{ position: 'absolute', left: 0, top: 0, width: '100%', opacity: fromOpacity, transform: `translateY(${fromY}px) scale(${fromScale})`, textAlign: 'center' }}>
        {from}
      </div>
      <div style={{ opacity: toOpacity, transform: `translateY(${toY}px) scale(${toScale})`, textAlign: 'center' }}>
        {to}
      </div>
    </div>
  );
};

// ══════════════════════════════════════════════════════
// 15. CARD FLIP — characters rotate on Y-axis with perspective
// ══════════════════════════════════════════════════════
interface CardFlipProps {
  text: string;
  mode?: StaggerMode;
  staggerMs?: number;
  durationMs?: number;
  perspective?: number;
  style?: React.CSSProperties;
  charStyle?: React.CSSProperties;
}

export const CardFlip: React.FC<CardFlipProps> = ({
  text,
  mode = 'left',
  staggerMs = 40,
  durationMs = 500,
  perspective = 800,
  style,
  charStyle,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const chars = text.split('');
  const staggerFrames = (staggerMs / 1000) * fps;
  const durationFrames = (durationMs / 1000) * fps;
  const ranks = getStaggerOrder(chars.length, mode);

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', perspective, ...style }}>
      {chars.map((char, i) => {
        const delay = ranks[i] * staggerFrames;
        const progress = interpolate(frame - delay, [0, durationFrames], [0, 1], {
          extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
        });
        const eased = ease.backOut(progress);
        const rotateY = interpolate(eased, [0, 1], [-90, 0]);
        const o = interpolate(progress, [0, 0.3], [0, 1], { extrapolateRight: 'clamp' });

        return (
          <span key={i} style={{
            display: 'inline-block', transform: `rotateY(${rotateY}deg)`,
            transformOrigin: 'center center', opacity: o, backfaceVisibility: 'hidden',
            whiteSpace: char === ' ' ? 'pre' : 'normal', ...charStyle,
          }}>
            {char}
          </span>
        );
      })}
    </div>
  );
};

// ══════════════════════════════════════════════════════
// 16. MOTION BLUR SLIDE — text slides in with blur, sharpens on stop
// ══════════════════════════════════════════════════════
interface MotionBlurSlideProps {
  text: string;
  direction?: 'left' | 'right' | 'top' | 'bottom';
  delay?: number;
  durationMs?: number;
  travel?: number;
  maxBlur?: number;
  style?: React.CSSProperties;
}

export const MotionBlurSlide: React.FC<MotionBlurSlideProps> = ({
  text, direction = 'left', delay = 0, durationMs = 500, travel = 300, maxBlur = 12, style,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const durationFrames = (durationMs / 1000) * fps;
  const progress = interpolate(frame - delay, [0, durationFrames], [0, 1], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: ease.out,
  });

  const isH = direction === 'left' || direction === 'right';
  const sign = direction === 'left' || direction === 'top' ? -1 : 1;
  const pos = interpolate(progress, [0, 1], [sign * travel, 0]);
  const blur = interpolate(progress, [0, 0.7, 1], [maxBlur, maxBlur * 0.3, 0]);
  const o = interpolate(progress, [0, 0.2], [0, 1], { extrapolateRight: 'clamp' });
  const transform = isH ? `translateX(${pos}px)` : `translateY(${pos}px)`;

  return <div style={{ transform, filter: `blur(${blur}px)`, opacity: o, ...style }}>{text}</div>;
};

// ══════════════════════════════════════════════════════
// 17. ANTICIPATION SPRING — scale down, then spring in with overshoot
// ══════════════════════════════════════════════════════
interface AnticipationSpringProps {
  children: React.ReactNode;
  delay?: number;
  anticipationScale?: number;
  anticipationFrames?: number;
  config?: { damping: number; stiffness: number; mass?: number };
  style?: React.CSSProperties;
}

export const AnticipationSpring: React.FC<AnticipationSpringProps> = ({
  children, delay = 0, anticipationScale = 0.85, anticipationFrames = 8,
  config = { damping: 10, stiffness: 180, mass: 0.8 }, style,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const localFrame = frame - delay;
  if (localFrame < 0) return <div style={{ opacity: 0, ...style }}>{children}</div>;

  const isAnticipation = localFrame < anticipationFrames;
  const antProgress = isAnticipation
    ? interpolate(localFrame, [0, anticipationFrames], [0, 1], { extrapolateRight: 'clamp' })
    : 1;
  const springFrame = Math.max(0, localFrame - anticipationFrames);
  const s = spring({ frame: springFrame, fps, config });
  const scale = isAnticipation ? interpolate(antProgress, [0, 1], [1, anticipationScale]) : s;
  const o = interpolate(localFrame, [0, 4], [0, 1], { extrapolateRight: 'clamp' });

  return <div style={{ transform: `scale(${scale})`, opacity: o, ...style }}>{children}</div>;
};

// ══════════════════════════════════════════════════════
// 18. ARC MOTION — text follows a curved path to final position
// ══════════════════════════════════════════════════════
interface ArcMotionProps {
  children: React.ReactNode;
  delay?: number;
  durationMs?: number;
  startX?: number;
  startY?: number;
  arcX?: number;
  arcY?: number;
  style?: React.CSSProperties;
}

export const ArcMotion: React.FC<ArcMotionProps> = ({
  children, delay = 0, durationMs = 600, startX = -400, startY = 200, arcX = 0, arcY = -300, style,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const durationFrames = (durationMs / 1000) * fps;
  const progress = interpolate(frame - delay, [0, durationFrames], [0, 1], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: ease.out,
  });

  const t = progress;
  const mt = 1 - t;
  const x = mt * mt * startX + 2 * mt * t * arcX + t * t * 0;
  const y = mt * mt * startY + 2 * mt * t * arcY + t * t * 0;
  const rotation = interpolate(progress, [0, 0.5, 1], [15, -5, 0]);
  const o = interpolate(progress, [0, 0.15], [0, 1], { extrapolateRight: 'clamp' });

  return (
    <div style={{
      position: 'absolute', left: '50%', top: '50%',
      transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y}px)) rotate(${rotation}deg)`,
      opacity: o, ...style,
    }}>
      {children}
    </div>
  );
};
