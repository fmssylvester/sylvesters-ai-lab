// ScreenDemo — A screenshot/screen recording with animated annotation overlays.
// The image IS the content. Annotations highlight what to look at.
// Used for showing tools, UI, code, results.

import React from "react";
import { AbsoluteFill, Img, useCurrentFrame, useVideoConfig, interpolate, spring } from "remotion";

interface Annotation {
  x: number;       // percentage from left (0-100)
  y: number;       // percentage from top (0-100)
  label: string;
  color?: string;
  delay?: number;
  arrow?: "up" | "down" | "left" | "right";
}

interface ScreenDemoProps {
  imageSrc: string;
  annotations?: Annotation[];
  delay?: number;
  zoomTo?: { x: number; y: number; scale: number }; // zoom target
  zoomFrame?: number; // frame to start zoom
}

export const ScreenDemo: React.FC<ScreenDemoProps> = ({
  imageSrc,
  annotations = [],
  delay = 0,
  zoomTo,
  zoomFrame,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const local = frame - delay;

  if (local < 0) return null;

  // Image entrance
  const imageScale = spring({
    frame: local,
    fps,
    config: { stiffness: 180, damping: 20 },
  });

  // Zoom animation
  const zoomProgress = zoomTo && zoomFrame
    ? interpolate(
        frame,
        [zoomFrame, zoomFrame + 30],
        [0, 1],
        { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
      )
    : 0;

  const finalZoom = zoomTo
    ? 1 + (zoomTo.scale - 1) * zoomProgress
    : 1;

  const panX = zoomTo ? -zoomTo.x * zoomProgress * 0.5 : 0;
  const panY = zoomTo ? -zoomTo.y * zoomProgress * 0.3 : 0;

  return (
    <AbsoluteFill style={{ background: "#07080F" }}>
      {/* Image with zoom */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
          transform: `scale(${imageScale})`,
        }}
      >
        <Img
          src={imageSrc}
          style={{
            width: "90%",
            height: "auto",
            maxHeight: "85%",
            objectFit: "contain",
            borderRadius: 12,
            boxShadow: "0 40px 100px rgba(0,0,0,0.6)",
            transform: `scale(${finalZoom}) translate(${panX}%, ${panY}%)`,
          }}
        />
      </div>

      {/* Annotations */}
      {annotations.map((ann, i) => {
        const annDelay = delay + 10 + (ann.delay ?? i * 6);
        const annLocal = frame - annDelay;
        if (annLocal < 0) return null;

        const annScale = spring({
          frame: annLocal,
          fps,
          config: { stiffness: 300, damping: 22 },
        });

        const color = ann.color ?? "#00D9FF";
        const arrowChars: Record<string, string> = {
          up: "↓", down: "↑", left: "→", right: "←",
        };

        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: `${ann.x}%`,
              top: `${ann.y}%`,
              transform: `scale(${annScale}) translate(-50%, -50%)`,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 4,
            }}
          >
            {ann.arrow && (
              <div
                style={{
                  fontFamily: "'Switzer', sans-serif",
                  fontSize: 32,
                  color,
                  textShadow: `0 0 20px ${color}66`,
                }}
              >
                {arrowChars[ann.arrow]}
              </div>
            )}
            <div
              style={{
                fontFamily: "'Switzer', sans-serif",
                fontWeight: 700,
                fontSize: 18,
                color,
                background: "rgba(0,0,0,0.8)",
                padding: "6px 14px",
                borderRadius: 6,
                border: `1px solid ${color}44`,
                whiteSpace: "nowrap",
                textShadow: `0 0 12px ${color}44`,
              }}
            >
              {ann.label}
            </div>
          </div>
        );
      })}
    </AbsoluteFill>
  );
};
