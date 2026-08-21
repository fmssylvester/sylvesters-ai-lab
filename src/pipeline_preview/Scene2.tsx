// duration: 125
import { useCurrentFrame, useVideoConfig, spring, interpolate, Easing, Img, staticFile, Audio, Sequence } from 'remotion';

export default function Scene3() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Motion timings
  const canvasScale = interpolate(frame, [0, 125], [0.95, 1.05], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.bezier(0.22, 1, 0.36, 1),
  });

  // Header animation (Frame 3 ~ 0.1s)
  const headerSpring = spring({ frame: frame - 3, fps, config: { damping: 14, stiffness: 100 } });
  const headerY = interpolate(headerSpring, [0, 1], [-50, 0]);
  const headerOpacity = interpolate(headerSpring, [0, 1], [0, 1]);

  // Webhook Node pop animation (Frame 24 ~ 0.8s)
  const nodeSpring = spring({ frame: frame - 24, fps, config: { damping: 14, stiffness: 120 } });
  const nodeScale = interpolate(nodeSpring, [0, 1], [0.2, 1]);
  const nodeOpacity = interpolate(nodeSpring, [0, 1], [0, 1]);
  const nodeGlow = interpolate(nodeSpring, [0, 1], [0, 35]);

  // Inspector Parallax Shift (Frame 63 ~ 2.1s)
  const inspectSpring = spring({ frame: frame - 63, fps, config: { damping: 15, stiffness: 85 } });
  const nodeShiftX = interpolate(inspectSpring, [0, 1], [0, -260]);
  const inspectSlideX = interpolate(inspectSpring, [0, 1], [150, 0]);
  const inspectOpacity = interpolate(inspectSpring, [0, 1], [0, 1]);

  // Pulse animation for node status dot
  const pulse = Math.sin(frame * 0.1) * 0.3 + 0.7;

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        background: 'radial-gradient(circle at 50% 50%, #0B1120 0%, #07090D 100%)',
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: "'Plus Jakarta Sans', sans-serif",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@700;800;900&display=swap');
        * { box-sizing: border-box; }
      `}</style>

      {/* SFX Sequences */}
      <Sequence from={3}>
        <Audio src={staticFile('sfx/whoosh.wav')} volume={0.25} />
      </Sequence>
      <Sequence from={24}>
        <Audio src={staticFile('sfx/pop.wav')} volume={0.3} />
      </Sequence>
      <Sequence from={63}>
        <Audio src={staticFile('sfx/click.wav')} volume={0.3} />
      </Sequence>

      {/* Gradient Mesh Base */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'radial-gradient(circle at 18% 30%, rgba(0, 217, 255, 0.12) 0%, transparent 55%), radial-gradient(circle at 82% 75%, rgba(231, 184, 77, 0.10) 0%, transparent 50%), radial-gradient(circle at 65% 20%, rgba(0, 217, 255, 0.08) 0%, transparent 55%)',
          transform: `translate(${Math.sin(frame / 75) * 7}px, ${Math.cos(frame / 95) * 6}px)`,
          pointerEvents: 'none',
        }}
      />

      {/* Grid Canvas Mesh */}
      <div
        style={{
          position: 'absolute',
          inset: -100,
          backgroundImage: `
            linear-gradient(to right, rgba(0, 217, 255, 0.06) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(0, 217, 255, 0.06) 1px, transparent 1px)
          `,
          backgroundSize: '80px 80px',
          transform: `scale(${canvasScale})`,
          transformOrigin: 'center center',
          opacity: 0.7,
          maskImage:
            'radial-gradient(ellipse at center, black 35%, transparent 80%)',
          WebkitMaskImage:
            'radial-gradient(ellipse at center, black 35%, transparent 80%)',
          pointerEvents: 'none',
        }}
      />

      {/* Film Grain Texture Overlay */}
      <svg
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          opacity: 0.05,
          pointerEvents: 'none',
          zIndex: 1,
        }}
      >
        <filter id="noise">
          <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="3" stitchTiles="stitch" />
        </filter>
        <rect width="100%" height="100%" filter="url(#noise)" />
      </svg>

      {/* Vignette */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'radial-gradient(ellipse at center, transparent 45%, rgba(0, 0, 0, 0.5) 100%)',
          pointerEvents: 'none',
          zIndex: 2,
        }}
      />

      {/* Header Eyebrow Title */}
      <div
        style={{
          position: 'absolute',
          top: 90,
          opacity: headerOpacity,
          transform: `translateY(${headerY}px)`,
          zIndex: 10,
          textAlign: 'center',
        }}
      >
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 12,
            padding: '12px 32px',
            background: 'rgba(0, 217, 255, 0.08)',
            border: '1px solid rgba(0, 217, 255, 0.3)',
            borderRadius: 100,
            backdropFilter: 'blur(20px)',
            boxShadow: '0 0 30px rgba(0, 217, 255, 0.15)',
          }}
        >
          <div
            style={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              backgroundColor: '#00D9FF',
              boxShadow: '0 0 10px #00D9FF',
            }}
          />
          <span
            style={{
              color: '#00D9FF',
              fontSize: 22,
              fontWeight: 900,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
            }}
          >
            STEP BY STEP FROM SCRATCH
          </span>
        </div>
      </div>

      {/* Central Canvas Stage */}
      <div
        style={{
          position: 'relative',
          width: 1400,
          height: 600,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 5,
        }}
      >
        {/* Main Webhook Node Container */}
        <div
          style={{
            position: 'absolute',
            opacity: nodeOpacity,
            transform: `translateX(${nodeShiftX}px) scale(${nodeScale})`,
            display: 'flex',
            alignItems: 'center',
            gap: 24,
            padding: '32px 40px',
            borderRadius: 24,
            background: 'rgba(13, 18, 30, 0.55)',
            border: '1.5px solid #00D9FF',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px) saturate(120%)',
            boxShadow: `0 25px 60px rgba(0, 0, 0, 0.6), 0 0 ${nodeGlow}px rgba(0, 217, 255, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.12)`,
            zIndex: 3,
          }}
        >
          {/* Node Connection Port (Left) */}
          <div
            style={{
              position: 'absolute',
              left: -12,
              top: '50%',
              transform: 'translateY(-50%)',
              width: 24,
              height: 24,
              borderRadius: '50%',
              background: '#0A1628',
              border: '2px solid #00D9FF',
              boxShadow: '0 0 12px #00D9FF',
            }}
          />

          {/* Logo Badge Container */}
          <div
            style={{
              width: 76,
              height: 76,
              borderRadius: 18,
              background: 'linear-gradient(135deg, rgba(0, 217, 255, 0.2) 0%, rgba(231, 184, 77, 0.1) 100%)',
              border: '1px solid rgba(0, 217, 255, 0.4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: 'inset 0 0 15px rgba(0, 217, 255, 0.2)',
            }}
          >
            <Img
              src={staticFile('01_LOGOS/Productivity/n8n.svg')}
              style={{
                width: 46,
                height: 46,
                filter: 'drop-shadow(0 0 8px rgba(0, 217, 255, 0.6))',
              }}
            />
          </div>

          {/* Title Text */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <span
              style={{
                color: '#FFFFFF',
                fontSize: 40,
                fontWeight: 900,
                letterSpacing: '-0.02em',
                whiteSpace: 'nowrap',
              }}
            >
              Webhook Trigger Node
            </span>
          </div>

          {/* Icon Glow Badge */}
          <div
            style={{
              width: 52,
              height: 52,
              borderRadius: 14,
              background: 'rgba(237, 184, 77, 0.12)',
              border: '1px solid #E7B84D',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginLeft: 12,
              boxShadow: '0 0 20px rgba(231, 184, 77, 0.25)',
            }}
          >
            <Img
              src={staticFile('02_ICONS/ai-zap.svg')}
              style={{
                width: 28,
                height: 28,
                filter: 'drop-shadow(0 0 6px #E7B84D)',
              }}
            />
          </div>

          {/* Node Connection Port (Right) */}
          <div
            style={{
              position: 'absolute',
              right: -12,
              top: '50%',
              transform: 'translateY(-50%)',
              width: 24,
              height: 24,
              borderRadius: '50%',
              background: '#0A1628',
              border: '2px solid #E7B84D',
              boxShadow: '0 0 12px #E7B84D',
            }}
          />
        </div>

        {/* Node Inspector Panel (Drifts in at frame 63) */}
        <div
          style={{
            position: 'absolute',
            right: 80,
            opacity: inspectOpacity,
            transform: `translateX(${inspectSlideX}px)`,
            width: 440,
            height: 380,
            borderRadius: 24,
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(0, 217, 255, 0.22)',
            backdropFilter: 'blur(12px) saturate(120%)',
            WebkitBackdropFilter: 'blur(12px) saturate(120%)',
            boxShadow: '0 30px 70px rgba(0, 0, 0, 0.6), 0 0 60px rgba(0, 217, 255, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.15), 0 0 40px rgba(0, 217, 255, 0.08)',
            padding: 32,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            zIndex: 2,
          }}
        >
          {/* Top Panel Rim Highlight */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 40,
              right: 40,
              height: 1,
              background: 'linear-gradient(90deg, transparent, rgba(0, 217, 255, 0.8), transparent)',
            }}
          />

          {/* Graphic Wireframe Mock UI Elements */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', gap: 8 }}>
              <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#FF6D5A' }} />
              <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#E7B84D' }} />
              <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#10B981' }} />
            </div>
            <div
              style={{
                width: 10,
                height: 10,
                borderRadius: '50%',
                background: '#00D9FF',
                opacity: pulse,
                boxShadow: '0 0 10px #00D9FF',
              }}
            />
          </div>

          {/* Graphic Bars (Minimal visuals without unapproved text) */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div
              style={{
                height: 48,
                borderRadius: 12,
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                display: 'flex',
                alignItems: 'center',
                padding: '0 16px',
                justifyContent: 'space-between',
              }}
            >
              <div style={{ width: 120, height: 8, borderRadius: 4, background: 'rgba(0, 217, 255, 0.6)' }} />
              <div style={{ width: 32, height: 16, borderRadius: 8, background: 'rgba(0, 217, 255, 0.2)' }} />
            </div>

            <div
              style={{
                height: 48,
                borderRadius: 12,
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                display: 'flex',
                alignItems: 'center',
                padding: '0 16px',
                justifyContent: 'space-between',
              }}
            >
              <div style={{ width: 160, height: 8, borderRadius: 4, background: 'rgba(231, 184, 77, 0.6)' }} />
              <div style={{ width: 24, height: 16, borderRadius: 8, background: 'rgba(231, 184, 77, 0.2)' }} />
            </div>

            <div
              style={{
                height: 80,
                borderRadius: 12,
                background: 'rgba(255, 255, 255, 0.02)',
                border: '1px solid rgba(255, 255, 255, 0.06)',
                padding: 16,
                display: 'flex',
                flexDirection: 'column',
                gap: 10,
              }}
            >
              <div style={{ width: '80%', height: 6, borderRadius: 3, background: 'rgba(255, 255, 255, 0.2)' }} />
              <div style={{ width: '50%', height: 6, borderRadius: 3, background: 'rgba(255, 255, 255, 0.15)' }} />
              <div style={{ width: '65%', height: 6, borderRadius: 3, background: 'rgba(0, 217, 255, 0.3)' }} />
            </div>
          </div>

          {/* Inspector Action Button Wireframe */}
          <div
            style={{
              height: 44,
              borderRadius: 12,
              background: 'linear-gradient(90deg, #00D9FF 0%, rgba(0, 217, 255, 0.7) 100%)',
              boxShadow: '0 0 20px rgba(0, 217, 255, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <div style={{ width: 80, height: 8, borderRadius: 4, background: '#0A1628' }} />
          </div>
        </div>
      </div>
    </div>
  );
}