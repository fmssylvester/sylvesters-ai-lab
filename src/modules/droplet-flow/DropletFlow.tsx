import { motion } from "framer-motion";
import { useEffect, useState } from "react";

type Item = {
  title: string;
  description?: string;
};

export default function DropletFlow({ items }: { items: Item[] }) {

  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((p) => (p + 1) % items.length);
    }, 3200);

    return () => clearInterval(interval);
  }, [items.length]);

  return (
    <div
      style={{
        width: "100%",
        height: "380px",
        position: "relative",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      {items.map((item, i) => {

        const offset = i - activeIndex;

        // normalize circular stacking
        const depth = Math.abs(offset);

        const isActive = offset === 0;

        return (
          <motion.div
            key={item.title + i}

            animate={{
              x: offset * 60,
              y: depth * 18,
              scale: isActive ? 1 : 0.92 - depth * 0.03,
              opacity:
                depth === 0 ? 1 :
                depth === 1 ? 0.6 :
                depth === 2 ? 0.35 :
                0.15,

              zIndex: 100 - depth,

              filter: isActive ? "blur(0px)" : "blur(2px)",
            }}

            transition={{
              duration: 0.9,
              ease: "easeInOut",
            }}

            style={{
              position: "absolute",

              width: "460px",

              padding: "22px 28px",
              borderRadius: "20px",

              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.10)",

              backdropFilter: "blur(22px)",
              WebkitBackdropFilter: "blur(22px)",

              color: "white",

              textAlign: "center",

              boxShadow: "0 25px 80px rgba(0,0,0,0.4)",
            }}
          >
            <div
              style={{
                fontSize: "20px",
                fontWeight: 600,
              }}
            >
              {item.title}
            </div>

            <div
              style={{
                marginTop: "10px",
                fontSize: "14px",
                opacity: 0.7,
              }}
            >
              {item.description}
            </div>
          </motion.div>
        );

      })}
    </div>
  );
}
