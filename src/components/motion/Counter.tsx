import { useCurrentFrame, useVideoConfig, spring, interpolate } from "remotion";

interface CounterProps {
  from?: number;
  to: number;
  duration?: number;
  delay?: number;
  prefix?: string;
  suffix?: string;
  fontSize?: number;
  color?: string;
  glowColor?: string;
}

export default function Counter({
  from = 0,
  to,
  duration = 60,
  delay = 0,
  prefix = "",
  suffix = "",
  fontSize = 120,
  color = "#00D9FF",
  glowColor,
}: CounterProps) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const progress = interpolate(frame - delay, [0, duration], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const value = Math.round(from + (to - from) * progress);

  const pop = spring({
    frame: frame - delay - duration,
    fps,
    config: { damping: 10, stiffness: 150 },
  });

  const settleScale = 1 + pop * 0.05;
  const glow = glowColor || color;

  return (
    <div
      style={{
        fontFamily: "'Inter', sans-serif",
        fontSize,
        fontWeight: 900,
        color,
        transform: `scale(${settleScale})`,
        textShadow: `0 0 40px ${glow}44, 0 0 80px ${glow}22`,
        letterSpacing: "-0.03em",
      }}
    >
      {prefix}
      {value}
      {suffix && (
        <span style={{ fontSize: fontSize * 0.35, fontWeight: 600, marginLeft: 8, opacity: 0.7 }}>
          {suffix}
        </span>
      )}
    </div>
  );
}
