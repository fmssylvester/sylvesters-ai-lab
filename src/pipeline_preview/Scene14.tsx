// duration: 161
import React from 'react';
import {
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
  staticFile,
  Img,
  Audio,
  Sequence,
  AbsoluteFill,
} from 'remotion';

export default function Scene14() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Audio Sequences
  const sfxWhooshFrame = Math.round(0.1 * fps);
  const sfxBlipFrame = Math.round(1.5 * fps);
  const sfxPopFrame = Math.round(3.2 * fps);

  // Entrance spring animations
  const headerSpring = spring({
    frame,
    fps,
    config: { damping: 14, stiffness: 80, mass: 0.8 },
  });

  const canvasSpring = spring({
    frame: frame - 6,
    fps,
    config: { damping: 16, stiffness: 70, mass: 1 },
  });

  // Continuous 3D camera glide motion
  const camRotateX = interpolate(frame, [0, 80, 160], [12, 6, 13], {
    extrapolateRight: 'clamp',
  });
  const camRotateY = interpolate(frame, [0, 80, 160], [-6, 3, -5], {
    extrapolateRight: 'clamp',
  });
  const camTranslateX = interpolate(frame, [0, 80, 160], [20, -15, 10], {
    extrapolateRight: 'clamp',
  });
  const camScale = interpolate(frame, [0, 80, 160], [0.96, 1.01, 0.99], {
    extrapolateRight: 'clamp',
  });

  // Pulse line animation progress (0 to 1 across frames 12 to 135)
  const pulseProgress = interpolate(frame, [12, 135], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // 6 Node coordinates expanded vertically and horizontally for 1600x760 canvas
  const nodes = [
    { id: 1, x: 140, y: 380, label: '01', name: 'TRIGGER' },
    { id: 2, x: 410, y: 190, label: '02', name: 'PARSER' },
    { id: 3, x: 680, y: 550, label: '03', name: 'AI ROUTER' },
    { id: 4, x: 950, y: 210, label: '04', name: 'TRANSFORM' },
    { id: 5, x: 1220, y: 550, label: '05', name: 'VALIDATE' },
    { id: 6, x: 1490, y: 380, label: '06', name: 'DEPLOY' },
  ];

  // Continuous smooth cubic bezier curve spanning node 01 through node 06
  const pathD = `M 180 380 C 270 380, 320 190, 370 190 C 450 190, 600 550, 640 550 C 730 550, 870 210, 910 210 C 1000 210, 1140 550, 1180 550 C 1270 550, 1400 380, 1450 380`;

  // Secondary dynamic network circuit paths in bottom negative space
  const secondaryPath1 = `M 180 430 L 370 650 L 910 650 L 1180 630 L 1450 430`;
  const secondaryPath2 = `M 370 240 L 640 110 L 1180 110 L 1450 330`;

  // Ambient floating background data particles
  const particles = Array.from({ length: 28 }).map((_, i) => {
    const seedX = (i * 137.5) % 1800;
    const seedY = 500 + ((i * 83.1) % 520); // Focus particle density on lower canvas
    const size = 3 + (i % 4) * 2;
    const speed = 0.4 + (i % 3) * 0.3;
    const yOffset = Math.sin((frame * speed + i * 10) / 20) * 18;
    const xOffset = Math.cos((frame * speed + i * 7) / 25) * 12;
    const opacity = 0.2 + (Math.sin(frame / 15 + i) + 1) * 0.3;
    return {
      x: seedX + xOffset,
      y: seedY + yOffset,
      size,
      opacity,
      color: i % 2 === 0 ? '#00D9FF' : '#10B981',
    };
  });

  return (
    <AbsoluteFill
      style={{
        background: 'radial-gradient(circle at 50% 45%, #0B1120 0%, #05080E 100%)',
        fontFamily: '"Plus Jakarta Sans", sans-serif',
        overflow: 'hidden',
        color: '#FFFFFF',
      }}
    >
      <style>
        {`@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@700;800;900&family=JetBrains+Mono:wght@500;700;800&display=swap');`}
      </style>

      {/* Gradient Mesh Base */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'radial-gradient(circle at 20% 20%, rgba(0, 217, 255, 0.15) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(16, 185, 129, 0.12) 0%, transparent 55%), radial-gradient(circle at 50% 90%, rgba(0, 217, 255, 0.10) 0%, transparent 60%)',
          transform: `translate(${Math.sin(frame / 80) * 8}px, ${Math.cos(frame / 100) * 8}px)`,
          pointerEvents: 'none',
        }}
      />

      {/* SFX Audio Tracks */}
      <Sequence from={sfxWhooshFrame}>
        <Audio src={staticFile('sfx/whoosh.wav')} volume={0.3} />
      </Sequence>
      <Sequence from={sfxBlipFrame}>
        <Audio src={staticFile('sfx/robot-blip.wav')} volume={0.25} />
      </Sequence>
      <Sequence from={sfxPopFrame}>
        <Audio src={staticFile('sfx/pop.wav')} volume={0.3} />
      </Sequence>

      {/* Background Grid Lines with lower canvas emphasis */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `linear-gradient(to right, rgba(0, 217, 255, 0.05) 1px, transparent 1px),
                            linear-gradient(to bottom, rgba(0, 217, 255, 0.05) 1px, transparent 1px)`,
          backgroundSize: '50px 50px',
          maskImage:
            'radial-gradient(ellipse at 50% 55%, black 70%, transparent 98%)',
          WebkitMaskImage:
            'radial-gradient(ellipse at 50% 55%, black 70%, transparent 98%)',
        }}
      />

      {/* Ambient Data Particles in Negative Space */}
      {particles.map((p, idx) => (
        <div
          key={idx}
          style={{
            position: 'absolute',
            left: `${p.x}px`,
            top: `${p.y}px`,
            width: `${p.size}px`,
            height: `${p.size}px`,
            borderRadius: '50%',
            backgroundColor: p.color,
            opacity: p.opacity,
            boxShadow: `0 0 ${p.size * 3}px ${p.color}`,
            pointerEvents: 'none',
          }}
        />
      ))}

      {/* Header Band */}
      <div
        style={{
          position: 'absolute',
          top: 36,
          left: 0,
          right: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '10px',
          zIndex: 10,
          transform: `translateY(${(1 - headerSpring) * -40}px)`,
          opacity: headerSpring,
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            background: 'rgba(255, 255, 255, 0.04)',
            padding: '6px 20px',
            borderRadius: '40px',
            border: '1px solid rgba(0, 217, 255, 0.35)',
            boxShadow: '0 0 25px rgba(0, 217, 255, 0.15)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
          }}
        >
          <Img
            src={staticFile('01_LOGOS/Productivity/n8n.svg')}
            style={{ height: '24px', filter: 'drop-shadow(0 0 8px rgba(0,217,255,0.6))' }}
          />
          <Img
            src={staticFile('02_ICONS/ai-layers.svg')}
            style={{ height: '22px', filter: 'drop-shadow(0 0 8px rgba(231,184,77,0.6))' }}
          />
        </div>

        <div
          style={{
            background: 'rgba(15, 23, 42, 0.65)',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            borderRadius: 18,
            padding: '10px 36px',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            boxShadow:
              '0 10px 35px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.15), 0 0 25px rgba(0,217,255,0.08)',
            textAlign: 'center',
          }}
        >
          <h1
            style={{
              margin: 0,
              fontSize: '42px',
              fontWeight: 900,
              letterSpacing: '-0.02em',
              color: '#FFFFFF',
              textShadow: '0 0 35px rgba(0, 217, 255, 0.3)',
              textTransform: 'uppercase',
            }}
          >
            PRODUCTION-READY WORKFLOW
          </h1>

          <p
            style={{
              margin: 0,
              fontSize: '18px',
              fontWeight: 700,
              color: '#E7B84D',
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              textShadow: '0 0 15px rgba(231, 184, 77, 0.25)',
              marginTop: 4,
            }}
          >
            6-Node Full End-To-End Architecture
          </p>
        </div>
      </div>

      {/* Main 3D Stage / Scaled & Anchored Glass Workflow Canvas (Width: 1620px, Height: 760px) */}
      <div
        style={{
          position: 'absolute',
          top: '200px',
          left: '150px',
          width: '1620px',
          height: '760px',
          perspective: '1200px',
          transformStyle: 'preserve-3d',
        }}
      >
        <div
          style={{
            width: '100%',
            height: '100%',
            position: 'relative',
            transform: `scale(${camScale * canvasSpring}) rotateX(${camRotateX}deg) rotateY(${camRotateY}deg) translateX(${camTranslateX}px)`,
            transformStyle: 'preserve-3d',
          }}
        >
          {/* Main Stage Glass Container */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              borderRadius: '32px',
              background: 'rgba(11, 18, 33, 0.55)',
              border: '1px solid rgba(0, 217, 255, 0.22)',
              boxShadow:
                '0 35px 80px rgba(0, 0, 0, 0.8), inset 0 1px 0 rgba(255, 255, 255, 0.18), 0 0 50px rgba(0, 217, 255, 0.05)',
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
            }}
          />

          {/* SVG Connection Paths */}
          <svg
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              overflow: 'visible',
            }}
          >
            <defs>
              {/* Solid Neon Gradient for Primary Signal Trace */}
              <linearGradient id="neonGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#00D9FF" />
                <stop offset="45%" stopColor="#10B981" />
                <stop offset="75%" stopColor="#00D9FF" />
                <stop offset="100%" stopColor="#10B981" />
              </linearGradient>

              {/* Secondary Circuit Trace Gradient */}
              <linearGradient id="subGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="rgba(0, 217, 255, 0.15)" />
                <stop offset="50%" stopColor="rgba(16, 185, 129, 0.25)" />
                <stop offset="100%" stopColor="rgba(0, 217, 255, 0.15)" />
              </linearGradient>
            </defs>

            {/* Secondary Circuit Paths in Negative Lower Space */}
            <path
              d={secondaryPath1}
              fill="none"
              stroke="url(#subGradient)"
              strokeWidth="2"
              strokeDasharray="6 6"
            />
            <path
              d={secondaryPath2}
              fill="none"
              stroke="url(#subGradient)"
              strokeWidth="2"
              strokeDasharray="6 6"
            />

            {/* Solid Continuous Background Trace Path (No abrupt termination!) */}
            <path
              d={pathD}
              fill="none"
              stroke="url(#neonGradient)"
              strokeWidth="5"
              strokeOpacity="0.4"
            />

            {/* Active Flow Pulse Path across whole architecture */}
            <path
              d={pathD}
              fill="none"
              stroke="url(#neonGradient)"
              strokeWidth="7"
              strokeLinecap="round"
              strokeDasharray="2200"
              strokeDashoffset={2200 * (1 - pulseProgress)}
              style={{
                filter: 'drop-shadow(0 0 14px #00D9FF) drop-shadow(0 0 25px #10B981)',
              }}
            />
          </svg>

          {/* 6 Expanded Workflow Nodes */}
          {nodes.map((node, index) => {
            const nodeActivationStart = 12 + index * 18;
            const isNodeActive = frame >= nodeActivationStart;
            const nodeSpring = spring({
              frame: frame - (8 + index * 4),
              fps,
              config: { damping: 15, stiffness: 90 },
            });

            // Sequential Emerald Activation State
            const isEmeraldActive =
              frame >= nodeActivationStart && frame < nodeActivationStart + 28;

            // Final settled architecture state (Node 06 & All Active)
            const isNode6SettledActive = index === 5 && frame >= nodeActivationStart;
            const node6Pulse = isNode6SettledActive
              ? Math.sin((frame - nodeActivationStart) * 0.2) * 0.5 + 0.5
              : 0;

            const borderColor = isNode6SettledActive
              ? `rgba(0, 217, 255, ${0.85 + node6Pulse * 0.15})`
              : isEmeraldActive
              ? '#10B981'
              : isNodeActive
              ? '#00D9FF'
              : 'rgba(255,255,255,0.18)';

            // Ultra-intense emerald focal glow on activation
            const glowShadow = isNode6SettledActive
              ? `0 0 ${30 + node6Pulse * 20}px rgba(0, 217, 255, 0.85), 0 0 ${50 + node6Pulse * 25}px rgba(16, 185, 129, 0.75), inset 0 0 20px rgba(0, 217, 255, 0.5)`
              : isEmeraldActive
              ? '0 0 50px rgba(16, 185, 129, 0.95), 0 0 90px rgba(16, 185, 129, 0.6), inset 0 0 20px rgba(16, 185, 129, 0.7)'
              : isNodeActive
              ? '0 0 30px rgba(0, 217, 255, 0.5), inset 0 0 12px rgba(0, 217, 255, 0.3)'
              : '0 12px 25px rgba(0,0,0,0.5)';

            return (
              <div
                key={node.id}
                style={{
                  position: 'absolute',
                  left: `${node.x - 45}px`,
                  top: `${node.y - 45}px`,
                  width: '90px',
                  height: '90px',
                  borderRadius: '26px',
                  background: 'rgba(15, 23, 42, 0.85)',
                  border: `2px solid ${borderColor}`,
                  boxShadow: glowShadow,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transform: `scale(${nodeSpring}) translateZ(25px)`,
                  transition: 'border-color 0.2s, box-shadow 0.2s',
                  backdropFilter: 'blur(16px)',
                  WebkitBackdropFilter: 'blur(16px)',
                }}
              >
                {/* Node Number */}
                <span
                  style={{
                    fontSize: '24px',
                    fontWeight: 800,
                    fontFamily: "'JetBrains Mono', monospace",
                    color: isNode6SettledActive
                      ? '#00D9FF'
                      : isEmeraldActive
                      ? '#10B981'
                      : isNodeActive
                      ? '#00D9FF'
                      : 'rgba(255,255,255,0.4)',
                    textShadow: isEmeraldActive
                      ? '0 0 12px #10B981'
                      : isNodeActive
                      ? '0 0 10px #00D9FF'
                      : 'none',
                  }}
                >
                  {node.label}
                </span>

                {/* Node Label Name */}
                <span
                  style={{
                    fontSize: '10px',
                    fontWeight: 700,
                    fontFamily: "'JetBrains Mono', monospace",
                    letterSpacing: '0.05em',
                    color: isNodeActive ? '#E2E8F0' : 'rgba(255,255,255,0.3)',
                    marginTop: '2px',
                  }}
                >
                  {node.name}
                </span>

                {/* Intense Active Emerald Status Indicator Indicator */}
                <div
                  style={{
                    position: 'absolute',
                    top: '-7px',
                    right: '-7px',
                    width: '20px',
                    height: '20px',
                    borderRadius: '50%',
                    background: isNodeActive ? '#10B981' : '#475569',
                    boxShadow: isNodeActive
                      ? '0 0 15px #10B981, 0 0 30px #10B981, 0 0 50px rgba(16, 185, 129, 0.9)'
                      : 'none',
                    border: '2px solid #07090D',
                  }}
                />
              </div>
            );
          })}

          {/* Lower Canvas HUD & Metrics Bar (Anchors lower space inside container) */}
          <div
            style={{
              position: 'absolute',
              bottom: '24px',
              left: '40px',
              right: '40px',
              height: '54px',
              borderRadius: '16px',
              background: 'rgba(15, 23, 42, 0.7)',
              border: '1px solid rgba(0, 217, 255, 0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0 28px',
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
              boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.1)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div
                  style={{
                    width: '10px',
                    height: '10px',
                    borderRadius: '50%',
                    backgroundColor: '#10B981',
                    boxShadow: '0 0 10px #10B981',
                  }}
                />
                <span
                  style={{
                    fontSize: '13px',
                    fontWeight: 700,
                    fontFamily: "'JetBrains Mono', monospace",
                    color: '#10B981',
                    letterSpacing: '0.05em',
                  }}
                >
                  SYSTEM STATUS: OPERATIONAL
                </span>
              </div>
              <span style={{ color: 'rgba(255,255,255,0.2)' }}>|</span>
              <span
                style={{
                  fontSize: '13px',
                  fontWeight: 600,
                  fontFamily: "'JetBrains Mono', monospace",
                  color: 'rgba(255,255,255,0.7)',
                }}
              >
                NODES ACTIVE: {Math.min(6, Math.max(0, Math.floor((frame - 10) / 18) + 1))}/06
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
              <span
                style={{
                  fontSize: '13px',
                  fontWeight: 600,
                  fontFamily: "'JetBrains Mono', monospace",
                  color: '#00D9FF',
                }}
              >
                LATENCY: 12ms
              </span>
              <span style={{ color: 'rgba(255,255,255,0.2)' }}>|</span>
              <span
                style={{
                  fontSize: '13px',
                  fontWeight: 600,
                  fontFamily: "'JetBrains Mono', monospace",
                  color: '#E7B84D',
                }}
              >
                THROUGHPUT: 2.4 GB/s
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Cinematic Film Grain Overlay */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          opacity: 0.04,
          pointerEvents: 'none',
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Vignette */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          background:
            'radial-gradient(ellipse at center, transparent 50%, rgba(0, 0, 0, 0.6) 100%)',
        }}
      />
    </AbsoluteFill>
  );
}