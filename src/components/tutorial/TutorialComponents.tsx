import React from "react";
import { AbsoluteFill, useCurrentFrame, interpolate } from "remotion";

const CYAN = "#00D9FF";
const BLUE = "#0066FF";

/**
 * TalkingHead - Circular talking head overlay
 * Used in tutorial-style videos like MalvaAI and EsmileAi
 */
export const TalkingHead: React.FC<{
  position?: "top-right" | "bottom-right" | "bottom-left";
  size?: number;
  borderColor?: string;
}> = ({ 
  position = "top-right", 
  size = 180,
  borderColor = CYAN 
}) => {
  const frame = useCurrentFrame();
  const pulse = (Math.sin(frame / 15) + 1) / 2;
  
  const posStyle = {
    "top-right": { top: 40, right: 40 },
    "bottom-right": { bottom: 40, right: 40 },
    "bottom-left": { bottom: 40, left: 40 },
  }[position];

  return (
    <div
      style={{
        position: "absolute",
        ...posStyle,
        width: size,
        height: size,
        borderRadius: "50%",
        border: `3px solid ${borderColor}`,
        boxShadow: `0 0 ${20 + 10 * pulse}px ${borderColor}40`,
        overflow: "hidden",
        background: "linear-gradient(135deg, #1a1a2e, #0f0f1a)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {/* Placeholder for talking head - replace with actual video/image */}
      <div
        style={{
          width: "100%",
          height: "100%",
          background: "radial-gradient(circle at 50% 40%, #2a2a4a, #1a1a2e)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: size * 0.3,
          color: "rgba(255,255,255,0.3)",
        }}
      >
        🎤
      </div>
    </div>
  );
};

/**
 * ScreenFrame - Screen recording with neon border
 * Used to show AI tool interfaces
 */
export const ScreenFrame: React.FC<{
  children: React.ReactNode;
  borderColor?: string;
  showControls?: boolean;
}> = ({ 
  children, 
  borderColor = CYAN,
  showControls = true 
}) => {
  const frame = useCurrentFrame();
  const glow = (Math.sin(frame / 20) + 1) / 2;

  return (
    <div
      style={{
        position: "absolute",
        top: 60,
        left: 60,
        right: 60,
        bottom: 60,
        borderRadius: 16,
        border: `2px solid ${borderColor}`,
        boxShadow: `0 0 ${30 + 15 * glow}px ${borderColor}40, inset 0 0 60px rgba(0,0,0,0.5)`,
        overflow: "hidden",
        background: "#0a0a12",
      }}
    >
      {/* macOS-style title bar */}
      {showControls && (
        <div
          style={{
            height: 40,
            background: "linear-gradient(180deg, #1a1a2e, #12121f)",
            borderBottom: "1px solid rgba(255,255,255,0.1)",
            display: "flex",
            alignItems: "center",
            padding: "0 16px",
            gap: 8,
          }}
        >
          <div style={{ width: 12, height: 12, borderRadius: "50%", background: "#ff5f57" }} />
          <div style={{ width: 12, height: 12, borderRadius: "50%", background: "#febc2e" }} />
          <div style={{ width: 12, height: 12, borderRadius: "50%", background: "#28c840" }} />
        </div>
      )}
      <div style={{ flex: 1, overflow: "hidden" }}>
        {children}
      </div>
    </div>
  );
};

/**
 * CommentOverlay - YouTube comment with glowing border
 * Used to show social proof or feedback
 */
export const CommentOverlay: React.FC<{
  username?: string;
  comment?: string;
  avatar?: string;
}> = ({ 
  username = "@viewer",
  comment = "This is amazing!",
  avatar 
}) => {
  const frame = useCurrentFrame();
  const glow = (Math.sin(frame / 12) + 1) / 2;

  return (
    <div
      style={{
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        width: 800,
        padding: 32,
        borderRadius: 16,
        background: "rgba(20, 20, 35, 0.95)",
        border: `2px solid ${CYAN}`,
        boxShadow: `0 0 ${40 + 20 * glow}px ${CYAN}60`,
        backdropFilter: "blur(10px)",
      }}
    >
      <div style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
        {/* Avatar */}
        <div
          style={{
            width: 48,
            height: 48,
            borderRadius: "50%",
            background: "linear-gradient(135deg, #667eea, #764ba2)",
            flexShrink: 0,
          }}
        />
        <div style={{ flex: 1 }}>
          <div style={{ color: "rgba(255,255,255,0.9)", fontSize: 18, fontWeight: 600, marginBottom: 8 }}>
            {username}
          </div>
          <div style={{ color: "rgba(255,255,255,0.7)", fontSize: 16, lineHeight: 1.5 }}>
            {comment}
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * TextOverlay - Simple text with optional background
 */
export const TextOverlay: React.FC<{
  text: string;
  position?: "top" | "center" | "bottom";
  style?: "label" | "title" | "subtitle";
  color?: string;
}> = ({ 
  text, 
  position = "top",
  style = "label",
  color = "#fff" 
}) => {
  const posStyle = {
    top: { top: 100, left: 0, right: 0, textAlign: "center" as const },
    center: { top: "50%", left: 0, right: 0, textAlign: "center" as const, transform: "translateY(-50%)" },
    bottom: { bottom: 100, left: 0, right: 0, textAlign: "center" as const },
  }[position];

  const textStyle = {
    label: { fontSize: 24, fontWeight: 500, letterSpacing: 2, textTransform: "uppercase" as const },
    title: { fontSize: 48, fontWeight: 700 },
    subtitle: { fontSize: 20, fontWeight: 400, opacity: 0.8 },
  }[style];

  return (
    <div
      style={{
        position: "absolute",
        ...posStyle,
        color,
        fontFamily: "'Switzer', 'Inter', system-ui, sans-serif",
        ...textStyle,
        textShadow: "0 2px 20px rgba(0,0,0,0.8)",
        padding: "0 60px",
      }}
    >
      {text}
    </div>
  );
};

/**
 * GradientBackground - Dark blue gradient like MalvaAI/EsmileAi
 */
export const GradientBackground: React.FC<{
  variant?: "default" | "deep" | "warm";
}> = ({ variant = "default" }) => {
  const gradients = {
    default: "radial-gradient(ellipse at 20% 50%, #0a1628 0%, #060d1a 50%, #030810 100%)",
    deep: "radial-gradient(ellipse at 50% 50%, #0d1f3c 0%, #06101f 50%, #020812 100%)",
    warm: "radial-gradient(ellipse at 30% 40%, #1a0f2e 0%, #0d0a1a 50%, #060510 100%)",
  };

  return (
    <AbsoluteFill
      style={{
        background: gradients[variant],
      }}
    />
  );
};
