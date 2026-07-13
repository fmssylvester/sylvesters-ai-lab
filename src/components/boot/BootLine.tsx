import { motion } from "framer-motion";

interface BootLineProps {
  text: string;
  delay: number;
}

export default function BootLine({
  text,
  delay,
}: BootLineProps) {
  return (
    <motion.div
      initial={{
        opacity: 0,
        y: 8,
        filter: "blur(8px)",
      }}
      animate={{
        opacity: 1,
        y: 0,
        filter: "blur(0px)",
      }}
      transition={{
        delay,
        duration: 0.5,
        ease: [0.22, 1, 0.36, 1],
      }}
      style={{
        color: "#B8C5D6",
        fontSize: "30px",
        fontWeight: 600,
        letterSpacing: "0.8px",
        whiteSpace: "nowrap",
      }}
    >
      {text}
    </motion.div>
  );
}
