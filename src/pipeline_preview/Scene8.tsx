// duration: 170
import React from "react";
import {
  AbsoluteFill,
  Audio,
  Img,
  Sequence,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

export const Scene8: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Font styling
  const fontStyle = {
    fontFamily: "'Plus Jakarta Sans', Arial, sans-serif",
  };

  // Animated Springs
  const headerSpring = spring({
    frame: frame - 4,
    fps,
    config: { damping: 14, mass: 0.8, stiffness: 100 },
  });

  const payrollSpring = spring({
    frame: frame - 12,
    fps,
    config: { damping: 15, mass: 0.9, stiffness: 90 },
  });

  const strikeSpring = spring({
    frame: frame - 32,
    fps,
    config: { damping: 16, mass: 0.5, stiffness: 200 },
  });

  const automateSpring = spring({
    frame: frame - 48,
    fps,
    config: { damping: 12, mass: 0.8, stiffness: 110 },
  });

  const hubSpring = spring({
    frame: frame - 58,
    fps,
    config: { damping: 14, mass: 0.9, stiffness: 85 },
  });

  const dingPulse = spring({
    frame: frame - 88,
    fps,
    config: { damping: 10, stiffness: 180 },
  });

  // Interpolations
  const strikeProgress = interpolate(strikeSpring, [0, 1], [0, 106], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const impactFlash = interpolate(frame, [32, 35, 50], [0, 0.4, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const cyanFlareScale = interpolate(dingPulse, [0, 1], [0.3, 2.5]);
  const cyanFlareOpacity = interpolate(frame, [88, 96, 120], [0, 0.75, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Continuous background grid drift
  const gridY = (frame * 0.8) % 80;

  // Orbiting ring rotation
  const ringRotation = frame * 1.2;

  // Background floating ambient particles for depth
  const particles = [
    { x: 180, y: 820, size: 6, speed: 0.4 },
    { x: 420, y: 910, size: 10, speed: 0.6 },
    { x: 890, y: 860, size: 8, speed: 0.5 },
    { x: 1450, y: 890, size: 7, speed: 0.7 },
    { x: 1720, y: 830, size: 12, speed: 0.3 },
    { x: 280, y: 220, size: 8, speed: 0.5 },
    { x: 1650, y: 260, size: 9, speed: 0.4 },
  ];

  return (
    <AbsoluteFill
      style={{
        background: "radial-gradient(circle at 50% 40%, #0B1120 0%, #07090D 100%)",
        color: "#FFFFFF",
        ...fontStyle,
        overflow: "hidden",
      }}
    >
      {/* Google Fonts Import */}
      <style>
        {`@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@700;800;900&family=JetBrains+Mono:wght@500;700;800&display=swap');`}
      </style>

      {/* Gradient Mesh Base */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(circle at 18% 30%, rgba(255, 109, 90, 0.12) 0%, transparent 55%), radial-gradient(circle at 82% 75%, rgba(0, 217, 255, 0.12) 0%, transparent 50%), radial-gradient(circle at 45% 85%, rgba(231, 184, 77, 0.08) 0%, transparent 55%)",
          transform: `translate(${Math.sin(frame / 80) * 7}px, ${Math.cos(frame / 100) * 7}px)`,
          pointerEvents: "none",
        }}
      />

      {/* SFX Audio Tracks */}
      <Sequence from={4}>
        <Audio src={staticFile("audio/sfx/whoosh_heavy.wav")} volume={0.3} />
      </Sequence>
      <Sequence from={32}>
        <Audio src={staticFile("audio/sfx/impact.wav")} volume={0.35} />
      </Sequence>
      <Sequence from={88}>
        <Audio src={staticFile("sfx/ding-confirm.wav")} volume={0.35} />
      </Sequence>

      {/* Enhanced Background Perspective Grid with Higher Opacity */}
      <div
        style={{
          position: "absolute",
          inset: "-100px",
          backgroundImage: `
            linear-gradient(rgba(0, 217, 255, 0.05) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0, 217, 255, 0.05) 1px, transparent 1px)
          `,
          backgroundSize: "80px 80px",
          backgroundPosition: `0px ${gridY}px`,
          opacity: 0.5,
          maskImage:
            "radial-gradient(ellipse at center, black 30%, transparent 82%)",
          WebkitMaskImage:
            "radial-gradient(ellipse at center, black 30%, transparent 82%)",
        }}
      />

      {/* Floating Particles in Lower & Peripheral Regions for Depth */}
      {particles.map((p, i) => {
        const floatY = Math.sin((frame * p.speed + i * 10) * 0.05) * 12;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: p.x,
              top: p.y + floatY,
              width: p.size,
              height: p.size,
              borderRadius: "50%",
              backgroundColor: i % 2 === 0 ? "#00D9FF" : "#FF6D5A",
              opacity: 0.35,
              filter: `blur(${p.size / 2}px)`,
              boxShadow: `0 0 ${p.size * 2}px ${i % 2 === 0 ? "#00D9FF" : "#FF6D5A"}`,
            }}
          />
        );
      })}

      {/* Coral Impact Glow Flash (Triggered at frame 32) */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundColor: "#FF6D5A",
          opacity: impactFlash,
          pointerEvents: "none",
          mixBlendMode: "screen",
        }}
      />

      {/* Cyan Flare Burst (Triggered at frame 88) */}
      <div
        style={{
          position: "absolute",
          top: "70%",
          left: "50%",
          width: 700,
          height: 700,
          marginLeft: -350,
          marginTop: -350,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(0, 217, 255, 0.8) 0%, rgba(0, 217, 255, 0.2) 45%, transparent 70%)",
          transform: `scale(${cyanFlareScale})`,
          opacity: cyanFlareOpacity,
          pointerEvents: "none",
          mixBlendMode: "screen",
          filter: "blur(24px)",
        }}
      />

      {/* VERTICALLY BALANCED MAIN CONTAINER */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "45px 0 45px 0",
          boxSizing: "border-box",
        }}
      >
        {/* HEADER SECTION: "DON'T HIRE MORE STAFF" */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            transform: `translateY(${interpolate(headerSpring, [0, 1], [-30, 0])}px)`,
            opacity: interpolate(headerSpring, [0, 1], [0, 1]),
          }}
        >
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 12,
              padding: "8px 24px",
              borderRadius: 30,
              backgroundColor: "rgba(255, 109, 90, 0.12)",
              border: "1px solid rgba(255, 109, 90, 0.4)",
              marginBottom: 10,
            }}
          >
            <span
              style={{
                width: 10,
                height: 10,
                borderRadius: "50%",
                backgroundColor: "#FF6D5A",
                boxShadow: "0 0 10px #FF6D5A",
              }}
            />
            <span
              style={{
                fontSize: 22,
                fontWeight: 800,
                color: "#FF6D5A",
                letterSpacing: "0.1em",
              }}
            >
              DON'T HIRE MORE STAFF
            </span>
          </div>

          {/* SECONDARY HEADLINE: "AUTOMATE WITH N8N" */}
          <h1
            style={{
              fontSize: 68,
              fontWeight: 900,
              margin: 0,
              letterSpacing: "-0.02em",
              textAlign: "center",
              background: "linear-gradient(135deg, #FFFFFF 30%, #00D9FF 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              filter: "drop-shadow(0 8px 20px rgba(0,0,0,0.6))",
              transform: `scale(${interpolate(automateSpring, [0, 1], [0.9, 1])})`,
              opacity: interpolate(automateSpring, [0, 1], [0, 1]),
            }}
          >
            AUTOMATE WITH N8N
          </h1>
        </div>

        {/* MIDDLE SECTION: HIGH-OVERHEAD PAYROLL EXPENSE LIST (SHIFTED DOWN BY 30PX FOR VERTICAL BALANCE) */}
        <div
          style={{
            width: 1040,
            marginTop: 30,
            transform: `translateY(${interpolate(payrollSpring, [0, 1], [40, 0])}px)`,
            opacity: interpolate(payrollSpring, [0, 1], [0, 1]),
            position: "relative",
          }}
        >
          <div
            style={{
              backgroundColor: "rgba(255, 255, 255, 0.05)",
              backdropFilter: "blur(12px) saturate(120%)",
              WebkitBackdropFilter: "blur(12px) saturate(120%)",
              borderRadius: 24,
              border: "1px solid rgba(255, 255, 255, 0.12)",
              padding: "28px 40px",
              boxShadow:
                "0 20px 50px rgba(0, 0, 0, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.12)",
              display: "flex",
              flexDirection: "column",
              gap: 16,
              position: "relative",
              overflow: "hidden",
            }}
          >
            {/* Payroll Header */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                borderBottom: "1px solid rgba(255,255,255,0.08)",
                paddingBottom: 12,
              }}
            >
              <span style={{ fontSize: 18, color: "#94A3B8", fontWeight: 800, letterSpacing: "0.05em" }}>
                ANNUAL PAYROLL EXPENSES
              </span>
              <span
                style={{
                  fontSize: 20,
                  fontWeight: 800,
                  color: "#FF6D5A",
                  fontFamily: "'JetBrains Mono', 'IBM Plex Mono', monospace",
                  backgroundColor: "rgba(255, 109, 90, 0.15)",
                  padding: "4px 16px",
                  borderRadius: 10,
                  border: "1px solid rgba(255, 109, 90, 0.3)",
                }}
              >
                +$250,000 / yr OVERHEAD
              </span>
            </div>

            {/* Expense Item 1 */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                fontSize: 22,
                fontWeight: 700,
                color: "rgba(255,255,255,0.85)",
              }}
            >
              <span>Senior Workflow Engineer</span>
              <span style={{ color: "#FFFFFF", fontFamily: "'JetBrains Mono', 'IBM Plex Mono', monospace", fontSize: 24 }}>$130,000 / yr</span>
            </div>

            {/* Expense Item 2 */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                fontSize: 22,
                fontWeight: 700,
                color: "rgba(255,255,255,0.85)",
              }}
            >
              <span>Operations Manager</span>
              <span style={{ color: "#FFFFFF", fontFamily: "'JetBrains Mono', 'IBM Plex Mono', monospace", fontSize: 24 }}>$90,000 / yr</span>
            </div>

            {/* Expense Item 3 */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                fontSize: 22,
                fontWeight: 700,
                color: "rgba(255,255,255,0.85)",
              }}
            >
              <span>Benefits, Desk & Software Seats</span>
              <span style={{ color: "#FFFFFF", fontFamily: "'JetBrains Mono', 'IBM Plex Mono', monospace", fontSize: 24 }}>$30,000 / yr</span>
            </div>

            {/* VIOLENT CORAL (#FF6D5A) STRIKETHROUGH OVERLAY WITH DISINTEGRATION EMBERS */}
            {frame >= 32 && (
              <>
                {/* Thick Primary Strikethrough Slash Bar */}
                <div
                  style={{
                    position: "absolute",
                    top: "55%",
                    left: "-3%",
                    width: `${strikeProgress}%`,
                    height: 16,
                    backgroundColor: "#FF6D5A",
                    borderRadius: 8,
                    boxShadow: "0 0 30px #FF6D5A, 0 0 60px rgba(255, 109, 90, 0.9)",
                    transform: "translateY(-50%) rotate(-3deg)",
                    transformOrigin: "left center",
                    zIndex: 10,
                  }}
                />

                {/* Secondary Parallel Coral Accent Strikethrough */}
                <div
                  style={{
                    position: "absolute",
                    top: "59%",
                    left: "-2%",
                    width: `${strikeProgress * 0.98}%`,
                    height: 6,
                    backgroundColor: "#E7B84D",
                    borderRadius: 4,
                    boxShadow: "0 0 15px #E7B84D",
                    transform: "translateY(-50%) rotate(-3deg)",
                    transformOrigin: "left center",
                    zIndex: 9,
                    opacity: 0.8,
                  }}
                />

                {/* Particle Dust / Disintegration Ember Fragments along Coral Slash */}
                {Array.from({ length: 18 }).map((_, i) => {
                  const pFrame = frame - 32;
                  if (pFrame < 0) return null;
                  const posX = 4 + i * 5.5;
                  if (posX > strikeProgress) return null;

                  const driftY =
                    Math.sin(i * 1.8 + frame * 0.1) * 20 -
                    pFrame * (0.6 + (i % 3) * 0.4);
                  const driftX = (i % 2 === 0 ? 1 : -1) * (pFrame * 0.6 + (i % 4) * 2);
                  const emberSize = 3 + (i % 4) * 2;
                  const emberOpacity = Math.max(0, 1 - pFrame / 45);

                  return (
                    <div
                      key={`ember-${i}`}
                      style={{
                        position: "absolute",
                        left: `${posX}%`,
                        top: `calc(55% + ${driftY}px)`,
                        width: emberSize,
                        height: emberSize,
                        borderRadius: "50%",
                        backgroundColor: i % 3 === 0 ? "#E7B84D" : "#FF6D5A",
                        boxShadow: `0 0 ${emberSize * 3}px ${i % 3 === 0 ? "#E7B84D" : "#FF6D5A"}`,
                        transform: `translate(${driftX}px, 0)`,
                        opacity: emberOpacity,
                        pointerEvents: "none",
                        zIndex: 11,
                      }}
                    />
                  );
                })}

                {/* Tinted Cancelled Card Mask */}
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    backgroundColor: "rgba(255, 109, 90, 0.08)",
                    border: "2px solid #FF6D5A",
                    borderRadius: 24,
                    pointerEvents: "none",
                    boxShadow: "inset 0 0 40px rgba(255, 109, 90, 0.25)",
                  }}
                />

                {/* Detached "EXPENSE ELIMINATED" Badge floating just above slash with bold 45-degree drop shadow */}
                <div
                  style={{
                    position: "absolute",
                    right: 48,
                    top: 14,
                    transform: "rotate(-10deg)",
                    backgroundColor: "#FF6D5A",
                    color: "#FFFFFF",
                    fontSize: 19,
                    fontWeight: 900,
                    padding: "8px 22px",
                    borderRadius: 8,
                    letterSpacing: "0.15em",
                    border: "1.5px solid rgba(255, 255, 255, 0.9)",
                    boxShadow:
                      "12px 12px 35px rgba(0, 0, 0, 0.85), 0 0 25px rgba(255, 109, 90, 0.7)",
                    zIndex: 15,
                  }}
                >
                  EXPENSE ELIMINATED
                </div>
              </>
            )}
          </div>
        </div>

        {/* LOWER SECTION: AUTOMATION ENGINE HUB */}
        <div
          style={{
            width: 1040,
            transform: `translateY(${interpolate(hubSpring, [0, 1], [50, 0])}px)`,
            opacity: interpolate(hubSpring, [0, 1], [0, 1]),
            position: "relative",
          }}
        >
          {/* Glass Card Container */}
          <div
            style={{
              height: 250,
              borderRadius: 24,
              backgroundColor: "rgba(255, 255, 255, 0.05)",
              backdropFilter: "blur(12px) saturate(120%)",
              WebkitBackdropFilter: "blur(12px) saturate(120%)",
              border: "1.5px solid #00D9FF",
              boxShadow:
                "0 25px 60px rgba(0,0,0,0.7), 0 0 50px rgba(0, 217, 255, 0.2), inset 0 1px 0 rgba(255,255,255,0.12)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "0 60px",
              position: "relative",
              overflow: "hidden",
            }}
          >
            {/* Background Orbit Ring */}
            <div
              style={{
                position: "absolute",
                left: "50%",
                top: "50%",
                width: 460,
                height: 460,
                marginLeft: -230,
                marginTop: -230,
                borderRadius: "50%",
                border: "1.5px dashed rgba(0, 217, 255, 0.35)",
                transform: `rotate(${ringRotation}deg)`,
                pointerEvents: "none",
              }}
            />

            {/* Left Node: AI Core Agent */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 12,
                zIndex: 2,
              }}
            >
              <div
                style={{
                  width: 100,
                  height: 100,
                  borderRadius: 20,
                  backgroundColor: "rgba(0, 217, 255, 0.12)",
                  border: "2px solid #00D9FF",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 10px 30px rgba(0, 217, 255, 0.4)",
                }}
              >
                <Img
                  src={staticFile("02_ICONS/ai-cpu.svg")}
                  style={{
                    width: 58,
                    height: 58,
                    filter: "drop-shadow(0 0 12px #00D9FF)",
                  }}
                />
              </div>
              <span
                style={{
                  fontSize: 16,
                  fontWeight: 800,
                  color: "#00D9FF",
                  letterSpacing: "0.08em",
                }}
              >
                AI CORE AGENT
              </span>
            </div>

            {/* Center Animated Connection Line with High Glow Intensity */}
            <div
              style={{
                flex: 1,
                margin: "0 40px",
                height: 6,
                backgroundColor: "rgba(0, 217, 255, 0.35)",
                borderRadius: 3,
                position: "relative",
                overflow: "hidden",
                zIndex: 2,
                boxShadow: "0 0 20px #00D9FF, 0 0 35px rgba(0, 217, 255, 0.8)",
              }}
            >
              {/* Flowing High-Glow Pulse Beam */}
              <div
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  bottom: 0,
                  width: 180,
                  background:
                    "linear-gradient(90deg, transparent 0%, #FFFFFF 30%, #00D9FF 70%, transparent 100%)",
                  transform: `translateX(${((frame * 10) % 550) - 150}px)`,
                  boxShadow: "0 0 25px #00D9FF, 0 0 50px #00D9FF, 0 0 80px #FFFFFF",
                }}
              />
            </div>

            {/* Right Node: n8n Automation Hub */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 12,
                zIndex: 2,
              }}
            >
              <div
                style={{
                  width: 100,
                  height: 100,
                  borderRadius: 20,
                  backgroundColor: "rgba(255, 109, 90, 0.12)",
                  border: "2px solid #FF6D5A",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 10px 30px rgba(255, 109, 90, 0.4)",
                }}
              >
                <Img
                  src={staticFile("01_LOGOS/Productivity/n8n.svg")}
                  style={{
                    width: 64,
                    height: 64,
                    filter: "drop-shadow(0 0 12px #FF6D5A)",
                  }}
                />
              </div>
              <span
                style={{
                  fontSize: 16,
                  fontWeight: 800,
                  color: "#FF6D5A",
                  letterSpacing: "0.08em",
                }}
              >
                AUTOMATION HUB
              </span>
            </div>
          </div>

          {/* Bottom Metrics Bar to complete Vertical Balance */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginTop: 14,
              padding: "0 10px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  backgroundColor: "#E7B84D",
                  boxShadow: "0 0 8px #E7B84D",
                }}
              />
              <span style={{ fontSize: 16, color: "#94A3B8", fontWeight: 700 }}>
                24/7 Autonomous Execution
              </span>
            </div>
            <div style={{ fontSize: 16, color: "#E7B84D", fontWeight: 800, letterSpacing: "0.05em" }}>
              99.2% COST SAVINGS VS FULL-TIME STAFF
            </div>
          </div>
        </div>
      </div>

      {/* Subtle Grain Overlay */}
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
    </AbsoluteFill>
  );
};