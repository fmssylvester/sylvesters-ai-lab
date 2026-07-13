interface GradientBackgroundProps {
  variant?: "void" | "bloom" | "mesh";
  bloomColor?: string;
  bloomPosition?: { x: string; y: string };
  style?: React.CSSProperties;
}

export default function GradientBackground({
  variant = "void",
  bloomColor = "rgba(0,60,80,0.12)",
  bloomPosition = { x: "50%", y: "45%" },
  style = {},
}: GradientBackgroundProps) {
  if (variant === "bloom") {
    return (
      <div style={{ position: "absolute", inset: 0, ...style }}>
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "#07090D",
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: `radial-gradient(ellipse 60% 50% at ${bloomPosition.x} ${bloomPosition.y}, ${bloomColor} 0%, transparent 70%)`,
          }}
        />
      </div>
    );
  }

  if (variant === "mesh") {
    return (
      <div style={{ position: "absolute", inset: 0, ...style }}>
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "#07090D",
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: `
              radial-gradient(ellipse 40% 35% at 30% 40%, rgba(0,60,80,0.1) 0%, transparent 70%),
              radial-gradient(ellipse 35% 40% at 70% 60%, rgba(80,60,0,0.06) 0%, transparent 70%)
            `,
          }}
        />
      </div>
    );
  }

  // void — subtle noise texture
  return (
    <div style={{ position: "absolute", inset: 0, ...style }}>
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "#07090D",
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          opacity: 0.03,
          backgroundImage:
            "radial-gradient(circle, rgba(255,255,255,0.3) 1px, transparent 1px)",
          backgroundSize: "3px 3px",
        }}
      />
    </div>
  );
}
