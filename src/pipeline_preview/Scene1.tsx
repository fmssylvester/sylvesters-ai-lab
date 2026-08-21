// duration: 209
import {
  AbsoluteFill,
  Audio,
  Easing,
  Img,
  Sequence,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import React from "react";

export default function Scene3amMoment() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Camera pull-back & ambient depth zoom
  const camZoom = interpolate(frame, [0, 209], [1.05, 0.96], {
    easing: Easing.bezier(0.16, 1, 0.3, 1),
  });

  // Micro camera shake on trigger execution at frame 75
  const shakeFrame = frame - 75;
  let shakeX = 0;
  let shakeY = 0;
  if (shakeFrame >= 0 && shakeFrame < 14) {
    const shakeAmp = (1 - shakeFrame / 14) * 6;
    shakeX = Math.sin(shakeFrame * 2.8) * shakeAmp;
    shakeY = Math.cos(shakeFrame * 3.4) * shakeAmp;
  }

  // Hero Card entrance
  const cardSpring = spring({
    frame,
    fps,
    config: { damping: 18, stiffness: 80, mass: 0.9 },
  });
  const cardY = interpolate(cardSpring, [0, 1], [40, 0]);
  const cardOpacity = interpolate(cardSpring, [0, 1], [0, 1]);
  const floatOffset = Math.sin(frame / 25) * 5;

  // Clock pulse & colon blink
  const pulse = Math.sin(frame / 12) * 0.03 + 1;
  const colonOpacity = Math.sin(frame / 8) > 0 ? 1 : 0.35;

  // Workflow graph node animation timings
  const node1Progress = interpolate(frame - 15, [0, 12], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.16, 1, 0.3, 1),
  });
  const node2Progress = interpolate(frame - 30, [0, 12], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.16, 1, 0.3, 1),
  });
  const node3Progress = interpolate(frame - 45, [0, 12], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.16, 1, 0.3, 1),
  });
  const node4Progress = interpolate(frame - 60, [0, 12], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.16, 1, 0.3, 1),
  });
  const node5Progress = interpolate(frame - 75, [0, 12], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.16, 1, 0.3, 1),
  });

  // Curve connections progress
  const curve1Progress = interpolate(frame - 25, [0, 18], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.quad),
  });
  const curve2Progress = interpolate(frame - 40, [0, 18], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.quad),
  });
  const curve3Progress = interpolate(frame - 55, [0, 18], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.quad),
  });
  const curve4Progress = interpolate(frame - 70, [0, 18], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.quad),
  });

  // Payload envelope traversal across 2D n8n network layout
  const envProgress = interpolate(frame - 75, [0, 45], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.25, 1, 0.5, 1),
  });

  // Dynamic 2D path coordinates for payload: Node 2 (lower-left) -> Node 3 (center) -> Node 5 (lower-right)
  const envX = interpolate(
    envProgress,
    [0, 0.5, 1],
    [320, 960, 1600]
  );
  const envY = interpolate(
    envProgress,
    [0, 0.5, 1],
    [780, 630, 810]
  );
  const envOpacity = interpolate(frame - 75, [0, 5, 40, 45], [0, 1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const emeraldBloom = interpolate(frame, [75, 88, 120], [0, 0.5, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Atmospheric background particles across all 4 quadrants
  const bgParticles = Array.from({ length: 28 }).map((_, i) => ({
    x: ((i * 137.5 + i * 29) % 1840) + 40,
    y: ((i * 91.3 + i * 47) % 1000) + 40,
    size: 16 + (i % 6) * 12,
    blur: 4 + (i % 4) * 5,
    opacity: 0.12 + (i % 4) * 0.08,
    color: i % 3 === 0 ? "#00D9FF" : i % 3 === 1 ? "#E7B84D" : "#10B981",
    speed: 0.4 + (i % 3) * 0.3,
  }));

  // Foreground dust specks balancing dead zones (lower-left & lower-right)
  const dust = Array.from({ length: 24 }).map((_, i) => ({
    x: (i * 112.3 + frame * (0.35 + (i % 3) * 0.2)) % 1920,
    y: ((i * 83.9) % 1080) + Math.sin(frame * 0.025 + i) * 16,
    size: 2 + (i % 3),
    opacity: 0.2 + ((Math.sin(frame * 0.035 + i) + 1) / 2) * 0.35,
    color: i % 2 === 0 ? "#00D9FF" : "#E7B84D",
  }));

  return (
    <AbsoluteFill
      style={{
        width: 1920,
        height: 1080,
        backgroundColor: "#020108",
        overflow: "hidden",
        fontFamily: '"Inter", "Montserrat", system-ui, sans-serif',
      }}
    >
      {/* SFX Sequences */}
      <Sequence from={3}>
        <Audio src={staticFile("sfx/whoosh.wav")} volume={0.25} />
      </Sequence>
      <Sequence from={30}>
        <Audio src={staticFile("sfx/clock-tick.wav")} volume={0.2} />
      </Sequence>
      <Sequence from={75}>
        <Audio src={staticFile("sfx/ding-low.wav")} volume={0.3} />
      </Sequence>

      {/* Camera World Container */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          transform: `scale(${camZoom}) translate(${shakeX}px, ${shakeY}px)`,
          transformOrigin: "center center",
        }}
      >
        {/* Radial Background */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(circle at 50% 45%, #0A1628 0%, #020108 100%)",
          }}
        />

        {/* Quadrant Visual Weight Glows for Lower Left & Lower Right */}
        <div
          style={{
            position: "absolute",
            bottom: -80,
            left: -80,
            width: 600,
            height: 600,
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(0, 217, 255, 0.12) 0%, transparent 70%)",
            pointerEvents: "none",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: -80,
            right: -80,
            width: 600,
            height: 600,
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(16, 185, 129, 0.12) 0%, transparent 70%)",
            pointerEvents: "none",
          }}
        />

        {/* Ambient DOF Particles */}
        {bgParticles.map((pt, i) => (
          <div
            key={`bgp-${i}`}
            style={{
              position: "absolute",
              left: pt.x,
              top: pt.y,
              width: pt.size,
              height: pt.size,
              borderRadius: "50%",
              backgroundColor: pt.color,
              filter: `blur(${pt.blur}px)`,
              opacity:
                pt.opacity *
                (((Math.sin(frame * 0.04 + i) + 1) / 2) * 0.5 + 0.5),
              transform: `translateY(${Math.sin((frame * pt.speed) / 20) * 18}px)`,
            }}
          />
        ))}

        {/* n8n Grid Lines Background */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            filter: "blur(2px)",
            opacity: 0.3,
            pointerEvents: "none",
          }}
        >
          <svg width="1920" height="1080" style={{ position: "absolute" }}>
            <defs>
              <pattern
                id="workflowGrid"
                width="80"
                height="80"
                patternUnits="userSpaceOnUse"
              >
                <path
                  d="M 80 0 L 0 0 0 80"
                  fill="none"
                  stroke="rgba(0, 217, 255, 0.12)"
                  strokeWidth="1"
                />
                <circle cx="80" cy="80" r="2" fill="rgba(0, 217, 255, 0.2)" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#workflowGrid)" />
          </svg>
        </div>

        {/* HERO CLOCK CONTAINER */}
        <div
          style={{
            position: "absolute",
            top: 60,
            left: "50%",
            transform: `translateX(-50%) translateY(${cardY + floatOffset}px)`,
            opacity: cardOpacity,
            width: 880,
            padding: "28px 48px",
            borderRadius: 28,
            backgroundColor: "rgba(10, 22, 40, 0.65)",
            border: "1px solid rgba(255, 255, 255, 0.14)",
            backdropFilter: "blur(24px)",
            WebkitBackdropFilter: "blur(24px)",
            boxShadow:
              "0 24px 80px rgba(0, 0, 0, 0.7), inset 0 1px 1px rgba(255, 255, 255, 0.2), 0 0 32px rgba(0, 217, 255, 0.15)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            textAlign: "center",
            zIndex: 10,
          }}
        >
          {/* Header Label */}
          <div
            style={{
              color: "#00D9FF",
              fontSize: 16,
              fontWeight: 800,
              letterSpacing: 5,
              textTransform: "uppercase",
              marginBottom: 8,
              textShadow: "0 0 14px rgba(0, 217, 255, 0.6)",
            }}
          >
            AUTOMATED WORKFLOW ENGINE
          </div>

          {/* Clock Display */}
          <div
            style={{
              height: 100,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              position: "relative",
            }}
          >
            <div
              style={{
                fontSize: 96,
                fontWeight: 800,
                color: "#E7B84D",
                fontFamily:
                  '"Consolas", "Courier New", "Monaco", monospace',
                letterSpacing: 2,
                lineHeight: "100px",
                textShadow:
                  "0 0 20px rgba(231, 184, 77, 0.8), 0 0 40px rgba(231, 184, 77, 0.3)",
                transform: `scale(${pulse})`,
                display: "flex",
                alignItems: "center",
              }}
            >
              <span>03</span>

              {/* Colon Separator with 20px Radial Amber Bloom */}
              <div
                style={{
                  position: "relative",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 4px",
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    width: 20,
                    height: 20,
                    borderRadius: "50%",
                    background:
                      "radial-gradient(circle, rgba(231, 184, 77, 0.9) 0%, rgba(231, 184, 77, 0) 75%)",
                    filter: "blur(4px)",
                    pointerEvents: "none",
                  }}
                />
                <span style={{ opacity: colonOpacity, position: "relative" }}>
                  :
                </span>
              </div>

              <span>00</span>
              <span
                style={{
                  fontSize: 44,
                  marginLeft: 16,
                  fontWeight: 800,
                  color: "#F59E0B",
                  letterSpacing: 2,
                }}
              >
                AM
              </span>
            </div>
          </div>

          {/* Visual Typography Subtext */}
          <div
            style={{
              marginTop: 12,
              padding: "6px 20px",
              borderRadius: 20,
              backgroundColor: "rgba(16, 185, 129, 0.12)",
              border: "1px solid rgba(16, 185, 129, 0.3)",
              display: "flex",
              alignItems: "center",
              gap: 10,
              boxShadow: "0 0 16px rgba(16, 185, 129, 0.15)",
            }}
          >
            <span
              style={{
                width: 10,
                height: 10,
                borderRadius: "50%",
                backgroundColor: "#10B981",
                boxShadow: "0 0 10px #10B981",
              }}
            />
            <span
              style={{
                color: "#E2E8F0",
                fontSize: 18,
                fontWeight: 700,
                letterSpacing: 2.5,
                textTransform: "uppercase",
              }}
            >
              Zero Human Intervention
            </span>
          </div>
        </div>

        {/* 2D n8n WORKFLOW GRAPH CANVAS (Spans Lower 60% with 3D Z-Depth perspective) */}
        <div
          style={{
            position: "absolute",
            top: 380,
            left: 0,
            right: 0,
            bottom: 40,
            transform: "perspective(1000px) rotateX(15deg)",
            transformOrigin: "center top",
            zIndex: 5,
          }}
        >
          {/* Animated Connecting Bezier Curves Across Quadrants */}
          <svg
            width="1920"
            height="660"
            style={{ position: "absolute", inset: 0, overflow: "visible" }}
          >
            <defs>
              <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#00D9FF" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#E7B84D" stopOpacity="0.8" />
              </linearGradient>
              <linearGradient id="grad2" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#00D9FF" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#00D9FF" stopOpacity="0.8" />
              </linearGradient>
              <linearGradient id="grad3" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#E7B84D" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#10B981" stopOpacity="0.8" />
              </linearGradient>
              <linearGradient id="grad4" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#10B981" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#10B981" stopOpacity="0.8" />
              </linearGradient>
            </defs>

            {/* Path 1: Top-Left Node 1 -> Lower-Left Node 2 */}
            <path
              d="M 280 150 C 280 230, 320 280, 320 360"
              fill="none"
              stroke="rgba(0, 217, 255, 0.2)"
              strokeWidth="4"
            />
            <path
              d="M 280 150 C 280 230, 320 280, 320 360"
              fill="none"
              stroke="url(#grad2)"
              strokeWidth="4"
              strokeDasharray="300"
              strokeDashoffset={300 * (1 - curve1Progress)}
              style={{ filter: "drop-shadow(0 0 8px #00D9FF)" }}
            />

            {/* Path 2: Lower-Left Node 2 -> Center Node 3 */}
            <path
              d="M 420 400 C 600 400, 720 260, 840 230"
              fill="none"
              stroke="rgba(231, 184, 77, 0.2)"
              strokeWidth="4"
            />
            <path
              d="M 420 400 C 600 400, 720 260, 840 230"
              fill="none"
              stroke="url(#grad1)"
              strokeWidth="4"
              strokeDasharray="500"
              strokeDashoffset={500 * (1 - curve2Progress)}
              style={{ filter: "drop-shadow(0 0 8px #E7B84D)" }}
            />

            {/* Path 3: Center Node 3 -> Lower-Right Node 5 */}
            <path
              d="M 1080 230 C 1220 260, 1340 430, 1480 430"
              fill="none"
              stroke="rgba(16, 185, 129, 0.2)"
              strokeWidth="4"
            />
            <path
              d="M 1080 230 C 1220 260, 1340 430, 1480 430"
              fill="none"
              stroke="url(#grad3)"
              strokeWidth="4"
              strokeDasharray="500"
              strokeDashoffset={500 * (1 - curve3Progress)}
              style={{ filter: "drop-shadow(0 0 8px #10B981)" }}
            />

            {/* Path 4: Center Node 3 -> Upper-Right Node 4 */}
            <path
              d="M 1080 210 C 1220 180, 1380 150, 1500 150"
              fill="none"
              stroke="rgba(16, 185, 129, 0.2)"
              strokeWidth="4"
            />
            <path
              d="M 1080 210 C 1220 180, 1380 150, 1500 150"
              fill="none"
              stroke="url(#grad4)"
              strokeWidth="4"
              strokeDasharray="450"
              strokeDashoffset={450 * (1 - curve4Progress)}
              style={{ filter: "drop-shadow(0 0 8px #10B981)" }}
            />
          </svg>

          {/* Node 1: Top-Left Secondary Trigger Card */}
          <div
            style={{
              position: "absolute",
              left: 170,
              top: 90,
              width: 230,
              padding: "16px 20px",
              borderRadius: 18,
              background: "rgba(10, 22, 40, 0.85)",
              border: "1px solid rgba(0, 217, 255, 0.4)",
              boxShadow:
                "0 12px 36px rgba(0, 0, 0, 0.6), 0 0 20px rgba(0, 217, 255, 0.2)",
              backdropFilter: "blur(16px)",
              WebkitBackdropFilter: "blur(16px)",
              opacity: node1Progress,
              transform: `scale(${0.8 + node1Progress * 0.2}) rotate(-2deg)`,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                marginBottom: 6,
              }}
            >
              <div
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: "50%",
                  backgroundColor: "#00D9FF",
                  boxShadow: "0 0 8px #00D9FF",
                }}
              />
              <span
                style={{
                  color: "#00D9FF",
                  fontSize: 12,
                  fontWeight: 700,
                  letterSpacing: 1.5,
                  textTransform: "uppercase",
                }}
              >
                Cron Scheduler
              </span>
            </div>
            <div style={{ color: "#E2E8F0", fontSize: 15, fontWeight: 600 }}>
              03:00 AM Trigger
            </div>
          </div>

          {/* Node 2: Lower-Left Quadrant Node (Balances Left Visual Weight) */}
          <div
            style={{
              position: "absolute",
              left: 200,
              top: 340,
              width: 250,
              padding: "18px 22px",
              borderRadius: 18,
              background: "rgba(10, 22, 40, 0.85)",
              border: "1px solid rgba(0, 217, 255, 0.4)",
              boxShadow:
                "0 12px 36px rgba(0, 0, 0, 0.6), 0 0 24px rgba(0, 217, 255, 0.25)",
              backdropFilter: "blur(16px)",
              WebkitBackdropFilter: "blur(16px)",
              opacity: node2Progress,
              transform: `scale(${0.8 + node2Progress * 0.2}) rotate(3deg)`,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                marginBottom: 6,
              }}
            >
              <div
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: "50%",
                  backgroundColor: "#00D9FF",
                  boxShadow: "0 0 8px #00D9FF",
                }}
              />
              <span
                style={{
                  color: "#00D9FF",
                  fontSize: 12,
                  fontWeight: 700,
                  letterSpacing: 1.5,
                  textTransform: "uppercase",
                }}
              >
                Inbound Webhook
              </span>
            </div>
            <div style={{ color: "#E2E8F0", fontSize: 16, fontWeight: 600 }}>
              Fetch Payload Data
            </div>
          </div>

          {/* Node 3: Center AI Engine Node */}
          <div
            style={{
              position: "absolute",
              left: 830,
              top: 170,
              width: 260,
              padding: "20px 24px",
              borderRadius: 20,
              background: "rgba(10, 22, 40, 0.9)",
              border: "1px solid rgba(231, 184, 77, 0.5)",
              boxShadow:
                "0 16px 44px rgba(0, 0, 0, 0.7), 0 0 30px rgba(231, 184, 77, 0.3)",
              backdropFilter: "blur(20px)",
              WebkitBackdropFilter: "blur(20px)",
              opacity: node3Progress,
              transform: `scale(${0.8 + node3Progress * 0.2})`,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                marginBottom: 6,
              }}
            >
              <div
                style={{
                  width: 12,
                  height: 12,
                  borderRadius: "50%",
                  backgroundColor: "#E7B84D",
                  boxShadow: "0 0 10px #E7B84D",
                }}
              />
              <span
                style={{
                  color: "#E7B84D",
                  fontSize: 13,
                  fontWeight: 800,
                  letterSpacing: 1.5,
                  textTransform: "uppercase",
                }}
              >
                n8n AI Engine
              </span>
            </div>
            <div style={{ color: "#FFFFFF", fontSize: 17, fontWeight: 700 }}>
              Auto Parse & Route
            </div>
          </div>

          {/* Node 4: Upper-Right Secondary Action Card */}
          <div
            style={{
              position: "absolute",
              right: 180,
              top: 90,
              width: 240,
              padding: "16px 20px",
              borderRadius: 18,
              background: "rgba(10, 22, 40, 0.85)",
              border: "1px solid rgba(16, 185, 129, 0.4)",
              boxShadow:
                "0 12px 36px rgba(0, 0, 0, 0.6), 0 0 20px rgba(16, 185, 129, 0.2)",
              backdropFilter: "blur(16px)",
              WebkitBackdropFilter: "blur(16px)",
              opacity: node4Progress,
              transform: `scale(${0.8 + node4Progress * 0.2}) rotate(2deg)`,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                marginBottom: 6,
              }}
            >
              <div
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: "50%",
                  backgroundColor: "#10B981",
                  boxShadow: "0 0 8px #10B981",
                }}
              />
              <span
                style={{
                  color: "#10B981",
                  fontSize: 12,
                  fontWeight: 700,
                  letterSpacing: 1.5,
                  textTransform: "uppercase",
                }}
              >
                Database Write
              </span>
            </div>
            <div style={{ color: "#E2E8F0", fontSize: 15, fontWeight: 600 }}>
              Insert Sync Log
            </div>
          </div>

          {/* Node 5: Lower-Right Quadrant Node (Balances Right Visual Weight) */}
          <div
            style={{
              position: "absolute",
              right: 200,
              top: 360,
              width: 250,
              padding: "18px 22px",
              borderRadius: 18,
              background: "rgba(10, 22, 40, 0.85)",
              border: "1px solid rgba(16, 185, 129, 0.4)",
              boxShadow:
                "0 12px 36px rgba(0, 0, 0, 0.6), 0 0 24px rgba(16, 185, 129, 0.25)",
              backdropFilter: "blur(16px)",
              WebkitBackdropFilter: "blur(16px)",
              opacity: node5Progress,
              transform: `scale(${0.8 + node5Progress * 0.2}) rotate(-3deg)`,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                marginBottom: 6,
              }}
            >
              <div
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: "50%",
                  backgroundColor: "#10B981",
                  boxShadow: "0 0 8px #10B981",
                }}
              />
              <span
                style={{
                  color: "#10B981",
                  fontSize: 12,
                  fontWeight: 700,
                  letterSpacing: 1.5,
                  textTransform: "uppercase",
                }}
              >
                Slack Dispatch
              </span>
            </div>
            <div style={{ color: "#E2E8F0", fontSize: 16, fontWeight: 600 }}>
              Send Alert Notification
            </div>
          </div>
        </div>

        {/* Dynamic Flying Envelope Payload Across Graph Nodes */}
        {frame >= 75 && (
          <div
            style={{
              position: "absolute",
              transform: `translate(${envX}px, ${envY}px)`,
              opacity: envOpacity,
              zIndex: 12,
              pointerEvents: "none",
            }}
          >
            <div
              style={{
                position: "absolute",
                transform: "translate(-50%, -50%)",
                width: 120,
                height: 120,
                borderRadius: "50%",
                background:
                  "radial-gradient(circle, rgba(0, 217, 255, 0.6) 0%, transparent 70%)",
              }}
            />
            <Img
              src={staticFile("08_PROPS/envelope.png")}
              style={{
                width: 84,
                height: "auto",
                transform: "translate(-50%, -50%) rotate(10deg)",
                filter:
                  "drop-shadow(0 0 20px #00D9FF) drop-shadow(0 0 8px #E7B84D)",
              }}
            />
          </div>
        )}

        {/* Emerald Glow Flash on Execution */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(circle at 50% 60%, rgba(16, 185, 129, 0.25) 0%, transparent 70%)",
            opacity: emeraldBloom,
            pointerEvents: "none",
            zIndex: 15,
          }}
        />

        {/* Foreground Dust Specks Balancing Dead Quadrants */}
        {dust.map((d, i) => (
          <div
            key={`dust-${i}`}
            style={{
              position: "absolute",
              left: d.x,
              top: d.y,
              width: d.size,
              height: d.size,
              borderRadius: "50%",
              backgroundColor: d.color,
              opacity: d.opacity,
              pointerEvents: "none",
              zIndex: 16,
            }}
          />
        ))}
      </div>

      {/* Cinematic Vignette */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(ellipse at center, transparent 45%, rgba(2, 1, 8, 0.88) 100%)",
          pointerEvents: "none",
        }}
      />

      {/* Subtle SVG Film Grain Overlay */}
      <svg style={{ position: "absolute", width: 0, height: 0 }}>
        <filter id="scene3amGrain">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.8"
            numOctaves="3"
            stitchTiles="stitch"
          />
          <feColorMatrix type="saturate" values="0" />
        </filter>
      </svg>
      <div
        style={{
          position: "absolute",
          inset: 0,
          filter: "url(#scene3amGrain)",
          opacity: 0.025,
          pointerEvents: "none",
        }}
      />
    </AbsoluteFill>
  );
}