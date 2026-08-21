import { AbsoluteFill, useCurrentFrame } from "remotion";
import { layers } from "../../core/layout/layers";
import { useId } from "react";

// chromatic RGB edge split
export const RGBSplit = ({ intensity = 0.5 }: { intensity?: number }) => (
  <AbsoluteFill
    style={{
      zIndex: layers.hud,
      pointerEvents: "none",
      mixBlendMode: "screen",
      boxShadow: `inset ${8 * intensity}px 0 0 rgba(0,217,255,${0.4 * intensity}), inset ${-8 * intensity}px 0 0 rgba(255,90,90,${0.4 * intensity})`,
    }}
  />
);

// moving scanlines
export const Scanlines = ({ intensity = 0.4, speed = 6 }: { intensity?: number; speed?: number }) => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill
      style={{
        zIndex: layers.hud,
        pointerEvents: "none",
        backgroundImage:
          "repeating-linear-gradient(0deg, rgba(255,255,255,0.07) 0px, rgba(255,255,255,0.07) 1px, transparent 2px, transparent 4px)",
        backgroundPosition: `0 ${(frame * speed) % 40}px`,
        opacity: intensity,
      }}
    />
  );
};

// soft bloom / halation glow
export const Halation = ({ intensity = 0.5, color = "#00D9FF" }: { intensity?: number; color?: string }) => (
  <AbsoluteFill
    style={{
      zIndex: layers.hud,
      pointerEvents: "none",
      mixBlendMode: "screen",
      background: `radial-gradient(60% 50% at 50% 45%, ${color}22 0%, transparent 70%)`,
      opacity: intensity,
    }}
  />
);

// SVG turbulence + displacement distortion (breathes across frames)
export const DistortionField = ({
  children,
  scale = 14,
  frequency = 0.012,
}: {
  children: React.ReactNode;
  scale?: number;
  frequency?: number;
}) => {
  const id = useId().replace(/:/g, "");
  const frame = useCurrentFrame();
  const s = scale + 8 * Math.sin(frame / 9);
  const bf = `${frequency.toFixed(4)} ${(frequency * 1.3).toFixed(4)}`;
  return (
    <>
      <svg style={{ position: "absolute", width: 0, height: 0 }}>
        <filter id={id}>
          <feTurbulence type="fractalNoise" baseFrequency={bf} numOctaves={2} seed={3} result="noise" />
          <feDisplacementMap in="SourceGraphic" in2="noise" scale={s} xChannelSelector="R" yChannelSelector="G" />
        </filter>
      </svg>
      <AbsoluteFill style={{ filter: `url(#${id})` }}>{children}</AbsoluteFill>
    </>
  );
};

// film-style animated grain
export const NoiseField = ({ intensity = 0.12 }: { intensity?: number }) => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill
      style={{
        zIndex: layers.hud,
        pointerEvents: "none",
        opacity: intensity,
        backgroundImage:
          "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.6'/%3E%3C/svg%3E\")",
        backgroundPosition: `${(frame * 7) % 120}px ${(frame * 5) % 120}px`,
        mixBlendMode: "overlay",
      }}
    />
  );
};
