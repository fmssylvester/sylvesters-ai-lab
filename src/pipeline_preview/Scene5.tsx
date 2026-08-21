// duration: 151
import React from "react";
import {
  useCurrentFrame,
  useVideoConfig,
  spring,
  interpolate,
  Sequence,
  Audio,
  Img,
  staticFile,
} from "remotion";

export const Scene5: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const titleSpring = spring({ frame, fps, config: { damping: 14 } });
  
  const plungeProgress = spring({
    frame: frame - 20,
    fps,
    config: { damping: 18, stiffness: 80 },
  });

  const percentVal = Math.round(interpolate(plungeProgress, [0, 1], [0, -68]));

  const titleY = interpolate(titleSpring, [0, 1], [-40, 0]);
  const titleOpacity = interpolate(titleSpring, [0, 1], [0, 1]);

  const cardSpring = spring({ frame: frame - 10, fps, config: { damping: 15 } });
  const cardScale = interpolate(cardSpring, [0, 1], [0.92, 1]);
  const cardOpacity = interpolate(cardSpring, [0, 1], [0, 1]);

  const pathLength = 900;
  const strokeDashoffset = interpolate(plungeProgress, [0, 1], [pathLength, 0]);

  return (
    <div
      style={{
        width: 1920,
        height: 1080,
        background: "radial-gradient(circle at 50% 50%, #120F17 0%, #07090D 100%)",
        color: "#FFFFFF",
        fontFamily: "'Plus Jakarta Sans', sans-serif",
        position: "relative",
        overflow: "hidden",
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
            "radial-gradient(circle at 18% 30%, rgba(255, 107, 107, 0.12) 0%, transparent 55%), radial-gradient(circle at 82% 72%, rgba(231, 184, 77, 0.10) 0%, transparent 50%), radial-gradient(circle at 55% 20%, rgba(0, 217, 255, 0.08) 0%, transparent 55%)",
          transform: `translate(${Math.sin(frame / 75) * 7}px, ${Math.cos(frame / 95) * 7}px)`,
          pointerEvents: "none",
        }}
      />

      {/* Film Grain */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          opacity: 0.05,
          pointerEvents: "none",
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      />

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

      {/* SFX Tracks */}
      <Sequence from={3}>
        <Audio src={staticFile("audio/sfx/whoosh_heavy.wav")} volume={0.3} />
      </Sequence>
      <Sequence from={45}>
        <Audio src={staticFile("sfx/error-beep.wav")} volume={0.25} />
      </Sequence>
      <Sequence from={96}>
        <Audio src={staticFile("sfx/ding-low.wav")} volume={0.3} />
      </Sequence>

      {/* Header */}
      <div
        style={{
          position: "absolute",
          top: 90,
          display: "flex",
          alignItems: "center",
          gap: 20,
          transform: `translateY(${titleY}px)`,
          opacity: titleOpacity,
        }}
      >
        <Img
          src={staticFile("02_ICONS/ai-chat.svg")}
          style={{ width: 64, height: 64, filter: "drop-shadow(0 0 12px rgba(0, 217, 255, 0.4))" }}
        />
        <h1
          style={{
            fontSize: 60,
            fontWeight: 900,
            letterSpacing: "-0.02em",
            margin: 0,
            textTransform: "uppercase",
            background: "linear-gradient(180deg, #FFFFFF 0%, #FF6B6B 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            filter: "drop-shadow(0 4px 20px rgba(255, 107, 107, 0.25))",
          }}
        >
          RESPONSE TIME KILLS CONVERSION
        </h1>
      </div>

      {/* Blurred Support Glass Container */}
      <div
        style={{
          width: 1480,
          height: 560,
          marginTop: 100,
          borderRadius: 24,
          background: "rgba(255, 255, 255, 0.05)",
          backdropFilter: "blur(12px) saturate(120%)",
          WebkitBackdropFilter: "blur(12px) saturate(120%)",
          border: "1px solid rgba(255, 255, 255, 0.12)",
          boxShadow:
            "0 25px 60px rgba(0,0,0,0.5), 0 0 100px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.1), 0 0 70px rgba(255,107,107,0.08)",
          transform: `scale(${cardScale})`,
          opacity: cardOpacity,
          position: "relative",
          padding: 48,
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          boxSizing: "border-box",
          overflow: "hidden",
        }}
      >
        {/* Support Ticket Visual Mock Background */}
        <div
          style={{
            width: "40%",
            display: "flex",
            flexDirection: "column",
            gap: 20,
            zIndex: 2,
          }}
        >
          <div
            style={{
              background: "rgba(255, 255, 255, 0.05)",
              borderRadius: 16,
              padding: "24px",
              border: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
              <div
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: "50%",
                  background: "#FF6B6B",
                  boxShadow: "0 0 10px #FF6B6B",
                }}
              />
              <div style={{ width: "40%", height: 10, background: "rgba(255,255,255,0.3)", borderRadius: 5 }} />
            </div>
            <div style={{ width: "85%", height: 12, background: "rgba(255,255,255,0.15)", borderRadius: 6, marginBottom: 10 }} />
            <div style={{ width: "60%", height: 12, background: "rgba(255,255,255,0.08)", borderRadius: 6 }} />
          </div>

          <div
            style={{
              background: "rgba(255, 255, 255, 0.02)",
              borderRadius: 16,
              padding: "24px",
              border: "1px solid rgba(255,255,255,0.05)",
              opacity: 0.6,
            }}
          >
            <div style={{ width: "70%", height: 12, background: "rgba(255,255,255,0.12)", borderRadius: 6, marginBottom: 10 }} />
            <div style={{ width: "45%", height: 12, background: "rgba(255,255,255,0.06)", borderRadius: 6 }} />
          </div>
        </div>

        {/* Plunging Chart Line & Percentage Counter */}
        <div
          style={{
            width: "56%",
            height: "100%",
            zIndex: 2,
            position: "relative",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <svg
            style={{ position: "absolute", width: "100%", height: "100%", overflow: "visible" }}
            viewBox="0 0 700 400"
          >
            <path
              d="M 50 60 C 220 60, 280 320, 650 340"
              fill="none"
              stroke="#FF6B6B"
              strokeWidth="10"
              strokeLinecap="round"
              strokeDasharray={pathLength}
              strokeDashoffset={strokeDashoffset}
              style={{ filter: "drop-shadow(0 0 20px rgba(255, 107, 107, 0.8))" }}
            />
          </svg>

          <div
            style={{
              zIndex: 3,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <div
              style={{
                fontSize: 116,
                fontWeight: 800,
                letterSpacing: "-0.03em",
                color: "#FF6B6B",
                fontFamily: "'JetBrains Mono', 'IBM Plex Mono', monospace",
                textShadow: "0 0 50px rgba(255, 107, 107, 0.6)",
                lineHeight: 1,
                fontVariantNumeric: "tabular-nums",
              }}
            >
              {percentVal}%
            </div>
            <div
              style={{
                fontSize: 28,
                fontWeight: 700,
                color: "#E7B84D",
                letterSpacing: "0.02em",
                marginTop: 16,
                textTransform: "uppercase",
                textShadow: "0 0 20px rgba(231, 184, 77, 0.3)",
              }}
            >
              Conversion Rate Drop
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};