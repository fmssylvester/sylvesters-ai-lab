// DataChart — Simple animated bar chart or ranking.
// Bars animate in from left, labels appear after.
// Used for comparisons, metrics, rankings.

import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring } from "remotion";

interface DataItem {
  label: string;
  value: number;
  color?: string;
}

interface DataChartProps {
  items: DataItem[];
  title?: string;
  delay?: number;
  maxValue?: number;
  layout?: "horizontal" | "vertical";
}

export const DataChart: React.FC<DataChartProps> = ({
  items,
  title,
  delay = 0,
  maxValue,
  layout = "horizontal",
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const local = frame - delay;

  if (local < 0) return null;

  const max = maxValue ?? Math.max(...items.map((i) => i.value));
  const colors = ["#00D9FF", "#E7B84D", "#FF6B6B", "#60A5FA", "#34D399"];

  return (
    <AbsoluteFill
      style={{
        background: "#07080F",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "60px 120px",
      }}
    >
      {title && (
        <div
          style={{
            fontFamily: "'Melodrama', 'Switzer', sans-serif",
            fontWeight: 700,
            fontSize: 42,
            color: "#FFFFFF",
            marginBottom: 48,
            opacity: interpolate(local, [0, 8], [0, 1], { extrapolateRight: "clamp" }),
          }}
        >
          {title}
        </div>
      )}

      <div
        style={{
          display: "flex",
          flexDirection: layout === "horizontal" ? "column" : "row",
          gap: layout === "horizontal" ? 24 : 0,
          width: "100%",
          maxWidth: 1200,
          alignItems: layout === "horizontal" ? "stretch" : "flex-end",
          justifyContent: layout === "horizontal" ? undefined : "center",
          height: layout === "vertical" ? 500 : undefined,
        }}
      >
        {items.map((item, i) => {
          const barDelay = delay + 4 + i * 4;
          const barLocal = frame - barDelay;
          if (barLocal < 0) return null;

          const barProgress = spring({
            frame: barLocal,
            fps,
            config: { stiffness: 150, damping: 18 },
          });

          const barColor = item.color ?? colors[i % colors.length];
          const pct = (item.value / max) * 100;

          if (layout === "horizontal") {
            return (
              <div key={i} style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {/* Label */}
                <div
                  style={{
                    fontFamily: "'Switzer', sans-serif",
                    fontSize: 22,
                    color: "#F1F5F9",
                    opacity: interpolate(barLocal, [4, 10], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
                  }}
                >
                  {item.label}
                </div>
                {/* Bar */}
                <div
                  style={{
                    height: 40,
                    background: "rgba(255,255,255,0.06)",
                    borderRadius: 8,
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      width: `${pct * barProgress}%`,
                      height: "100%",
                      background: barColor,
                      borderRadius: 8,
                      boxShadow: `0 0 20px ${barColor}44`,
                    }}
                  />
                </div>
                {/* Value */}
                <div
                  style={{
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: 18,
                    color: barColor,
                    opacity: interpolate(barLocal, [8, 14], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
                  }}
                >
                  {item.value.toLocaleString()}
                </div>
              </div>
            );
          }

          // Vertical layout
          const height = (pct * barProgress * 5);
          return (
            <div
              key={i}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 8,
                margin: "0 12px",
              }}
            >
              <div
                style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: 18,
                  color: barColor,
                  opacity: interpolate(barLocal, [8, 14], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
                }}
              >
                {item.value.toLocaleString()}
              </div>
              <div
                style={{
                  width: 60,
                  height,
                  background: barColor,
                  borderRadius: "8px 8px 0 0",
                  boxShadow: `0 0 20px ${barColor}44`,
                }}
              />
              <div
                style={{
                  fontFamily: "'Switzer', sans-serif",
                  fontSize: 16,
                  color: "#F1F5F9",
                  textAlign: "center",
                  opacity: interpolate(barLocal, [4, 10], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
                }}
              >
                {item.label}
              </div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
