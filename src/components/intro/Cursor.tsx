import { motion } from "framer-motion";

export default function Cursor() {
  return (
    <motion.span
      animate={{
        opacity: [0.25, 1, 0.25],
      }}
      transition={{
        duration: 1.2,
        repeat: Infinity,
        ease: "easeInOut",
      }}
      style={{
        color: "#60A5FA",
        marginLeft: 4,
        textShadow: "0 0 10px rgba(96,165,250,.6)",
        fontWeight: 300,
      }}
    >
      |
    </motion.span>
  );
}
