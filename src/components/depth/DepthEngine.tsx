import { motion } from "framer-motion";
import { motionTokens } from "../../core/motion/motionTokens";
import { layers } from "../../core/layout/layers";

export default function DepthEngine() {
  return (
    <>
      <motion.div
        animate={{
          x: [-40, 40, -40],
          y: [-20, 20, -20],
        }}
        transition={{
          duration: motionTokens.duration.atmosphere,
          repeat: Infinity,
          ease: motionTokens.easing.standard,
        }}
        style={{
          position: "absolute",
          width: 700,
          height: 700,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(96,165,250,0.08), transparent 70%)",
          filter: "blur(120px)",
          top: "18%",
          left: "12%",
          zIndex: layers.background + 5,
          pointerEvents: "none",
        }}
      />

      <motion.div
        animate={{
          x: [30, -30, 30],
          y: [15, -15, 15],
        }}
        transition={{
          duration: motionTokens.duration.atmosphere + 10,
          repeat: Infinity,
          ease: motionTokens.easing.standard,
        }}
        style={{
          position: "absolute",
          width: 600,
          height: 600,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(168,85,247,0.06), transparent 70%)",
          filter: "blur(130px)",
          bottom: "10%",
          right: "10%",
          zIndex: layers.background + 6,
          pointerEvents: "none",
        }}
      />
    </>
  );
}
