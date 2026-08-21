import { AbsoluteFill, useCurrentFrame } from "remotion";
import { layers } from "../../core/layout/layers";

// concentric rotating rings
export const Rings = ({
  color = "#00D9FF",
  count = 3,
  size = 400,
  speed = 0.5,
}: {
  color?: string;
  count?: number;
  size?: number;
  speed?: number;
}) => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ zIndex: layers.particles, pointerEvents: "none", justifyContent: "center", alignItems: "center" }}>
      <div style={{ position: "relative", width: size, height: size }}>
        {Array.from({ length: count }).map((_, i) => {
          const rot = frame * speed * (i % 2 ? -1 : 1) * (1 + i * 0.3);
          const alpha = i === 0 ? "cc" : i === 1 ? "88" : "44";
          return (
            <div
              key={i}
              style={{
                position: "absolute",
                inset: i * (size / count / 2),
                borderRadius: "50%",
                border: `1px solid ${color}${alpha}`,
                transform: `rotate(${rot}deg)`,
              }}
            />
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

// rotating polygon outline
export const Polygon = ({
  color = "#00D9FF",
  sides = 6,
  size = 300,
  speed = 0.4,
}: {
  color?: string;
  sides?: number;
  size?: number;
  speed?: number;
}) => {
  const frame = useCurrentFrame();
  const rot = frame * speed;
  const pts = Array.from({ length: sides })
    .map((_, i) => {
      const a = (i / sides) * Math.PI * 2 - Math.PI / 2;
      return `${50 + 45 * Math.cos(a)}% ${50 + 45 * Math.sin(a)}%`;
    })
    .join(", ");
  return (
    <AbsoluteFill style={{ zIndex: layers.particles, pointerEvents: "none", justifyContent: "center", alignItems: "center" }}>
      <svg width={size} height={size} viewBox="0 0 100 100" style={{ transform: `rotate(${rot}deg)` }}>
        <polygon points={pts} fill="none" stroke={color} strokeWidth={0.6} opacity={0.6} />
      </svg>
    </AbsoluteFill>
  );
};

// progress arc
export const Arc = ({
  color = "#00D9FF",
  size = 300,
  progress = 1,
  thickness = 6,
}: {
  color?: string;
  size?: number;
  progress?: number;
  thickness?: number;
}) => {
  const r = 44;
  const c = 2 * Math.PI * r;
  const p = Math.min(1, Math.max(0, progress));
  return (
    <AbsoluteFill style={{ zIndex: layers.particles, pointerEvents: "none", justifyContent: "center", alignItems: "center" }}>
      <svg width={size} height={size} viewBox="0 0 100 100">
        <circle cx="50" cy="50" r={r} fill="none" stroke={`${color}33`} strokeWidth={thickness} />
        <circle
          cx="50"
          cy="50"
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={thickness}
          strokeDasharray={c}
          strokeDashoffset={c * (1 - p)}
          strokeLinecap="round"
          transform="rotate(-90 50 50)"
        />
      </svg>
    </AbsoluteFill>
  );
};

// static tech grid lines
export const TechLines = ({ color = "rgba(0,217,255,0.18)" }: { color?: string }) => (
  <AbsoluteFill
    style={{
      zIndex: layers.background,
      pointerEvents: "none",
      backgroundImage: `linear-gradient(${color} 1px, transparent 1px), linear-gradient(90deg, ${color} 1px, transparent 1px)`,
      backgroundSize: "80px 80px",
    }}
  />
);
