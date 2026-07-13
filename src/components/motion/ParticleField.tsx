import { useCurrentFrame, useVideoConfig, interpolate } from "remotion";
import { useMemo } from "react";

interface Particle {
  x: number;
  y: number;
  size: number;
  speed: number;
  opacity: number;
  delay: number;
}

interface ParticleFieldProps {
  count?: number;
  color?: string;
  maxSize?: number;
  drift?: "up" | "down" | "random";
  opacity?: number;
}

function seededRandom(seed: number) {
  const x = Math.sin(seed * 91.17 + 13.37) * 43758.5453;
  return x - Math.floor(x);
}

export default function ParticleField({
  count = 30,
  color = "#00D9FF",
  maxSize = 3,
  drift = "random",
  opacity = 0.4,
}: ParticleFieldProps) {
  const frame = useCurrentFrame();
  const { width, height, fps } = useVideoConfig();

  const particles = useMemo<Particle[]>(() => {
    return Array.from({ length: count }, (_, i) => ({
      x: seededRandom(i * 7 + 1) * width,
      y: seededRandom(i * 13 + 5) * height,
      size: 1 + seededRandom(i * 3 + 9) * (maxSize - 1),
      speed: 0.2 + seededRandom(i * 11 + 3) * 0.6,
      opacity: 0.2 + seededRandom(i * 17 + 7) * 0.8,
      delay: seededRandom(i * 19 + 11) * 60,
    }));
  }, [count, width, height, maxSize]);

  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden" }}>
      {particles.map((p, i) => {
        const t = (frame + p.delay) * p.speed;
        const breathe = 0.5 + 0.5 * Math.sin(t * 0.04 + i);
        let y = p.y;
        if (drift === "up") y = (p.y - t * 0.5) % height;
        else if (drift === "down") y = (p.y + t * 0.5) % height;
        else y = p.y + Math.sin(t * 0.02) * 20;

        if (y < -10) y += height;
        if (y > height + 10) y -= height;

        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: p.x + Math.sin(t * 0.015 + i) * 15,
              top: y,
              width: p.size,
              height: p.size,
              borderRadius: "50%",
              background: color,
              opacity: p.opacity * breathe * opacity,
              boxShadow: `0 0 ${p.size * 3}px ${color}66`,
            }}
          />
        );
      })}
    </div>
  );
}
