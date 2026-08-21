// ScreenshotFrame — Browser or device frame around any content.
// Shows a realistic browser chrome (address bar, dots) around child content.
// Used to present tool screenshots, websites, UI demos.

import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring } from "remotion";

interface ScreenshotFrameProps {
  children: React.ReactNode;
  title?: string;
  url?: string;
  delay?: number;
  device?: "browser" | "phone" | "terminal";
}

export const ScreenshotFrame: React.FC<ScreenshotFrameProps> = ({
  children,
  title,
  url = "sylvesters-ai-lab.com",
  delay = 0,
  device = "browser",
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const local = frame - delay;

  if (local < 0) return null;

  const scale = spring({
    frame: local,
    fps,
    config: { stiffness: 180, damping: 20 },
  });

  const opacity = interpolate(local, [0, 8], [0, 1], {
    extrapolateRight: "clamp",
  });

  if (device === "terminal") {
    return (
      <AbsoluteFill style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div
          style={{
            transform: `scale(${scale})`,
            opacity,
            width: "80%",
            background: "#0D1117",
            borderRadius: 12,
            border: "1px solid #30363D",
            overflow: "hidden",
            boxShadow: "0 40px 100px rgba(0,0,0,0.6)",
          }}
        >
          {/* Terminal header */}
          <div style={{ display: "flex", gap: 8, padding: "12px 16px", background: "#161B22", borderBottom: "1px solid #30363D" }}>
            <div style={{ width: 12, height: 12, borderRadius: "50%", background: "#FF5F57" }} />
            <div style={{ width: 12, height: 12, borderRadius: "50%", background: "#FEBC2E" }} />
            <div style={{ width: 12, height: 12, borderRadius: "50%", background: "#28C840" }} />
            {title && (
              <div style={{ marginLeft: 12, fontFamily: "'JetBrains Mono', monospace", fontSize: 13, color: "#8B949E" }}>
                {title}
              </div>
            )}
          </div>
          <div style={{ padding: 24 }}>{children}</div>
        </div>
      </AbsoluteFill>
    );
  }

  return (
    <AbsoluteFill style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div
        style={{
          transform: `scale(${scale})`,
          opacity,
          width: "80%",
          background: "#1A1A2E",
          borderRadius: 16,
          border: "1px solid rgba(255,255,255,0.08)",
          overflow: "hidden",
          boxShadow: "0 40px 100px rgba(0,0,0,0.6)",
        }}
      >
        {/* Browser chrome */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            padding: "14px 20px",
            background: "rgba(255,255,255,0.03)",
            borderBottom: "1px solid rgba(255,255,255,0.06)",
          }}
        >
          {/* Traffic lights */}
          <div style={{ display: "flex", gap: 7 }}>
            <div style={{ width: 12, height: 12, borderRadius: "50%", background: "#FF5F57" }} />
            <div style={{ width: 12, height: 12, borderRadius: "50%", background: "#FEBC2E" }} />
            <div style={{ width: 12, height: 12, borderRadius: "50%", background: "#28C840" }} />
          </div>
          {/* Address bar */}
          <div
            style={{
              flex: 1,
              background: "rgba(255,255,255,0.06)",
              borderRadius: 8,
              padding: "8px 16px",
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 14,
              color: "#8B949E",
            }}
          >
            {url}
          </div>
        </div>
        {/* Content */}
        <div style={{ padding: 0, minHeight: 400 }}>{children}</div>
      </div>
    </AbsoluteFill>
  );
};
