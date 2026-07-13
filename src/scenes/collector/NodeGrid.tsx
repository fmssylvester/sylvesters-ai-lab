import { useCurrentFrame, interpolate, spring, useVideoConfig } from "remotion";
import { useMemo } from "react";

const CYAN = "#00D9FF";
const GOLD = "#E7B84D";

interface Node {
  x: number;
  y: number;
  appear: number; // frame when this node appears
}

// Deterministic grid layout with heavy organic jitter
function buildNodes(total: number, width: number, height: number): Node[] {
  const cols = Math.ceil(Math.sqrt(total * (width / height)));
  const rows = Math.ceil(total / cols);
  const cellW = width / (cols + 1);
  const cellH = height / (rows + 1);
  const nodes: Node[] = [];
  // Seed-based jitter (deterministic) — heavier for organic feel
  const jitter = (i: number) => ((i * 7919 + 104729) % 100) / 100 - 0.5;
  for (let i = 0; i < total; i++) {
    const col = i % cols;
    const row = Math.floor(i / cols);
    nodes.push({
      x: cellW * (col + 1) + jitter(i) * cellW * 0.7,
      y: cellH * (row + 1) + jitter(i + 500) * cellH * 0.7,
      appear: i,
    });
  }
  return nodes;
}

function dist(a: Node, b: Node) {
  return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);
}

export default function NodeGrid({ activeCount, totalNodes = 40 }: { activeCount: number; totalNodes?: number }) {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  const nodes = useMemo(() => buildNodes(totalNodes, width, height), [totalNodes, width, height]);

  // Lines connect nodes that are close
  const maxDist = Math.min(width, height) * 0.22;

  const visibleNodes = nodes.filter((n) => n.appear < activeCount);

  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden" }}>
      {/* Bloom layer: blurred duplicate — creates the "light source" feel */}
      <svg width={width} height={height} style={{ position: "absolute", filter: "blur(18px)", opacity: 0.6 }}>
        {visibleNodes.map((node, i) => {
          const age = activeCount - node.appear;
          const color = age > 15 ? GOLD : CYAN;
          const pop = spring({ frame: frame - node.appear, fps, config: { damping: 14, stiffness: 160 } });
          // Subtle breathing: sinusoidal pulse after appearing
          const breathe = 1 + 0.2 * Math.sin((frame - node.appear) * 0.08 + i * 1.3);
          return (
            <circle key={`b${i}`} cx={node.x} cy={node.y} r={14 * pop * breathe} fill={color} />
          );
        })}
        {visibleNodes.map((node, i) =>
          visibleNodes.slice(i + 1).map((other, j) => {
            if (dist(node, other) > maxDist) return null;
            const age = Math.max(activeCount - node.appear, activeCount - other.appear);
            const color = age > 15 ? GOLD : CYAN;
            return (
              <line key={`bl${i}_${j}`} x1={node.x} y1={node.y} x2={other.x} y2={other.y}
                stroke={color} strokeWidth={2.5} opacity={0.5} />
            );
          })
        )}
      </svg>

      {/* Sharp layer */}
      <svg width={width} height={height} style={{ position: "absolute" }}>
        {visibleNodes.map((node, i) => {
          const age = activeCount - node.appear;
          const color = age > 15 ? GOLD : CYAN;
          const pop = spring({ frame: frame - node.appear, fps, config: { damping: 14, stiffness: 160 } });
          const breathe = 1 + 0.1 * Math.sin((frame - node.appear) * 0.08 + i * 1.3);
          const scale = (1 + (1 - pop) * 0.5) * breathe;
          return (
            <g key={`s${i}`} transform={`translate(${node.x},${node.y}) scale(${scale})`}>
              <circle r={6} fill={color} />
              <circle r={14} fill="none" stroke={color} strokeWidth={0.8} opacity={0.5 * pop} />
            </g>
          );
        })}
        {visibleNodes.map((node, i) =>
          visibleNodes.slice(i + 1).map((other, j) => {
            if (dist(node, other) > maxDist) return null;
            const age = Math.max(activeCount - node.appear, activeCount - other.appear);
            const color = age > 15 ? GOLD : CYAN;
            return (
              <line key={`sl${i}_${j}`} x1={node.x} y1={node.y} x2={other.x} y2={other.y}
                stroke={color} strokeWidth={1.2} opacity={0.35} />
            );
          })
        )}
    </svg>
    </div>
  );
}
