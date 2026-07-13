import { motion } from "framer-motion";

export default function VolumetricLight() {
  return (
    <motion.div
      animate={{
        x: [-120, 120, -120],
        opacity: [0.18, 0.32, 0.18],
        scale: [1, 1.08, 1],
      }}
      transition={{
        duration: 18,
        repeat: Infinity,
        ease: "easeInOut",
      }}
      style={{
        position: "absolute",
        width: "900px",
        height: "900px",
        borderRadius: "50%",
        background:
          "radial-gradient(circle, rgba(90,140,255,.18) 0%, rgba(90,140,255,.06) 35%, transparent 75%)",
        filter: "blur(120px)",
        pointerEvents: "none",
      }}
    />
  );
}
