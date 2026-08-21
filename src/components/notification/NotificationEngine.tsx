// Reusable notification card (feeds the "Notification Pack").
//
// A glass notification that slides in from a screen corner, used for UI
// callouts, app alerts, or "new message" beats inside videos. Self-contained
// glass styling (brand tokens) and motion via MotionPresets, so it drops into
// any scene without coupling to a specific dashboard. Reusable as a standalone
// asset and as a building block for the Notification Pack.

import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { applyPreset } from "../../core/motion/MotionPresets";

export type NotifyPosition = "topRight" | "topLeft" | "bottomRight" | "bottomLeft";

export interface NotificationProps {
  title: string;
  body?: string;
  icon?: React.ReactNode;
  accent?: string;
  position?: NotifyPosition;
  frame: number;
  fps: number;
  start?: number;
  duration: number;
  curve?: "smooth" | "quint" | "stripe" | "expressive";
  dismissAfter?: number; // frames to stay before sliding out (0 = stay)
  style?: React.CSSProperties;
  className?: string;
}

const POS: Record<NotifyPosition, React.CSSProperties> = {
  topRight: { top: 40, right: 40 },
  topLeft: { top: 40, left: 40 },
  bottomRight: { bottom: 40, right: 40 },
  bottomLeft: { bottom: 40, left: 40 },
};

export const Notification: React.FC<NotificationProps> = ({
  title,
  body,
  icon,
  accent = "#00D9FF",
  position = "topRight",
  frame,
  fps,
  start = 0,
  duration,
  curve = "quint",
  dismissAfter = 0,
  style,
  className,
}) => {
  const fromRight = position.endsWith("Right");
  // Slide in, then (optionally) slide back out after dismissAfter.
  let motionStart = start;
  let motionDur = duration;
  let preset = fromRight ? "slideLeft" : "slideRight";
  if (dismissAfter > 0 && frame > start + dismissAfter) {
    motionStart = start + dismissAfter;
    motionDur = duration;
    preset = fromRight ? "slideRight" : "slideLeft";
  }

  const frag = applyPreset(preset, { frame, fps, start: motionStart, duration: motionDur, curve });
  const pos = POS[position];
  const isTop = position.startsWith("top");

  return (
    <AbsoluteFill className={className} style={{ pointerEvents: "none" }}>
      <div
        style={{
          position: "absolute",
          ...pos,
          ...frag,
          width: 340,
          padding: "16px 18px",
          borderRadius: 16,
          background: "rgba(12,16,22,0.72)",
          border: `1px solid ${accent}55`,
          boxShadow: `0 10px 40px rgba(0,0,0,0.5), 0 0 22px ${accent}22`,
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          display: "flex",
          gap: 14,
          alignItems: "flex-start",
          textAlign: "left",
          ...style,
        }}
      >
        {icon && (
          <div style={{ color: accent, fontSize: 22, lineHeight: 1, marginTop: 2 }}>{icon}</div>
        )}
        <div style={{ flex: 1 }}>
          <div
            style={{
              fontSize: 15,
              fontWeight: 700,
              color: "#F5F7FA",
              letterSpacing: "0.01em",
            }}
          >
            {title}
          </div>
          {body && (
            <div style={{ fontSize: 13, color: "rgba(245,247,250,0.7)", marginTop: 4, lineHeight: 1.4 }}>
              {body}
            </div>
          )}
          <div
            style={{
              marginTop: 8,
              height: 3,
              width: "100%",
              borderRadius: 3,
              background: `linear-gradient(90deg, ${accent}, transparent)`,
              transformOrigin: isTop ? "left" : "right",
              opacity: 0.8,
            }}
          />
        </div>
      </div>
    </AbsoluteFill>
  );
};
