import { ReactNode } from "react";

interface CinematicContainerProps {
  children: ReactNode;
}

export default function CinematicContainer({
  children,
}: CinematicContainerProps) {
  return (
    <div
      style={{
        width: "100%",
        height: "100vh",
        background:
          "radial-gradient(circle at center, #0f172a 0%, #000000 65%)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {children}
    </div>
  );
}
