import { motion } from "framer-motion";

export default function ParticleEngine() {
  return (
    <>
      {Array.from({ length: 18 }).map((_, i) => (
        <motion.div
          key={i}
          animate={{
            y: [-20, 20, -20],
            x: [-10, 10, -10],
            opacity: [0.15, 0.35, 0.15],
          }}
          transition={{
            duration: 18 + i,
            repeat: Infinity,
          }}
          style={{
            position: "absolute",
            width: 3,
            height: 3,
            borderRadius: "50%",
            background: "rgba(255,255,255,.35)",
            left: `${8 + i * 5}%`,
            top: `${10 + (i % 8) * 10}%`,
            filter: "blur(.5px)",
            pointerEvents: "none",
          }}
        />
      ))}
    </>
  );
}
