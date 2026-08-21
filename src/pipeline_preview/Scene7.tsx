// duration: 132
import React from 'react';
import {
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
  staticFile,
  Audio,
  Img,
  AbsoluteFill,
  Sequence,
} from 'remotion';

export const MainScene = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Header alert entrance
  const headerOpacity = interpolate(frame, [0, 15], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const headerY = interpolate(frame, [0, 15], [-30, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Inactive Left Tab animation (closes at frame 15-30)
  const tabCloseProgress = interpolate(frame, [15, 30], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const inactiveScale = interpolate(tabCloseProgress, [0, 1], [1, 0.7]);
  const inactiveOpacity = interpolate(tabCloseProgress, [0, 1], [1, 0]);

  // Cursor positions over time for spring + electric cyan trail
  const getCursorPos = (f: number) => {
    const p = spring({
      frame: f - 22,
      fps,
      config: { damping: 14, mass: 0.8, stiffness: 100 },
    });
    return {
      x: interpolate(p, [0, 1], [210, 960]),
      y: interpolate(p, [0, 1], [260, 480]),
    };
  };

  const cursorCurrent = getCursorPos(frame);
  const cursorTrail1 = getCursorPos(frame - 1.5);
  const cursorTrail2 = getCursorPos(frame - 3.0);
  const cursorTrail3 = getCursorPos(frame - 4.5);

  // Velocity calculation for dynamic electric cyan trail intensity
  const movementVelocity = Math.abs(cursorCurrent.x - cursorTrail2.x);
  const trailOpacity = interpolate(movementVelocity, [0, 50], [0, 0.85], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Click animation scale pulse on the cursor
  const clickScale =
    frame >= 12 && frame <= 18
      ? interpolate(frame, [12, 15, 18], [1, 0.75, 1])
      : 1;

  // Competitor Card activation spring
  const compCardSpring = spring({
    frame: frame - 28,
    fps,
    config: { damping: 12, stiffness: 90 },
  });

  // Green active badge & check-double prop reveal
  const badgeSpring = spring({
    frame: frame - 72,
    fps,
    config: { damping: 10, stiffness: 150 },
  });

  return (
    <AbsoluteFill
      style={{
        background: 'radial-gradient(circle at 50% 50%, #0B1120 0%, #07090D 100%)',
        fontFamily: "'Plus Jakarta Sans', sans-serif",
        color: '#FFFFFF',
        overflow: 'hidden',
      }}
    >
      <style>
        {`@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@700;800;900&display=swap');`}
      </style>

      {/* Gradient Mesh Base */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'radial-gradient(circle at 20% 25%, rgba(255, 109, 90, 0.12) 0%, transparent 55%), radial-gradient(circle at 82% 75%, rgba(0, 217, 255, 0.10) 0%, transparent 50%), radial-gradient(circle at 45% 85%, rgba(231, 184, 77, 0.08) 0%, transparent 55%)',
          transform: `translate(${Math.sin(frame / 80) * 7}px, ${Math.cos(frame / 100) * 7}px)`,
          pointerEvents: 'none',
        }}
      />

      {/* Background Grid */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `linear-gradient(to right, rgba(255,255,255,0.05) 1px, transparent 1px),
                            linear-gradient(to bottom, rgba(255,255,255,0.05) 1px, transparent 1px)`,
          backgroundSize: '80px 80px',
          opacity: 0.6,
          maskImage:
            'radial-gradient(ellipse at center, black 30%, transparent 82%)',
          WebkitMaskImage:
            'radial-gradient(ellipse at center, black 30%, transparent 82%)',
          pointerEvents: 'none',
        }}
      />

      {/* Ambient Central Glow */}
      <div
        style={{
          position: 'absolute',
          left: '50%',
          top: '50%',
          width: 900,
          height: 900,
          transform: 'translate(-50%, -50%)',
          background:
            'radial-gradient(circle, rgba(0, 217, 255, 0.12) 0%, rgba(0, 217, 255, 0.05) 50%, transparent 70%)',
          pointerEvents: 'none',
        }}
      />

      {/* Sound Effects */}
      <Sequence from={15}>
        <Audio src={staticFile('sfx/click.wav')} volume={0.25} />
      </Sequence>
      <Sequence from={36}>
        <Audio src={staticFile('sfx/whoosh.wav')} volume={0.3} />
      </Sequence>
      <Sequence from={72}>
        <Audio src={staticFile('sfx/ding-confirm.wav')} volume={0.3} />
      </Sequence>

      {/* Top Header Alert */}
      <div
        style={{
          position: 'absolute',
          top: 70,
          left: 0,
          right: 0,
          display: 'flex',
          justifyContent: 'center',
          opacity: headerOpacity,
          transform: `translateY(${headerY}px)`,
          zIndex: 10,
        }}
      >
        <div
          style={{
            padding: '16px 42px',
            borderRadius: 50,
            background: 'rgba(255, 107, 107, 0.12)',
            border: '1px solid rgba(255, 107, 107, 0.4)',
            boxShadow: '0 0 35px rgba(255, 107, 107, 0.25)',
            fontSize: 26,
            fontWeight: 900,
            color: '#FF6D5A',
            letterSpacing: '-0.01em',
            display: 'flex',
            alignItems: 'center',
            gap: 16,
          }}
        >
          <span
            style={{
              width: 12,
              height: 12,
              borderRadius: '50%',
              backgroundColor: '#FF6D5A',
              boxShadow: '0 0 12px #FF6D5A',
            }}
          />
          CUSTOMER LOST TO COMPETITOR
        </div>
      </div>

      {/* Inactive Glass Support Tab (Left - Fades/Closes at frame 15-30) */}
      <div
        style={{
          position: 'absolute',
          left: 120,
          top: 220,
          width: 420,
          height: 380,
          borderRadius: 24,
          background: 'rgba(255, 255, 255, 0.05)',
          backdropFilter: 'blur(12px) saturate(120%)',
          WebkitBackdropFilter: 'blur(12px) saturate(120%)',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          padding: 30,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          transform: `scale(${inactiveScale})`,
          opacity: inactiveOpacity,
          boxShadow: '0 25px 60px rgba(0,0,0,0.6)',
          zIndex: 20,
        }}
      >
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <div
            style={{
              width: 18,
              height: 18,
              borderRadius: '50%',
              background: frame >= 15 ? '#FF6D5A' : 'rgba(255, 109, 90, 0.8)',
              boxShadow: frame >= 15 ? '0 0 18px #FF6D5A' : 'none',
            }}
          />
          <div style={{ width: 14, height: 14, borderRadius: '50%', background: 'rgba(255, 255, 255, 0.15)' }} />
          <div style={{ width: 14, height: 14, borderRadius: '50%', background: 'rgba(255, 255, 255, 0.15)' }} />
          <span style={{ marginLeft: 10, fontSize: 14, color: 'rgba(255,255,255,0.4)', fontWeight: 700 }}>
            Slow Support Tab
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div
            style={{
              width: '85%',
              height: 44,
              borderRadius: 12,
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
            }}
          />
          <div
            style={{
              width: '60%',
              height: 36,
              borderRadius: 12,
              background: 'rgba(255, 255, 255, 0.03)',
              alignSelf: 'flex-end',
            }}
          />
        </div>

        <div style={{ fontSize: 13, color: 'rgba(255,109,90,0.7)', fontWeight: 700 }}>
          ⚠️ Response delayed by 4+ hours
        </div>
      </div>

      {/* Main Glass Card - Anchored and Centered within Frame */}
      <div
        style={{
          position: 'absolute',
          left: '50%',
          top: 180,
          transform: `translateX(-50%) scale(${0.92 + compCardSpring * 0.08})`,
          width: 1140,
          minHeight: 680,
          borderRadius: 24,
          background: 'rgba(255, 255, 255, 0.05)',
          backdropFilter: 'blur(12px) saturate(120%)',
          WebkitBackdropFilter: 'blur(12px) saturate(120%)',
          border: frame > 30 ? '1.5px solid #00D9FF' : '1px solid rgba(255, 255, 255, 0.12)',
          boxShadow:
            frame > 30
              ? '0 30px 80px rgba(0, 0, 0, 0.7), 0 0 90px rgba(0, 217, 255, 0.18), inset 0 0 30px rgba(0, 217, 255, 0.06)'
              : '0 25px 60px rgba(0, 0, 0, 0.6)',
          padding: 48,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          opacity: interpolate(compCardSpring, [0, 1], [0.4, 1]),
          zIndex: 15,
        }}
      >
        {/* Header Row */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div
            style={{
              fontSize: 40,
              fontWeight: 900,
              color: '#FFFFFF',
              letterSpacing: '-0.02em',
              textShadow: '0 0 20px rgba(0, 217, 255, 0.6), 0 0 40px rgba(0, 217, 255, 0.3)',
            }}
          >
            Instant Response Competitor
          </div>

          {/* Active Real-Time Green Chat Badge */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              padding: '12px 24px',
              borderRadius: 30,
              background: 'rgba(16, 185, 129, 0.15)',
              border: '1px solid rgba(16, 185, 129, 0.5)',
              boxShadow: '0 0 20px rgba(16, 185, 129, 0.2)',
              transform: `scale(${badgeSpring})`,
              opacity: badgeSpring,
            }}
          >
            <span
              style={{
                width: 12,
                height: 12,
                borderRadius: '50%',
                backgroundColor: '#10B981',
                boxShadow: '0 0 14px #10B981',
              }}
            />
            <span style={{ color: '#10B981', fontSize: 18, fontWeight: 900, letterSpacing: '0.05em' }}>
              ACTIVE INSTANT
            </span>
          </div>
        </div>

        {/* Chat Interior Container - Scaled up elements filling internal whitespace */}
        <div
          style={{
            marginTop: 32,
            padding: 36,
            borderRadius: 24,
            background: 'rgba(255, 255, 255, 0.03)',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            display: 'flex',
            flexDirection: 'column',
            gap: 24,
          }}
        >
          {/* Customer Message */}
          <div
            style={{
              alignSelf: 'flex-start',
              padding: '22px 32px',
              borderRadius: '22px 22px 22px 6px',
              background: '#00D9FF',
              color: '#FFFFFF',
              fontSize: 24,
              fontWeight: 700,
              boxShadow: '0 12px 30px rgba(0, 217, 255, 0.3)',
              maxWidth: '80%',
            }}
          >
            Can I get instant pricing and enterprise custom onboarding today?
          </div>

          {/* Agent Reply */}
          <div
            style={{
              alignSelf: 'flex-end',
              padding: '24px 36px',
              borderRadius: '22px 22px 6px 22px',
              background: 'rgba(15, 23, 42, 0.95)',
              border: '1.5px solid #00D9FF',
              boxShadow: '0 0 35px rgba(0, 217, 255, 0.3)',
              display: 'flex',
              alignItems: 'center',
              gap: 20,
              transform: `scale(${badgeSpring})`,
              opacity: badgeSpring,
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <span style={{ color: '#00D9FF', fontSize: 26, fontWeight: 900 }}>
                Connected instantly!
              </span>
              <span style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: 18, fontWeight: 700 }}>
                AI Quote & Onboarding Deck sent in 0.02 seconds.
              </span>
            </div>

            {/* Photo Prop: Double Check */}
            <Img
              src={staticFile('08_PROPS/check-double.png')}
              style={{
                width: 42,
                height: 42,
                objectFit: 'contain',
                filter: 'drop-shadow(0 0 12px rgba(0, 217, 255, 0.9))',
              }}
            />
          </div>

          {/* Scaled-Up Secondary AI Feature Strip filling lower internal whitespace */}
          <div
            style={{
              marginTop: 8,
              padding: '18px 28px',
              borderRadius: 16,
              background: 'rgba(0, 217, 255, 0.06)',
              border: '1px dashed rgba(0, 217, 255, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              transform: `scale(${badgeSpring})`,
              opacity: badgeSpring,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <span style={{ fontSize: 22 }}>⚡</span>
              <span style={{ fontSize: 18, fontWeight: 800, color: '#00D9FF' }}>
                Automated Deal Locked
              </span>
              <span style={{ fontSize: 16, color: 'rgba(255, 255, 255, 0.6)', fontWeight: 700 }}>
                • Zero Wait Time • 100% Satisfaction
              </span>
            </div>
            <div
              style={{
                padding: '8px 18px',
                borderRadius: 20,
                background: '#00D9FF',
                color: '#0E1017',
                fontSize: 15,
                fontWeight: 900,
                boxShadow: '0 0 15px rgba(0, 217, 255, 0.5)',
              }}
            >
              DEAL CONVERTED
            </div>
          </div>
        </div>
      </div>

      {/* Vibrant Electric Cyan (#00D9FF) Glow Motion Trail for Cursor */}
      {trailOpacity > 0.05 && (
        <>
          <div
            style={{
              position: 'absolute',
              top: cursorTrail3.y + 20,
              left: cursorTrail3.x + 20,
              width: 24,
              height: 24,
              borderRadius: '50%',
              background: '#00D9FF',
              opacity: trailOpacity * 0.25,
              filter: 'blur(8px)',
              pointerEvents: 'none',
              zIndex: 97,
            }}
          />
          <div
            style={{
              position: 'absolute',
              top: cursorTrail2.y + 15,
              left: cursorTrail2.x + 15,
              width: 32,
              height: 32,
              borderRadius: '50%',
              background: '#00D9FF',
              opacity: trailOpacity * 0.5,
              filter: 'blur(6px)',
              pointerEvents: 'none',
              zIndex: 98,
            }}
          />
          <div
            style={{
              position: 'absolute',
              top: cursorTrail1.y + 10,
              left: cursorTrail1.x + 10,
              width: 40,
              height: 40,
              borderRadius: '50%',
              background: '#00D9FF',
              opacity: trailOpacity * 0.8,
              filter: 'blur(4px)',
              pointerEvents: 'none',
              zIndex: 99,
            }}
          />
        </>
      )}

      {/* Glowing Neon Cursor */}
      <div
        style={{
          position: 'absolute',
          top: cursorCurrent.y,
          left: cursorCurrent.x,
          transform: `scale(${clickScale})`,
          pointerEvents: 'none',
          zIndex: 100,
          filter: 'drop-shadow(0 0 20px #00D9FF) drop-shadow(0 0 40px #00D9FF)',
        }}
      >
        <Img
          src={staticFile('02_ICONS/cursor.svg')}
          style={{
            width: 56,
            height: 56,
            objectFit: 'contain',
            filter: 'brightness(1.2) drop-shadow(0 0 10px #00D9FF)',
          }}
        />
      </div>

      {/* Film Grain Overlay */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          opacity: 0.05,
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
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
    </AbsoluteFill>
  );
};