import { ReactNode } from "react";
import { layers } from "../../core/layout/layers";
import GlassReflection from "./GlassReflection";

interface GlassPanelProps {
  children: ReactNode;
}

export default function GlassPanel({
  children,
}: GlassPanelProps) {
  return (
    <div
      style={{
        position: "relative",

        zIndex: layers.glass,

        width: "min(1320px,95vw)",

        borderRadius: "34px",

        overflow: "hidden",

        background:
          "linear-gradient(180deg, rgba(255,255,255,.08), rgba(255,255,255,.04))",

        backdropFilter: "blur(28px)",
        WebkitBackdropFilter: "blur(28px)",

        border: "1px solid rgba(255,255,255,.12)",

        boxShadow:
          "0 40px 120px rgba(0,0,0,.45), inset 0 1px rgba(255,255,255,.18)",
      }}
    >
      <GlassReflection />

      {children}
    </div>
  );
}
