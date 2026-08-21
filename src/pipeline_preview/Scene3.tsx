// duration: 221
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

export default function Scene3() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Header Animation
  const headlineSpring = spring({
    frame,
    fps,
    config: { damping: 14, mass: 0.8 },
  });

  const headlineY = interpolate(headlineSpring, [0, 1], [-50, 0]);
  const headlineOpacity = interpolate(headlineSpring, [0, 1], [0, 1]);

  // Card Cascade Springs
  const card1Spring = spring({
    frame: frame - 5,
    fps,
    config: { damping: 14, mass: 0.7 },
  });
  const card2Spring = spring({
    frame: frame - 10,
    fps,
    config: { damping: 14, mass: 0.7 },
  });
  const card3Spring = spring({
    frame: frame - 15,
    fps,
    config: { damping: 14, mass: 0.7 },
  });

  // Node 2 Error & Auto-Resolution State Transitions
  // Frame 0 - 53: Coral Execution Error State (#FF6B6B)
  // Frame 54+: Emerald Auto-Resolved State (#10B981)
  const isError = frame < 54;
  const isResolved = frame >= 54;

  const errorPulse = isError
    ? Math.sin(frame * 0.35) * 0.35 + 0.65
    : 1;

  const resolveFlash = interpolate(frame, [54, 60, 72], [0, 1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Phase 2 Transition (Frame 85+)
  const phase2Spring = spring({
    frame: frame - 85,
    fps,
    config: { damping: 16, mass: 0.9 },
  });

  const phase1Scale = interpolate(phase2Spring, [0, 1], [1, 0.95]);
  const phase1Y = interpolate(phase2Spring, [0, 1], [0, -40]);

  const presenterY = interpolate(phase2Spring, [0, 1], [140, 0]);
  const presenterOpacity = interpolate(phase2Spring, [0, 1], [0, 1]);

  // Dynamic Theme Colors
  const cyanColor = '#00D9FF';
  const coralColor = '#FF6B6B';
  const emeraldColor = '#10B981';

  let centerBorderColor = coralColor;
  let centerGlow = `0 0 ${50 * errorPulse}px rgba(255, 107, 107, ${0.75 * errorPulse})`;
  let statusBadgeColor = coralColor;
  let statusBg = 'rgba(255, 107, 107, 0.2)';
  let statusText = 'EXECUTION ERROR #0412';

  if (isResolved) {
    centerBorderColor = emeraldColor;
    centerGlow = `0 0 ${60 + resolveFlash * 40}px rgba(16, 185, 129, 0.6)`;
    statusBadgeColor = emeraldColor;
    statusBg = 'rgba(16, 185, 129, 0.2)';
    statusText = 'AUTO-RESOLVED';
  }

  // Radial geometry pulse
  const bgGlowScale = interpolate(Math.sin(frame * 0.05), [-1, 1], [0.95, 1.1]);

  return (
    <div
      style={{
        width: 1920,
        height: 1080,
        backgroundColor: '#07090D',
        background: 'radial-gradient(circle at 50% 50%, #141C2E 0%, #07090D 80%)',
        position: 'relative',
        overflow: 'hidden',
        fontFamily: "'Plus Jakarta Sans', sans-serif",
        color: '#FFFFFF',
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@700;800;900&display=swap');
      `}</style>

      {/* Gradient Mesh Base */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'radial-gradient(circle at 15% 30%, rgba(0, 217, 255, 0.12) 0%, transparent 55%), radial-gradient(circle at 85% 25%, rgba(231, 184, 77, 0.10) 0%, transparent 50%), radial-gradient(circle at 60% 90%, rgba(0, 217, 255, 0.08) 0%, transparent 55%)',
          transform: `translate(${Math.sin(frame / 70) * 7}px, ${Math.cos(frame / 90) * 6}px)`,
          pointerEvents: 'none',
        }}
      />

      {/* 80px Grid Lines */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `
            linear-gradient(to right, rgba(255,255,255,0.05) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255,255,255,0.05) 1px, transparent 1px)
          `,
          backgroundSize: '80px 80px',
          opacity: 0.7,
          maskImage:
            'radial-gradient(ellipse at center, black 30%, transparent 82%)',
          WebkitMaskImage:
            'radial-gradient(ellipse at center, black 30%, transparent 82%)',
          pointerEvents: 'none',
        }}
      />

      {/* Lower Quadrant Grid Nodes & Particles */}
      <div
        style={{
          position: 'absolute',
          bottom: 120,
          left: 140,
          display: 'flex',
          flexDirection: 'column',
          gap: 8,
          opacity: 0.35,
          pointerEvents: 'none',
          zIndex: 2,
        }}
      >
        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: cyanColor }} />
          <span style={{ fontSize: 11, fontFamily: 'monospace', color: cyanColor, letterSpacing: '0.1em' }}>GRID_NODE_LL :: 0x4F</span>
        </div>
        <div style={{ display: 'flex', gap: 4 }}>
          {[40, 24, 60, 16, 32].map((w, i) => (
            <div key={i} style={{ width: w, height: 2, background: 'rgba(0, 217, 255, 0.4)', borderRadius: 1 }} />
          ))}
        </div>
      </div>

      <div
        style={{
          position: 'absolute',
          bottom: 120,
          right: 140,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-end',
          gap: 8,
          opacity: 0.35,
          pointerEvents: 'none',
          zIndex: 2,
        }}
      >
        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          <span style={{ fontSize: 11, fontFamily: 'monospace', color: cyanColor, letterSpacing: '0.1em' }}>GRID_NODE_LR :: 0x8E</span>
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: cyanColor }} />
        </div>
        <div style={{ display: 'flex', gap: 4 }}>
          {[32, 16, 60, 24, 40].map((w, i) => (
            <div key={i} style={{ width: w, height: 2, background: 'rgba(0, 217, 255, 0.4)', borderRadius: 1 }} />
          ))}
        </div>
      </div>

      {/* Floating Ambient Grid Particles */}
      {[
        { x: 280, y: 720 },
        { x: 420, y: 840 },
        { x: 1500, y: 750 },
        { x: 1640, y: 860 },
      ].map((pt, idx) => (
        <div
          key={idx}
          style={{
            position: 'absolute',
            left: pt.x,
            top: pt.y,
            width: 4,
            height: 4,
            borderRadius: '50%',
            backgroundColor: cyanColor,
            opacity: 0.25 + Math.sin(frame * 0.08 + idx) * 0.15,
            boxShadow: `0 0 8px ${cyanColor}`,
            pointerEvents: 'none',
            zIndex: 2,
          }}
        />
      ))}

      {/* Film Grain Texture */}
      <svg
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          opacity: 0.05,
          pointerEvents: 'none',
          zIndex: 3,
        }}
      >
        <filter id="scene3-grain">
          <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="3" stitchTiles="stitch" />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter="url(#scene3-grain)" />
      </svg>

      {/* Vignette */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'radial-gradient(ellipse at center, transparent 45%, rgba(0, 0, 0, 0.5) 100%)',
          pointerEvents: 'none',
          zIndex: 4,
        }}
      />

      {/* Atmospheric Central Radial Glow */}
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          width: 1000,
          height: 600,
          transform: `translate(-50%, -50%) scale(${bgGlowScale})`,
          background: isError
            ? 'radial-gradient(circle, rgba(255, 107, 107, 0.18) 0%, transparent 70%)'
            : isResolved
            ? 'radial-gradient(circle, rgba(16, 185, 129, 0.18) 0%, transparent 70%)'
            : 'radial-gradient(circle, rgba(0, 217, 255, 0.22) 0%, transparent 70%)',
          pointerEvents: 'none',
          transition: 'background 0.3s ease',
        }}
      />

      {/* Central HUD Geometry & Ring Lines */}
      <svg
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          width: 900,
          height: 500,
          transform: 'translate(-50%, -50%)',
          pointerEvents: 'none',
          opacity: 0.4,
        }}
      >
        <circle cx="450" cy="250" r="220" fill="none" stroke="rgba(0, 217, 255, 0.2)" strokeWidth="1.5" strokeDasharray="8 8" />
        <circle cx="450" cy="250" r="160" fill="none" stroke="rgba(255, 255, 255, 0.1)" strokeWidth="1" />
        <line x1="100" y1="250" x2="800" y2="250" stroke="rgba(0, 217, 255, 0.3)" strokeWidth="2" strokeDasharray="6 6" />
      </svg>

      {/* Visual Vertical Cyan Guide Line connecting Central Cluster to Identity Card */}
      <div
        style={{
          position: 'absolute',
          top: 480,
          bottom: 230,
          left: '50%',
          width: 2,
          transform: 'translateX(-50%)',
          background: 'linear-gradient(to bottom, rgba(0, 217, 255, 0.4), rgba(0, 217, 255, 0.1))',
          boxShadow: '0 0 8px rgba(0, 217, 255, 0.3)',
          pointerEvents: 'none',
          zIndex: 4,
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: -3,
            width: 8,
            height: 8,
            borderRadius: '50%',
            backgroundColor: cyanColor,
            boxShadow: `0 0 10px ${cyanColor}`,
          }}
        />
      </div>

      {/* SFX Audio Sync */}
      <Sequence from={15}>
        <Audio src={staticFile('sfx/error-beep.wav')} volume={0.2} />
      </Sequence>
      <Sequence from={54}>
        <Audio src={staticFile('sfx/ding-confirm.wav')} volume={0.25} />
      </Sequence>

      {/* Flash overlay on auto-resolve */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundColor: emeraldColor,
          opacity: resolveFlash * 0.12,
          pointerEvents: 'none',
          zIndex: 20,
        }}
      />

      {/* Header Region - Crisp Typography with reduced blur radius */}
      <div
        style={{
          position: 'absolute',
          top: 80,
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 10,
          transform: `translateY(${headlineY}px)`,
          opacity: headlineOpacity,
        }}
      >
        <h1
          style={{
            margin: 0,
            fontSize: 76,
            fontWeight: 900,
            letterSpacing: '-0.03em',
            textTransform: 'uppercase',
            color: '#FFFFFF',
            textShadow: '0 0 10px rgba(0, 217, 255, 0.5), 0 0 20px rgba(0, 217, 255, 0.25)',
            textAlign: 'center',
          }}
        >
          EVERY CONFIGURATION & MISTAKE
        </h1>
      </div>

      {/* Distributed Node Canvas Container */}
      <div
        style={{
          position: 'absolute',
          top: 250,
          left: 0,
          right: 0,
          height: 440,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: 36,
          zIndex: 5,
          transform: `scale(${phase1Scale}) translateY(${phase1Y}px)`,
        }}
      >
        {/* Node Card 1 */}
        <div
          style={{
            width: 380,
            height: 420,
            borderRadius: 24,
            background: 'rgba(255, 255, 255, 0.05)',
            backdropFilter: 'blur(12px) saturate(120%)',
            WebkitBackdropFilter: 'blur(12px) saturate(120%)',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            boxShadow: '0 20px 50px rgba(0,0,0,0.5), 0 0 80px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.15), 0 0 40px rgba(0,217,255,0.06)',
            padding: 32,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            transform: `scale(${interpolate(card1Spring, [0, 1], [0.8, 1])}) translateY(${interpolate(
              card1Spring,
              [0, 1],
              [60, 0]
            )}px)`,
            opacity: interpolate(card1Spring, [0, 1], [0, 1]),
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke={cyanColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="3" />
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
            </svg>
            <div
              style={{
                width: 12,
                height: 12,
                borderRadius: '50%',
                backgroundColor: cyanColor,
                boxShadow: `0 0 12px ${cyanColor}`,
              }}
            />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ fontSize: 18, fontWeight: 700, color: 'rgba(255,255,255,0.7)' }}>DATA INGESTION</div>
            <div style={{ height: 6, borderRadius: 3, background: cyanColor, width: '90%', opacity: 0.8 }} />
            <div style={{ height: 6, borderRadius: 3, background: 'rgba(255,255,255,0.15)', width: '65%' }} />
            <div style={{ height: 6, borderRadius: 3, background: 'rgba(255,255,255,0.1)', width: '80%' }} />
          </div>
          <div
            style={{
              padding: '10px 16px',
              borderRadius: 8,
              background: 'rgba(0, 217, 255, 0.12)',
              border: '1px solid rgba(0, 217, 255, 0.3)',
              fontSize: 14,
              color: cyanColor,
              fontWeight: 700,
              letterSpacing: '0.05em',
            }}
          >
            NODE 01 :: SYNCED
          </div>
        </div>

        {/* Node Card 2 (Target for Execution Error Coral -> Emerald Auto-Resolved) */}
        <div
          style={{
            width: 430,
            height: 450,
            borderRadius: 24,
            background: 'rgba(255, 255, 255, 0.05)',
            backdropFilter: 'blur(12px) saturate(120%)',
            WebkitBackdropFilter: 'blur(12px) saturate(120%)',
            border: `2px solid ${centerBorderColor}`,
            boxShadow: `${centerGlow}, 0 25px 60px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.15), 0 0 40px rgba(0,217,255,0.06)`,
            padding: 36,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            transform: `scale(${interpolate(card2Spring, [0, 1], [0.8, 1])}) translateY(${interpolate(
              card2Spring,
              [0, 1],
              [60, 0]
            )}px)`,
            opacity: interpolate(card2Spring, [0, 1], [0, 1]),
            transition: 'border-color 0.25s ease, box-shadow 0.25s ease',
            zIndex: 2,
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke={statusBadgeColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="4" y="4" width="16" height="16" rx="2" ry="2" />
              <rect x="9" y="9" width="6" height="6" />
              <line x1="9" y1="1" x2="9" y2="4" />
              <line x1="15" y1="1" x2="15" y2="4" />
              <line x1="9" y1="20" x2="9" y2="23" />
              <line x1="15" y1="20" x2="15" y2="23" />
              <line x1="20" y1="9" x2="23" y2="9" />
              <line x1="20" y1="15" x2="23" y2="15" />
              <line x1="1" y1="9" x2="4" y2="9" />
              <line x1="1" y1="15" x2="4" y2="15" />
            </svg>
            <div
              style={{
                width: 14,
                height: 14,
                borderRadius: '50%',
                backgroundColor: statusBadgeColor,
                boxShadow: `0 0 16px ${statusBadgeColor}`,
              }}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ fontSize: 18, fontWeight: 900, color: statusBadgeColor, letterSpacing: '0.05em' }}>
              {isError ? 'EXECUTION ERROR' : 'EXECUTION RECOVERED'}
            </div>
            {/* Progress bar uses coral accent color during execution error state */}
            <div
              style={{
                height: 8,
                borderRadius: 4,
                background: statusBadgeColor,
                width: '100%',
                boxShadow: `0 0 10px ${statusBadgeColor}`,
                transition: 'background 0.25s ease',
              }}
            />
            <div style={{ height: 6, borderRadius: 3, background: 'rgba(255,255,255,0.2)', width: '85%' }} />
            <div style={{ height: 6, borderRadius: 3, background: 'rgba(255,255,255,0.12)', width: '70%' }} />
          </div>

          <div
            style={{
              padding: '12px 20px',
              borderRadius: 10,
              background: statusBg,
              border: `1.5px solid ${statusBadgeColor}`,
              fontSize: 16,
              color: statusBadgeColor,
              fontWeight: 900,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              letterSpacing: '0.04em',
              transition: 'all 0.25s ease',
            }}
          >
            <span>{statusText}</span>
            <span style={{ fontSize: 20 }}>{isError ? '⚠' : '✓'}</span>
          </div>
        </div>

        {/* Node Card 3 */}
        <div
          style={{
            width: 380,
            height: 420,
            borderRadius: 24,
            background: 'rgba(255, 255, 255, 0.05)',
            backdropFilter: 'blur(12px) saturate(120%)',
            WebkitBackdropFilter: 'blur(12px) saturate(120%)',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            boxShadow: '0 20px 50px rgba(0,0,0,0.5), 0 0 80px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.15), 0 0 40px rgba(0,217,255,0.06)',
            padding: 32,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            transform: `scale(${interpolate(card3Spring, [0, 1], [0.8, 1])}) translateY(${interpolate(
              card3Spring,
              [0, 1],
              [60, 0]
            )}px)`,
            opacity: interpolate(card3Spring, [0, 1], [0, 1]),
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke={cyanColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="4 17 10 11 4 5" />
              <line x1="12" y1="19" x2="20" y2="19" />
            </svg>
            <div
              style={{
                width: 12,
                height: 12,
                borderRadius: '50%',
                backgroundColor: cyanColor,
                boxShadow: `0 0 12px ${cyanColor}`,
              }}
            />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ fontSize: 18, fontWeight: 700, color: 'rgba(255,255,255,0.7)' }}>PIPELINE DISPATCH</div>
            <div style={{ height: 6, borderRadius: 3, background: cyanColor, width: '75%', opacity: 0.8 }} />
            <div style={{ height: 6, borderRadius: 3, background: 'rgba(255,255,255,0.15)', width: '90%' }} />
            <div style={{ height: 6, borderRadius: 3, background: 'rgba(255,255,255,0.1)', width: '50%' }} />
          </div>
          <div
            style={{
              padding: '10px 16px',
              borderRadius: 8,
              background: 'rgba(0, 217, 255, 0.12)',
              border: '1px solid rgba(0, 217, 255, 0.3)',
              fontSize: 14,
              color: cyanColor,
              fontWeight: 700,
              letterSpacing: '0.05em',
            }}
          >
            NODE 03 :: READY
          </div>
        </div>
      </div>

      {/* Persona Identification Card - Shifted up by 40px to bottom: 115 */}
      <div
        style={{
          position: 'absolute',
          bottom: 115,
          left: '50%',
          transform: `translateX(-50%) translateY(${presenterY}px)`,
          opacity: presenterOpacity,
          width: 920,
          borderRadius: 24,
          background: 'rgba(255, 255, 255, 0.05)',
          backdropFilter: 'blur(12px) saturate(120%)',
          WebkitBackdropFilter: 'blur(12px) saturate(120%)',
          border: '1px solid rgba(0, 217, 255, 0.35)',
          boxShadow: '0 0 60px rgba(0, 217, 255, 0.2), 0 25px 60px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.15), 0 0 40px rgba(0,217,255,0.08)',
          padding: '28px 48px',
          display: 'flex',
          alignItems: 'center',
          gap: 32,
          zIndex: 15,
        }}
      >
        <div
          style={{
            width: 84,
            height: 84,
            borderRadius: 20,
            background: 'radial-gradient(circle at 30% 30%, #00D9FF 0%, #07090D 100%)',
            border: '2px solid #00D9FF',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            boxShadow: '0 0 25px rgba(0, 217, 255, 0.5)',
            flexShrink: 0,
          }}
        >
          <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <div
            style={{
              fontSize: 40,
              fontWeight: 900,
              letterSpacing: '-0.01em',
              color: '#FFFFFF',
              lineHeight: 1.1,
            }}
          >
            SYLVESTER
          </div>
          <div
            style={{
              fontSize: 18,
              fontWeight: 700,
              color: cyanColor,
              letterSpacing: '0.04em',
              display: 'flex',
              alignItems: 'center',
              gap: 12,
            }}
          >
            <span>AI AUTOMATION SPECIALIST</span>
            <span style={{ color: 'rgba(255,255,255,0.3)' }}>|</span>
            <span
              style={{
                padding: '2px 8px',
                borderRadius: 4,
                background: 'rgba(16, 185, 129, 0.2)',
                color: emeraldColor,
                fontSize: 14,
                fontWeight: 900,
              }}
            >
              SYSTEM ONLINE
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}