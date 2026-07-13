import { useCurrentFrame, interpolate, spring } from "remotion";
import DecoSVG from "./DecoSVG";
import { FONT_DISPLAY, FONT_BODY, COLOR } from "../../core/typography/typography";

const DEFAULT = "WE TEACH MACHINES TO DREAM IN LIGHT MOTION AND CINEMA";

export default function TextTemplateB({ words = DEFAULT }: { words?: string }) {
  const frame = useCurrentFrame();
  const fps = 30;
  const list = words.split(" ");
  const n = list.length;

  const blobs = [
    { c: "rgba(0,217,255,0.5)", x: 12, y: 18, r: 540, sp: 1 },
    { c: "rgba(139,92,246,0.45)", x: 88, y: 14, r: 500, sp: -1 },
    { c: "rgba(231,184,77,0.32)", x: 40, y: 95, r: 460, sp: 1 },
    { c: "rgba(0,217,255,0.28)", x: 75, y: 88, r: 420, sp: -1 },
  ];

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        background: "linear-gradient(135deg, #080b15, #0c1124 55%, #0a0e1c)",
        overflow: "hidden",
        position: "relative",
      }}
    >
      {blobs.map((b, i) => {
        const ox = interpolate(frame, [0, 180], [0, b.sp * 70]);
        const oy = interpolate(frame, [0, 180], [0, -b.sp * 45]);
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              width: b.r,
              height: b.r,
              borderRadius: "50%",
              background: `radial-gradient(circle, ${b.c}, transparent 70%)`,
              filter: "blur(95px)",
              left: `${b.x}%`,
              top: `${b.y}%`,
              transform: `translate(calc(-50% + ${ox}px), calc(-50% + ${oy}px))`,
            }}
          />
        );
      })}

      <DecoSVG src="icons/hexagon.svg" size={260} color="#00D9FF" left="4%" top="8%" anim="spin" speed={0.5} opacity={0.16} />
      <DecoSVG src="icons/triangle.svg" size={200} color="#E7B84D" left="84%" top="10%" anim="drift" speed={0.7} opacity={0.2} />
      <DecoSVG src="icons/atom.svg" size={220} color="#8B5CF6" left="86%" top="70%" anim="spin" speed={-0.4} opacity={0.18} />
      <DecoSVG src="icons/hexagon.svg" size={160} color="#8B5CF6" left="6%" top="74%" anim="float" speed={1} opacity={0.14} />

      {list.map((w, i) => {
        const depth = i / (n - 1);
        const y = interpolate(depth, [0, 1], [86, 14]);
        const xSway = (i % 2 === 0 ? -1 : 1) * 9;
        const scale = interpolate(depth, [0, 1], [1.35, 0.6]);
        const op = interpolate(depth, [0, 1], [1, 0.45]);
        const delay = i * 5;
        const s = spring({ frame: frame - delay, fps, config: { damping: 16, stiffness: 95 } });
        const floatY = Math.sin((frame + i * 14) / 26) * 10;
        const rise = interpolate(s, [0, 1], [60, 0]);
        const reveal = interpolate(s, [0, 1], [0, 1], { extrapolateLeft: "clamp" });
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: `calc(50% + ${xSway}%)`,
              top: `${y}%`,
              transform: `translate(calc(-50% + 0px), calc(-50% + ${floatY + rise}px)) scale(${scale})`,
              opacity: op * reveal,
              zIndex: n - i,
              padding: "14px 30px",
              borderRadius: 18,
              background: "rgba(255,255,255,0.055)",
              backdropFilter: "blur(16px)",
              WebkitBackdropFilter: "blur(16px)",
              border: "1px solid rgba(255,255,255,0.14)",
              boxShadow: "0 24px 80px rgba(0,0,0,0.5)",
              pointerEvents: "none",
              whiteSpace: "nowrap",
            }}
          >
            <span
              style={{
                fontSize: 66,
                fontWeight: 600,
                fontFamily: FONT_BODY,
                color: depth < 0.4 ? COLOR.text : COLOR.textSoft,
                letterSpacing: "-0.01em",
                whiteSpace: "nowrap",
              }}
            >
              {w}
            </span>
          </div>
        );
      })}

      <div
        style={{
          position: "absolute",
          bottom: 56,
          left: 0,
          right: 0,
          textAlign: "center",
          opacity: interpolate(frame, [120, 150], [0, 1]),
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
