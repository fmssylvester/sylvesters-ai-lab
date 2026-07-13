export default function FilmGrain() {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        pointerEvents: "none",
        opacity: 0.08,
        mixBlendMode: "soft-light",
        backgroundImage:
          "radial-gradient(circle, rgba(255,255,255,.25) 1px, transparent 1px)",
        backgroundSize: "4px 4px",
        zIndex: 1,
      }}
    />
  );
}
