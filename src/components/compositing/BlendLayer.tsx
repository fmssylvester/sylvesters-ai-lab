import { AbsoluteFill, Img, staticFile, useCurrentFrame } from "remotion";
import Vignette from "../postfx/Vignette";

/**
 * BlendLayer — principle 8: never force a choice between motion graphics and
 * real footage. Footage is the foundation; typography / SVG / particles /
 * lighting / UI / callouts are OVERLAYS that enhance reality.
 *
 * Reusable: pass a footage frame sequence (or single still) + children overlays.
 * The overlay layer always sits above the footage and below post-fx.
 */
interface Props {
  footage: string; // staticFile path to a JPG frame (or still)
  children?: React.ReactNode;
  // subtle treatment so footage reads as a cinematic base, not a flat photo
  brightness?: number;
  blur?: number;
  grade?: string; // css filter fragment, e.g. "saturate(1.1)"
  vignette?: boolean;
}

export default function BlendLayer({
  footage,
  children,
  brightness = 0.6,
  blur = 2,
  grade = "",
  vignette = true,
}: Props) {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ background: "#06080d", overflow: "hidden" }}>
      <AbsoluteFill>
        <Img
          src={staticFile(footage)}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            filter: `brightness(${brightness}) blur(${blur}px) ${grade}`,
          }}
        />
        {/* key-light wash so overlays feel lit, not pasted */}
        <AbsoluteFill
          style={{
            background:
              "radial-gradient(ellipse 50% 46% at 50% 46%, rgba(255,255,255,0.06) 0%, rgba(0,0,0,0) 70%)",
          }}
        />
      </AbsoluteFill>

      {/* overlay layer — motion graphics go here */}
      <AbsoluteFill style={{ zIndex: 10 }}>{children}</AbsoluteFill>

      {vignette && <Vignette />}
    </AbsoluteFill>
  );
}
