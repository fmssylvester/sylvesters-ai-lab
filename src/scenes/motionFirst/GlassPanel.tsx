// Reusable 3D glass panel — text and real media (logos / footage / diagrams)
// live ON the surface, never as a floating caption over a photo. This is the
// core primitive for the "real motion graphics" build (cf. malvaAI/esmileAI:
// footage on glass/device panels, text inside the card).

import React from "react";
import { AbsoluteFill, useCurrentFrame, interpolate, staticFile, Video } from "remotion";
import { ASSETS } from "./part1Assets";

export type Accent = "cyan" | "gold" | "red";

export const ACCENT_COLOR: Record<Accent, string> = {
  cyan: "#00D9FF",
  gold: "#E7B84D",
  red: "#FF6B6B",
};

export const GlassPanel: React.FC<{
  frame?: number;
  title?: string;
  body?: React.ReactNode;
  media?: React.ReactNode;
  accent?: Accent;
  tilt?: number;
  tiltX?: number;
  delay?: number;
  width?: number | string;
  height?: number | string;
  glow?: boolean;
  style?: React.CSSProperties;
}> = ({
  frame = 0,
  title,
  body,
  media,
  accent = "cyan",
  tilt = 0,
  tiltX = 0,
  delay = 0,
  width = "42%",
  height = "62%",
  glow = true,
  style,
}) => {
  const c = ACCENT_COLOR[accent];
  const a = interpolate(frame, [delay, delay + 24], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const breathe = frame ? Math.sin((frame - delay) / 42) * 1.1 : 0;
  const glintX = frame ? ((frame * 0.6) % 220) - 60 : -60;
  return (
    <div
      style={{
        position: "relative",
        width,
        height,
        opacity: a,
        transform: `perspective(1300px) rotateY(${tilt + breathe}deg) rotateX(${tiltX}deg) scale(${0.92 + 0.08 * a})`,
        transformStyle: "preserve-3d",
        ...style,
      }}
    >
      {/* frosted backdrop bloom — gives the glass something to refract */}
      <div
        style={{
          position: "absolute",
          inset: -28,
          borderRadius: 40,
          background: `radial-gradient(60% 60% at 50% 38%, ${c}26, rgba(0,0,0,0) 70%)`,
          filter: "blur(30px)",
          zIndex: 0,
        }}
      />
      {/* glass surface */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: 22,
          background: `linear-gradient(160deg, rgba(255,255,255,0.07), rgba(255,255,255,0) 42%), rgba(19,26,37,0.72)`,
          border: `1px solid ${c}88`,
          borderTop: "1px solid rgba(255,255,255,0.42)",
          borderLeft: "1px solid rgba(255,255,255,0.22)",
          boxShadow: glow
            ? `0 40px 100px rgba(0,0,0,0.72), 0 0 55px ${c}22, inset 0 1px 0 rgba(255,255,255,0.26), inset 0 0 34px rgba(255,255,255,0.06)`
            : `0 40px 100px rgba(0,0,0,0.72), inset 0 1px 0 rgba(255,255,255,0.26)`,
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          zIndex: 1,
        }}
      >
        {/* rim light + inner glow */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: 22,
            pointerEvents: "none",
            background: `linear-gradient(135deg, rgba(255,255,255,0.12), rgba(255,255,255,0) 32%, rgba(255,255,255,0) 72%, rgba(255,255,255,0.05))`,
          }}
        />
        {/* moving specular glint */}
        <div style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none", borderRadius: 22 }}>
          <div
            style={{
              position: "absolute",
              top: "-20%",
              bottom: "-20%",
              width: "26%",
              left: `${glintX}%`,
              background: "linear-gradient(90deg, rgba(255,255,255,0), rgba(255,255,255,0.18), rgba(255,255,255,0))",
              transform: "skewX(-18deg)",
              opacity: 0.7,
            }}
          />
        </div>
        {media && (
          <div style={{ position: "relative", flex: 1, minHeight: 0, display: "flex", alignItems: "center", justifyContent: "center", padding: 20, zIndex: 2 }}>
            {media}
          </div>
        )}
        {(title || body) && (
          <div style={{ position: "relative", padding: "16px 22px", borderTop: `1px solid ${c}33`, background: "rgba(7,9,13,0.55)", zIndex: 2 }}>
            {title && (
              <div style={{ color: c, fontFamily: "monospace", fontWeight: 700, letterSpacing: "0.16em", fontSize: 17, textShadow: `0 0 14px ${c}66` }}>
                {title}
              </div>
            )}
            {body && <div style={{ color: "#EAF1F8", fontSize: 19, marginTop: 7, lineHeight: 1.35, textShadow: "0 1px 10px rgba(0,0,0,0.6)" }}>{body}</div>}
          </div>
        )}
      </div>
    </div>
  );
};

