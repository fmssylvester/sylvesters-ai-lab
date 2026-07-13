import { useCurrentFrame, useVideoConfig, spring } from "remotion";
import GlassCard from "./GlassCard";

interface IconCardProps {
  icon: string;
  label: string;
  accentColor?: string;
  size?: number;
  enterDelay?: number;
}

export default function IconCard({
  icon,
  label,
  accentColor = "#00D9FF",
  size = 160,
  enterDelay = 0,
}: IconCardProps) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const pop = spring({
    frame: frame - enterDelay,
    fps,
    config: { damping: 14, stiffness: 120 },
  });

  return (
    <GlassCard
      width={size}
      height={size + 40}
      padding={20}
      glowColor={`${accentColor}33`}
      glowIntensity={pop}
      enterDelay={enterDelay}
      enterFrom="scale"
    >
      <div
        style={{
          fontSize: size * 0.35,
          filter: `drop-shadow(0 0 ${12 * pop}px ${accentColor}88)`,
          marginBottom: 8,
        }}
      >
        {icon}
      </div>
      <span
        style={{
          fontFamily: "'Inter', sans-serif",
          fontSize: 14,
          fontWeight: 600,
          color: "rgba(255,255,255,0.8)",
          letterSpacing: "0.04em",
          textAlign: "center",
        }}
      >
        {label}
      </span>
    </GlassCard>
  );
}
