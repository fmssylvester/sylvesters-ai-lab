import { interpolate, useCurrentFrame } from "remotion";

export interface CaptionCue {
  text: string;
  in: number;
  out: number;
  emphasis?: readonly string[];
}

interface Props {
  cues: readonly CaptionCue[];
  bottom?: number;
  fontSize?: number;
  color?: string;
  emphasisColor?: string;
}

/**
 * Reusable whisper lower-third caption engine.
 * Fully frame-driven: soft blur + fade + rise, with per-word emphasis.
 * One focal line at a time; designed to never compete with the visual.
 */
export default function CaptionEngine({
  cues,
  bottom = 90,
  fontSize = 34,
  color = "rgba(245,247,250,0.72)",
  emphasisColor = "#00D9FF",
}: Props) {
  const frame = useCurrentFrame();

  const active = cues.find((c) => frame >= c.in && frame < c.out);
  if (!active) return null;

  const IN = 16;
  const OUT = 14;
  const sinceIn = frame - active.in;
  const untilOut = active.out - frame;

  const opacity =
    Math.min(
      interpolate(sinceIn, [0, IN], [0, 1], { extrapolateRight: "clamp" }),
      interpolate(untilOut, [0, OUT], [0, 1], { extrapolateRight: "clamp" })
    );

  const rise = interpolate(sinceIn, [0, IN], [10, 0], {
    extrapolateRight: "clamp",
  });
  const blur = interpolate(sinceIn, [0, IN], [8, 0], {
    extrapolateRight: "clamp",
  });

  const words = active.text.split(" ");
  const emphasized = new Set(active.emphasis ?? []);

  return (
    <div
      style={{
        position: "absolute",
        bottom: `${bottom}px`,
        left: 0,
        right: 0,
        display: "flex",
        justifyContent: "center",
        zIndex: 80,
        pointerEvents: "none",
      }}
    >
      <div
        style={{
          opacity,
          transform: `translateY(${rise}px)`,
          filter: `blur(${blur}px)`,
          fontSize,
          fontWeight: 400,
          letterSpacing: "0.01em",
          lineHeight: 1.4,
          textAlign: "center",
          maxWidth: 1200,
          textShadow: "0 2px 30px rgba(0,0,0,0.65)",
        }}
      >
        {words.map((w, i) => {
          const isEmph = emphasized.has(w);
          return (
            <span
              key={i}
              style={{
                color: isEmph ? emphasisColor : color,
                fontWeight: isEmph ? 600 : 400,
                textShadow: isEmph
                  ? `0 0 24px ${emphasisColor}66, 0 2px 30px rgba(0,0,0,0.65)`
                  : "0 2px 30px rgba(0,0,0,0.65)",
              }}
            >
              {w}
              {i < words.length - 1 ? " " : ""}
            </span>
          );
        })}
      </div>
    </div>
  );
}
