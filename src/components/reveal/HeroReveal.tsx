import { motion } from "framer-motion";

interface HeroRevealProps {
  children: React.ReactNode;
  visible: boolean;
}

export default function HeroReveal({
  children,
  visible,
}: HeroRevealProps) {
  return (
    <motion.div
      initial={{
        opacity: 0,
        scale: 0.985,
        filter: "blur(18px)",
      }}
      animate={{
        opacity: visible ? 1 : 0,
        scale: visible ? 1 : 0.985,
        filter: visible ? "blur(0px)" : "blur(18px)",
      }}
      transition={{
        duration: 0.9,
        ease: [0.22, 1, 0.36, 1],
      }}
      style={{
        position: "absolute",
        inset: 0,
      }}
    >
      {children}
    </motion.div>
  );
}
