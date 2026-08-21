// Reusable bar-chart (feeds the "Data Visualization Pack").
//
// Animated bars that grow from a common baseline with a per-bar stagger.
// Frame-driven, pure, headless-safe. Drop into a GlassPanel or dashboard scene
// to visualise comparisons, benchmarks, or "before/after" metrics. Colours use
// the brand signal so it stays on-system. Pairs with Counter (count-up) for
// number-led storytelling.

import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate } from "remotion";
import { sampleCurve, CurveName } from "../../core/motion/AnimationCurves";

export interface BarChartProps {
  data: number[]; // raw values
  frame: number;
  fps: number;
  start?: number;
  duration: number;
  curve?: CurveName;
  color?: string;
  max?: number; // override auto-scaled max
  gap?: number; // px between bars
  showValue?: boolean;
  labels?: string[];
  style?: React.CSSProperties;
  className?: string;
}

export const BarChart: React.FC<BarChartProps> = ({
  data,
  frame,
  fps,
  start = 0,
  duration,
  curve = "smooth",
  color = "#00D9FF",
  max,
  gap = 14,
  showValue = false,
  labels,
  style,
  className,
}) => {
  const m = max ?? Math.max(...data, 1);
  const stagger = Math.max(1, Math.floor(duration * 0.08));

  return (
    <AbsoluteFill
      className={className}
      style={{
        ...style,
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "center",
        gap,
        padding: 24,
        pointerEvents: "none",
      }}
    >
      {data.map((v, i) => {
        const p = interpolate((frame - start - i * stagger) / Math.max(1, duration), [0, 1], [0, 1], {
          easing: (t) => sampleCurve(curve, t),
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        });
        const frac = m > 0 ? v / m : 0;
        return (
          <div
            key={i}
            style={{
              height: "100%",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              flex: 1,
              maxWidth: 80,
            }}
          >
            {showValue && (
              <div style={{ color: "#F5F7FA", fontSize: 14, fontWeight: 700, marginBottom: 6 }}>
                {Math.round(v)}
              </div>
            )}
            <div
              style={{
                flex: 1,
                width: "100%",
                display: "flex",
                alignItems: "flex-end",
                justifyContent: "center",
              }}
            >
              <div
                style={{
                  width: "100%",
                  height: `${frac * 100}%`,
                  transform: `scaleY(${p})`,
                  transformOrigin: "bottom",
                  background: `linear-gradient(180deg, ${color}, ${color}55)`,
                  borderRadius: "6px 6px 0 0",
                  boxShadow: `0 0 18px ${color}33`,
                }}
              />
            </div>
            {labels && labels[i] && (
              <div style={{ marginTop: 8, color: "rgba(245,247,250,0.6)", fontSize: 12 }}>{labels[i]}</div>
            )}
          </div>
        );
      })}
    </AbsoluteFill>
  );
};
