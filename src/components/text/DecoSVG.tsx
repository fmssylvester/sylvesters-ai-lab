import { useCurrentFrame, staticFile, Img } from "remotion";

type Anim = "spin" | "float" | "pulse" | "drift";

export default function DecoSVG({
  src,
  size = 90,
  color = "#00D9FF",
  left = "50%",
  top = "50%",
  anim = "spin",
  speed = 1,
  opacity = 0.35,
  z = 1,
}: {
  src: string;
  size?: number;
  color?: string;
  left?: string;
  top?: string;
  anim?: Anim;
  speed?: number;
  opacity?: number;
  z?: number;
}) {
  const frame = useCurrentFrame();
  const t = frame / 30;
  let transform = "";
  if (anim === "spin") transform = `rotate(${t * 26 * speed}deg)`;
  else if (anim === "float") transform = `translateY(${Math.sin(t * speed) * 20}px)`;
  else if (anim === "pulse") {
    const s = 0.82 + 0.18 * Math.sin(t * speed);
    transform = `scale(${s})`;
  } else if (anim === "drift")
    transform = `translate(${Math.sin(t * speed) * 34}px, ${Math.cos(t * speed * 0.7) * 22}px) rotate(${t * 9 * speed}deg)`;

  return (
    <Img
      src={staticFile(src)}
      style={{
        position: "absolute",
        left,
        top,
        width: size,
        height: size,
        color,
        opacity,
        transform,
        zIndex: z,
        pointerEvents: "none",
        filter: `drop-shadow(0 0 ${size * 0.35}px ${color})`,
      }}
    />
  );
}
