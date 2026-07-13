import { useCurrentFrame, useVideoConfig, spring, interpolate } from "remotion";

interface CursorPath {
  frame: number;
  x: number;
  y: number;
}

interface AnimatedCursorProps {
  path: CursorPath[];
  clickFrame?: number;
  size?: number;
  visible?: boolean;
}

export default function AnimatedCursor({
  path,
  clickFrame,
  size = 24,
  visible = true,
}: AnimatedCursorProps) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  if (!visible) return null;

  // Find current position along path
  let currentX = path[0]?.x || 0;
  let currentY = path[0]?.y || 0;

  for (let i = 0; i < path.length - 1; i++) {
    const a = path[i];
    const b = path[i + 1];
    if (frame >= a.frame && frame <= b.frame) {
      const t = interpolate(frame, [a.frame, b.frame], [0, 1], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      });
      // Smooth easing
      const ease = t * t * (3 - 2 * t);
      currentX = a.x + (b.x - a.x) * ease;
      currentY = a.y + (b.y - a.y) * ease;
      break;
    }
    if (frame > b.frame) {
      currentX = b.x;
      currentY = b.y;
    }
  }

  // Click animation
  const isClicking = clickFrame !== undefined && frame >= clickFrame;
  const clickPop = isClicking
    ? spring({
        frame: frame - clickFrame!,
        fps,
        config: { damping: 12, stiffness: 200 },
      })
    : 0;

  const clickScale = 1 + clickPop * 0.15;
  const clickRing = clickPop * 20;

  return (
    <div
      style={{
        position: "absolute",
        left: currentX,
        top: currentY,
        transform: `translate(-2px, -2px) scale(${clickScale})`,
        zIndex: 1000,
        pointerEvents: "none",
      }}
    >
      {/* Click ripple ring */}
      {isClicking && clickPop > 0 && (
        <div
          style={{
            position: "absolute",
            left: size / 2,
            top: size / 2,
            width: clickRing,
            height: clickRing,
            borderRadius: "50%",
            border: "2px solid rgba(66,133,244,0.5)",
            transform: "translate(-50%, -50%)",
            opacity: 1 - clickPop,
          }}
        />
      )}

      {/* Cursor SVG */}
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        style={{ filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.3))" }}
      >
        <path
          d="M5 3L19 12L12 13L9 20L5 3Z"
          fill="white"
          stroke="#333"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}
