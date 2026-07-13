import { motion } from "framer-motion";
import { ReactNode } from "react";
import { motionTokens } from "../../core/motion/motionTokens";

interface CameraEngineProps {
  children: ReactNode;
}

export default function CameraEngine({
  children,
}: CameraEngineProps) {
  return (
    <motion.div
      animate={{
        y: [0, -4, 0],
        scale: [1, 1.003, 1],
      }}
      transition={{
        duration: motionTokens.duration.hero,
        repeat: Infinity,
        repeatType: "mirror",
        ease: motionTokens.easing.standard,
      }}
      style={{
        width: "100%",
        height: "100%",
      }}
    >
      {children}
    </motion.div>
  );
}
