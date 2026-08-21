import { AbsoluteFill } from "remotion";
import { layers } from "../../core/layout/layers";

// duotone grade (multiply + screen passes)
export const Duotone = ({
  colorA = "#00D9FF",
  colorB = "#07090D",
  intensity = 0.5,
}: {
  colorA?: string;
  colorB?: string;
  intensity?: number;
}) => (
  <>
    <AbsoluteFill style={{ zIndex: layers.hud, pointerEvents: "none", mixBlendMode: "multiply", background: colorB, opacity: intensity }} />
    <AbsoluteFill style={{ zIndex: layers.hud, pointerEvents: "none", mixBlendMode: "screen", background: colorA, opacity: intensity }} />
  </>
);

// single-color tint
export const Tint = ({ color = "#00D9FF", intensity = 0.25 }: { color?: string; intensity?: number }) => (
  <AbsoluteFill style={{ zIndex: layers.hud, pointerEvents: "none", mixBlendMode: "overlay", background: color, opacity: intensity }} />
);

// bloom glow
export const Bloom = ({ color = "#00D9FF", intensity = 0.4 }: { color?: string; intensity?: number }) => (
  <AbsoluteFill
    style={{
      zIndex: layers.hud,
      pointerEvents: "none",
      mixBlendMode: "screen",
      background: `radial-gradient(60% 50% at 50% 45%, ${color}33 0%, transparent 70%)`,
      opacity: intensity,
    }}
  />
);

// pass-through color grade (filter string) — e.g. "saturate(0.85) hue-rotate(-120deg)"
export const ColorGrade = ({ children, filter = "saturate(1) contrast(1)" }: { children: React.ReactNode; filter?: string }) => (
  <AbsoluteFill style={{ filter }}>{children}</AbsoluteFill>
);

// colored vignette
export const VignetteColor = ({ color = "#00D9FF", intensity = 0.5 }: { color?: string; intensity?: number }) => (
  <AbsoluteFill
    style={{
      zIndex: layers.hud,
      pointerEvents: "none",
      background: `radial-gradient(75% 75% at 50% 50%, transparent 55%, ${color}${Math.round(intensity * 60)
        .toString(16)
        .padStart(2, "0")} 100%)`,
    }}
  />
);
