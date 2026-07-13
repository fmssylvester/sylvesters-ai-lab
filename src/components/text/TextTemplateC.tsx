import { useCurrentFrame, interpolate, spring, useVideoConfig } from "remotion";
import { useMemo } from "react";
import DecoSVG from "./DecoSVG";
import { FONT_DISPLAY, FONT_BODY, COLOR } from "../../core/typography/typography";

const DEFAULT = "WE TEACH MACHINES TO DREAM IN LIGHT MOTION AND CINEMA";

const LAYOUT = [
  { x: 50, y: 45, s: 1.5, r: -2 },
  { x: 34, y: 36, s: 1.0, r: 3 },
  { x: 66, y: 38, s: 1.1, r: -3 },
  { x: 27, y: 59, s: 0.85, r: 2 },
  { x: 73, y: 60, s: 0.9, r: -2 },
  { x: 46, y: 26, s: 0.95, r: 2 },
  { x: 55, y: 70, s: 1.0, r: -1 },
  { x: 19, y: 43, s: 0.7, r: 4 },
  { x: 81, y: 46, s: 0.75, r: -3 },
  { x: 50, y: 57, s: 0.8, r: 1 },
];

const IMPACT = 50;

function rand(seed: number) {
  const x = Math.sin(seed * 99.13) * 43758.5453;
  return x - Math.floor(x);
}

export default function TextTemplateC({ words = DEFAULT }: { words?: string }) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const list = words.split(" ");

  const particles = useMemo(
    () =>
      Array.from({ length: 100 }, (_, i) => {
        const a = rand(i + 1) * Math.PI * 2;
        const R = 240 + rand(i + 7) * 520;
        const speed = 240 + rand(i + 13) * 460;
        const size = 1.5 + rand(i + 21) * 3.5;
        const hue = i % 3 === 0 ? "#00D9FF" : i % 3 === 1 ? "#E7B84D" : "#8B5CF6";
        return { a, R, speed, size, hue };
      }),
    []
  );

  const assemble = interpolate(frame, [0, IMPACT], [0, 1], { extrapolateLeft: "clamp" });
  const after = Math.max(0, frame - IMPACT);
  const burst = after / (180 - IMPACT);

  const master = spring({ frame: frame - IMPACT, fps, config: { damping: 12, stiffness: 150, mass: 0.6 } });
  const resolve = interpolate(master, [0, 1], [0, 1]);
  const dx = (1 - resolve) * 22;

  const wordScale = interpolate(master, [0, 1], [0.55, 1]);
  const wordOpacity = interpolate(frame, [IMPACT - 4, IMPACT + 6], [0, 1], { extrapolateLeft: "clamp" });

  const shock = interpolate(frame, [IMPACT, IMPACT + 55], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const shockScale = interpolate(shock, [0, 1], [0.1, 4.2]);
  const shockOpacity = interpolate(shock, [0, 1], [0.95, 0]);

  const copy = (color: string, ox: number, blend?: string, alpha = 1) =>
    list.map((w, i) => {
      const l = LAYOUT[i] ?? LAYOUT[LAYOUT.length - 1];
      const delay = i * 3;
      const s = spring({ frame: frame - delay, fps, config: { damping: 13, stiffness: 130, mass: 0.7 } });
      const ang = (i / list.length) * Math.PI * 2;
      const fx = 50 + Math.cos(ang) * 72;
      const fy = 50 + Math.sin(ang) * 72;
      const x = interpolate(s, [0, 1], [fx, l.x]);
      const y = interpolate(s, [0, 1], [fy, l.y]);
      const op = interpolate(s, [0, 1], [0, 1], { extrapolateLeft: "clamp" });
      return (
        <div
          key={i}
          style={{
            position: "absolute",
            left: `${x}%`,
            top: `${y}%`,
            transform: `translate(-50%,-50%) scale(${l.s * wordScale}) rotate(${l.r}deg)`,
            opacity: op * wordOpacity * alpha,
            zIndex: i,
            fontSize: 72,
            fontWeight: 600,
            fontFamily: FONT_BODY,
            color,
            mixBlendMode: (blend as any) ?? "normal",
            letterSpacing: "-0.01em",
            whiteSpace: "nowrap",
            textShadow: `0 2px 10px rgba(0,0,0,0.85), 0 0 22px ${COLOR.accent}40`,
          }}
        >
          {w}
        </div>
      );
    });

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        background: "radial-gradient(circle at 50% 48%, #0a0d16, #04050a)",
        overflow: "hidden",
        position: "relative",
      }}
    >
      <DecoSVG src="icons/orbit.svg" size={640} color="#00D9FF" left="50%" top="50%" anim="spin" speed={0.4} opacity={0.12} />
      <DecoSVG src="icons/orbit.svg" size={420} color="#8B5CF6" left="50%" top="50%" anim="spin" speed={-0.6} opacity={0.1} />
      <DecoSVG src="icons/sparkles.svg" size={120} color="#E7B84D" left="22%" top="20%" anim="float" speed={1.3} opacity={0.5} />
      <DecoSVG src="icons/sparkles.svg" size={90} color="#00D9FF" left="78%" top="74%" anim="pulse" speed={1.1} opacity={0.5} />
      <DecoSVG src="icons/atom.svg" size={150} color="#8B5CF6" left="84%" top="22%" anim="drift" speed={0.7} opacity={0.3} />

      {particles.map((p, i) => {
        const before = frame <= IMPACT;
        const ex = Math.cos(p.a) * (before ? p.R * (1 - assemble) : p.speed * burst);
        const ey = Math.sin(p.a) * (before ? p.R * (1 - assemble) : p.speed * burst);
        const op = before ? assemble : Math.max(0, 1 - burst);
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              width: p.size,
              height: p.size,
              borderRadius: "50%",
              background: p.hue,
              left: "50%",
              top: "50%",
              marginLeft: -p.size / 2,
              marginTop: -p.size / 2,
              transform: `translate(${ex}px, ${ey}px)`,
              opacity: op,
              boxShadow: `0 0 ${p.size * 3}px ${p.hue}`,
            }}
          />
        );
      })}

      <div
        style={{
          position: "absolute",
          width: 220,
          height: 220,
          borderRadius: "50%",
          border: "2px solid rgba(0,217,255,0.8)",
          left: "50%",
          top: "50%",
          marginLeft: -110,
          marginTop: -110,
          transform: `scale(${shockScale})`,
          opacity: shockOpacity,
          boxShadow: "0 0 70px rgba(0,217,255,0.6)",
        }}
      />

      {copy("#FF2D55", dx, "screen", 0.35)}
      {copy("#00D9FF", -dx, "screen", 0.35)}
      {copy("#F5F7FA", 0)}

      <div
        style={{
          position: "absolute",
          bottom: 56,
          left: 0,
          right: 0,
          textAlign: "center",
          opacity: interpolate(frame, [IMPACT + 40, IMPACT + 75], [0, 1]),
          fontSize: 18,
          letterSpacing: "0.36em",
          color: COLOR.muted,
          fontFamily: FONT_BODY,
          textTransform: "uppercase",
        }}
      >
        Sylvester's AI Lab
      </div>
    </div>
  );
}
