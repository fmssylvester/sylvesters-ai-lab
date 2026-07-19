import { useCurrentFrame, useVideoConfig } from "remotion";
import { COLOR } from "../../core/typography/typography";

interface CinematicBackdropProps {
  mood?: string;
  /** Current frame. Defaults to useCurrentFrame() when omitted. */
  frame?: number;
}

// Deterministic star/dust field (stable across renders).
const STARS = Array.from({ length: 60 }, (_, i) => ({
  x: (i * 137) % 100,
  y: (i * 251) % 100,
  ph: i * 1.3,
  s: 1 + (i % 3),
}));

/**
 * Persistent frame-driven cinematic backdrop: layered radial glows that breathe
 * and drift, a subtle star/dust field, and a vignette. Mood shifts the palette.
 * No hardcoded content — only abstract light and the locked bg token.
 */
export default function CinematicBackdrop({
  mood = "calm",
  frame,
}: CinematicBackdropProps) {
  const f = frame ?? useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = f / fps;

  const driftX = Math.sin(t * 0.2) * 40;
  const driftY = Math.cos(t * 0.17) * 30;
  const glowPulse = 0.5 + 0.5 * Math.sin(t * 0.5);

  const palette =
    mood === "urgent"
      ? ["rgba(255,107,107,0.16)", "rgba(255,180,77,0.10)"]
      : mood === "energetic"
      ? ["rgba(0,217,255,0.18)", "rgba(231,180,77,0.12)"]
      : mood === "dramatic"
      ? ["rgba(96,165,250,0.14)", "rgba(0,0,0,0.20)"]
      : ["rgba(96,165,250,0.12)", "rgba(139,92,246,0.10)"];

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        overflow: "hidden",
        background: COLOR.bg,
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: -200,
          transform: `translate(${driftX}px, ${driftY}px)`,
          opacity: 0.6 + 0.4 * glowPulse,
          background: `radial-gradient(60% 60% at 30% 35%, ${palette[0]}, transparent 60%), radial-gradient(55% 55% at 72% 68%, ${palette[1]}, transparent 60%)`,
        }}
      />
      {STARS.map((s, i) => {
        const tw = 0.2 + 0.5 * (0.5 + 0.5 * Math.sin(t * 0.6 + s.ph));
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: `${s.x}%`,
              top: `${s.y}%`,
              width: s.s,
              height: s.s,
              borderRadius: "50%",
              background: "#FFFFFF",
              opacity: tw * 0.5,
            }}
          />
        );
      })}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(circle at 50% 45%, transparent 32%, rgba(0,0,0,0.6) 100%)",
        }}
      />
    </div>
  );
}