// A device frame (desktop/laptop/phone) with real footage filling its screen
// area. Footage is SUPPORTING — it interprets the line, not the hero.
// A poster image is always rendered as the base layer (fast first paint);
// the <Video> plays on top in a real browser. When LM_POSTER_ONLY is set
// (headless still rendering, where this Chromium can't decode video), the
// <Video> is skipped so the frame still composes.
export const DeviceFootage: React.FC<{
  frame: string; // staticFile path to a video (.webm/.mp4)
  device?: "desktop" | "laptop" | "phone" | "tablet";
  glitch?: boolean;
}> = ({ frame, device = "desktop", glitch = false }) => {
  const svgMap = {
    desktop: ASSETS.desktopSvg,
    laptop: ASSETS.laptopSvg,
    phone: ASSETS.phoneSvg,
    tablet: ASSETS.tabletSvg,
  };
  const poster = frame.includes("website-scroll") ? ASSETS.posterScroll : ASSETS.posterMouse;
  const map = {
    desktop: { left: "6.5%", top: "6.2%", width: "87%", height: "67%" },
    laptop: { left: "13%", top: "9%", width: "74%", height: "64%" },
    phone: { left: "30%", top: "4%", width: "40%", height: "90%" },
    tablet: { left: "14%", top: "8%", width: "72%", height: "80%" },
  }[device];
  const skipVideo = typeof process !== "undefined" && process.env && process.env.LM_POSTER_ONLY === "1";
  return (
    <div style={{ position: "relative", width: "100%" }}>
      <img src={svgMap[device]} style={{ width: "100%", objectFit: "contain", display: "block" }} />
      <div style={{ position: "absolute", left: map.left, top: map.top, width: map.width, height: map.height, overflow: "hidden", borderRadius: 4 }}>
        <img src={poster} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
        {glitch ? (
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(90deg, rgba(255,107,107,0.25), rgba(0,217,255,0.2))", mixBlendMode: "screen" }} />
        ) : null}
        {!skipVideo && (
          <Video
            src={staticFile(frame)}
            style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
            onError={() => {}}
          />
        )}
      </div>
    </div>
  );
};

export const LogoMark: React.FC<{ name: string; size?: number }> = ({ name, size = 120 }) => {
  const base = name.replace(/^logos\//, "").replace(/\.(jpg|svg)$/i, "").replace(/_com$/, "");
  const uri = ASSETS[base] ?? ASSETS[name.replace(/^logos\//, "").replace(/\.(jpg|svg)$/i, "")];
  return <img src={uri} style={{ width: size, height: size, objectFit: "contain" }} />;
};

// A small glass "chip" with text on its surface (e.g. CAMERA / TIME tokens).
export const GlassChip: React.FC<{ label: string; accent?: Accent; frame?: number; delay?: number }> = ({
  label,
  accent = "cyan",
  frame = 0,
  delay = 0,
}) => {
  const c = ACCENT_COLOR[accent];
  const a = interpolate(frame, [delay, delay + 18], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <div
      style={{
        opacity: a,
        transform: `scale(${0.9 + 0.1 * a})`,
        padding: "16px 30px",
        borderRadius: 14,
        border: `1px solid ${c}88`,
        color: c,
        fontFamily: "monospace",
        fontWeight: 700,
        fontSize: 30,
        letterSpacing: "0.2em",
        background: "rgba(0,217,255,0.06)",
        boxShadow: `0 0 36px ${c}33`,
        backdropFilter: "blur(8px)",
      }}
    >
      {label}
    </div>
  );
};
