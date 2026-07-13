import { motion } from "framer-motion";

export default function DropletBackground() {
  return (
    <>
      {Array.from({ length: 6 }).map((_, i) => (
        <motion.div
          key={i}
          animate={{
            x: [0, 40, -40, 0],
            y: [0, -20, 20, 0],
            opacity: [0.08, 0.18, 0.08],
          }}
          transition={{
            duration: 10 + i * 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          style={{
            position: "absolute",
            width: 180 + i * 40,
            height: 180 + i * 40,
            borderRadius: "50%",

            background:
              "radial-gradient(circle, rgba(96,165,250,0.18), transparent)",

            top: `${20 + i * 10}%`,
            left: `${10 + i * 12}%`,

            filter: "blur(40px)",
          }}
        />
      ))}
    </>
  );
}
