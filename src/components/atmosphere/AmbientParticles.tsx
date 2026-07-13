import { useMemo } from "react";
import { motion } from "framer-motion";

function seededRandom(seed: number) {
  const x = Math.sin(seed * 127.1) * 43758.5453;
  return x - Math.floor(x);
}

export default function AmbientParticles() {
  const particles = useMemo(
    () =>
      Array.from({ length: 32 }, (_, i) => ({
        x: seededRandom(i * 1) * 100,
        size: 4 + seededRandom(i * 2 + 0.5) * 10,
        duration: 20 + seededRandom(i * 3 + 1.2) * 20,
        delay: seededRandom(i * 4 + 2.7) * 15,
      })),
    []
  );

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        overflow: "hidden",
        pointerEvents: "none",
        zIndex: 0,
      }}
    >
      {particles.map((p, i) => (
        <motion.div
          key={i}
          initial={{
            y: 120,
            opacity: 0,
          }}
          animate={{
            y: -120,
            opacity: [0, 0.35, 0.15, 0],
          }}
          transition={{
            duration: p.duration,
            repeat: Infinity,
            delay: p.delay,
            ease: "linear",
          }}
          style={{
            position: "absolute",
            left: `${p.x}%`,
            bottom: "-40px",
            width: p.size,
            height: p.size,
            borderRadius: "999px",
            background: "rgba(180,220,255,0.75)",
            filter: "blur(3px)",
          }}
        />
      ))}
    </div>
  );
}
