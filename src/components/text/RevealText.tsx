import { motion } from "framer-motion";
import { ReactNode } from "react";

interface RevealTextProps {
  children: ReactNode;
  delay?: number;
}

export default function RevealText({
  children,
  delay = 0,
}: RevealTextProps) {
  return (
    <motion.div
      initial={{
        opacity: 0,
        y: 30,
        filter: "blur(12px)",
      }}
      animate={{
        opacity: 1,
        y: 0,
        filter: "blur(0px)",
      }}
      transition={{
        duration: 1.2,
        delay,
      }}
    >
      {children}
    </motion.div>
  );
}
