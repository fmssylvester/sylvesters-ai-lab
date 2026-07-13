export default function Vignette() {
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        pointerEvents: "none",
        background:
          "radial-gradient(circle at center, transparent 40%, rgba(0,0,0,.55) 100%)",
      }}
    />
  );
}
