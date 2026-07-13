import { useState, useEffect } from "react";

interface Props {
  size?: number;
  color?: string;
  speed?: number;
}

export default function LoadingSpinner({ size = 48, color = "#00D9FF", speed = 1600 }: Props) {
  const [rotation, setRotation] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setRotation((prev) => (prev + 6) % 360);
    }, speed / 60);
    return () => clearInterval(interval);
  }, [speed]);

  const pulseOpacity = 0.4 + Math.sin((rotation * Math.PI) / 180) * 0.25;

  return (
    <div
      style={{
        width: size,
        height: size,
        position: "relative",
        opacity: pulseOpacity,
      }}
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 48 48"
        style={{ transform: `rotate(${rotation}deg)` }}
      >
        <circle
          cx="24"
          cy="24"
          r="20"
          fill="none"
          stroke={color}
          strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray={`${Math.PI * 40 * 0.65} ${Math.PI * 40 * 0.35}`}
          opacity={0.2}
        />
        <circle
          cx="24"
          cy="24"
          r="20"
          fill="none"
          stroke={color}
          strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray={`${Math.PI * 40 * 0.65} ${Math.PI * 40 * 0.35}`}
          opacity={0.9}
          style={{ transform: "rotate(-90deg)", transformOrigin: "center" }}
        />
      </svg>
    </div>
  );
}
