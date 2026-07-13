import { motion } from "framer-motion";

type Item = {
  title: string;
  description?: string;
};

export default function RevealList({
  items,
}: {
  items: Item[];
}) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "18px",
        width: "100%",
        maxWidth: "720px",
      }}
    >
      {items.map((item, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 20, filter: "blur(10px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{
            duration: 0.8,
            delay: i * 0.35,
            ease: "easeOut",
          }}
          style={{
            padding: "18px 22px",
            borderRadius: "16px",
            background: "rgba(255,255,255,0.06)",
            border: "1px solid rgba(255,255,255,0.08)",
            backdropFilter: "blur(18px)",
            WebkitBackdropFilter: "blur(18px)",
            color: "white",
          }}
        >
          <div
            style={{
              fontSize: "18px",
              fontWeight: 600,
              letterSpacing: "0.5px",
            }}
          >
            {item.title}
          </div>

          {item.description && (
            <div
              style={{
                marginTop: "6px",
                fontSize: "14px",
                opacity: 0.7,
              }}
            >
              {item.description}
            </div>
          )}
        </motion.div>
      ))}
    </div>
  );
}
