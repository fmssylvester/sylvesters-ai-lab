// duration: 202
import React from 'react';
import {
  useCurrentFrame,
  useVideoConfig,
  spring,
  interpolate,
  Sequence,
  Audio,
  staticFile,
} from 'remotion';

export const Scene10: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Entrances
  const hubSpring = spring({
    frame: frame - 5,
    fps,
    config: { damping: 14, mass: 0.8 },
  });

  const pathSpring = spring({
    frame: frame - 15,
    fps,
    config: { damping: 16 },
  });

  const greenCardSpring = spring({
    frame: frame - 30,
    fps,
    config: { damping: 13, mass: 0.7 },
  });

  const amberCardSpring = spring({
    frame: frame - 42,
    fps,
    config: { damping: 13, mass: 0.7 },
  });

  const pathProgress = interpolate(pathSpring, [0, 1], [0, 1]);

  // Quadratic Bezier helper for data packet trajectories
  const getBezierPoint = (
    p0: { x: number; y: number },
    p1: { x: number; y: number },
    p2: { x: number; y: number },
    t: number
  ) => {
    const clampedT = Math.max(0, Math.min(1, t));
    const cx =
      (1 - clampedT) * (1 - clampedT) * p0.x +
      2 * (1 - clampedT) * clampedT * p1.x +
      clampedT * clampedT * p2.x;
    const cy =
      (1 - clampedT) * (1 - clampedT) * p0.y +
      2 * (1 - clampedT) * clampedT * p1.y +
      clampedT * clampedT * p2.y;
    return { x: cx, y: cy };
  };

  // Expanded Path Anchors occupying full mid-to-lower canvas
  const startPt = { x: 960, y: 160 };
  const leftCtrl = { x: 480, y: 460 };
  const leftEnd = { x: 480, y: 780 };

  const rightCtrl = { x: 1440, y: 460 };
  const rightEnd = { x: 1440, y: 780 };

  // Streaming Data Packets
  const packetOffsetsLeft = [0, 0.2, 0.4, 0.6, 0.8];
  const packetOffsetsRight = [0.1, 0.3, 0.5, 0.7, 0.9];
  const flowSpeed = 0.022;

  return (
    <div
      style={{
        width: 1920,
        height: 1080,
        background: 'radial-gradient(circle at 50% 50%, #0B1120 0%, #07090D 100%)',
        fontFamily: "'Plus Jakarta Sans', sans-serif",
        position: 'relative',
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
            'radial-gradient(circle at 20% 30%, rgba(0, 217, 255, 0.12) 0%, transparent 55%), radial-gradient(circle at 82% 72%, rgba(231, 184, 77, 0.10) 0%, transparent 50%), radial-gradient(circle at 48% 90%, rgba(16, 185, 129, 0.08) 0%, transparent 55%)',
          transform: `translate(${Math.sin(frame / 80) * 7}px, ${Math.cos(frame / 100) * 7}px)`,
          pointerEvents: 'none',
        }}
      />

      {/* Background Grid */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)',
          backgroundSize: '80px 80px',
          opacity: 0.6,
          maskImage:
            'radial-gradient(ellipse at center, black 30%, transparent 82%)',
          WebkitMaskImage:
            'radial-gradient(ellipse at center, black 30%, transparent 82%)',
          pointerEvents: 'none',
        }}
      />

      {/* Deep Atmosphere Radial Glows */}
      <div
        style={{
          position: 'absolute',
          top: '40%',
          left: '50%',
          width: 1400,
          height: 900,
          transform: 'translate(-50%, -40%)',
          background:
            'radial-gradient(circle, rgba(0, 217, 255, 0.05) 0%, rgba(16, 185, 129, 0.05) 45%, transparent 75%)',
          pointerEvents: 'none',
        }}
      />

      {/* Audio SFX */}
      <Sequence from={10} durationInFrames={30}>
        <Audio src={staticFile('sfx/pop.wav')} volume={0.25} />
      </Sequence>
      <Sequence from={30} durationInFrames={30}>
        <Audio src={staticFile('sfx/robot-blip.wav')} volume={0.25} />
      </Sequence>
      <Sequence from={42} durationInFrames={30}>
        <Audio src={staticFile('sfx/email-notif.wav')} volume={0.25} />
      </Sequence>

      {/* SVG Dual Branching Motion Paths */}
      <svg
        style={{
          position: 'absolute',
          inset: 0,
          width: 1920,
          height: 1080,
          pointerEvents: 'none',
        }}
      >
        <defs>
          <linearGradient id="leftGlassGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#00D9FF" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#10B981" stopOpacity="1" />
          </linearGradient>

          <linearGradient id="rightGlassGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#00D9FF" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#E7B84D" stopOpacity="1" />
          </linearGradient>

          <filter id="glowGreen" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="10" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>

          <filter id="glowAmber" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="10" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Outer Glass Ribbons */}
        <path
          d={`M ${startPt.x} ${startPt.y} Q ${leftCtrl.x} ${leftCtrl.y} ${leftEnd.x} ${leftEnd.y}`}
          fill="none"
          stroke="rgba(16, 185, 129, 0.2)"
          strokeWidth="36"
          strokeLinecap="round"
          style={{ opacity: pathProgress }}
        />
        <path
          d={`M ${startPt.x} ${startPt.y} Q ${rightCtrl.x} ${rightCtrl.y} ${rightEnd.x} ${rightEnd.y}`}
          fill="none"
          stroke="rgba(231, 184, 77, 0.2)"
          strokeWidth="36"
          strokeLinecap="round"
          style={{ opacity: pathProgress }}
        />

        {/* Dynamic Glowing Dashed Streams */}
        <path
          d={`M ${startPt.x} ${startPt.y} Q ${leftCtrl.x} ${leftCtrl.y} ${leftEnd.x} ${leftEnd.y}`}
          fill="none"
          stroke="url(#leftGlassGrad)"
          strokeWidth="8"
          strokeDasharray="16 12"
          filter="url(#glowGreen)"
          style={{
            opacity: pathProgress,
            strokeDashoffset: -frame * 3,
          }}
        />

        <path
          d={`M ${startPt.x} ${startPt.y} Q ${rightCtrl.x} ${rightCtrl.y} ${rightEnd.x} ${rightEnd.y}`}
          fill="none"
          stroke="url(#rightGlassGrad)"
          strokeWidth="8"
          strokeDasharray="16 12"
          filter="url(#glowAmber)"
          style={{
            opacity: pathProgress,
            strokeDashoffset: -frame * 3,
          }}
        />
      </svg>

      {/* Active Glowing Data Packet Particles (Left Stream) */}
      {frame > 15 &&
        packetOffsetsLeft.map((offset, idx) => {
          const t = ((frame - 15) * flowSpeed + offset) % 1;
          const pos = getBezierPoint(startPt, leftCtrl, leftEnd, t);
          const size = interpolate(t, [0, 0.5, 1], [14, 22, 16]);
          return (
            <div
              key={`left-packet-${idx}`}
              style={{
                position: 'absolute',
                left: pos.x,
                top: pos.y,
                width: size,
                height: size,
                borderRadius: '50%',
                backgroundColor: '#FFFFFF',
                boxShadow:
                  '0 0 20px #10B981, 0 0 40px #10B981, 0 0 60px #10B981',
                transform: 'translate(-50%, -50%)',
                opacity: pathProgress * interpolate(t, [0, 0.08, 0.92, 1], [0, 1, 1, 0]),
                zIndex: 5,
              }}
            />
          );
        })}

      {/* Active Glowing Data Packet Particles (Right Stream) */}
      {frame > 18 &&
        packetOffsetsRight.map((offset, idx) => {
          const t = ((frame - 18) * flowSpeed + offset) % 1;
          const pos = getBezierPoint(startPt, rightCtrl, rightEnd, t);
          const size = interpolate(t, [0, 0.5, 1], [14, 22, 16]);
          return (
            <div
              key={`right-packet-${idx}`}
              style={{
                position: 'absolute',
                left: pos.x,
                top: pos.y,
                width: size,
                height: size,
                borderRadius: '50%',
                backgroundColor: '#FFFFFF',
                boxShadow:
                  '0 0 20px #E7B84D, 0 0 40px #E7B84D, 0 0 60px #E7B84D',
                transform: 'translate(-50%, -50%)',
                opacity: pathProgress * interpolate(t, [0, 0.08, 0.92, 1], [0, 1, 1, 0]),
                zIndex: 5,
              }}
            />
          );
        })}

      {/* Stream Label Badges - Scaled Up with Glowing Emerald & Amber Contrast */}
      <div
        style={{
          position: 'absolute',
          left: 580,
          top: 450,
          transform: `translate(-50%, -50%) scale(${pathSpring})`,
          opacity: pathProgress,
          padding: '12px 28px',
          borderRadius: 30,
          background: 'rgba(255, 255, 255, 0.05)',
          border: '2px solid rgba(16, 185, 129, 0.6)',
          color: '#10B981',
          fontWeight: 900,
          fontSize: 26,
          letterSpacing: '0.04em',
          boxShadow: '0 0 30px rgba(16, 185, 129, 0.35), inset 0 0 15px rgba(16, 185, 129, 0.15)',
          backdropFilter: 'blur(12px) saturate(120%)',
          zIndex: 8,
        }}
      >
        Auto-Resolved (90%)
      </div>

      <div
        style={{
          position: 'absolute',
          left: 1340,
          top: 450,
          transform: `translate(-50%, -50%) scale(${pathSpring})`,
          opacity: pathProgress,
          padding: '12px 28px',
          borderRadius: 30,
          background: 'rgba(255, 255, 255, 0.05)',
          border: '2px solid rgba(231, 184, 77, 0.6)',
          color: '#E7B84D',
          fontWeight: 900,
          fontSize: 26,
          letterSpacing: '0.04em',
          boxShadow: '0 0 30px rgba(231, 184, 77, 0.35), inset 0 0 15px rgba(231, 184, 77, 0.15)',
          backdropFilter: 'blur(12px) saturate(120%)',
          zIndex: 8,
        }}
      >
        Human Escalation
      </div>

      {/* Header Pill */}
      <div
        style={{
          position: 'absolute',
          left: 960,
          top: 110,
          transform: `translate(-50%, -50%) scale(${hubSpring})`,
          opacity: Math.min(1, hubSpring * 1.5),
          display: 'flex',
          alignItems: 'center',
          gap: 20,
          padding: '22px 50px',
          borderRadius: 40,
          backgroundColor: 'rgba(255, 255, 255, 0.05)',
          backdropFilter: 'blur(12px) saturate(120%)',
          border: '2px solid rgba(0, 217, 255, 0.5)',
          boxShadow:
            '0 20px 60px rgba(0,0,0,0.6), inset 0 1px 2px rgba(255,255,255,0.25), 0 0 40px rgba(0, 217, 255, 0.18)',
          zIndex: 10,
        }}
      >
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
          <path
            d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"
            fill="#00D9FF"
          />
        </svg>
        <span
          style={{
            fontSize: 40,
            fontWeight: 900,
            letterSpacing: '0.03em',
            color: '#FFFFFF',
            textShadow: '0 0 20px rgba(255,255,255,0.5)',
          }}
        >
          24/7 AI SUPPORT ENGINE
        </span>
      </div>

      {/* Left Glass Card Destination: Auto-Resolved (Positioned Lower to Balance Frame) */}
      <div
        style={{
          position: 'absolute',
          left: 480,
          top: 820,
          width: 560,
          height: 310,
          transform: `translate(-50%, -50%) scale(${greenCardSpring})`,
          opacity: Math.min(1, greenCardSpring * 1.5),
          borderRadius: 24,
          backgroundColor: 'rgba(255, 255, 255, 0.05)',
          backdropFilter: 'blur(12px) saturate(120%)',
          border: '2px solid rgba(16, 185, 129, 0.5)',
          boxShadow:
            '0 30px 70px rgba(0,0,0,0.7), inset 0 1px 1px rgba(255,255,255,0.15), 0 0 50px rgba(16, 185, 129, 0.2)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 36,
          gap: 18,
          zIndex: 6,
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 72,
            height: 72,
            borderRadius: '50%',
            background: 'rgba(16, 185, 129, 0.25)',
            border: '2px solid #10B981',
            boxShadow: '0 0 25px rgba(16, 185, 129, 0.5)',
          }}
        >
          <svg width="38" height="38" viewBox="0 0 24 24" fill="none">
            <path
              d="M20 6L9 17L4 12"
              stroke="#10B981"
              strokeWidth="3.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        <div style={{ textAlign: 'center' }}>
          <div
            style={{
              fontSize: 42,
              fontWeight: 900,
              color: '#10B981',
              textShadow: '0 0 25px rgba(16, 185, 129, 0.5)',
            }}
          >
            Auto-Resolved (90%)
          </div>
          <div
            style={{
              fontSize: 22,
              fontWeight: 700,
              color: 'rgba(255, 255, 255, 0.85)',
              marginTop: 10,
            }}
          >
            Instant AI Settlement & Direct Resolution
          </div>
        </div>
      </div>

      {/* Right Glass Card Destination: Human Escalation (Positioned Lower to Balance Frame) */}
      <div
        style={{
          position: 'absolute',
          left: 1440,
          top: 820,
          width: 560,
          height: 310,
          transform: `translate(-50%, -50%) scale(${amberCardSpring})`,
          opacity: Math.min(1, amberCardSpring * 1.5),
          borderRadius: 24,
          backgroundColor: 'rgba(255, 255, 255, 0.05)',
          backdropFilter: 'blur(12px) saturate(120%)',
          border: '2px solid rgba(231, 184, 77, 0.5)',
          boxShadow:
            '0 30px 70px rgba(0,0,0,0.7), inset 0 1px 1px rgba(255,255,255,0.15), 0 0 50px rgba(231, 184, 77, 0.2)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 36,
          gap: 18,
          zIndex: 6,
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 72,
            height: 72,
            borderRadius: '50%',
            background: 'rgba(231, 184, 77, 0.25)',
            border: '2px solid #E7B84D',
            boxShadow: '0 0 25px rgba(231, 184, 77, 0.5)',
          }}
        >
          <svg width="38" height="38" viewBox="0 0 24 24" fill="none">
            <path
              d="M18 8A6 6 0 0 0 6 8C6 15 3 17 3 17H21S18 15 18 8Z"
              stroke="#E7B84D"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M13.73 21A2 2 0 0 1 10.27 21"
              stroke="#E7B84D"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        <div style={{ textAlign: 'center' }}>
          <div
            style={{
              fontSize: 42,
              fontWeight: 900,
              color: '#E7B84D',
              textShadow: '0 0 25px rgba(231, 184, 77, 0.5)',
            }}
          >
            Human Escalation
          </div>
          <div
            style={{
              fontSize: 22,
              fontWeight: 700,
              color: 'rgba(255, 255, 255, 0.85)',
              marginTop: 10,
            }}
          >
            Seamless Tier-2 Specialist Handoff
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
};