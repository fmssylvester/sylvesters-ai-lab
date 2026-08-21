import { AbsoluteFill, useCurrentFrame, interpolate, Easing } from "remotion";
import { layers } from "../../core/layout/layers";
import type { CSSProperties, ReactNode } from "react";

// animated liquid/smart glass: frost-in, breathing refraction highlight, reflection sweep
export const LiquidGlass = ({
  children,
  frostIn = false,
  sweep = true,
  sweepPeriod = 5,
  tint = "rgba(255,255,255,0.06)",
  border = "rgba(255,255,255,0.14)",
  radius = 28,
  padding = 28,
  style,
}: {
  children?: ReactNode;
  frostIn?: boolean;
  sweep?: boolean;
  sweepPeriod?: number;
  tint?: string;
  border?: string;
  radius?: number;
  padding?: number;
  style?: CSSProperties;
}) => {
  const frame = useCurrentFrame();
  const blur = frostIn
    ? interpolate(frame, [0, 40], [0, 24], { extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) })
    : 24;
  const op = frostIn ? interpolate(frame, [0, 40], [0, 1], { extrapolateRight: "clamp" }) : 1;
  const phase = (frame % (sweepPeriod * 30)) / (sweepPeriod * 30);
  const sweepX = -300 + phase * 1600;
  const sweepOp = sweep ? Math.sin(phase * Math.PI) * 0.5 : 0;
  return (
    <div
      style={{
        position: "relative",
        zIndex: layers.glass,
        opacity: op,
        borderRadius: radius,
        overflow: "hidden",
        background: `linear-gradient(180deg, ${tint}, rgba(255,255,255,0.02))`,
        backdropFilter: `blur(${blur}px)`,
        WebkitBackdropFilter: `blur(${blur}px)`,
        border: `1px solid ${border}`,
        boxShadow: "0 40px 120px rgba(0,0,0,0.45), inset 0 1px rgba(255,255,255,0.18)",
        padding,
        ...style,
      }}
    >
      {sweep && (
        <div
          style={{
            position: "absolute",
            top: "-20%",
            left: 0,
            width: 220,
            height: "160%",
            transform: `translateX(${sweepX}px) rotate(-18deg)`,
            background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.22), transparent)",
            filter: "blur(20px)",
            opacity: sweepOp,
            pointerEvents: "none",
          }}
        />
      )}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "radial-gradient(80% 60% at 30% 20%, rgba(255,255,255,0.10), transparent 60%)",
          pointerEvents: "none",
        }}
      />
      {children}
    </div>
  );
};
