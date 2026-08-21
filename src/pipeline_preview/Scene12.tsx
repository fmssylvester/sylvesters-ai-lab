// duration: 108
import React from "react";
import {
  useCurrentFrame,
  useVideoConfig,
  spring,
  interpolate,
  staticFile,
  Img,
  Audio,
  Sequence,
  Easing,
} from "remotion";

export default function Scene12() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Camera scale and subtle zoom-in onto the conditional branch logic
  const camZoom = interpolate(frame, [0, 108], [0.95, 1.08], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.22, 1, 0.36, 1),
  });

  // Entrance spring for main panel
  const panelSpring = spring({
    frame,
    fps,
    config: { damping: 15, mass: 0.8, stiffness: 110 },
  });

  // Header text spring
  const headerSpring = spring({
    frame: frame - 4,
    fps,
    config: { damping: 14, stiffness: 100 },
  });

  // Subheader text spring
  const subheadSpring = spring({
    frame: frame - 12,
    fps,
    config: { damping: 14, stiffness: 100 },
  });

  // Rule 1 activation spring (at frame 33 / ~1.1s)
  const rule1Spring = spring({
    frame: frame - 33,
    fps,
    config: { damping: 12, stiffness: 120 },
  });

  // Rule 2 activation spring (at frame 66 / ~2.2s)
  const rule2Spring = spring({
    frame: frame - 66,
    fps,
    config: { damping: 12, stiffness: 120 },
  });

  // Interp values for highlights
  const rule1Glow = interpolate(rule1Spring, [0, 1], [0, 1]);
  const rule2Glow = interpolate(rule2Spring, [0, 1], [0, 1]);

  return (
    <div
      style={{
        width: 1920,
        height: 1080,
        backgroundColor: "#07090D",
        backgroundImage:
          "radial-gradient(circle at 50% 50%, #0B1120 0%, #07090D 100%)",
        fontFamily: "'Plus Jakarta Sans', sans-serif",
        color: "#FFFFFF",
        overflow: "hidden",
        position: "relative",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <style>
        {`@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@700;800;900&family=JetBrains+Mono:wght@500;700;800&display=swap');`}
      </style>

      {/* Gradient Mesh Base */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(circle at 18% 30%, rgba(0, 217, 255, 0.12) 0%, transparent 55%), radial-gradient(circle at 82% 72%, rgba(231, 184, 77, 0.10) 0%, transparent 50%), radial-gradient(circle at 55% 20%, rgba(0, 217, 255, 0.08) 0%, transparent 55%)",
          transform: `translate(${Math.sin(frame / 80) * 7}px, ${Math.cos(frame / 100) * 7}px)`,
          pointerEvents: "none",
        }}
      />

      {/* Grid Pattern Background */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage:
            "linear-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.05) 1px, transparent 1px)",
          backgroundSize: "80px 80px",
          opacity: 0.6,
          maskImage:
            "radial-gradient(ellipse at center, black 30%, transparent 82%)",
          WebkitMaskImage:
            "radial-gradient(ellipse at center, black 30%, transparent 82%)",
          pointerEvents: "none",
        }}
      />

      {/* Subtle Film Grain Overlay */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          opacity: 0.05,
          backgroundImage:
            "url('data:image/svg+xml;utf8,<svg viewBox=\"0 0 200 200\" xmlns=\"http://www.w3.org/2000/svg\"><filter id=\"noiseFilter\"><feTurbulence type=\"fractalNoise\" baseFrequency=\"0.75\" numOctaves=\"4\" stitchTiles=\"stitch\"/></filter><rect width=\"100%\" height=\"100%\" filter=\"url(%23noiseFilter)\"/></svg>')",
          pointerEvents: "none",
        }}
      />

      {/* SFX Audio Elements */}
      <Sequence from={6}>
        <Audio src={staticFile("sfx/click.wav")} volume={0.3} />
      </Sequence>
      <Sequence from={33}>
        <Audio src={staticFile("sfx/ding-low.wav")} volume={0.3} />
      </Sequence>
      <Sequence from={66}>
        <Audio src={staticFile("sfx/error-beep.wav")} volume={0.25} />
      </Sequence>

      {/* Main Canvas Container with Dynamic Dynamic Camera Zoom */}
      <div
        style={{
          transform: `scale(${camZoom})`,
          transformOrigin: "center center",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          width: 1560,
          zIndex: 1,
        }}
      >
        {/* Central Floating Glassmorphism n8n Switch Node Panel */}
        <div
          style={{
            width: 1480,
            minHeight: 520,
            backgroundColor: "rgba(255, 255, 255, 0.05)",
            backdropFilter: "blur(12px) saturate(120%)",
            WebkitBackdropFilter: "blur(12px) saturate(120%)",
            borderRadius: 24,
            border: "1px solid rgba(255, 255, 255, 0.12)",
            boxShadow:
              "0 25px 60px rgba(0, 0, 0, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.12), 0 0 80px rgba(0, 217, 255, 0.08)",
            opacity: interpolate(panelSpring, [0, 1], [0, 1]),
            transform: `scale(${interpolate(panelSpring, [0, 1], [0.92, 1])})`,
            padding: 40,
            display: "flex",
            flexDirection: "column",
            position: "relative",
            overflow: "hidden",
          }}
      >
        {/* Panel Title — anchored inside the glass card */}
        <div
          style={{
            textAlign: "center",
            marginBottom: 36,
            opacity: interpolate(headerSpring, [0, 1], [0, 1]),
            transform: `translateY(${interpolate(headerSpring, [0, 1], [-20, 0])}px)`,
          }}
        >
          <div
            style={{
              fontSize: 54,
              fontWeight: 900,
              letterSpacing: "-0.02em",
              color: "#FFFFFF",
              textTransform: "uppercase",
              textShadow: "0 0 30px rgba(0, 217, 255, 0.3)",
            }}
          >
            INTELLIGENT SENSITIVE ROUTING
          </div>

          <div
            style={{
              fontSize: 24,
              fontWeight: 700,
              letterSpacing: "0.02em",
              color: "#E7B84D",
              marginTop: 10,
              opacity: interpolate(subheadSpring, [0, 1], [0, 1]),
              transform: `translateY(${interpolate(subheadSpring, [0, 1], [10, 0])}px)`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 12,
            }}
          >
            <span
              style={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                backgroundColor: "#E7B84D",
                boxShadow: "0 0 10px #E7B84D",
              }}
            />
            Keywords: 'Refund' & 'Delete'
          </div>
        </div>

        {/* Panel Top Control Bar */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
              paddingBottom: 20,
              marginBottom: 36,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 12,
                  backgroundColor: "rgba(0, 217, 255, 0.15)",
                  border: "1px solid #00D9FF",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 0 20px rgba(0, 217, 255, 0.3)",
                }}
              >
                <Img
                  src={staticFile("02_ICONS/ai-settings.svg")}
                  style={{
                    width: 28,
                    height: 28,
                    filter:
                      "invert(72%) sepia(85%) saturate(1800%) hue-rotate(155deg) brightness(105%) contrast(105%)",
                  }}
                />
              </div>
              <div>
                <div
                  style={{
                    fontSize: 22,
                    fontWeight: 800,
                    color: "#FFFFFF",
                  }}
                >
                  n8n Switch Node • Conditional Intent Evaluator
                </div>
                <div style={{ fontSize: 14, color: "rgba(255, 255, 255, 0.5)", marginTop: 2 }}>
                  Mode: Strict Regex & Keyword Match
                </div>
              </div>
            </div>

            {/* Status Pills */}
            <div style={{ display: "flex", gap: 12 }}>
              <div
                style={{
                  padding: "8px 16px",
                  borderRadius: 20,
                  backgroundColor: "rgba(16, 185, 129, 0.15)",
                  border: "1px solid #10B981",
                  fontSize: 13,
                  fontWeight: 700,
                  color: "#10B981",
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <span
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: "50%",
                    backgroundColor: "#10B981",
                    boxShadow: "0 0 8px #10B981",
                  }}
                />
                Active Filter
              </div>
            </div>
          </div>

          {/* Logic Flow Grid: Input -> Rules Evaluation */}
          <div style={{ display: "flex", gap: 32, alignItems: "stretch", flex: 1 }}>
            {/* Input Trigger Node */}
            <div
              style={{
                width: 320,
                backgroundColor: "rgba(255, 255, 255, 0.05)",
                borderRadius: 16,
                border: "1px solid rgba(255, 255, 255, 0.12)",
                backdropFilter: "blur(12px) saturate(120%)",
                WebkitBackdropFilter: "blur(12px) saturate(120%)",
                padding: 24,
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
              }}
            >
              <div
                style={{
                  fontSize: 12,
                  fontWeight: 800,
                  color: "rgba(255, 255, 255, 0.4)",
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  marginBottom: 12,
                }}
              >
                INPUT STREAM
              </div>
              <div
                style={{
                  fontSize: 18,
                  fontWeight: 800,
                  color: "#00D9FF",
                  marginBottom: 8,
                }}
              >
                Customer Message
              </div>
              <div
                style={{
                  fontSize: 14,
                  color: "rgba(255, 255, 255, 0.7)",
                  backgroundColor: "rgba(0, 0, 0, 0.3)",
                  padding: "12px 16px",
                  borderRadius: 10,
                  border: "1px solid rgba(255, 255, 255, 0.12)",
                  fontFamily: "'JetBrains Mono', 'IBM Plex Mono', monospace",
                }}
              >
                "I want a refund or delete my account immediately"
              </div>
            </div>

            {/* Connector Wire Graphic */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "rgba(0, 217, 255, 0.5)",
                fontSize: 24,
              }}
            >
              ➔
            </div>

            {/* Rules Cards Container */}
            <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 20 }}>
              {/* Rule 1: "Refund" Keyword Branch */}
              <div
                style={{
                  backgroundColor: rule1Glow > 0 ? "rgba(231, 184, 77, 0.12)" : "rgba(255, 255, 255, 0.03)",
                  borderRadius: 16,
                  border: rule1Glow > 0 ? "2px solid #E7B84D" : "1px solid rgba(255, 255, 255, 0.1)",
                  boxShadow:
                    rule1Glow > 0
                      ? "0 0 30px rgba(231, 184, 77, 0.35), inset 0 0 15px rgba(231, 184, 77, 0.15)"
                      : "none",
                  padding: "20px 24px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  transition: "all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)",
                  transform: `scale(${1 + rule1Glow * 0.02})`,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                  <div
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 10,
                      backgroundColor: rule1Glow > 0 ? "#E7B84D" : "rgba(255, 255, 255, 0.1)",
                      color: rule1Glow > 0 ? "#000000" : "#FFFFFF",
                      fontWeight: 900,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 16,
                    }}
                  >
                    1
                  </div>
                  <div>
                    <div style={{ fontSize: 14, color: "rgba(255, 255, 255, 0.5)", fontWeight: 700 }}>
                      IF MESSAGE CONTAINS
                    </div>
                    <div style={{ fontSize: 22, fontWeight: 800, color: rule1Glow > 0 ? "#E7B84D" : "#FFFFFF" }}>
                      'Refund'
                    </div>
                  </div>
                </div>

                <div
                  style={{
                    padding: "8px 20px",
                    borderRadius: 10,
                    backgroundColor: rule1Glow > 0 ? "#E7B84D" : "rgba(255, 255, 255, 0.05)",
                    color: rule1Glow > 0 ? "#000000" : "rgba(255, 255, 255, 0.4)",
                    fontWeight: 800,
                    fontSize: 14,
                    letterSpacing: "0.02em",
                  }}
                >
                  ROUTE ➔ HUMAN ESCALATION
                </div>
              </div>

              {/* Rule 2: "Delete" Keyword Branch */}
              <div
                style={{
                  backgroundColor: rule2Glow > 0 ? "rgba(255, 107, 107, 0.15)" : "rgba(255, 255, 255, 0.03)",
                  borderRadius: 16,
                  border: rule2Glow > 0 ? "2px solid #FF6B6B" : "1px solid rgba(255, 255, 255, 0.1)",
                  boxShadow:
                    rule2Glow > 0
                      ? "0 0 35px rgba(255, 107, 107, 0.4), inset 0 0 15px rgba(255, 107, 107, 0.2)"
                      : "none",
                  padding: "20px 24px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  transition: "all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)",
                  transform: `scale(${1 + rule2Glow * 0.02})`,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                  <div
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 10,
                      backgroundColor: rule2Glow > 0 ? "#FF6B6B" : "rgba(255, 255, 255, 0.1)",
                      color: rule2Glow > 0 ? "#FFFFFF" : "rgba(255, 255, 255, 0.6)",
                      fontWeight: 900,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 16,
                    }}
                  >
                    2
                  </div>
                  <div>
                    <div style={{ fontSize: 14, color: "rgba(255, 255, 255, 0.5)", fontWeight: 700 }}>
                      IF MESSAGE CONTAINS
                    </div>
                    <div style={{ fontSize: 22, fontWeight: 800, color: rule2Glow > 0 ? "#FF6B6B" : "#FFFFFF" }}>
                      'Delete'
                    </div>
                  </div>
                </div>

                <div
                  style={{
                    padding: "8px 20px",
                    borderRadius: 10,
                    backgroundColor: rule2Glow > 0 ? "#FF6B6B" : "rgba(255, 255, 255, 0.05)",
                    color: rule2Glow > 0 ? "#FFFFFF" : "rgba(255, 255, 255, 0.4)",
                    fontWeight: 800,
                    fontSize: 14,
                    letterSpacing: "0.02em",
                  }}
                >
                  ROUTE ➔ COMPLIANCE QUEUE
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Vignette */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          background:
            "radial-gradient(ellipse at center, transparent 45%, rgba(0, 0, 0, 0.5) 100%)",
        }}
      />
    </div>
  );
}