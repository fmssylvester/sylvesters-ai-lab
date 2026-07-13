import { useCurrentFrame, useVideoConfig, interpolate } from "remotion";

interface DepthLayerProps {
  children: React.ReactNode;
  depth: number;
  cameraX?: number;
  cameraY?: number;
  cameraZoom?: number;
  style?: React.CSSProperties;
}

export default function DepthLayer({
  children,
  depth,
  cameraX = 0,
  cameraY = 0,
  cameraZoom = 1,
  style = {},
}: DepthLayerProps) {
  const frame = useCurrentFrame();

  const parallaxX = cameraX * depth * -0.5;
  const parallaxY = cameraY * depth * -0.5;
  const scale = 1 + (cameraZoom - 1) * depth * 0.3;
  const blur = depth < 0 ? Math.abs(depth) * 2 : 0;

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        transform: `translate(${parallaxX}px, ${parallaxY}px) scale(${scale})`,
        filter: blur > 0 ? `blur(${blur}px)` : undefined,
        ...style,
      }}
    >
      {children}
    </div>
  );
}
