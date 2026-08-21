// duration: 156
import React from 'react';
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';

// Custom SVG Cursor Component
const CustomCursor: React.FC<{
  size?: number;
  color?: string;
  isClicked?: boolean;
}> = ({ size = 36, color = '#00D9FF', isClicked = false }) => (
  <div style={{ position: 'relative', width: size, height: size }}>
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      style={{ filter: `drop-shadow(0 0 8px ${color})` }}
    >
      <path
        d="M3 3L10.07 19.97L12.58 12.58L19.97 10.07L3 3Z"
        fill={color}
        stroke="#FFFFFF"
        strokeWidth="2"
        strokeLinejoin="round"
      />
    </svg>
    {isClicked && (
      <div
        style={{
          position: 'absolute',
          top: -12,
          left: -12,
          width: size + 24,
          height: size + 24,
          borderRadius: '50%',
          border: `2px solid ${color}`,
          boxShadow: `0 0 20px ${color}`,
          pointerEvents: 'none',
        }}
      />
    )}
  </div>
);

// Inline SVG n8n Logo Icon
const N8nLogo: React.FC = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
    <rect width="24" height="24" rx="6" fill="#FF6D5A" />
    <circle cx="7" cy="12" r="2.5" fill="#FFFFFF" />
    <circle cx="12" cy="7" r="2.5" fill="#FFFFFF" />
    <circle cx="12" cy="17" r="2.5" fill="#FFFFFF" />
    <circle cx="17" cy="12" r="2.5" fill="#FFFFFF" />
    <path d="M7 12H12M12 7V17M12 12H17" stroke="#FFFFFF" strokeWidth="2" />
  </svg>
);

