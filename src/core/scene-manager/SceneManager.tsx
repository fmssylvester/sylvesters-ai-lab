import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

import Hero from "../../sections/Hero";

type Scene = "landing";

export function SceneManager({
  initialScene = "landing",
}: {
  initialScene: Scene;
}) {
  const [scene] = useState<Scene>(initialScene);

  // Future: MotionDirector will control this
  useEffect(() => {
    const timer = setTimeout(() => {
      // placeholder for future scene switching logic
    }, 10000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <AnimatePresence mode="wait">
      {scene === "landing" && (
        <motion.div
          key="landing"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.2 }}
        >
          <Hero />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
