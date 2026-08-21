// duration: 137
import React from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  spring,
  interpolate,
  Sequence,
  Audio,
  staticFile,
  Easing,
} from "remotion";

export const SceneAChatDemo = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const headerSpring = spring({
    frame,
    fps,
    config: { damping: 16, stiffness: 100 },
  });

  const popStart = 10;
  const replyStart = 45;

  const spring1 = spring({
    frame: frame - popStart,
    fps,
    config: { damping: 12, stiffness: 120 },
  });

  const spring2 = spring({
    frame: frame - replyStart,
    fps,
    config: { damping: 12, stiffness: 100 },
  });

  const sweepProgress = interpolate(
    frame,
    [replyStart, replyStart + 36],
    [-60, 160],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.bezier(0.22, 1, 0.36, 1),
    }
  );

  const beamX = interpolate(frame, [0, 120], [30, 70], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.22, 1, 0.36, 1),
  });

  const beamOpacity = interpolate(
    frame,
    [0, 20, 100, 137],
    [0.3, 0.8, 0.8, 0.5],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  const customerOpacity =
    frame >= popStart
      ? interpolate(spring1, [0, 0.15], [0, 1], { extrapolateRight: "clamp" })
      : 0;

  const botOpacity =
    frame >= replyStart
      ? interpolate(spring2, [0, 0.15], [0, 1], { extrapolateRight: "clamp" })
      : 0;

  const headerY = interpolate(headerSpring, [0, 1], [-30, 0]);
  const headerOpacity = interpolate(headerSpring, [0, 1], [0, 1]);

  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#05070A",
        backgroundImage:
          "radial-gradient(circle at 50% 40%, #0A1224 0%, #040609 100%)",
        fontFamily: "'Plus Jakarta Sans', sans-serif",
        fontWeight: 700,
        letterSpacing: "-0.02em",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "flex-start",
        padding: "60px 80px",
      }}
    >
      <style>
        {`@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@600;700;800;900&display=swap');`}
      </style>

      {/* Dynamic Grid Background with Cinematic Depth */}
      <div
        style={{
          position: "absolute",
          inset: -100,
          backgroundImage: `linear-gradient(rgba(0, 217, 255, 0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 217, 255, 0.08) 1px, transparent 1px)`,
          backgroundSize: "50px 50px",
          opacity: 0.6,
          transform: `perspective(1000px) rotateX(15deg) scale(1.1) translateY(${frame * 0.4}px)`,
          maskImage:
            "radial-gradient(ellipse at center, black 30%, transparent 80%)",
          WebkitMaskImage:
            "radial-gradient(ellipse at center, black 30%, transparent 80%)",
          pointerEvents: "none",
        }}
      />

      {/* Ambient Lighting Gradients */}
      <div
        style={{
          position: "absolute",
          width: 900,
          height: 900,
          borderRadius: "50%",
          background: "#00D9FF",
          filter: "blur(180px)",
          opacity: 0.15 + Math.sin(frame / 20) * 0.03,
          top: "-15%",
          left: "5%",
          transform: `translate(${Math.sin(frame / 50) * 15}px, ${Math.cos(frame / 60) * 15}px)`,
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "absolute",
          width: 800,
          height: 800,
          borderRadius: "50%",
          background: "#3B82F6",
          filter: "blur(190px)",
          opacity: 0.18,
          bottom: "-10%",
          right: "5%",
          transform: `translate(${Math.cos(frame / 55) * 15}px, ${Math.sin(frame / 65) * 15}px)`,
          pointerEvents: "none",
        }}
      />

      {/* Moving Beam Effect */}
      <div
        style={{
          position: "absolute",
          width: 650,
          height: 450,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(0,217,255,0.25) 0%, rgba(0,217,255,0) 70%)",
          filter: "blur(90px)",
          left: `${beamX}%`,
          top: "55%",
          transform: "translate(-50%, -50%)",
          opacity: beamOpacity,
          pointerEvents: "none",
        }}
      />

      {/* Subtle Grain Overlay */}
      <svg
        style={{
          position: "absolute",
          width: "100%",
          height: "100%",
          opacity: 0.04,
          pointerEvents: "none",
        }}
      >
        <filter id="grain">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.8"
            numOctaves="3"
            stitchTiles="stitch"
          />
        </filter>
        <rect width="100%" height="100%" filter="url(#grain)" />
      </svg>

      {/* Required Storyboard Header Structure */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          textAlign: "center",
          marginBottom: 36,
          zIndex: 20,
          transform: `translateY(${headerY}px)`,
          opacity: headerOpacity,
        }}
      >
        <h1
          style={{
            fontSize: 48,
            fontWeight: 900,
            color: "#FFFFFF",
            margin: 0,
            letterSpacing: "-0.03em",
            textTransform: "uppercase",
            lineHeight: 1.1,
            textShadow: "0 10px 30px rgba(0, 0, 0, 0.8)",
          }}
        >
          INSTANT{" "}
          <span
            style={{
              color: "#00D9FF",
              textShadow: "0 0 25px rgba(0, 217, 255, 0.6)",
            }}
          >
            INTELLIGENT
          </span>{" "}
          REPLY
        </h1>

        <div
          style={{
            fontSize: 24,
            color: "rgba(255, 255, 255, 0.65)",
            fontWeight: 600,
            letterSpacing: "0.08em",
            marginTop: 10,
            display: "flex",
            alignItems: "center",
            gap: 12,
          }}
        >
          <span
            style={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              backgroundColor: "#00D9FF",
              boxShadow: "0 0 10px #00D9FF",
              display: "inline-block",
            }}
          />
          Incoming Customer Messages
        </div>
      </div>

      {/* Main Chat Container */}
      <div
        style={{
          width: 1480,
          minHeight: 560,
          backdropFilter: "blur(16px) saturate(140%)",
          WebkitBackdropFilter: "blur(16px) saturate(140%)",
          backgroundColor: "rgba(10, 16, 30, 0.65)",
          border: "1px solid rgba(0, 217, 255, 0.25)",
          boxShadow:
            "0 30px 80px rgba(0, 0, 0, 0.7), 0 0 100px rgba(0, 217, 255, 0.12), inset 0 1px 1px rgba(255, 255, 255, 0.2)",
          borderRadius: 28,
          padding: "44px 52px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          position: "relative",
          zIndex: 10,
        }}
      >
        {/* Top Glow Accent */}
        <div
          style={{
            position: "absolute",
            top: -1,
            left: 60,
            right: 60,
            height: 2,
            background:
              "linear-gradient(90deg, transparent, #00D9FF, transparent)",
            borderRadius: 28,
            boxShadow: "0 0 15px #00D9FF",
          }}
        />

        {/* Chat Header Bar */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 32,
            paddingBottom: 22,
            borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div
              style={{
                width: 12,
                height: 12,
                borderRadius: "50%",
                backgroundColor: "#FF5F56",
                boxShadow: "0 0 8px rgba(255, 95, 86, 0.4)",
              }}
            />
            <div
              style={{
                width: 12,
                height: 12,
                borderRadius: "50%",
                backgroundColor: "#FFBD2E",
                boxShadow: "0 0 8px rgba(255, 189, 46, 0.4)",
              }}
            />
            <div
              style={{
                width: 12,
                height: 12,
                borderRadius: "50%",
                backgroundColor: "#27C93F",
                boxShadow: "0 0 8px rgba(39, 201, 63, 0.4)",
              }}
            />
          </div>
          <div
            style={{
              fontSize: 13,
              color: "rgba(255,255,255,0.45)",
              fontWeight: 700,
              letterSpacing: "0.15em",
              textTransform: "uppercase",
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
                backgroundColor: "#00D9FF",
              }}
            />
            Live Support Stream
          </div>
          <div style={{ width: 54 }} />
        </div>

        {/* Messages Stream */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 32,
            width: "100%",
          }}
        >
          {/* Incoming Customer Message */}
          <div
            style={{
              alignSelf: "flex-start",
              maxWidth: "70%",
              opacity: customerOpacity,
              transform: `perspective(1000px) rotateX(${interpolate(
                spring1,
                [0, 1],
                [16, 0]
              )}deg) rotateY(${interpolate(
                spring1,
                [0, 1],
                [-12, 0]
              )}deg) translateY(${interpolate(
                spring1,
                [0, 1],
                [30, 0]
              )}px) scale(${spring1})`,
              transformOrigin: "bottom left",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                marginBottom: 8,
                marginLeft: 4,
              }}
            >
              <div
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  backgroundColor: "#3B82F6",
                }}
              />
              <span
                style={{
                  fontSize: 13,
                  color: "rgba(255, 255, 255, 0.6)",
                  fontWeight: 700,
                  letterSpacing: "0.08em",
                }}
              >
                CUSTOMER
              </span>
            </div>
            <div
              style={{
                backgroundColor: "#1E293B",
                color: "#F8FAFC",
                border: "1px solid rgba(255, 255, 255, 0.12)",
                borderRadius: "24px 24px 24px 6px",
                padding: "26px 36px",
                fontSize: "28px",
                lineHeight: 1.4,
                boxShadow:
                  "0 15px 35px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.1)",
              }}
            >
              Hi! Can someone help me reset my password?
            </div>
          </div>

          {/* Intelligent Bot Reply with Enhanced Neon Bloom */}
          <div
            style={{
              alignSelf: "flex-end",
              maxWidth: "80%",
              opacity: botOpacity,
              transform: `perspective(1000px) rotateX(${interpolate(
                spring2,
                [0, 1],
                [-14, 0]
              )}deg) rotateY(${interpolate(
                spring2,
                [0, 1],
                [12, 0]
              )}deg) translateY(${interpolate(
                spring2,
                [0, 1],
                [30, 0]
              )}px) scale(${spring2})`,
              transformOrigin: "bottom right",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "flex-end",
                gap: 8,
                marginBottom: 8,
                marginRight: 4,
              }}
            >
              <span
                style={{
                  fontSize: 13,
                  color: "#00D9FF",
                  fontWeight: 700,
                  letterSpacing: "0.08em",
                }}
              >
                AI ASSISTANT
              </span>
              <div
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  backgroundColor: "#00D9FF",
                  boxShadow: "0 0 10px #00D9FF",
                }}
              />
            </div>
            <div
              style={{
                backgroundColor: "rgba(8, 25, 45, 0.92)",
                color: "#FFFFFF",
                border: "2px solid #00D9FF",
                borderRadius: "24px 24px 6px 24px",
                padding: "28px 38px",
                fontSize: "26px",
                lineHeight: 1.45,
                boxShadow:
                  "0 0 50px rgba(0, 217, 255, 0.4), inset 0 0 20px rgba(0, 217, 255, 0.25), 0 20px 60px rgba(0, 0, 0, 0.8)",
                position: "relative",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  top: -50,
                  bottom: -50,
                  width: 140,
                  left: `${sweepProgress}%`,
                  background:
                    "linear-gradient(90deg, transparent, rgba(0, 217, 255, 0.4), rgba(255, 255, 255, 0.8), rgba(0, 217, 255, 0.4), transparent)",
                  transform: "skewX(-25deg)",
                  pointerEvents: "none",
                }}
              />
              Password resets are a sensitive request, so I've passed this to
              our support team. A specialist will email you within minutes.
            </div>
          </div>
        </div>
      </div>

      <Sequence from={popStart} layout="none">
        <Audio src={staticFile("sfx/pop.wav")} volume={0.28} />
      </Sequence>
      <Sequence from={replyStart} layout="none">
        <Audio src={staticFile("sfx/email-notif.wav")} volume={0.28} />
      </Sequence>
    </AbsoluteFill>
  );
};