export const Scene16: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Header spring entrance
  const headerSpring = spring({
    frame,
    fps,
    config: { damping: 14, stiffness: 100 },
  });

  // Cursor movement animation targeting the "RUN NOW" button
  const cursorProgress = spring({
    frame: Math.max(0, frame - 5),
    fps,
    config: { damping: 18, stiffness: 80 },
  });
  const cursorX = interpolate(cursorProgress, [0, 1], [1320, 1560]);
  const cursorY = interpolate(cursorProgress, [0, 1], [720, 930]);

  // Click state triggered at frame 26 to 32
  const isClicked = frame >= 26 && frame <= 32;

  // Sequential execution flags for emerald green (#10B981) nodes
  const node1Active = frame >= 30;
  const node2Active = frame >= 46;
  const node3Active = frame >= 62;

  // Node activation spring scales
  const n1Spring = spring({ frame: Math.max(0, frame - 30), fps, config: { damping: 12, stiffness: 140 } });
  const n2Spring = spring({ frame: Math.max(0, frame - 46), fps, config: { damping: 12, stiffness: 140 } });
  const n3Spring = spring({ frame: Math.max(0, frame - 62), fps, config: { damping: 12, stiffness: 140 } });

  // Typewriter effect for prompt input
  const fullQuery = 'EXECUTE: Order #8492 -> Extract Payload & Sync DB';
  const typedCount = Math.floor(
    interpolate(frame, [5, 45], [12, fullQuery.length], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    })
  );
  const currentText = fullQuery.substring(0, typedCount);

  // Connection pulse positioning
  const pulse1X = node1Active ? interpolate((frame - 30) % 20, [0, 20], [320, 620]) : 320;
  const pulse2X = node2Active ? interpolate((frame - 46) % 20, [0, 20], [860, 1160]) : 860;

  return (
    <AbsoluteFill
      style={{
        width: 1920,
        height: 1080,
        background: 'radial-gradient(circle at 50% 50%, #0B1120 0%, #07090D 100%)',
        fontFamily: "'Plus Jakarta Sans', sans-serif",
        color: '#FFFFFF',
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
            'radial-gradient(circle at 20% 25%, rgba(0, 217, 255, 0.12) 0%, transparent 55%), radial-gradient(circle at 82% 75%, rgba(231, 184, 77, 0.10) 0%, transparent 50%), radial-gradient(circle at 55% 90%, rgba(0, 217, 255, 0.08) 0%, transparent 55%)',
          transform: `translate(${Math.sin(frame / 80) * 7}px, ${Math.cos(frame / 100) * 7}px)`,
          pointerEvents: 'none',
        }}
      />

      {/* Background Grid Motif */}
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
        }}
      />

      {/* Main Required Header Text Hierarchy */}
      <div
        style={{
          position: 'absolute',
          top: 50,
          left: 0,
          width: 1920,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 20,
          transform: `translateY(${interpolate(headerSpring, [0, 1], [-30, 0])}px)`,
          opacity: interpolate(frame, [0, 12], [0, 1], { extrapolateRight: 'clamp' }),
        }}
      >
        <h1
          style={{
            margin: 0,
            fontSize: 76,
            fontWeight: 900,
            color: '#00D9FF',
            letterSpacing: '-0.01em',
            textShadow: '0 0 35px rgba(0, 217, 255, 0.35)',
            textTransform: 'uppercase',
            lineHeight: 1.1,
          }}
        >
          LIVE WORKFLOW EXECUTION
        </h1>
        <p
          style={{
            margin: '8px 0 0 0',
            fontSize: 40,
            fontWeight: 700,
            color: '#FFFFFF',
            letterSpacing: '0.02em',
            opacity: 0.9,
          }}
        >
          Watch It Process In Real Time
        </p>
      </div>

      {/* Main Glassmorphism UI Window */}
      <div
        style={{
          position: 'absolute',
          left: 160,
          top: 210,
          width: 1600,
          height: 800,
          borderRadius: 24,
          background: 'rgba(255, 255, 255, 0.05)',
          backdropFilter: 'blur(12px) saturate(120%)',
          WebkitBackdropFilter: 'blur(12px) saturate(120%)',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          boxShadow: node1Active
            ? '0 25px 80px rgba(0, 0, 0, 0.8), 0 0 100px rgba(0, 0, 0, 0.3), 0 0 80px rgba(16, 185, 129, 0.18)'
            : '0 25px 80px rgba(0, 0, 0, 0.8), 0 0 100px rgba(0, 0, 0, 0.3), 0 0 60px rgba(0, 217, 255, 0.1)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          zIndex: 10,
        }}
      >
        {/* Workspace Title Header Bar */}
        <div
          style={{
            height: 64,
            padding: '0 28px',
            background: 'rgba(7, 9, 13, 0.6)',
            borderBottom: '1px solid rgba(255, 255, 255, 0.12)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <N8nLogo />
            <span style={{ fontSize: 20, fontWeight: 700, color: '#FFFFFF' }}>
              n8n Automated Workflow Engine
            </span>
          </div>

          {/* Dynamic Status Badge */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '6px 18px',
              borderRadius: 20,
              background: node1Active ? 'rgba(16, 185, 129, 0.2)' : 'rgba(0, 217, 255, 0.12)',
              border: `1px solid ${node1Active ? '#10B981' : '#00D9FF'}`,
            }}
          >
            <div
              style={{
                width: 10,
                height: 10,
                borderRadius: '50%',
                background: node1Active ? '#10B981' : '#00D9FF',
                boxShadow: `0 0 12px ${node1Active ? '#10B981' : '#00D9FF'}`,
              }}
            />
            <span
              style={{
                fontSize: 14,
                fontWeight: 900,
                color: node1Active ? '#10B981' : '#00D9FF',
                letterSpacing: '0.05em',
              }}
            >
              {node1Active ? 'WORKFLOW RUNNING' : 'SYSTEM READY'}
            </span>
          </div>
        </div>

        {/* Node Canvas Area */}
        <div
          style={{
            flex: 1,
            position: 'relative',
            padding: '0 80px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'radial-gradient(ellipse at center, rgba(13, 22, 38, 0.4) 0%, rgba(7, 9, 13, 0.6) 100%)',
          }}
        >
          {/* SVG Connection Cables */}
          <svg
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              pointerEvents: 'none',
              zIndex: 1,
            }}
          >
            {/* Cable 1 -> 2 */}
            <line
              x1="380"
              y1="270"
              x2="680"
              y2="270"
              stroke={node1Active ? '#10B981' : 'rgba(0, 217, 255, 0.4)'}
              strokeWidth="4"
              strokeDasharray={node1Active ? 'none' : '8 6'}
            />
            {/* Cable 2 -> 3 */}
            <line
              x1="920"
              y1="270"
              x2="1220"
              y2="270"
              stroke={node2Active ? '#10B981' : 'rgba(255, 255, 255, 0.2)'}
              strokeWidth="4"
              strokeDasharray={node2Active ? 'none' : '8 6'}
            />

            {/* Glowing Pulse Particles */}
            {node1Active && (
              <circle cx={pulse1X} cy="270" r="7" fill="#10B981" style={{ filter: 'drop-shadow(0 0 8px #10B981)' }} />
            )}
            {node2Active && (
              <circle cx={pulse2X} cy="270" r="7" fill="#10B981" style={{ filter: 'drop-shadow(0 0 8px #10B981)' }} />
            )}
          </svg>

          {/* Node 1: Webhook Trigger */}
          <div
            style={{
              position: 'relative',
              width: 280,
              height: 180,
              borderRadius: 18,
              background: 'rgba(255, 255, 255, 0.05)',
              backdropFilter: 'blur(12px) saturate(120%)',
              WebkitBackdropFilter: 'blur(12px) saturate(120%)',
              border: `2px solid ${node1Active ? '#10B981' : '#00D9FF'}`,
              boxShadow: node1Active
                ? '0 0 35px rgba(16, 185, 129, 0.7)'
                : '0 0 20px rgba(0, 217, 255, 0.2)',
              padding: 24,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              zIndex: 2,
              transform: `scale(${node1Active ? interpolate(n1Spring, [0, 1], [0.95, 1.05]) : 1})`,
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 13, fontWeight: 900, color: node1Active ? '#10B981' : '#00D9FF' }}>
                WEBHOOK TRIGGER
              </span>
              <span
                style={{
                  fontSize: 11,
                  padding: '3px 10px',
                  borderRadius: 12,
                  background: node1Active ? 'rgba(16,185,129,0.25)' : 'rgba(0,217,255,0.2)',
                  color: node1Active ? '#10B981' : '#00D9FF',
                  fontWeight: 700,
                }}
              >
                {node1Active ? 'SUCCESS' : 'IDLE'}
              </span>
            </div>
            <div>
              <div style={{ fontSize: 22, fontWeight: 900, color: '#FFFFFF', marginBottom: 4 }}>
                Order Received
              </div>
              <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', fontFamily: "'JetBrains Mono', 'IBM Plex Mono', monospace" }}>POST /api/v1/orders</div>
            </div>
          </div>

          {/* Node 2: AI Processor Node */}
          <div
            style={{
              position: 'relative',
              width: 280,
              height: 180,
              borderRadius: 18,
              background: 'rgba(255, 255, 255, 0.05)',
              backdropFilter: 'blur(12px) saturate(120%)',
              WebkitBackdropFilter: 'blur(12px) saturate(120%)',
              border: `2px solid ${node2Active ? '#10B981' : '#E7B84D'}`,
              boxShadow: node2Active
                ? '0 0 45px rgba(16, 185, 129, 0.8)'
                : '0 0 20px rgba(231, 184, 77, 0.2)',
              padding: 24,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              zIndex: 2,
              transform: `scale(${node2Active ? interpolate(n2Spring, [0, 1], [0.95, 1.05]) : 1})`,
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 13, fontWeight: 900, color: node2Active ? '#10B981' : '#E7B84D' }}>
                AI PROCESSOR
              </span>
              <span
                style={{
                  fontSize: 11,
                  padding: '3px 10px',
                  borderRadius: 12,
                  background: node2Active ? 'rgba(16,185,129,0.25)' : 'rgba(231,184,77,0.2)',
                  color: node2Active ? '#10B981' : '#E7B84D',
                  fontWeight: 700,
                }}
              >
                {node2Active ? 'PARSED' : 'WAITING'}
              </span>
            </div>
            <div>
              <div style={{ fontSize: 22, fontWeight: 900, color: '#FFFFFF', marginBottom: 4 }}>
                Schema Extraction
              </div>
              <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', fontFamily: "'JetBrains Mono', 'IBM Plex Mono', monospace" }}>GPT-4o Structured Output</div>
            </div>
          </div>

          {/* Node 3: Database Action Node */}
          <div
            style={{
              position: 'relative',
              width: 280,
              height: 180,
              borderRadius: 18,
              background: 'rgba(255, 255, 255, 0.05)',
              backdropFilter: 'blur(12px) saturate(120%)',
              WebkitBackdropFilter: 'blur(12px) saturate(120%)',
              border: `2px solid ${node3Active ? '#10B981' : 'rgba(255,255,255,0.25)'}`,
              boxShadow: node3Active
                ? '0 0 35px rgba(16, 185, 129, 0.7)'
                : 'none',
              padding: 24,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              zIndex: 2,
              transform: `scale(${node3Active ? interpolate(n3Spring, [0, 1], [0.95, 1.05]) : 1})`,
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 13, fontWeight: 900, color: node3Active ? '#10B981' : 'rgba(255,255,255,0.5)' }}>
                DATABASE SYNC
              </span>
              <span
                style={{
                  fontSize: 11,
                  padding: '3px 10px',
                  borderRadius: 12,
                  background: node3Active ? 'rgba(16,185,129,0.25)' : 'rgba(255,255,255,0.1)',
                  color: node3Active ? '#10B981' : 'rgba(255,255,255,0.5)',
                  fontWeight: 700,
                }}
              >
                {node3Active ? 'COMMITTED' : 'READY'}
              </span>
            </div>
            <div>
              <div style={{ fontSize: 22, fontWeight: 900, color: '#FFFFFF', marginBottom: 4 }}>
                Postgres Update
              </div>
              <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', fontFamily: "'JetBrains Mono', 'IBM Plex Mono', monospace" }}>UPSERT INTO orders_db</div>
            </div>
          </div>
        </div>

        {/* Chat / Query Input Field Area */}
        <div
          style={{
            height: 110,
            padding: '0 32px',
            background: 'rgba(255, 255, 255, 0.02)',
            borderTop: '1px solid rgba(255, 255, 255, 0.12)',
            display: 'flex',
            alignItems: 'center',
            gap: 20,
          }}
        >
          {/* Text Input Box */}
          <div
            style={{
              flex: 1,
              height: 64,
              borderRadius: 14,
              background: 'rgba(255, 255, 255, 0.05)',
              border: node1Active ? '2px solid #10B981' : '1px solid rgba(255, 255, 255, 0.12)',
              boxShadow: node1Active ? '0 0 25px rgba(16, 185, 129, 0.3)' : 'none',
              padding: '0 24px',
              display: 'flex',
              alignItems: 'center',
              fontSize: 19,
              fontWeight: 700,
              color: '#FFFFFF',
              fontFamily: "'JetBrains Mono', 'IBM Plex Mono', monospace",
            }}
          >
            <span style={{ color: '#00D9FF', marginRight: 12, fontWeight: 900 }}>&gt;</span>
            <span>{currentText}</span>
            <div
              style={{
                width: 3,
                height: 24,
                background: node1Active ? '#10B981' : '#00D9FF',
                marginLeft: 6,
                opacity: Math.floor(frame / 6) % 2 === 0 ? 1 : 0.2,
              }}
            />
          </div>

          {/* Interactive Trigger Button */}
          <div
            style={{
              height: 64,
              padding: '0 36px',
              borderRadius: 14,
              background: node1Active
                ? 'linear-gradient(135deg, #10B981 0%, #059669 100%)'
                : 'linear-gradient(135deg, #00D9FF 0%, #00B3D6 100%)',
              color: '#07090D',
              fontSize: 18,
              fontWeight: 900,
              letterSpacing: '0.05em',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: node1Active
                ? '0 0 30px rgba(16, 185, 129, 0.5)'
                : '0 0 25px rgba(0, 217, 255, 0.4)',
              transform: `scale(${isClicked ? 0.92 : 1})`,
            }}
          >
            {node1Active ? 'EXECUTING...' : 'RUN NOW'}
          </div>
        </div>
      </div>

      {/* Motion Cursor Overlay */}
      <div
        style={{
          position: 'absolute',
          left: cursorX,
          top: cursorY,
          zIndex: 100,
          pointerEvents: 'none',
        }}
      >
        <CustomCursor
          size={42}
          color={node1Active ? '#10B981' : '#00D9FF'}
          isClicked={isClicked}
        />
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
    </AbsoluteFill>
  );
};

export default Scene16;