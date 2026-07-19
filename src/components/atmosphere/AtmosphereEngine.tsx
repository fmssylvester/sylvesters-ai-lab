import { useCurrentFrame, useVideoConfig } from "remotion";
import { COLOR } from "../../core/typography/typography";

interface AtmosphereEngineProps {
  mood?: string;
  /** Accent color for the glow/particles. Defaults to the locked brand accent. */
  color?: string;
  intensity?: number;
}

// Deterministic particle field (no per-render randomness — stable in render).
const PARTICLES = Array.from({ length: 22 }, (_, i) => ({
  x: (i * 53) % 100,
  y: (i * 89) % 100,
  ph: i * 0.7,
  sp: 0.3 + (i % 5) * 0.12,
  s: 2 + (i % 3),
}));

function hexA(hex: string, alpha: number): string {
  const h = (hex || "#60A5FA").replace("#", "");
  const r = parseInt(h.substring(0, 2), 16);
  const g = parseInt(h.substring(2, 4), 16);
  const b = parseInt(h.substring(4, 6), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

/**
 * Frame-driven ambient atmosphere. Rebuilt from framer-motion `animate` to use
 * useCurrentFrame so it renders correctly in headless Remotion. All motion is
 * derived from the frame (breathing glow + drifting particles); no content is
 * hardcoded — only abstract light.
 */
export default function AtmosphereEngine({
  mood = "calm",
  color = COLOR.accent,
  intensity = 1,
}: AtmosphereEngineProps) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;

  const breathe = 0.5 + 0.5 * Math.sin(t * 0.6);
  const driftX = Math.sin(t * 0.3) * 30;
  const driftY = Math.cos(t * 0.25) * 24;

  const moodTint =
    mood === "urgent"
      ? "rgba(255,107,107,0.10)"
      : mood === "dramatic"
      ? "rgba(0,0,0,0.18)"
      : "transparent";

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        pointerEvents: "none",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: -160,
          opacity: 0.7 + 0.3 * breathe,
          transform: `translate(${driftX}px, ${driftY}px)`,
          background: `radial-gradient(700px circle at 28% 30%, ${hexA(
            color,
            0.18 * intensity
          )}, transparent 60%), radial-gradient(620px circle at 74% 66%, ${hexA(
            color,
            0.12 * intensity
          )}, transparent 60%)`,
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(circle at 50% 46%, transparent 30%, rgba(0,0,0,0.5) 100%)",
        }}
      />
      {PARTICLES.map((p, i) => {
        const py = (p.y + ((t * p.sp * 10) % 100)) % 100;
        const op = 0.1 + 0.12 * (0.5 + 0.5 * Math.sin(t * 0.8 + p.ph));
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: `${p.x}%`,
              top: `${py}%`,
              width: p.s,
              height: p.s,
              borderRadius: "50%",
              background: color,
              opacity: op * intensity,
              filter: "blur(0.5px)",
            }}
          />
        );
      })}
      {moodTint !== "transparent" && (
        <div
          style={{ position: "absolute", inset: 0, background: moodTint }}
        />
      )}
    </div>
  );
}
