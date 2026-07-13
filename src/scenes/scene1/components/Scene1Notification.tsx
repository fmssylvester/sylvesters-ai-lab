import { motion, AnimatePresence } from "framer-motion";

interface Props {
  text: string;
  arriveAt: number;
  currentFrame: number;
  onArrive?: () => void;
}

export default function Scene1Notification({
  text,
  arriveAt,
  currentFrame,
  onArrive,
}: Props) {
  const visible = currentFrame >= arriveAt;

  if (visible) {
    onArrive?.();
  }

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ x: 200, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 200, opacity: 0 }}
          transition={{
            duration: 0.6,
            ease: [0.22, 1, 0.36, 1],
          }}
          style={{
            padding: "10px 18px",
            borderRadius: 12,
            background: "rgba(15,23,42,0.9)",
            backdropFilter: "blur(16px)",
            border: "1px solid rgba(255,255,255,0.1)",
            boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
            fontSize: 13,
            color: "#F5F7FA",
            whiteSpace: "nowrap",
            display: "flex",
            alignItems: "center",
            gap: 10,
            zIndex: 60,
          }}
        >
          <div
            style={{
              width: 6,
              height: 6,
              borderRadius: "50%",
              background: "#00D9FF",
              boxShadow: "0 0 8px rgba(0,217,255,0.5)",
              animation: "pulse-dot 1.5s ease-in-out infinite",
            }}
          />
          {text}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
