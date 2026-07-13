import { motion } from "framer-motion";
import { useMotionDirector } from "../../core/motion/useMotionDirector";
import { motionTimeline } from "../../core/motion/motionTimeline";

export default function GlassReflection() {

  const { elapsed } = useMotionDirector();

  const active =
    elapsed > motionTimeline.reflectionStart &&
    elapsed < motionTimeline.reflectionEnd;

  return (
    <motion.div
      animate={{
        x: active ? [-600, 600] : -600,
        opacity: active ? [0, 0.5, 0] : 0,
      }}
      transition={{
        duration: 2.2,
        ease: "easeInOut",
      }}
      style={{
        position: "absolute",
        top: "-20%",
        left: 0,
        width: "220px",
        height: "160%",
        transform: "rotate(-18deg)",
        background:
          "linear-gradient(90deg, transparent, rgba(255,255,255,.18), transparent)",
        filter: "blur(20px)",
        pointerEvents: "none",
      }}
    />
  );
}
