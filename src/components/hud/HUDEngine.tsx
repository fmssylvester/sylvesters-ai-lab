import { AbsoluteFill, useCurrentFrame } from "remotion";
import { layers } from "../../core/layout/layers";

// four L corner brackets
export const CornerBrackets = ({
  color = "#00D9FF",
  size = 54,
  inset = 34,
  thickness = 2,
}: {
  color?: string;
  size?: number;
  inset?: number;
  thickness?: number;
}) => (
  <AbsoluteFill style={{ zIndex: layers.hud, pointerEvents: "none" }}>
    {(
      [
        ["top", "left"],
        ["top", "right"],
        ["bottom", "left"],
        ["bottom", "right"],
      ] as const
    ).map(([v, h], i) => (
      <div
        key={i}
        style={{
          position: "absolute",
          width: size,
          height: size,
          top: v === "top" ? inset : undefined,
          bottom: v === "bottom" ? inset : undefined,
          left: h === "left" ? inset : undefined,
          right: h === "right" ? inset : undefined,
          borderTop: v === "top" ? `${thickness}px solid ${color}` : undefined,
          borderLeft: h === "left" ? `${thickness}px solid ${color}` : undefined,
          borderRight: h === "right" ? `${thickness}px solid ${color}` : undefined,
          borderBottom: v === "bottom" ? `${thickness}px solid ${color}` : undefined,
          boxShadow: `0 0 12px ${color}55`,
        }}
      />
    ))}
  </AbsoluteFill>
);

// rotating reticle / crosshair
export const Reticle = ({ color = "#00D9FF", size = 160 }: { color?: string; size?: number }) => {
  const frame = useCurrentFrame();
  const rot = frame * 0.6;
  return (
    <AbsoluteFill style={{ zIndex: layers.hud, pointerEvents: "none", justifyContent: "center", alignItems: "center" }}>
      <div style={{ position: "relative", width: size, height: size, transform: `rotate(${rot}deg)` }}>
        <div style={{ position: "absolute", inset: 0, borderRadius: "50%", border: `1px solid ${color}66` }} />
        <div style={{ position: "absolute", inset: 14, borderRadius: "50%", border: `1px dashed ${color}99` }} />
        <div style={{ position: "absolute", top: "50%", left: -20, right: -20, height: 1, background: `${color}88` }} />
        <div style={{ position: "absolute", left: "50%", top: -20, bottom: -20, width: 1, background: `${color}88` }} />
      </div>
    </AbsoluteFill>
  );
};

// faint perspective tech grid
export const TechGrid = ({ color = "rgba(0,217,255,0.12)" }: { color?: string }) => (
  <AbsoluteFill
    style={{
      zIndex: layers.background,
      pointerEvents: "none",
      backgroundImage: `linear-gradient(${color} 1px, transparent 1px), linear-gradient(90deg, ${color} 1px, transparent 1px)`,
      backgroundSize: "60px 60px",
      maskImage: "radial-gradient(circle at 50% 50%, black, transparent 78%)",
      WebkitMaskImage: "radial-gradient(circle at 50% 50%, black, transparent 78%)",
    }}
  />
);

// small labeled data readout
export const DataReadout = ({
  label,
  value,
  color = "#00D9FF",
  x = 56,
  y = 120,
}: {
  label: string;
  value: string;
  color?: string;
  x?: number;
  y?: number;
}) => (
  <div
    style={{
      position: "absolute",
      left: x,
      top: y,
      fontFamily: "'Inter', ui-monospace, monospace",
      color,
      fontSize: 14,
      letterSpacing: "0.18em",
      textTransform: "uppercase",
    }}
  >
    <div style={{ opacity: 0.7 }}>{label}</div>
    <div style={{ fontSize: 22, fontWeight: 700 }}>{value}</div>
  </div>
);

// running SMPTE-style timecode
export const Timecode = ({ fps = 30, color = "#00D9FF", x = 56, y = 172 }: { fps?: number; color?: string; x?: number; y?: number }) => {
  const frame = useCurrentFrame();
  const s = Math.floor(frame / fps);
  const fr = frame % fps;
  const tc = `00:${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}:${String(fr).padStart(2, "0")}`;
  return (
    <div style={{ position: "absolute", left: x, top: y, fontFamily: "ui-monospace, monospace", color, fontSize: 15, letterSpacing: "0.2em" }}>
      {tc}
    </div>
  );
};

// horizontal scan line sweeping vertically
export const ScanFrame = ({ color = "#00D9FF" }: { color?: string }) => {
  const frame = useCurrentFrame();
  const y = (frame * 4) % 100;
  return (
    <AbsoluteFill style={{ zIndex: layers.hud, pointerEvents: "none", justifyContent: "center" }}>
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: `${y}%`,
          height: 2,
          background: `linear-gradient(90deg, transparent, ${color}, transparent)`,
          boxShadow: `0 0 16px ${color}`,
          opacity: 0.7,
        }}
      />
    </AbsoluteFill>
  );
};
