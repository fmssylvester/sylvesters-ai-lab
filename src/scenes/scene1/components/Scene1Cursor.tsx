import { motion } from "framer-motion";
import { useMemo } from "react";

interface Props {
  appearAt: number;
  hesitateAt: number;
  freezeAt: number;
  currentFrame: number;
}

export default function Scene1Cursor({
  appearAt,
  hesitateAt,
  freezeAt,
  currentFrame,
}: Props) {
  const state = useMemo(() => {
    if (currentFrame < appearAt) return "hidden";
    if (currentFrame < hesitateAt) return "approaching";
    if (currentFrame < freezeAt) return "hesitating";
    return "frozen";
  }, [currentFrame, appearAt, hesitateAt, freezeAt]);

  if (state === "hidden") return null;

  const isFrozen = state === "frozen";

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{
        opacity: isFrozen ? 0.6 : 1,
        x: state === "approaching"
          ? [0, 0]
          : state === "hesitating"
          ? [0, -2, 2, -1, 1, 0]
          : 0,
        y: state === "approaching" ? [40, 40] : 0,
      }}
      transition={{
        duration: state === "hesitating" ? 0.4 : 0.6,
        ease: "easeInOut",
      }}
      style={{
        position: "absolute",
        width: 18,
        height: 18,
        borderRadius: "50%",
        background: "rgba(0,217,255,0.35)",
        boxShadow: "0 0 12px rgba(0,217,255,0.2), 0 0 30px rgba(0,217,255,0.1)",
        pointerEvents: "none",
        zIndex: 70,
        top: "50%",
        left: "50%",
        marginTop: 20,
        marginLeft: 20,
        transform: isFrozen ? "none" : undefined,
      }}
    />
  );
}
