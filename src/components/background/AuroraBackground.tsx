import { motion } from "framer-motion";
import { motionTokens } from "../../core/motion/motionTokens";

export default function AuroraBackground() {
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        overflow: "hidden",
        pointerEvents: "none",
      }}
    >
      <motion.div
        animate={{
          x: [-120, 120, -120],
          y: [-60, 40, -60],
          rotate: [0, 8, 0],
        }}
        transition={{
          duration: motionTokens.duration.atmosphere,
          repeat: Infinity,
          ease: motionTokens.easing.standard,
        }}
        style={{
          position: "absolute",
          width: 900,
          height: 900,
          left: "50%",
          top: "45%",
          transform: "translate(-50%, -50%)",
          borderRadius: "50%",
          filter: "blur(140px)",
          opacity: 0.22,
          background:
            "radial-gradient(circle, #60a5fa 0%, #2563eb 35%, transparent 75%)",
        }}
      />
    </div>
  );
}
