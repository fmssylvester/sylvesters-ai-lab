import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import DropletScene from "../../scenes/demo/DropletScene";

type State = "intro" | "explainer";

export function TransitionEngine({
  children,
}: {
  children: React.ReactNode;
}) {
  const [state, setState] = useState<State>("intro");

  useEffect(() => {
    const timer = setTimeout(() => {
      setState("explainer");
    }, 6000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <AnimatePresence mode="wait">
      {state === "intro" && (
        <motion.div
          key="intro"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1 }}
        >
          {children}
        </motion.div>
      )}

      {state === "explainer" && (
        <motion.div
          key="explainer"
          initial={{
            opacity: 0,
            scale: 1.05,
            filter: "blur(12px)",
          }}
          animate={{
            opacity: 1,
            scale: 1,
            filter: "blur(0px)",
          }}
          transition={{
            duration: 1.3,
            ease: "easeInOut",
          }}
          style={{
            width: "100%",
            height: "100%",
            background: "radial-gradient(circle at center, #0B1220, #050914)",
          }}
        >
          <DropletScene />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
