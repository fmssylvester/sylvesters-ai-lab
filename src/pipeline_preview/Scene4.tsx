// duration: 192
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

export default function Scene4() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Timing constants (in frames @ 30fps)
  const IMP_FRAME = 36; // 1.2s impact
  const BLIP_FRAME = 90; // 3.0s blip

  // Intro Stadium Ripple Mask Expansion (0s - 0.8s)
  const maskSpring = spring({
    frame,
    fps,
    config: { damping: 16, stiffness: 70 },
  });

  // Hero Impact Spring (1.2s)
  const impactProgress = spring({
    frame: Math.max(0, frame - IMP_FRAME),
    fps,
    config: { damping: 11, stiffness: 140, mass: 0.7 },
  });

  // Subtitle Spring (3.0s)
  const subProgress = spring({
    frame: Math.max(0, frame - BLIP_FRAME),
    fps,
    config: { damping: 14, stiffness: 100 },
  });

  // Continuous pulsating circuit ripple rotation & wave
  const circuitPulse = (frame * 1.5) % 100;
  const circuitRotate = frame * 0.2;

  // Camera subtle drift
  const camScale = interpolate(frame, [0, 192], [1.05, 1.0], {
    extrapolateRight: 'clamp',
  });

  // Light cone intensity flare at impact
  const coneOpacity = frame < IMP_FRAME
    ? interpolate(frame, [0, IMP_FRAME], [0.1, 0.2])
    : interpolate(impactProgress, [0, 0.3, 1], [0.2, 0.75, 0.4]);

  return (
    <div
      style={{
        width: 1920,
        height: 1080,
        backgroundColor: '#07090D',
        backgroundImage:
          'radial-gradient(circle at 50% 50%, #0A1322 0%, #07090D 100%)',
        position: 'relative',
        overflow: 'hidden',
        fontFamily: "'Plus Jakarta Sans', sans-serif",
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@700;800;900&display=swap');
        `}
      </style>

      {/* Gradient Mesh Base */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'radial-gradient(circle at 20% 30%, rgba(0, 217, 255, 0.12) 0%, transparent 55%), radial-gradient(circle at 82% 72%, rgba(231, 184, 77, 0.10) 0%, transparent 50%), radial-gradient(circle at 45% 85%, rgba(0, 217, 255, 0.08) 0%, transparent 55%)',
          transform: `translate(${Math.sin(frame / 75) * 7}px, ${Math.cos(frame / 100) * 7}px)`,
          pointerEvents: 'none',
        }}
      />

      {/* Audio Layer */}
      <Sequence from={3}>
        <Audio src={staticFile('sfx/riser.wav')} volume={0.25} />
      </Sequence>
      <Sequence from={IMP_FRAME}>
        <Audio src={staticFile('audio/sfx/impact.wav')} volume={0.35} />
      </Sequence>
      <Sequence from={BLIP_FRAME}>
        <Audio src={staticFile('sfx/robot-blip.wav')} volume={0.25} />
      </Sequence>

      {/* Stadium Ripple Mask Layer */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          zIndex: 40,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <div
          style={{
            width: interpolate(maskSpring, [0, 1], [0, 2600]),
            height: interpolate(maskSpring, [0, 1], [0, 1500]),
            borderRadius: 800,
            boxShadow: '0 0 0 1000px #07090D',
            border: '2px solid rgba(0, 217, 255, 0.6)',
            opacity: interpolate(maskSpring, [0, 0.85, 1], [1, 0.8, 0]),
          }}
        />
      </div>

      {/* Main Canvas World */}
      <div
        style={{
          width: 1920,
          height: 1080,
          position: 'absolute',
          transform: `scale(${camScale})`,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {/* Background Grid Pattern */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage:
              'linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)',
            backgroundSize: '80px 80px',
            backgroundPosition: 'center center',
            opacity: 0.6,
            maskImage:
              'radial-gradient(ellipse at center, black 30%, transparent 82%)',
            WebkitMaskImage:
              'radial-gradient(ellipse at center, black 30%, transparent 82%)',
            pointerEvents: 'none',
          }}
        />

        {/* Volumetric Light Cone behind text */}
        <svg
          viewBox="0 0 1920 1080"
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            pointerEvents: 'none',
            opacity: coneOpacity,
            filter: 'blur(20px)',
          }}
        >
          <defs>
            <linearGradient id="cyanCone" x1="0.5" y1="0" x2="0.5" y2="1">
              <stop offset="0%" stopColor="#00D9FF" stopOpacity="0.9" />
              <stop offset="50%" stopColor="#00D9FF" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#00D9FF" stopOpacity="0" />
            </linearGradient>
          </defs>
          <polygon points="960,180 200,1080 1720,1080" fill="url(#cyanCone)" />
        </svg>

        {/* Pulsating Radial Circuit Vector Paths */}
        <svg
          viewBox="0 0 1000 1000"
          style={{
            position: 'absolute',
            width: 1100,
            height: 1100,
            pointerEvents: 'none',
            transform: `rotate(${circuitRotate}deg)`,
            opacity: 0.65,
          }}
        >
          <defs>
            <radialGradient id="circuitGlow">
              <stop offset="60%" stopColor="#00D9FF" stopOpacity="0" />
              <stop offset="100%" stopColor="#00D9FF" stopOpacity="0.4" />
            </radialGradient>
          </defs>

          {/* Concentric glowing circuit rings */}
          {[200, 320, 440].map((r, i) => {
            const dynamicR = r + (circuitPulse * (i + 1) * 0.4) % 120;
            return (
              <circle
                key={i}
                cx="500"
                cy="500"
                r={dynamicR}
                fill="none"
                stroke="#00D9FF"
                strokeWidth={1.5 + i}
                strokeDasharray={i % 2 === 0 ? '16 12 4 12' : '40 20 8 20'}
                opacity={Math.max(0, 1 - dynamicR / 550)}
              />
            );
          })}

          {/* Circuit tick marks */}
          <circle
            cx="500"
            cy="500"
            r="380"
            fill="none"
            stroke="#E7B84D"
            strokeWidth="2"
            strokeDasharray="2 18"
            opacity="0.5"
          />
        </svg>

        {/* Central Content Container */}
        <div
          style={{
            zIndex: 10,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            position: 'relative',
          }}
        >
          {/* Top Floating Icon Header */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 16,
              marginBottom: 24,
              opacity: frame >= IMP_FRAME ? interpolate(impactProgress, [0, 1], [0, 1]) : 0,
              transform: `scale(${frame >= IMP_FRAME ? interpolate(impactProgress, [0, 1], [0.6, 1]) : 0.6})`,
            }}
          >
            <div
              style={{
                width: 64,
                height: 64,
                borderRadius: '50%',
                background: 'rgba(0, 217, 255, 0.1)',
                border: '1px solid rgba(0, 217, 255, 0.4)',
                backdropFilter: 'blur(12px) saturate(120%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 0 30px rgba(0, 217, 255, 0.3)',
              }}
            >
              <Img
                src={staticFile('02_ICONS/ai-brain.svg')}
                style={{ width: 36, height: 36 }}
              />
            </div>
            <Img
              src={staticFile('02_ICONS/ai-sparkles.svg')}
              style={{
                width: 28,
                height: 28,
                filter: 'drop-shadow(0 0 12px #E7B84D)',
              }}
            />
          </div>

          {/* Hero Headline: SYLVESTER'S AI LAB */}
          <div
            style={{
              fontSize: 116,
              fontWeight: 900,
              letterSpacing: '-0.03em',
              lineHeight: 1.0,
              textTransform: 'uppercase',
              background:
                'linear-gradient(135deg, #FFFFFF 0%, #00D9FF 55%, #0088FF 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              filter: `drop-shadow(0 0 ${interpolate(impactProgress, [0, 1], [80, 30])}px rgba(0, 217, 255, 0.8))`,
              transform: `scale(${frame >= IMP_FRAME ? interpolate(impactProgress, [0, 1], [1.35, 1]) : 0.8})`,
              opacity: frame >= IMP_FRAME ? interpolate(impactProgress, [0, 0.3, 1], [0, 1, 1]) : 0,
            }}
          >
            SYLVESTER'S AI LAB
          </div>

          {/* Subtitle Glass Pill: REAL AUTOMATIONS • ZERO THEORY */}
          <div
            style={{
              marginTop: 36,
              opacity: frame >= BLIP_FRAME ? interpolate(subProgress, [0, 1], [0, 1]) : 0,
              transform: `translateY(${frame >= BLIP_FRAME ? interpolate(subProgress, [0, 1], [30, 0]) : 30}px)`,
            }}
          >
            <div
              style={{
                background: 'rgba(15, 23, 42, 0.75)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                border: '1px solid rgba(231, 184, 77, 0.5)',
                borderRadius: 100,
                padding: '16px 44px',
                boxShadow:
                  '0 10px 30px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.2), 0 0 40px rgba(231, 184, 77, 0.15)',
                display: 'flex',
                alignItems: 'center',
                gap: 14,
              }}
            >
              <span
                style={{
                  color: '#E7B84D',
                  fontSize: 24,
                  fontWeight: 800,
                  letterSpacing: '0.18em',
                  textTransform: 'uppercase',
                }}
              >
                REAL AUTOMATIONS • ZERO THEORY
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Subtle Film Grain Overlay */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          opacity: 0.05,
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