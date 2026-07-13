import { motion } from "framer-motion";

export default function AnimatedBackground() {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        overflow: "hidden",
        zIndex: -1,
        background: "#07090D",
      }}
    >
      <motion.div
        animate={{
          x: [0, 120, -80, 0],
          y: [0, -60, 100, 0],
        }}
        transition={{
          duration: 24,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        style={{
          position: "absolute",
          width: 700,
          height: 700,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(59,130,246,.35) 0%, rgba(59,130,246,0) 70%)",
          filter: "blur(80px)",
          top: "-200px",
          left: "-200px",
        }}
      />

      <motion.div
        animate={{
          x: [0, -100, 80, 0],
          y: [0, 100, -60, 0],
        }}
        transition={{
          duration: 30,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        style={{
          position: "absolute",
          width: 600,
          height: 600,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(0,217,255,.22) 0%, rgba(0,217,255,0) 70%)",
          filter: "blur(100px)",
          bottom: "-180px",
          right: "-180px",
        }}
      />
    </div>
  );
}
