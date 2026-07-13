interface VignetteProps {
  intensity?: number;
  softness?: number;
  color?: string;
}

export default function Vignette({
  intensity = 0.5,
  softness = 40,
  color = "rgba(0,0,0,1)",
}: VignetteProps) {
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        pointerEvents: "none",
        background: `radial-gradient(circle at center, transparent ${softness}%, ${color} ${softness + 35}%)`,
        opacity: intensity,
      }}
    />
  );
}
