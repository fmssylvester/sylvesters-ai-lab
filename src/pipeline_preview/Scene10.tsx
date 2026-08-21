// duration: 173
import React from 'react';
import {
  useCurrentFrame,
  useVideoConfig,
  spring,
  interpolate,
  staticFile,
  Img,
  Audio,
  Sequence,
} from 'remotion';

export default function Scene10() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Entrance Springs
  const titleSpring = spring({
    frame,
    fps,
    config: { damping: 14, stiffness: 80 },
  });

  const subtitleSpring = spring({
    frame: frame - 8,
    fps,
    config: { damping: 14, stiffness: 80 },
  });

  const stageSpring = spring({
    frame: frame - 14,
    fps,
    config: { damping: 16, stiffness: 60 },
  });

  // 3D Orbit Motion Logic
  const centerX = 960;
  const centerY = 580;
  const orbitSpeed = 0.022;
  const angle = frame * orbitSpeed;

  const radiusX = 420;
  const radiusZ = 240;
  const perspectiveFocal = 1000;

  // Node 1 (n8n) position in 3D
  const n8nX = Math.cos(angle) * radiusX;
  const n8nZ = Math.sin(angle) * radiusZ;
  const n8nY = Math.sin(angle * 1.5) * 25;

  const scale1 = perspectiveFocal / (perspectiveFocal - n8nZ);
  const p1X = centerX + n8nX * scale1;
  const p1Y = centerY + n8nY * scale1;

  // Node 2 (OpenAI) position in 3D (opposite side)
  const aiX = Math.cos(angle + Math.PI) * radiusX;
  const aiZ = Math.sin(angle + Math.PI) * radiusZ;
  const aiY = Math.sin((angle + Math.PI) * 1.5) * 25;

  const scale2 = perspectiveFocal / (perspectiveFocal - aiZ);
  const p2X = centerX + aiX * scale2;
  const p2Y = centerY + aiY * scale2;

  // Depth Rotations
  const rotY1 = interpolate(n8nZ, [-radiusZ, radiusZ], [25, -25]);
  const rotY2 = interpolate(aiZ, [-radiusZ, radiusZ], [25, -25]);

  // Data flow packet offsets
  const packet1Offset = (frame * 0.03) % 1;
  const packet2Offset = (frame * 0.03 + 0.33) % 1;
  const packet3Offset = (frame * 0.03 + 0.66) % 1;

  // Pulse ping visual effect around frame 84
  const pingProgress = spring({
    frame: frame - 84,
    fps,
    config: { damping: 12, stiffness: 120 },
  });

  const pulseScale = interpolate(pingProgress, [0, 1], [0.8, 2.5]);
  const pulseOpacity = interpolate(pingProgress, [0, 0.8, 1], [0.9, 0.4, 0]);

  // Ambient parallax particles
  const particles = Array.from({ length: 18 }).map((_, i) => {
    const seed = i * 137.5;
    const px = (Math.sin(seed) * 0.5 + 0.5) * 1800 + 60;
    const py = (Math.cos(seed * 1.3) * 0.5 + 0.5) * 900 + 90;
    const floatY = Math.sin(frame * 0.03 + seed) * 15;
    const pOpacity = interpolate(Math.sin(frame * 0.04 + seed), [-1, 1], [0.15, 0.55]);
    return { x: px, y: py + floatY, opacity: pOpacity, size: (i % 3) * 2 + 3 };
  });

  return (
    <div
      style={{
        width: 1920,
        height: 1080,
        background: 'radial-gradient(circle at 50% 45%, #0B1120 0%, #07090D 100%)',
        fontFamily: "'Plus Jakarta Sans', sans-serif",
        color: '#FFFFFF',
        position: 'relative',
        overflow: 'hidden',
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
            'radial-gradient(circle at 20% 25%, rgba(0, 217, 255, 0.12) 0%, transparent 55%), radial-gradient(circle at 82% 72%, rgba(16, 185, 129, 0.10) 0%, transparent 50%), radial-gradient(circle at 55% 85%, rgba(231, 184, 77, 0.08) 0%, transparent 55%)',
          transform: `translate(${Math.sin(frame / 80) * 7}px, ${Math.cos(frame / 100) * 7}px)`,
          pointerEvents: 'none',
        }}
      />

      {/* SFX Audio Elements */}
      <Sequence from={3} layout="none">
        <Audio src={staticFile('sfx/riser.wav')} volume={0.25} />
      </Sequence>
      <Sequence from={36} layout="none">
        <Audio src={staticFile('sfx/whoosh-a.wav')} volume={0.2} />
      </Sequence>
      <Sequence from={84} layout="none">
        <Audio src={staticFile('audio/sfx/ping.wav')} volume={0.3} />
      </Sequence>

      {/* Background Perspective Grid */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage:
            'linear-gradient(rgba(0, 217, 255, 0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 217, 255, 0.05) 1px, transparent 1px)',
          backgroundSize: '80px 80px',
          transform: 'perspective(1000px) rotateX(65deg) translateY(120px) scale(1.8)',
          transformOrigin: 'bottom center',
          opacity: 0.5,
        }}
      />

      {/* Ambient Parallax Particles */}
      {particles.map((p, idx) => (
        <div
          key={idx}
          style={{
            position: 'absolute',
            left: p.x,
            top: p.y,
            width: p.size,
            height: p.size,
            borderRadius: '50%',
            backgroundColor: idx % 2 === 0 ? '#00D9FF' : '#10B981',
            boxShadow: `0 0 10px ${idx % 2 === 0 ? '#00D9FF' : '#10B981'}`,
            opacity: p.opacity,
            pointerEvents: 'none',
          }}
        />
      ))}

      {/* Header Text Region */}
      <div
        style={{
          position: 'absolute',
          top: 80,
          left: 0,
          right: 0,
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          zIndex: 20,
        }}
      >
        <div
          style={{
            fontSize: 76,
            fontWeight: 900,
            letterSpacing: '-0.02em',
            textTransform: 'uppercase',
            color: '#FFFFFF',
            textShadow: '0 0 40px rgba(0, 217, 255, 0.6)',
            transform: `translateY(${interpolate(titleSpring, [0, 1], [-40, 0])}px)`,
            opacity: Math.max(0, titleSpring),
          }}
        >
          N8N + OPENAI AGENT
        </div>

        <div
          style={{
            fontSize: 24,
            fontWeight: 700,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            color: '#00D9FF',
            marginTop: 10,
            transform: `translateY(${interpolate(subtitleSpring, [0, 1], [20, 0])}px)`,
            opacity: Math.max(0, subtitleSpring),
          }}
        >
          Intelligent Automation Pipeline
        </div>
      </div>

      {/* Scaled-Up Central UI Glass Stage */}
      <div
        style={{
          position: 'absolute',
          left: '50%',
          top: centerY,
          transform: `translate(-50%, -50%) scale(${stageSpring})`,
          opacity: Math.max(0, stageSpring),
          width: 1560,
          height: 580,
          borderRadius: 24,
          background: 'rgba(255, 255, 255, 0.05)',
          backdropFilter: 'blur(12px) saturate(120%)',
          WebkitBackdropFilter: 'blur(12px) saturate(120%)',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          boxShadow:
            '0 30px 80px rgba(0, 0, 0, 0.6), 0 0 100px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.12), 0 0 100px rgba(0, 217, 255, 0.08)',
          zIndex: 1,
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '24px 36px',
        }}
      >
        {/* Top UI Header Bar */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderBottom: '1px solid rgba(255, 255, 255, 0.12)',
            paddingBottom: 14,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div
              style={{
                width: 10,
                height: 10,
                borderRadius: '50%',
                backgroundColor: '#10B981',
                boxShadow: '0 0 8px #10B981',
              }}
            />
            <span
              style={{
                fontSize: 14,
                fontWeight: 700,
                letterSpacing: '0.12em',
                color: 'rgba(255, 255, 255, 0.7)',
              }}
            >
              PIPELINE // ACTIVE
            </span>
          </div>

          <div
            style={{
              display: 'flex',
              gap: 24,
              fontSize: 13,
              color: 'rgba(255, 255, 255, 0.6)',
              fontWeight: 700,
              fontFamily: "'JetBrains Mono', 'IBM Plex Mono', monospace",
              fontVariantNumeric: 'tabular-nums',
            }}
          >
            <span>LATENCY: 14ms</span>
            <span>NODES: 2</span>
            <span>FLOW: 100%</span>
          </div>
        </div>

        {/* Bottom Status / Grid Footer */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderTop: '1px solid rgba(255, 255, 255, 0.12)',
            paddingTop: 14,
            fontSize: 12,
            letterSpacing: '0.08em',
            color: 'rgba(255, 255, 255, 0.4)',
            fontWeight: 700,
          }}
        >
          <span>PROTOCOL: REALTIME VECTOR STREAM</span>
          <span>SYSTEM READY</span>
        </div>
      </div>

      {/* Dynamic Volumetric Cyan & Emerald Data Beam (SVG) */}
      <svg
        style={{
          position: 'absolute',
          inset: 0,
          width: 1920,
          height: 1080,
          pointerEvents: 'none',
          zIndex: 6,
        }}
      >
        <defs>
          <linearGradient
            id="cyanEmeraldGrad"
            x1={p1X}
            y1={p1Y}
            x2={p2X}
            y2={p2Y}
            gradientUnits="userSpaceOnUse"
          >
            <stop offset="0%" stopColor="#00D9FF" />
            <stop offset="50%" stopColor="#38EF7D" />
            <stop offset="100%" stopColor="#10B981" />
          </linearGradient>

          <filter id="volumetricGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="10" result="blur1" />
            <feGaussianBlur stdDeviation="4" result="blur2" />
            <feMerge>
              <feMergeNode in="blur1" />
              <feMergeNode in="blur2" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Outer Volumetric Glow Tube */}
        <line
          x1={p1X}
          y1={p1Y}
          x2={p2X}
          y2={p2Y}
          stroke="url(#cyanEmeraldGrad)"
          strokeWidth="16"
          strokeOpacity="0.35"
          filter="url(#volumetricGlow)"
          strokeLinecap="round"
        />

        {/* Main Energetic Core Beam */}
        <line
          x1={p1X}
          y1={p1Y}
          x2={p2X}
          y2={p2Y}
          stroke="url(#cyanEmeraldGrad)"
          strokeWidth="6"
          filter="url(#volumetricGlow)"
          strokeLinecap="round"
        />

        {/* Intense White Inner Core */}
        <line
          x1={p1X}
          y1={p1Y}
          x2={p2X}
          y2={p2Y}
          stroke="#FFFFFF"
          strokeWidth="2"
          strokeOpacity="0.9"
          strokeLinecap="round"
        />

        {/* Traveling Data Flow Packets */}
        {[packet1Offset, packet2Offset, packet3Offset].map((pkt, idx) => {
          const packetX = interpolate(pkt, [0, 1], [p1X, p2X]);
          const packetY = interpolate(pkt, [0, 1], [p1Y, p2Y]);
          return (
            <g key={idx}>
              <circle
                cx={packetX}
                cy={packetY}
                r="7"
                fill="#FFFFFF"
                filter="url(#volumetricGlow)"
              />
              <circle
                cx={packetX}
                cy={packetY}
                r="12"
                fill="none"
                stroke="#00D9FF"
                strokeWidth="2"
                opacity="0.8"
              />
            </g>
          );
        })}

        {/* Vector Port Terminals */}
        {/* Port Node 1 Anchor */}
        <circle
          cx={p1X}
          cy={p1Y}
          r="14"
          fill="#07090D"
          stroke="#00D9FF"
          strokeWidth="3"
          filter="url(#volumetricGlow)"
        />
        <circle cx={p1X} cy={p1Y} r="5" fill="#FFFFFF" />

        {/* Port Node 2 Anchor */}
        <circle
          cx={p2X}
          cy={p2Y}
          r="14"
          fill="#07090D"
          stroke="#10B981"
          strokeWidth="3"
          filter="url(#volumetricGlow)"
        />
        <circle cx={p2X} cy={p2Y} r="5" fill="#FFFFFF" />

        {/* Pulse Impact Effect on Frame 84 */}
        {frame >= 84 && (
          <circle
            cx={(p1X + p2X) / 2}
            cy={(p1Y + p2Y) / 2}
            r={70 * pulseScale}
            fill="none"
            stroke="#00D9FF"
            strokeWidth="3"
            opacity={pulseOpacity}
            filter="url(#volumetricGlow)"
          />
        )}
      </svg>

      {/* 3D Orbit Container with Perspective Space */}
      <div
        style={{
          position: 'absolute',
          left: centerX,
          top: centerY,
          width: 0,
          height: 0,
          perspective: 1000,
          transformStyle: 'preserve-3d',
          zIndex: 10,
        }}
      >
        {/* Node 1: n8n */}
        <div
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            transform: `translate3d(${n8nX}px, ${n8nY}px, ${n8nZ}px) rotateY(${rotY1}deg) translate(-50%, -50%)`,
            zIndex: Math.round(n8nZ + 1000),
          }}
        >
          <div
            style={{
              width: 190,
              height: 190,
              borderRadius: 24,
              background: 'rgba(255, 255, 255, 0.05)',
              border: '2px solid #00D9FF',
              boxShadow:
                '0 20px 50px rgba(0, 0, 0, 0.6), 0 0 50px rgba(0, 217, 255, 0.3), inset 0 0 20px rgba(0, 217, 255, 0.12)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 28,
              backdropFilter: 'blur(12px) saturate(120%)',
              position: 'relative',
            }}
          >
            {/* Vector Connection Port Pin */}
            <div
              style={{
                position: 'absolute',
                top: -8,
                left: '50%',
                transform: 'translateX(-50%)',
                width: 16,
                height: 16,
                borderRadius: '50%',
                backgroundColor: '#00D9FF',
                boxShadow: '0 0 12px #00D9FF',
                border: '2px solid #FFFFFF',
              }}
            />

            <Img
              src={staticFile('01_LOGOS/Productivity/n8n.svg')}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'contain',
                filter: 'drop-shadow(0 0 14px rgba(0, 217, 255, 0.6))',
              }}
            />
          </div>
        </div>

        {/* Node 2: OpenAI */}
        <div
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            transform: `translate3d(${aiX}px, ${aiY}px, ${aiZ}px) rotateY(${rotY2}deg) translate(-50%, -50%)`,
            zIndex: Math.round(aiZ + 1000),
          }}
        >
          <div
            style={{
              width: 190,
              height: 190,
              borderRadius: 24,
              background: 'rgba(255, 255, 255, 0.05)',
              border: '2px solid #10B981',
              boxShadow:
                '0 20px 50px rgba(0, 0, 0, 0.6), 0 0 50px rgba(16, 185, 129, 0.3), inset 0 0 20px rgba(16, 185, 129, 0.12)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 28,
              backdropFilter: 'blur(12px) saturate(120%)',
              position: 'relative',
            }}
          >
            {/* Vector Connection Port Pin */}
            <div
              style={{
                position: 'absolute',
                top: -8,
                left: '50%',
                transform: 'translateX(-50%)',
                width: 16,
                height: 16,
                borderRadius: '50%',
                backgroundColor: '#10B981',
                boxShadow: '0 0 12px #10B981',
                border: '2px solid #FFFFFF',
              }}
            />

            <Img
              src={staticFile('01_LOGOS/AI/openai.svg')}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'contain',
                filter: 'drop-shadow(0 0 14px rgba(16, 185, 129, 0.6))',
              }}
            />
          </div>
        </div>
      </div>

      {/* Film Grain Overlay */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          opacity: 0.05,
          pointerEvents: 'none',
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Vignette */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          background:
            'radial-gradient(ellipse at center, transparent 45%, rgba(0, 0, 0, 0.5) 100%)',
        }}
      />
    </div>
  );
}