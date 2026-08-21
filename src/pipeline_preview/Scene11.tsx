// duration: 151
import React from 'react';
import {
  useCurrentFrame,
  useVideoConfig,
  spring,
  interpolate,
  Sequence,
  Audio,
  Img,
  staticFile,
} from 'remotion';

export default function Scene11() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Springs for animated elements
  const titleSpring = spring({
    frame: frame - 5,
    fps,
    config: { damping: 15, stiffness: 90 },
  });

  const subSpring = spring({
    frame: frame - 22,
    fps,
    config: { damping: 16, stiffness: 85 },
  });

  const leftCardSpring = spring({
    frame: frame - 8,
    fps,
    config: { damping: 14, stiffness: 80 },
  });

  const rightCardSpring = spring({
    frame: frame - 16,
    fps,
    config: { damping: 14, stiffness: 80 },
  });

  const dockedMetricsSpring = spring({
    frame: frame - 28,
    fps,
    config: { damping: 15, stiffness: 85 },
  });

  const dockedSourceSpring = spring({
    frame: frame - 22,
    fps,
    config: { damping: 15, stiffness: 85 },
  });

  const pathDraw = interpolate(frame, [15, 48], [1300, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Energy Packet Bezier Movement
  const packetProgress = interpolate(frame, [30, 90], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Perfectly centered Y-pipeline bezier curve points
  const p0 = { x: 350, y: 550 };
  const p1 = { x: 680, y: 450 };
  const p2 = { x: 1240, y: 650 };
  const p3 = { x: 1570, y: 550 };

  const getBezierPoint = (t: number) => {
    const u = 1 - t;
    const tt = t * t;
    const uu = u * u;
    const uuu = uu * u;
    const ttt = tt * t;
    return {
      x: uuu * p0.x + 3 * uu * t * p1.x + 3 * u * tt * p2.x + ttt * p3.x,
      y: uuu * p0.y + 3 * uu * t * p1.y + 3 * u * tt * p2.y + ttt * p3.y,
    };
  };

  const currPos = getBezierPoint(packetProgress);
  const prevPos1 = getBezierPoint(Math.max(0, packetProgress - 0.03));
  const prevPos2 = getBezierPoint(Math.max(0, packetProgress - 0.06));

  // Impact ripple spring at destination target node
  const impactSpring = spring({
    frame: frame - 90,
    fps,
    config: { damping: 12, stiffness: 120 },
  });

  // Balanced lower-field particle dust matrix
  const particleDots = [
    { x: 280, y: 820, size: 4, speed: 0.04, baseOpacity: 0.5 },
    { x: 440, y: 890, size: 5, speed: 0.03, baseOpacity: 0.6 },
    { x: 620, y: 780, size: 4, speed: 0.05, baseOpacity: 0.7 },
    { x: 780, y: 870, size: 6, speed: 0.035, baseOpacity: 0.65 },
    { x: 960, y: 800, size: 5, speed: 0.045, baseOpacity: 0.8 },
    { x: 1140, y: 880, size: 4, speed: 0.06, baseOpacity: 0.55 },
    { x: 1320, y: 820, size: 5, speed: 0.04, baseOpacity: 0.7 },
    { x: 1500, y: 890, size: 4, speed: 0.05, baseOpacity: 0.6 },
    { x: 1660, y: 810, size: 3, speed: 0.03, baseOpacity: 0.5 },
    { x: 520, y: 960, size: 3, speed: 0.04, baseOpacity: 0.45 },
    { x: 880, y: 950, size: 4, speed: 0.05, baseOpacity: 0.6 },
    { x: 1240, y: 970, size: 3, speed: 0.035, baseOpacity: 0.5 },
  ];

  return (
    <div
      style={{
        width: 1920,
        height: 1080,
        background: 'radial-gradient(circle at 50% 50%, #0B1120 0%, #07090D 100%)',
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
            'radial-gradient(circle at 20% 35%, rgba(0, 217, 255, 0.12) 0%, transparent 55%), radial-gradient(circle at 82% 35%, rgba(231, 184, 77, 0.10) 0%, transparent 50%), radial-gradient(circle at 50% 92%, rgba(0, 217, 255, 0.08) 0%, transparent 55%)',
          transform: `translate(${Math.sin(frame / 80) * 7}px, ${Math.cos(frame / 100) * 7}px)`,
          pointerEvents: 'none',
        }}
      />

      {/* Softened Background Grid Pattern */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `linear-gradient(to right, rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.05) 1px, transparent 1px)`,
          backgroundSize: '80px 80px',
          backgroundPosition: `0px ${frame * 0.3}px`,
          opacity: 0.6,
          maskImage:
            'radial-gradient(ellipse at center, black 30%, transparent 82%)',
          WebkitMaskImage:
            'radial-gradient(ellipse at center, black 30%, transparent 82%)',
        }}
      />

      {/* Subtle Radial Vignette overlay to soften stark linear edges */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'radial-gradient(circle at 50% 50%, transparent 35%, #07090D 95%)',
          pointerEvents: 'none',
        }}
      />

      {/* Atmospheric Ambient Glow Nodes Across Lower Canvas Field */}
      <div
        style={{
          position: 'absolute',
          left: 200,
          top: 420,
          width: 300,
          height: 300,
          background: 'rgba(0, 217, 255, 0.08)',
          filter: 'blur(100px)',
          borderRadius: '50%',
        }}
      />
      <div
        style={{
          position: 'absolute',
          right: 200,
          top: 420,
          width: 300,
          height: 300,
          background: 'rgba(231, 184, 77, 0.08)',
          filter: 'blur(100px)',
          borderRadius: '50%',
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: 680,
          top: 700,
          width: 560,
          height: 260,
          background: 'radial-gradient(ellipse at center, rgba(0, 217, 255, 0.07) 0%, rgba(231, 184, 77, 0.04) 50%, transparent 80%)',
          filter: 'blur(80px)',
          pointerEvents: 'none',
        }}
      />

      {/* Floating Atmospheric Dust Particles */}
      {particleDots.map((pt, i) => {
        const floatY = Math.sin(frame * pt.speed + i) * 10;
        const pulseOpacity = pt.baseOpacity + Math.sin(frame * 0.08 + i) * 0.2;
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: pt.x,
              top: pt.y + floatY,
              width: pt.size,
              height: pt.size,
              borderRadius: '50%',
              backgroundColor: i % 2 === 0 ? '#00D9FF' : '#E7B84D',
              boxShadow: `0 0 ${pt.size * 2.5}px ${i % 2 === 0 ? '#00D9FF' : '#E7B84D'}`,
              opacity: pulseOpacity,
            }}
          />
        );
      })}

      {/* Audio SFX Triggers */}
      <Sequence from={Math.round(0.4 * 30)}>
        <Audio src={staticFile('sfx/whoosh-b.wav')} volume={0.25} />
      </Sequence>
      <Sequence from={Math.round(1.8 * 30)}>
        <Audio src={staticFile('sfx/typewriter.wav')} volume={0.25} />
      </Sequence>
      <Sequence from={Math.round(3.0 * 30)}>
        <Audio src={staticFile('sfx/pop.wav')} volume={0.25} />
      </Sequence>

      {/* Header Container */}
      <div
        style={{
          position: 'absolute',
          top: 60,
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          zIndex: 10,
        }}
      >
        <div
          style={{
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.10)',
            borderRadius: 20,
            padding: '16px 40px',
            backdropFilter: 'blur(12px) saturate(120%)',
            WebkitBackdropFilter: 'blur(12px) saturate(120%)',
            boxShadow: '0 10px 40px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.12), 0 0 30px rgba(0,217,255,0.06)',
          }}
        >
          <div
            style={{
              fontSize: 52,
              fontWeight: 900,
              letterSpacing: '-0.02em',
              color: '#FFFFFF',
              textTransform: 'uppercase',
              filter: 'drop-shadow(0 8px 20px rgba(0, 217, 255, 0.4)) drop-shadow(0 4px 10px rgba(0,0,0,0.8))',
              transform: `scale(${interpolate(titleSpring, [0, 1], [0.88, 1])})`,
              opacity: titleSpring,
              display: 'flex',
              alignItems: 'center',
              gap: 16,
            }}
          >
          <span
            style={{
              background: 'linear-gradient(180deg, #FFFFFF 30%, #00D9FF 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            WEBHOOK TRIGGER
          </span>
          <span
            style={{
              color: '#E7B84D',
              textShadow: '0 0 20px rgba(231, 184, 77, 0.6)',
            }}
          >
            ➔
          </span>
          <span
            style={{
              background: 'linear-gradient(180deg, #E7B84D 20%, #E7B84D 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            LANGCHAIN AGENT
          </span>
          </div>
        </div>

        <div
          style={{
            fontSize: 18,
            fontWeight: 700,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            color: '#00D9FF',
            background: 'rgba(0, 217, 255, 0.1)',
            border: '1px solid rgba(0, 217, 255, 0.35)',
            padding: '10px 32px',
            borderRadius: 30,
            marginTop: 18,
            backdropFilter: 'blur(12px) saturate(120%)',
            boxShadow: '0 0 24px rgba(0, 217, 255, 0.25)',
            transform: `translateY(${interpolate(subSpring, [0, 1], [24, 0])}px)`,
            opacity: subSpring,
          }}
        >
          Real-Time Payload Processing Pipeline
        </div>
      </div>

      {/* Connecting Neon Pipeline SVG */}
      <svg
        style={{
          position: 'absolute',
          inset: 0,
          width: 1920,
          height: 1080,
          pointerEvents: 'none',
        }}
      >
        {/* Glow Path */}
        <path
          d={`M ${p0.x} ${p0.y} C ${p1.x} ${p1.y}, ${p2.x} ${p2.y}, ${p3.x} ${p3.y}`}
          fill="none"
          stroke="#00D9FF"
          strokeWidth="8"
          strokeDasharray="1300"
          strokeDashoffset={pathDraw}
          style={{ filter: 'drop-shadow(0 0 18px #00D9FF)' }}
          opacity={0.85}
        />
        {/* Core Line Path */}
        <path
          d={`M ${p0.x} ${p0.y} C ${p1.x} ${p1.y}, ${p2.x} ${p2.y}, ${p3.x} ${p3.y}`}
          fill="none"
          stroke="#FFFFFF"
          strokeWidth="3"
          strokeDasharray="1300"
          strokeDashoffset={pathDraw}
          opacity={0.95}
        />

        {/* Hierarchy Docking Connector Lines (Left & Right) */}
        <line
          x1="350"
          y1="680"
          x2="350"
          y2="710"
          stroke="rgba(0, 217, 255, 0.5)"
          strokeWidth="2"
          strokeDasharray="4 4"
        />
        <line
          x1="1570"
          y1="680"
          x2="1570"
          y2="710"
          stroke="rgba(231, 184, 77, 0.5)"
          strokeWidth="2"
          strokeDasharray="4 4"
        />
      </svg>

      {/* Traveling Energy Packet with Motion Blur */}
      {frame >= 30 && frame <= 94 && (
        <>
          <div
            style={{
              position: 'absolute',
              left: prevPos2.x - 12,
              top: prevPos2.y - 12,
              width: 24,
              height: 24,
              borderRadius: '50%',
              background: '#00D9FF',
              opacity: 0.3,
              filter: 'blur(6px)',
            }}
          />
          <div
            style={{
              position: 'absolute',
              left: prevPos1.x - 16,
              top: prevPos1.y - 16,
              width: 32,
              height: 32,
              borderRadius: '50%',
              background: '#00D9FF',
              opacity: 0.6,
              filter: 'blur(4px)',
            }}
          />
          <div
            style={{
              position: 'absolute',
              left: currPos.x - 20,
              top: currPos.y - 20,
              width: 40,
              height: 40,
              borderRadius: '50%',
              background: '#FFFFFF',
              boxShadow: '0 0 30px #00D9FF, 0 0 60px #E7B84D, inset 0 0 10px #FFFFFF',
              transform: 'scale(1.1)',
            }}
          />
        </>
      )}

      {/* Vertically Centered Left Node: Webhook (n8n) */}
      <div
        style={{
          position: 'absolute',
          left: 220,
          top: 420,
          width: 260,
          height: 260,
          borderRadius: 24,
          background: 'rgba(255, 255, 255, 0.05)',
          border: '1px solid rgba(0, 217, 255, 0.4)',
          backdropFilter: 'blur(12px) saturate(120%)',
          WebkitBackdropFilter: 'blur(12px) saturate(120%)',
          boxShadow: '0 25px 60px rgba(0,0,0,0.6), 0 0 35px rgba(0, 217, 255, 0.15)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          transform: `scale(${interpolate(leftCardSpring, [0, 1], [0.6, 1])})`,
          opacity: leftCardSpring,
        }}
      >
        <Img
          src={staticFile('01_LOGOS/Productivity/n8n.svg')}
          style={{
            width: 140,
            height: 140,
            objectFit: 'contain',
            filter: 'drop-shadow(0 8px 20px rgba(0,0,0,0.5))',
          }}
        />
      </div>

      {/* Docked Source Info Badge Beneath Left Node */}
      <div
        style={{
          position: 'absolute',
          left: 220,
          top: 710,
          width: 260,
          borderRadius: 18,
          background: 'rgba(255, 255, 255, 0.05)',
          border: '1px solid rgba(0, 217, 255, 0.3)',
          backdropFilter: 'blur(12px) saturate(120%)',
          WebkitBackdropFilter: 'blur(12px) saturate(120%)',
          padding: '14px 18px',
          boxShadow: '0 12px 30px rgba(0,0,0,0.5), 0 0 15px rgba(0, 217, 255, 0.12)',
          transform: `translateY(${interpolate(dockedSourceSpring, [0, 1], [20, 0])}px)`,
          opacity: dockedSourceSpring,
          display: 'flex',
          flexDirection: 'column',
          gap: 6,
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: 12, fontWeight: 700, color: '#00D9FF', letterSpacing: '0.08em' }}>
            PAYLOAD SOURCE
          </span>
          <span style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.6)', fontFamily: "'JetBrains Mono', 'IBM Plex Mono', monospace" }}>
            PORT 443
          </span>
        </div>
        <div style={{ fontSize: 16, fontWeight: 900, color: '#FFFFFF' }}>
          n8n Workflow
        </div>
      </div>

      {/* Vertically Centered Right Node: LangChain Agent */}
      <div
        style={{
          position: 'absolute',
          right: 220,
          top: 420,
          width: 260,
          height: 260,
          borderRadius: 24,
          background: 'rgba(255, 255, 255, 0.05)',
          border: `1px solid rgba(231, 184, 77, ${0.45 + impactSpring * 0.55})`,
          backdropFilter: 'blur(12px) saturate(120%)',
          WebkitBackdropFilter: 'blur(12px) saturate(120%)',
          boxShadow: `0 25px 60px rgba(0,0,0,0.6), 0 0 ${40 + impactSpring * 50}px rgba(231, 184, 77, ${0.2 + impactSpring * 0.35})`,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          transform: `scale(${interpolate(rightCardSpring, [0, 1], [0.6, 1]) + impactSpring * 0.08})`,
          opacity: rightCardSpring,
        }}
      >
        <Img
          src={staticFile('02_ICONS/ai-code.svg')}
          style={{
            width: 130,
            height: 130,
            objectFit: 'contain',
            filter: 'drop-shadow(0 8px 20px rgba(0,0,0,0.5))',
          }}
        />

        {/* Destination Impact Pulse Wave */}
        {frame >= 90 && (
          <div
            style={{
              position: 'absolute',
              inset: -10,
              borderRadius: 36,
              border: '2px solid #E7B84D',
              opacity: interpolate(impactSpring, [0, 1], [1, 0]),
              transform: `scale(${interpolate(impactSpring, [0, 1], [1, 1.25])})`,
              pointerEvents: 'none',
            }}
          />
        )}
      </div>

      {/* Unified Docked "EXECUTION METRICS" Glassmorphism Card Directly Beneath Target Node */}
      <div
        style={{
          position: 'absolute',
          right: 220,
          top: 710,
          width: 260,
          borderRadius: 18,
          background: 'rgba(255, 255, 255, 0.05)',
          border: '1px solid rgba(231, 184, 77, 0.3)',
          backdropFilter: 'blur(12px) saturate(120%)',
          WebkitBackdropFilter: 'blur(12px) saturate(120%)',
          padding: '16px 18px',
          boxShadow: '0 12px 30px rgba(0,0,0,0.5), 0 0 20px rgba(231, 184, 77, 0.12)',
          transform: `translateY(${interpolate(dockedMetricsSpring, [0, 1], [20, 0])}px)`,
          opacity: dockedMetricsSpring,
          display: 'flex',
          flexDirection: 'column',
          gap: 10,
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: 12, fontWeight: 700, color: '#E7B84D', letterSpacing: '0.08em' }}>
            EXECUTION METRICS
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div
              style={{
                width: 7,
                height: 7,
                borderRadius: '50%',
                backgroundColor: frame >= 90 ? '#E7B84D' : '#00D9FF',
                boxShadow: `0 0 8px ${frame >= 90 ? '#E7B84D' : '#00D9FF'}`,
              }}
            />
            <span style={{ fontSize: 11, fontWeight: 700, color: frame >= 90 ? '#E7B84D' : '#FFFFFF' }}>
              {frame >= 90 ? 'ACTIVE' : 'STREAMING'}
            </span>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 2 }}>
          <div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', fontWeight: 700 }}>LATENCY</div>
            <div style={{ fontSize: 18, fontWeight: 800, color: '#FFFFFF', marginTop: 2, fontFamily: "'JetBrains Mono', 'IBM Plex Mono', monospace", fontVariantNumeric: 'tabular-nums' }}>
              {Math.min(42, Math.floor(frame * 0.6))}ms
            </div>
          </div>
          <div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', fontWeight: 700 }}>PROTOCOL</div>
            <div style={{ fontSize: 18, fontWeight: 800, color: '#E7B84D', marginTop: 2, fontFamily: "'JetBrains Mono', 'IBM Plex Mono', monospace" }}>
              HTTP POST
            </div>
          </div>
        </div>
      </div>

      {/* Subtle Grain Texture Filter Overlay */}
      <svg style={{ position: 'absolute', width: 0, height: 0 }}>
        <filter id="scene11-grain">
          <feTurbulence type="fractalNoise" baseFrequency="0.75" numOctaves="4" />
          <feColorMatrix type="saturate" values="0" />
        </filter>
      </svg>
      <div
        style={{
          position: 'absolute',
          inset: 0,
          filter: 'url(#scene11-grain)',
          opacity: 0.05,
          pointerEvents: 'none',
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