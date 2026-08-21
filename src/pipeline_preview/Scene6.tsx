// duration: 125
import {
  AbsoluteFill,
  Audio,
  Sequence,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import React from "react";

// --- Enhanced Glass Icons with Layered Volumetric Glows ---

const GlassEnvelopeIcon: React.FC<{ floatY: number }> = ({ floatY }) => (
  <div
    style={{
      position: "relative",
      width: 160,
      height: 160,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      transform: `translateY(${floatY}px)`,
    }}
  >
    {/* Deep Layered Glow */}
    <div
      style={{
        position: "absolute",
        inset: -20,
        borderRadius: "40px",
        background: "radial-gradient(circle, rgba(0, 217, 255, 0.6) 0%, rgba(0, 217, 255, 0) 70%)",
        filter: "blur(30px)",
      }}
    />

    {/* Glass Container Card with Refraction & Bevel */}
    <div
      style={{
        width: 140,
        height: 140,
        borderRadius: "36px",
        background:
          "linear-gradient(135deg, rgba(255, 255, 255, 0.2) 0%, rgba(0, 217, 255, 0.08) 100%)",
        backdropFilter: "blur(24px)",
        WebkitBackdropFilter: "blur(24px)",
        border: "1.5px solid rgba(255, 255, 255, 0.35)",
        boxShadow:
          "inset 0 2px 4px rgba(255, 255, 255, 0.6), inset 0 -4px 16px rgba(0, 0, 0, 0.6), 0 24px 48px rgba(0, 0, 0, 0.7), 0 0 30px rgba(0, 217, 255, 0.4)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        transform: "perspective(1000px) rotateX(10deg) rotateY(-10deg)",
      }}
    >
      <svg width="76" height="76" viewBox="0 0 24 24" fill="none">
        <path
          d="M3 8L10.89 13.26C11.567 13.711 12.433 13.711 13.11 13.26L21 8M5 19H19C20.1046 19 21 18.1046 21 17V7C21 5.89543 20.1046 5 19 5H5C3.89543 5 3 5.89543 3 7V17C3 18.1046 3.89543 19 5 19Z"
          stroke="url(#cyanGlassGrad)"
          strokeWidth="2.4"
          strokeLinecap="round"
          strokeLinejoin="round"
          filter="drop-shadow(0 6px 16px rgba(0, 217, 255, 0.8))"
        />
        <defs>
          <linearGradient
            id="cyanGlassGrad"
            x1="3"
            y1="5"
            x2="21"
            y2="19"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#FFFFFF" />
            <stop offset="0.5" stopColor="#00D9FF" />
            <stop offset="1" stopColor="#00E5FF" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  </div>
);

const GlassClockIcon: React.FC<{ rotation: number }> = ({ rotation }) => (
  <div
    style={{
      position: "relative",
      width: 160,
      height: 160,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    }}
  >
    {/* Deep Layered Glow */}
    <div
      style={{
        position: "absolute",
        inset: -20,
        borderRadius: "50%",
        background: "radial-gradient(circle, rgba(231, 184, 77, 0.5) 0%, rgba(255, 107, 107, 0) 70%)",
        filter: "blur(30px)",
      }}
    />

    {/* Glass Circle Base */}
    <div
      style={{
        width: 140,
        height: 140,
        borderRadius: "50%",
        background:
          "linear-gradient(135deg, rgba(255, 255, 255, 0.22) 0%, rgba(231, 184, 77, 0.08) 100%)",
        backdropFilter: "blur(24px)",
        WebkitBackdropFilter: "blur(24px)",
        border: "1.5px solid rgba(255, 255, 255, 0.35)",
        boxShadow:
          "inset 0 2px 4px rgba(255, 255, 255, 0.6), inset 0 -4px 16px rgba(0, 0, 0, 0.6), 0 24px 48px rgba(0, 0, 0, 0.7), 0 0 35px rgba(231, 184, 77, 0.4)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        transform: "perspective(1000px) rotateX(10deg) rotateY(10deg)",
      }}
    >
      <svg width="76" height="76" viewBox="0 0 24 24" fill="none">
        <circle
          cx="12"
          cy="12"
          r="9"
          stroke="url(#amberGlassGrad)"
          strokeWidth="2.4"
          filter="drop-shadow(0 6px 16px rgba(231, 184, 77, 0.6))"
        />
        <path
          d="M12 7V12L15.5 15.5"
          stroke="#E7B84D"
          strokeWidth="2.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          transform={`rotate(${rotation} 12 12)`}
          filter="drop-shadow(0 0 10px #E7B84D)"
        />
        <defs>
          <linearGradient
            id="amberGlassGrad"
            x1="3"
            y1="3"
            x2="21"
            y2="21"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#FFFFFF" />
            <stop offset="0.5" stopColor="#E7B84D" />
            <stop offset="1" stopColor="#FF6B6B" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  </div>
);

export const Scene6: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Entrance springs
  const headerSpring = spring({
    frame: frame - 5,
    fps,
    config: { damping: 14, mass: 0.8 },
  });

  const panelSpring = spring({
    frame: frame - 15,
    fps,
    config: { damping: 15, mass: 0.9 },
  });

  const diskSpring = spring({
    frame: frame - 28,
    fps,
    config: { damping: 12, mass: 0.7 },
  });

  const footerSpring = spring({
    frame: frame - 50,
    fps,
    config: { damping: 14, mass: 0.8 },
  });

  // Dynamic Oscillations & Physics
  const envelopeFloat = Math.sin(frame * 0.08) * 8;
  const clockHandsRotation = (frame * 1.8) % 360;
  const tickOscillation = Math.sin(frame * 0.25);
  const particleTravel = (frame * 2.5) % 100;
  const diskPulse = Math.sin(frame * 0.1) * 0.08 + 1;

  // Timeline Progress
  const voidProgress = interpolate(frame, [15, 70], [0, 100], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        background: "radial-gradient(circle at 50% 50%, #0B1120 0%, #07090D 100%)",
        fontFamily: "'Plus Jakarta Sans', Arial, sans-serif",
        color: "#FFFFFF",
        overflow: "hidden",
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
            "radial-gradient(circle at 20% 30%, rgba(0, 217, 255, 0.12) 0%, transparent 55%), radial-gradient(circle at 80% 25%, rgba(231, 184, 77, 0.10) 0%, transparent 50%), radial-gradient(circle at 50% 90%, rgba(16, 185, 129, 0.08) 0%, transparent 55%)",
          transform: `translate(${Math.sin(frame / 80) * 8}px, ${Math.cos(frame / 100) * 8}px)`,
          pointerEvents: "none",
        }}
      />

      {/* SFX Audio Sync */}
      <Sequence from={6}>
        <Audio src={staticFile("sfx/clock-tick.wav")} volume={0.2} />
      </Sequence>
      <Sequence from={30}>
        <Audio src={staticFile("sfx/whoosh-b.wav")} volume={0.25} />
      </Sequence>
      <Sequence from={65}>
        <Audio src={staticFile("sfx/ding-low.wav")} volume={0.3} />
      </Sequence>

      {/* Film Grain Overlay */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          opacity: 0.05,
          pointerEvents: "none",
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Subtle Vertical Scanlines & Ambient Vignette */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage:
            "linear-gradient(rgba(255, 255, 255, 0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.02) 1px, transparent 1px)",
          backgroundSize: "80px 80px",
          pointerEvents: "none",
          maskImage:
            "radial-gradient(ellipse at center, black 30%, transparent 82%)",
          WebkitMaskImage:
            "radial-gradient(ellipse at center, black 30%, transparent 82%)",
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "repeating-linear-gradient(0deg, rgba(0, 0, 0, 0.1) 0px, rgba(0, 0, 0, 0.1) 1px, transparent 1px, transparent 4px)",
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          boxShadow: "inset 0 0 160px rgba(0, 0, 0, 0.5)",
          pointerEvents: "none",
        }}
      />

      {/* Floating Background Glow Orbs */}
      <div
        style={{
          position: "absolute",
          left: "20%",
          top: "30%",
          width: 450,
          height: 450,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(0, 217, 255, 0.08) 0%, transparent 70%)",
          filter: "blur(60px)",
          transform: `translateY(${Math.sin(frame * 0.03) * 20}px)`,
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "absolute",
          right: "20%",
          top: "30%",
          width: 450,
          height: 450,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(231, 184, 77, 0.08) 0%, transparent 70%)",
          filter: "blur(60px)",
          transform: `translateY(${Math.cos(frame * 0.03) * 20}px)`,
          pointerEvents: "none",
        }}
      />

      {/* Main Container */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "50px 80px 60px 80px",
          zIndex: 2,
        }}
      >
        {/* Top Header Pill */}
        <div
          style={{
            transform: `scale(${headerSpring}) translateY(${(1 - headerSpring) * -30}px)`,
            opacity: headerSpring,
            zIndex: 10,
          }}
        >
          <div
            style={{
              background: "rgba(255, 255, 255, 0.05)",
              border: "1.5px solid rgba(231, 184, 77, 0.35)",
              backdropFilter: "blur(12px) saturate(120%)",
              WebkitBackdropFilter: "blur(12px) saturate(120%)",
              borderRadius: "100px",
              padding: "16px 52px",
              boxShadow:
                "0 20px 50px rgba(0, 0, 0, 0.5), inset 0 1px 1px rgba(255, 255, 255, 0.2), 0 0 30px rgba(231, 184, 77, 0.15)",
              display: "flex",
              alignItems: "center",
              gap: "18px",
            }}
          >
            <div
              style={{
                width: "12px",
                height: "12px",
                borderRadius: "50%",
                background: "#E7B84D",
                boxShadow: "0 0 14px #E7B84D",
              }}
            />
            <span
              style={{
                fontFamily: "'Plus Jakarta Sans', Arial, sans-serif",
                fontSize: "40px",
                fontWeight: 900,
                letterSpacing: "0.05em",
                color: "#E7B84D",
                textTransform: "uppercase",
                textShadow: "0 0 24px rgba(231, 184, 77, 0.4)",
              }}
            >
              9-Hour Support Void
            </span>
          </div>
        </div>

        {/* Integrated Split-Screen Glass Panel System with Dawn/Sunrise Disk */}
        <div
          style={{
            position: "relative",
            width: "100%",
            maxWidth: "1560px",
            height: "500px",
            borderRadius: 24,
            transform: `scale(${panelSpring})`,
            opacity: panelSpring,
            background: "rgba(255, 255, 255, 0.05)",
            backdropFilter: "blur(12px) saturate(120%)",
            WebkitBackdropFilter: "blur(12px) saturate(120%)",
            border: "1px solid rgba(255, 255, 255, 0.12)",
            boxShadow:
              "0 35px 70px rgba(0, 0, 0, 0.6), 0 0 100px rgba(0, 0, 0, 0.3), inset 0 1px 2px rgba(255, 255, 255, 0.12)",
            display: "flex",
            alignItems: "center",
            overflow: "hidden",
          }}
        >
          {/* Left Split Panel: Night - 11:00 PM SENT */}
          <div
            style={{
              flex: 1,
              height: "100%",
              background:
                "linear-gradient(135deg, rgba(9, 16, 28, 0.55) 0%, rgba(7, 9, 13, 0.25) 100%)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: "28px",
              padding: "40px",
              position: "relative",
            }}
          >
            {/* Corner Ambient Glow */}
            <div
              style={{
                position: "absolute",
                left: -60,
                bottom: -60,
                width: 260,
                height: 260,
                borderRadius: "50%",
                background: "#00D9FF",
                opacity: 0.12,
                filter: "blur(50px)",
              }}
            />

            <GlassEnvelopeIcon floatY={envelopeFloat} />

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <span
                style={{
                  fontSize: "18px",
                  fontWeight: 700,
                  color: "#FF6B6B",
                  letterSpacing: "0.15em",
                  textTransform: "uppercase",
                }}
              >
                TICKET DISPATCHED
              </span>
              <div
                style={{
                  background: "rgba(0, 217, 255, 0.15)",
                  border: "1.5px solid #00D9FF",
                  padding: "12px 36px",
                  borderRadius: "100px",
                  boxShadow:
                    "0 10px 25px rgba(0, 217, 255, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.3)",
                }}
              >
                <span
                  style={{
                    fontFamily: "'JetBrains Mono', 'IBM Plex Mono', monospace",
                    fontSize: "32px",
                    fontWeight: 700,
                    letterSpacing: "0.04em",
                    color: "#FFFFFF",
                    fontVariantNumeric: "tabular-nums",
                  }}
                >
                  11:00 PM SENT
                </span>
              </div>
            </div>
          </div>

          {/* Central Split Divider Axis with Glowing Oscillating Particles */}
          <div
            style={{
              position: "absolute",
              left: "50%",
              top: 0,
              bottom: 0,
              width: "2px",
              transform: "translateX(-50%)",
              background:
                "linear-gradient(180deg, rgba(0, 217, 255, 0.8) 0%, rgba(231, 184, 77, 0.9) 50%, rgba(255, 107, 107, 0.8) 100%)",
              boxShadow: `0 0 ${12 + tickOscillation * 6}px #E7B84D`,
              zIndex: 3,
            }}
          >
            {/* Traveling Oscillating Particle / Tick along Divider */}
            <div
              style={{
                position: "absolute",
                top: `${particleTravel}%`,
                left: "50%",
                width: "12px",
                height: "24px",
                borderRadius: "6px",
                transform: "translate(-50%, -50%)",
                background: "#FFFFFF",
                boxShadow:
                  "0 0 15px #FFFFFF, 0 0 30px #E7B84D, inset 0 0 8px #FF6B6B",
              }}
            />
          </div>

          {/* Central Dawn/Sunrise Disk Element */}
          <div
            style={{
              position: "absolute",
              left: "50%",
              top: "50%",
              transform: `translate(-50%, -50%) scale(${diskSpring * diskPulse})`,
              opacity: diskSpring,
              width: "220px",
              height: "220px",
              borderRadius: "50%",
              background:
                "radial-gradient(circle, #0A1628 35%, rgba(14, 16, 23, 0.9) 100%)",
              border: "2px solid rgba(231, 184, 77, 0.5)",
              boxShadow:
                "0 0 50px rgba(231, 184, 77, 0.35), inset 0 0 30px rgba(255, 107, 107, 0.25)",
              backdropFilter: "blur(20px)",
              WebkitBackdropFilter: "blur(20px)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 4,
            }}
          >
            {/* Sunrise Arc Arc Graphic */}
            <div
              style={{
                position: "absolute",
                width: "160px",
                height: "80px",
                borderTopLeftRadius: "80px",
                borderTopRightRadius: "80px",
                border: "2px solid #E7B84D",
                borderBottom: "0",
                top: "25px",
                background:
                  "linear-gradient(180deg, rgba(231, 184, 77, 0.25) 0%, transparent 100%)",
                boxShadow: "0 -10px 20px rgba(231, 184, 77, 0.3)",
              }}
            />

            <div
              style={{
                position: "relative",
                zIndex: 2,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "2px",
                marginTop: "10px",
              }}
            >
              <span
                style={{
                  fontSize: "14px",
                  fontWeight: 900,
                  color: "#E7B84D",
                  letterSpacing: "0.2em",
                  textTransform: "uppercase",
                }}
              >
                TIME LAPSE
              </span>
              <span
                style={{
                  fontFamily: "'JetBrains Mono', 'IBM Plex Mono', monospace",
                  fontSize: "36px",
                  fontWeight: 800,
                  color: "#FFFFFF",
                  letterSpacing: "0.02em",
                  textShadow: "0 0 16px rgba(231, 184, 77, 0.6)",
                  fontVariantNumeric: "tabular-nums",
                }}
              >
                09h
              </span>
              <span
                style={{
                  fontSize: "12px",
                  fontWeight: 700,
                  color: "#FF6B6B",
                  letterSpacing: "0.15em",
                }}
              >
                OVERNIGHT VOID
              </span>
            </div>
          </div>

          {/* Right Split Panel: Morning / Dawn - 08:00 AM REPLIED */}
          <div
            style={{
              flex: 1,
              height: "100%",
              background:
                "linear-gradient(135deg, rgba(231, 184, 77, 0.04) 0%, rgba(7, 9, 13, 0.3) 100%)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: "28px",
              padding: "40px",
              position: "relative",
            }}
          >
            {/* Corner Ambient Glow */}
            <div
              style={{
                position: "absolute",
                right: -60,
                top: -60,
                width: 260,
                height: 260,
                borderRadius: "50%",
                background: "#E7B84D",
                opacity: 0.12,
                filter: "blur(50px)",
              }}
            />

            <GlassClockIcon rotation={clockHandsRotation} />

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <span
                style={{
                  fontSize: "18px",
                  fontWeight: 700,
                  color: "#E7B84D",
                  letterSpacing: "0.15em",
                  textTransform: "uppercase",
                }}
              >
                FIRST RESPONSE
              </span>
              <div
                style={{
                  background: "rgba(14, 16, 23, 0.85)",
                  border: "2px solid #E7B84D",
                  padding: "12px 36px",
                  borderRadius: "100px",
                  boxShadow:
                    "0 10px 25px rgba(231, 184, 77, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.2)",
                }}
              >
                <span
                  style={{
                    fontFamily: "'JetBrains Mono', 'IBM Plex Mono', monospace",
                    fontSize: "32px",
                    fontWeight: 700,
                    letterSpacing: "0.04em",
                    color: "#E7B84D",
                    fontVariantNumeric: "tabular-nums",
                  }}
                >
                  08:00 AM REPLIED
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Lower Metric Bar */}
        <div
          style={{
            transform: `scale(${footerSpring}) translateY(${(1 - footerSpring) * 30}px)`,
            opacity: footerSpring,
            width: "100%",
            maxWidth: "800px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "12px",
          }}
        >
            <div
              style={{
                width: "100%",
                background: "rgba(255, 255, 255, 0.05)",
                border: "1.5px solid rgba(255, 255, 255, 0.1)",
                backdropFilter: "blur(12px) saturate(120%)",
                WebkitBackdropFilter: "blur(12px) saturate(120%)",
                borderRadius: "24px",
                padding: "18px 40px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                boxShadow:
                  "0 15px 35px rgba(0, 0, 0, 0.5), inset 0 1px 1px rgba(255, 255, 255, 0.15)",
              }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
              <div
                style={{
                  width: "10px",
                  height: "10px",
                  borderRadius: "50%",
                  background: "#FF6B6B",
                  boxShadow: "0 0 12px #FF6B6B",
                }}
              />
              <span
                style={{
                  fontSize: "18px",
                  fontWeight: 900,
                  color: "#E7B84D",
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                }}
              >
                TOTAL LATENCY GAP
              </span>
            </div>

            {/* Dynamic Counter / Metric Display */}
            <span
              style={{
                fontFamily: "'JetBrains Mono', 'IBM Plex Mono', monospace",
                fontSize: "28px",
                fontWeight: 700,
                color: "#FFFFFF",
                letterSpacing: "0.08em",
                fontVariantNumeric: "tabular-nums",
                textShadow: "0 0 15px rgba(255,255,255,0.4)",
              }}
            >
              +09h {Math.floor((voidProgress / 100) * 0).toString().padStart(2, "0")}m{" "}
              {Math.floor((frame % 60) * 0.9)
                .toString()
                .padStart(2, "0")}
              s
            </span>
          </div>

          {/* Floor Reflection Line */}
          <div
            style={{
              width: "60%",
              height: "2px",
              background:
                "linear-gradient(90deg, transparent 0%, rgba(0,217,255,0.5) 30%, rgba(231,184,77,0.6) 70%, transparent 100%)",
              filter: "blur(1px)",
            }}
          />
        </div>
      </div>
    </AbsoluteFill>
  );
};