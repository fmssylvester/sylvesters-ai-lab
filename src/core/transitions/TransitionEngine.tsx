import React from "react";
import { useCurrentFrame, useVideoConfig, interpolate } from "remotion";

interface TransitionEngineProps {
  children: React.ReactNode;
  /** Current frame. Defaults to useCurrentFrame() when omitted. */
  frame?: number;
  /** Frame at which this scene becomes active (fade/scale-in starts here). */
  enterFrame?: number;
  /** Frame at which it should fade out (omit to stay visible). */
  exitFrame?: number;
  /** Transition length in frames. */
  durationInFrames?: number;
  mode?: "fade" | "blur" | "scale";
  style?: React.CSSProperties;
}

/**
 * Frame-driven scene transition. Renders `children` with an enter animation
 * (fade/blur/scale) beginning at `enterFrame` and an optional exit fade before
 * `exitFrame`. Fully driven by the Remotion frame — no wall-clock timers, so it
 * renders correctly in headless Remotion.
 */
export const TransitionEngine: React.FC<TransitionEngineProps> = ({
  children,
  frame,
  enterFrame = 0,
  exitFrame,
  durationInFrames = 14,
  mode = "fade",
  style = {},
}) => {
  const f = frame ?? useCurrentFrame();
  const { fps } = useVideoConfig();

  const enterP = interpolate(
    f,
    [enterFrame, enterFrame + durationInFrames],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  const exitP =
    exitFrame !== undefined
      ? interpolate(f, [exitFrame - durationInFrames, exitFrame], [1, 0], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        })
      : 1;

  const opacity = Math.min(enterP, exitP);
  const blur = mode === "blur" ? (1 - enterP) * 18 : 0;
  const scale = mode === "scale" ? 0.96 + 0.04 * enterP : 1;

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        opacity,
        filter: blur ? `blur(${blur}px)` : undefined,
        transform: `scale(${scale})`,
        ...style,
      }}
    >
      {children}
    </div>
  );
};

export default TransitionEngine;
