export default function HeroSpotlight() {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        pointerEvents: "none",
        zIndex: 0,
        background:
          "radial-gradient(circle at 50% 28%, rgba(255,255,255,0.10), rgba(255,255,255,0.03) 18%, rgba(255,255,255,0.00) 55%)",
      }}
    />
  );
}
