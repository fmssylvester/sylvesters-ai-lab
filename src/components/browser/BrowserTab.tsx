import { useEffect, useState } from "react";
import { Img } from "remotion";
import { motion } from "framer-motion";

interface Props {
  label: string;
  icon?: string;
  active?: boolean;
  arrivalDelay?: number;
}

export default function BrowserTab({
  label,
  icon,
  active = false,
  arrivalDelay = 0,
}: Props) {
  const [showFavicon, setShowFavicon] = useState(false);
  const [showLabel, setShowLabel] = useState(false);
  const [showHighlight, setShowHighlight] = useState(false);

  useEffect(() => {
    const faviconTimer = setTimeout(() => setShowFavicon(true), arrivalDelay);
    const labelTimer = setTimeout(
      () => setShowLabel(true),
      arrivalDelay + 200
    );
    const highlightTimer = setTimeout(
      () => setShowHighlight(true),
      arrivalDelay + 530
    );
    return () => {
      clearTimeout(faviconTimer);
      clearTimeout(labelTimer);
      clearTimeout(highlightTimer);
    };
  }, [arrivalDelay]);

  return (
    <motion.div
      initial={{ x: 60, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{
        duration: 0.45,
        ease: [0.22, 1, 0.36, 1],
        delay: arrivalDelay / 1000,
      }}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        padding: "6px 14px",
        borderRadius: 8,
        background: active
          ? "rgba(255,255,255,0.1)"
          : "rgba(255,255,255,0.03)",
        borderBottom: active ? "2px solid #00D9FF" : "2px solid transparent",
        minWidth: 120,
        maxWidth: 180,
        position: "relative",
        overflow: "hidden",
        opacity: active ? 1 : 0.5,
        cursor: "default",
      }}
    >
      {icon ? (
        <Img
          src={icon}
          style={{
            width: 14,
            height: 14,
            opacity: showFavicon ? 1 : 0,
            transition: "opacity 0.2s ease",
          }}
        />
      ) : (
        <div
          style={{
            width: 14,
            height: 14,
            borderRadius: 3,
            background: "#3B82F6",
            opacity: showFavicon ? 1 : 0,
            transition: "opacity 0.2s ease",
          }}
        />
      )}
      <span
        style={{
          fontSize: 13,
          color: active ? "#F5F7FA" : "#94A3B8",
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
          opacity: showLabel ? 1 : 0,
          transition: "opacity 0.33s ease",
        }}
      >
        {label}
      </span>
      {showHighlight && (
        <motion.div
          initial={{ x: "-100%" }}
          animate={{ x: "200%" }}
          transition={{
            duration: 0.4,
            ease: "easeInOut",
          }}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background:
              "linear-gradient(90deg, transparent, rgba(0,217,255,0.08), transparent)",
            pointerEvents: "none",
          }}
        />
      )}
    </motion.div>
  );
}
