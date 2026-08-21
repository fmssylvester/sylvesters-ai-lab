// duration: 175
import React from 'react';
import {
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
  Sequence,
  Audio,
  staticFile,
  AbsoluteFill,
} from 'remotion';

export default function Scene13() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Motion Springs
  const headerSpring = spring({
    frame: frame - 4,
    fps,
    config: { damping: 14, mass: 0.8 },
  });

  // Left & Right internal pane springs
  const alertCardSpring = spring({
    frame: frame - 10,
    fps,
    config: { damping: 13, mass: 0.7 },
  });

  const timerCardSpring = spring({
    frame: frame - 18,
    fps,
    config: { damping: 14, mass: 0.8 },
  });

  const statusSpring = spring({
    frame: frame - 55,
    fps,
    config: { damping: 12, mass: 0.6 },
  });

  // Dynamic Timer Interpolation (0.0s to 2.4s)
  const rawTimer = interpolate(frame, [25, 60], [0.0, 2.4], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const displayTimer = frame < 25 ? '0.0' : rawTimer.toFixed(1);
  const isTimerLocked = frame >= 60;

  const lockPulse = isTimerLocked
    ? Math.sin((frame - 60) * 0.2) * 0.03 + 1
    : 1;

  return (
    <AbsoluteFill
      style={{
        background: 'radial-gradient(circle at 50% 45%, #0B1120 0%, #07090D 100%)',
        fontFamily: "'Plus Jakarta Sans', sans-serif",
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
            'radial-gradient(circle at 20% 25%, rgba(0, 217, 255, 0.12) 0%, transparent 55%), radial-gradient(circle at 82% 75%, rgba(16, 185, 129, 0.10) 0%, transparent 50%), radial-gradient(circle at 48% 88%, rgba(231, 184, 77, 0.08) 0%, transparent 55%)',
          transform: `translate(${Math.sin(frame / 80) * 7}px, ${Math.cos(frame / 100) * 7}px)`,
          pointerEvents: 'none',
        }}
      />

      {/* Background Grid Line Overlay */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `
            linear-gradient(to right, rgba(255, 255, 255, 0.05) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255, 255, 255, 0.05) 1px, transparent 1px)
          `,
          backgroundSize: '80px 80px',
          opacity: 0.6,
          maskImage:
            'radial-gradient(ellipse at center, black 30%, transparent 82%)',
          WebkitMaskImage:
            'radial-gradient(ellipse at center, black 30%, transparent 82%)',
          pointerEvents: 'none',
        }}
      />

      {/* Grid-line accent highlights */}
      <div
        style={{
          position: 'absolute',
          bottom: 120,
          left: 0,
          right: 0,
          height: 1,
          background: 'linear-gradient(90deg, transparent 0%, rgba(0, 217, 255, 0.3) 25%, rgba(16, 185, 129, 0.4) 50%, rgba(0, 217, 255, 0.3) 75%, transparent 100%)',
          boxShadow: '0 0 15px rgba(0, 217, 255, 0.5)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: 40,
          left: 0,
          right: 0,
          height: 1,
          background: 'linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.12) 30%, rgba(255, 255, 255, 0.15) 50%, rgba(255, 255, 255, 0.12) 70%, transparent 100%)',
        }}
      />

      {/* Subtle Floating Ambient Data Particles */}
      {[
        { x: 240, y: 980, speed: 0.6, size: 4, color: '#00D9FF' },
        { x: 520, y: 1020, speed: 0.9, size: 6, color: '#10B981' },
        { x: 880, y: 970, speed: 0.4, size: 3, color: '#FFFFFF' },
        { x: 1140, y: 1010, speed: 0.7, size: 5, color: '#00D9FF' },
        { x: 1460, y: 990, speed: 0.5, size: 4, color: '#10B981' },
        { x: 1720, y: 1030, speed: 0.8, size: 5, color: '#00D9FF' },
      ].map((p, idx) => {
        const floatY = p.y - Math.sin((frame + idx * 20) * 0.05) * 12;
        const opacity = Math.sin((frame + idx * 15) * 0.08) * 0.35 + 0.45;
        return (
          <div
            key={idx}
            style={{
              position: 'absolute',
              left: p.x,
              top: floatY,
              width: p.size,
              height: p.size,
              borderRadius: '50%',
              backgroundColor: p.color,
              boxShadow: `0 0 12px ${p.color}`,
              opacity,
              pointerEvents: 'none',
            }}
          />
        );
      })}

      {/* Ambient bottom glow */}
      <div
        style={{
          position: 'absolute',
          bottom: -60,
          left: '50%',
          transform: 'translateX(-50%)',
          width: 1400,
          height: 320,
          background: 'radial-gradient(ellipse at center, rgba(16, 185, 129, 0.08) 0%, rgba(0, 217, 255, 0.04) 45%, transparent 75%)',
          pointerEvents: 'none',
        }}
      />

      {/* Audio SFX */}
      <Sequence from={Math.round(0.2 * fps)}>
        <Audio src={staticFile('sfx/email-notif.wav')} volume={0.3} />
      </Sequence>
      <Sequence from={Math.round(2.0 * fps)}>
        <Audio src={staticFile('sfx/ding-confirm.wav')} volume={0.35} />
      </Sequence>

      {/* True Split Glass Container Interface */}
      <div
        style={{
          position: 'absolute',
          top: 120,
          left: 120,
          width: 1680,
          height: 840,
          borderRadius: 24,
          backgroundColor: 'rgba(255, 255, 255, 0.05)',
          backdropFilter: 'blur(12px) saturate(120%)',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          boxShadow: '0 30px 80px rgba(0, 0, 0, 0.7), 0 0 100px rgba(0, 0, 0, 0.3), 0 0 40px rgba(0, 217, 255, 0.08)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Title anchored inside the container */}
        <div
          style={{
            textAlign: 'center',
            padding: '32px 0 24px 0',
            opacity: headerSpring,
            transform: `translateY(${(1 - headerSpring) * -20}px)`,
          }}
        >
          <div
            style={{
              fontSize: 58,
              fontWeight: 900,
              letterSpacing: '-0.02em',
              color: '#00D9FF',
              textShadow: '0 0 25px rgba(0, 217, 255, 0.8), 0 0 50px rgba(0, 217, 255, 0.4), 0 0 90px rgba(0, 217, 255, 0.25)',
              filter: 'drop-shadow(0 0 40px rgba(0, 217, 255, 0.25))',
              textTransform: 'uppercase',
            }}
          >
            SUB-3 SECOND RESPONSE
          </div>
          <div
            style={{
              width: 220,
              height: 4,
              background: 'linear-gradient(90deg, #00D9FF, #10B981)',
              borderRadius: 2,
              margin: '14px auto 0 auto',
              boxShadow: '0 0 25px rgba(0, 217, 255, 0.8), 0 0 40px rgba(0, 217, 255, 0.4)',
            }}
          />
        </div>

        <div
          style={{
            display: 'flex',
            flex: 1,
            overflow: 'hidden',
          }}
        >
        {/* LEFT SECTION: Dark Mode Escalation Alert UI with explicit Gmail motif */}
        <div
          style={{
            flex: 1,
            height: '100%',
            padding: 44,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            position: 'relative',
            backgroundColor: 'rgba(7, 9, 13, 0.5)',
            /* Vertical depth shadow lifting left card off background grid */
            boxShadow: '18px 0 40px rgba(0, 0, 0, 0.6), inset -1px 0 0 rgba(255, 255, 255, 0.12)',
            zIndex: 2,
            transform: `translateY(${(1 - alertCardSpring) * 15}px)`,
            opacity: alertCardSpring,
          }}
        >
          {/* Header Badge: Explicit Gmail Escalation Motif */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 12,
                backgroundColor: 'rgba(234, 67, 53, 0.12)',
                border: '1px solid rgba(234, 67, 53, 0.4)',
                borderRadius: 20,
                padding: '8px 18px',
                boxShadow: '0 0 15px rgba(234, 67, 53, 0.2)',
              }}
            >
              {/* Gmail Envelope Icon */}
              <svg width="22" height="18" viewBox="0 0 24 19" fill="none">
                <path
                  d="M1.5 3.5L12 11L22.5 3.5M1.5 3.5C1.5 2.4 2.4 1.5 3.5 1.5H20.5C21.6 1.5 22.5 2.4 22.5 3.5M1.5 3.5V15.5C1.5 16.6 2.4 17.5 3.5 17.5H20.5C21.6 17.5 22.5 16.6 22.5 15.5V3.5"
                  stroke="#FF6D5A"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <span
                style={{
                  fontSize: 18,
                  fontWeight: 900,
                  color: '#FF6D5A',
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                }}
              >
                GMAIL ESCALATION ALERT
              </span>
            </div>
            <span
              style={{
                fontSize: 18,
                color: 'rgba(255, 255, 255, 0.5)',
                fontWeight: 700,
                letterSpacing: '0.05em',
                fontFamily: "'JetBrains Mono', 'IBM Plex Mono', monospace",
              }}
            >
              PRIORITY P1
            </span>
          </div>

          {/* Center Alert Bell Visual */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 22,
              margin: '10px 0',
            }}
          >
            <div
              style={{
                width: 110,
                height: 110,
                borderRadius: '50%',
                backgroundColor: 'rgba(0, 217, 255, 0.12)',
                border: '2px solid #00D9FF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 0 35px rgba(0, 217, 255, 0.35)',
              }}
            >
              <svg
                width="52"
                height="52"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#00D9FF"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                <path d="M13.73 21a2 2 0 0 1-3.46 0" />
              </svg>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div
                style={{
                  fontSize: 28,
                  fontWeight: 900,
                  color: '#FFFFFF',
                  marginBottom: 8,
                  letterSpacing: '0.02em',
                }}
              >
                Dispatch Triggered
              </div>
              <div style={{ fontSize: 18, color: 'rgba(255,255,255,0.65)', fontWeight: 700 }}>
                Targeting On-Call Responder
              </div>
            </div>
          </div>

          {/* Left Card Footer */}
          <div
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              borderRadius: 14,
              padding: '18px 24px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              border: '1px solid rgba(255, 255, 255, 0.1)',
            }}
          >
            <span style={{ fontSize: 18, fontWeight: 900, color: '#00D9FF', letterSpacing: '0.04em' }}>
              Status: Escalated
            </span>
            <span style={{ fontSize: 18, color: 'rgba(255, 255, 255, 0.75)', fontWeight: 700, fontFamily: "'JetBrains Mono', 'IBM Plex Mono', monospace" }}>
              Target: &lt; 3.0s
            </span>
          </div>
        </div>

        {/* Central Dividing Interactive Threshold Matching Background Grid */}
        <div
          style={{
            width: 2,
            height: '100%',
            background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.05) 0%, rgba(16, 185, 129, 0.7) 50%, rgba(255, 255, 255, 0.05) 100%)',
            boxShadow: '0 0 15px rgba(16, 185, 129, 0.6)',
            position: 'relative',
            zIndex: 3,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {/* Threshold Center Indicator Node */}
          <div
            style={{
              width: 10,
              height: 40,
              borderRadius: 5,
              backgroundColor: '#10B981',
              boxShadow: '0 0 12px #10B981',
            }}
          />
        </div>

        {/* RIGHT SECTION: Response Timer & Green Status Confirmation */}
        <div
          style={{
            flex: 1.1,
            height: '100%',
            padding: 44,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            gap: 46,
            position: 'relative',
            backgroundColor: 'rgba(255, 255, 255, 0.02)',
            transform: `translateY(${(1 - timerCardSpring) * 15}px)`,
            opacity: timerCardSpring,
          }}
        >
          {/* Main Display: < 2.4s Response Time in Emerald Green (#10B981) */}
          <div
            style={{
              transform: `scale(${lockPulse})`,
              textAlign: 'center',
            }}
          >
            <div
              style={{
                fontSize: 64,
                fontWeight: 800,
                color: '#10B981',
                letterSpacing: '0.02em',
                fontFamily: "'JetBrains Mono', 'IBM Plex Mono', monospace",
                fontVariantNumeric: 'tabular-nums',
                textShadow: isTimerLocked
                  ? '0 0 35px rgba(16, 185, 129, 0.8), 0 0 70px rgba(16, 185, 129, 0.4)'
                  : '0 0 20px rgba(16, 185, 129, 0.3)',
                whiteSpace: 'nowrap',
              }}
            >
              &lt; {displayTimer}s Response Time
            </div>
          </div>

          {/* Badge Wrapper: Dynamic Green Glow Container */}
          <div
            style={{
              transform: `scale(${statusSpring})`,
              opacity: statusSpring,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
              padding: 3,
              borderRadius: 999,
              background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
              boxShadow: '0 0 35px rgba(16, 185, 129, 0.7), inset 0 0 15px rgba(255, 255, 255, 0.4)',
            }}
          >
            {/* Inner Badge */}
            <div
              style={{
                backgroundColor: '#10B981',
                padding: '20px 52px',
                borderRadius: 999,
                color: '#07090D',
                fontSize: 40,
                fontWeight: 800,
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                fontFamily: "'JetBrains Mono', 'IBM Plex Mono', monospace",
                border: '1px solid rgba(255, 255, 255, 0.6)',
                background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                boxShadow: 'inset 0 2px 10px rgba(255, 255, 255, 0.4)',
              }}
            >
              200 OK Status
            </div>
          </div>
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
    </AbsoluteFill>
  );
}