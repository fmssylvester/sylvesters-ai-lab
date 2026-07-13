export default function NoiseEngine() {
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        pointerEvents: "none",
        opacity: 0.035,
        backgroundImage: `
          radial-gradient(circle, rgba(255,255,255,.18) 1px, transparent 1px)
        `,
        backgroundSize: "8px 8px",
        mixBlendMode: "soft-light",
      }}
    />
  );
}
