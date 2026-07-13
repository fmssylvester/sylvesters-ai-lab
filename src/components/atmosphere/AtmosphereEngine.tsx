import { motion } from "framer-motion";
import { motionTokens } from "../../core/motion/motionTokens";

export default function AtmosphereEngine() {
  return (
    <>
      <motion.div
        animate={{
          opacity: [0.05, 0.08, 0.05],
          scale: [1, 1.05, 1],
        }}
        transition={{
          duration: motionTokens.duration.atmosphere,
          repeat: Infinity,
          ease: motionTokens.easing.standard,
        }}
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          background:
            "radial-gradient(circle at center, rgba(96,165,250,0.08), transparent 70%)",
          filter: "blur(120px)",
        }}
      />
    </>
  );
}
