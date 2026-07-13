import { useCurrentFrame, interpolate, spring } from "remotion";
import DecoSVG from "./DecoSVG";
import { FONT_DISPLAY, FONT_BODY, COLOR } from "../../core/typography/typography";

const DEFAULT = "WE TEACH MACHINES TO DREAM IN LIGHT MOTION AND CINEMA";

export default function TextTemplateA({ words = DEFAULT }: { words?: string }) {
  const frame = useCurrentFrame();
  const fps = 30;
  const list = words.split(" ");
  const mid = Math.ceil(list.length / 2);
  const lines = [list.slice(0, mid), list.slice(mid)];

  const ax = interpolate(frame, [0, 180], [0, 70]);
  const ay = interpolate(frame, [0, 180], [0, -34]);

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        background: "#05070B",
        overflow: "hidden",
        position: "relative",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 28,
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: -160,
          background:
            "radial-gradient(700px circle at 28% 30%, rgba(0,217,255,0.22), transparent 60%), radial-gradient(620px circle at 74% 66%, rgba(231,184,77,0.14), transparent 60%), radial-gradient(560px circle at 52% 92%, rgba(139,92,246,0.16), transparent 60%)",
          transform: `translate(${ax}px, ${ay}px)`,
          filter: "blur(30px)",
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(circle at 50% 46%, transparent 30%, rgba(0,0,0,0.72) 100%)",
        }}
      />

      <DecoSVG src="icons/orbit.svg" size={300} color="#00D9FF" left="6%" top="12%" anim="spin" speed={0.6} opacity={0.22} />
      <DecoSVG src="icons/sparkles.svg" size={120} color="#E7B84D" left="82%" top="14%" anim="float" speed={1.2} opacity={0.5} />
      <DecoSVG src="icons/atom.svg" size={160} color="#8B5CF6" left="78%" top="62%" anim="drift" speed={0.8} opacity={0.3} />
      <DecoSVG src="icons/aperture.svg" size={180} color="#00D9FF" left="10%" top="60%" anim="spin" speed={-0.5} opacity={0.18} />
      <DecoSVG src="icons/waves.svg" size={900} color="#00D9FF" left="50%" top="84%" anim="drift" speed={0.4} opacity={0.25} />

      {lines.map((line, li) => (
        <div
          key={li}
          style={{
            display: "flex",
            gap: 36,
            flexWrap: "wrap",
            justifyContent: "center",
            zIndex: 5,
          }}
        >
          {line.map((w, i) => {
            const idx = li * mid + i;
            const delay = 6 + idx * 5;
            const s = spring({
              frame: frame - delay,
              fps,
              config: { damping: 13, stiffness: 120, mass: 0.8 },
            });
            const rise = interpolate(s, [0, 1], [70, 0]);
            const bob = Math.sin((frame / 30) * 1.6 + idx * 0.6) * 7;
            const op = interpolate(s, [0, 1], [0, 1], { extrapolateLeft: "clamp" });
            return (
              <span
                key={i}
                style={{
                  fontSize: 96,
                  fontWeight: 700,
                  fontFamily: FONT_DISPLAY,
                  color: COLOR.text,
                  opacity: op,
                  transform: `translateY(${rise + bob}px)`,
                  textShadow: `0 0 54px ${COLOR.accent}55, 0 2px 8px rgba(0,0,0,0.75)`,
                  letterSpacing: "-0.02em",
                  whiteSpace: "nowrap",
                  display: "inline-block",
                }}
              >
                {w}
              </span>
            );
          })}
        </div>
      ))}

      <div
        style={{
          position: "absolute",
          bottom: 56,
          left: 0,
          right: 0,
          textAlign: "center",
          opacity: interpolate(frame, [120, 150], [0, 1]),
          fontSize: 19,
          letterSpacing: "0.36em",
          color: COLOR.muted,
          fontFamily: FONT_BODY,
          textTransform: "uppercase",
          zIndex: 6,
        }}
      >
        Sylvester's AI Lab
      </div>
    </div>
  );
}
