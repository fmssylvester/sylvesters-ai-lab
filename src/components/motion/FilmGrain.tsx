interface FilmGrainProps {
  opacity?: number;
}

export default function FilmGrain({ opacity = 0.06 }: FilmGrainProps) {
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        pointerEvents: "none",
        opacity,
        mixBlendMode: "soft-light",
        backgroundImage:
          "radial-gradient(circle, rgba(255,255,255,0.2) 1px, transparent 1px)",
        backgroundSize: "4px 4px",
      }}
    />
  );
}
