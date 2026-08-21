import React from 'react';
import {
  AbsoluteFill,
  Audio,
  Sequence,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
} from 'remotion';
import {
  EASE,
  hexA,
  breath,
  enter,
  cameraTransform,
} from '../motion-hook/cinematic';

// ══════════════════════════════════════════════════════════════════════════
//  SEG1 CLAY GLASS — Segment 1 (frames 0–137) of the explainer, re-skinned
//  into the channel's CLAY + LIQUID GLASS language.
//    · Beat A (0–83): "every customer message your business received" —
//      matte clay chat pills drop into a soft clay inbox tray on ash+purple.
//    · Beat B (83–137): "got an instant, intelligent reply" — a refractive
//      liquid-glass sphere sweeps in over the clay pile (real feTurbulence
//      refraction, magnifies the tray seen through it) and a glass reply
//      pill resolves at the rim. Timing + SFX copied from MotionHook.tsx.
//  Additive only: does not touch MotionHook.tsx / captions.ts / config.
// ══════════════════════════════════════════════════════════════════════════

// ── Ash + dark-purple palette (same as DesignLab) ──────────────────────────
const ASH_HI = '#DAD8E2';
const ASH = '#B7B4C2';
const ASH_LO = '#8E8A9E';
const PURPLE = '#2A1B47';
const PURPLE_GLOW = '#7C5CFF';
const CLAY = '#FCFCFF';
const INK = '#1C1830';

const FONT = "'Inter', system-ui, -apple-system, 'Segoe UI', sans-serif";
const MONO = "'Fragment Mono', 'SF Mono', ui-monospace, monospace";
const TOTAL = 137;

// ── SVG refraction toolkit (renamed ids so it can coexist with DesignLab) ──
const LiquidFilters: React.FC<{ dispScale: number }> = ({ dispScale }) => (
  <svg width="0" height="0" style={{ position: 'absolute' }} aria-hidden>
    <defs>
      <filter id="s1-liquid" x="-30%" y="-30%" width="160%" height="160%">
        <feTurbulence
          type="fractalNoise"
          baseFrequency="0.011 0.014"
          numOctaves={2}
          seed={7}
          result="noise"
        />
        <feDisplacementMap
          in="SourceGraphic"
          in2="noise"
          scale={dispScale}
          xChannelSelector="R"
          yChannelSelector="G"
        />
      </filter>
      <filter id="s1-goo">
        <feGaussianBlur in="SourceGraphic" stdDeviation="10" result="b" />
        <feColorMatrix
          in="b"
          type="matrix"
          values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 20 -9"
        />
      </filter>
    </defs>
  </svg>
);

// ── Ash + dark-purple graded backdrop (DesignLab recipe) ───────────────────
const AshBackdrop: React.FC<{ frame: number }> = ({ frame }) => {
  const px = 20 + breath(frame, 0.006, 5);
  const py = 78 + breath(frame, 0.008, 4, 1.2);
  const qx = 82 + breath(frame, 0.005, 6, 2.0);
  return (
    <AbsoluteFill style={{ overflow: 'hidden' }}>
      <AbsoluteFill
        style={{
          background: `radial-gradient(135% 105% at 50% 32%, ${ASH_HI} 0%, ${ASH} 62%, ${ASH_LO} 100%)`,
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: `${px}%`,
          top: `${py}%`,
          width: 1100,
          height: 1100,
          marginLeft: -550,
          marginTop: -550,
          borderRadius: '50%',
          background: `radial-gradient(circle, ${PURPLE}${hexA(0.55)}, transparent 60%)`,
          filter: 'blur(70px)',
          mixBlendMode: 'multiply',
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: `${qx}%`,
          top: '14%',
          width: 820,
          height: 820,
          marginLeft: -410,
          marginTop: -410,
          borderRadius: '50%',
          background: `radial-gradient(circle, ${PURPLE}${hexA(0.4)}, transparent 62%)`,
          filter: 'blur(80px)',
          mixBlendMode: 'multiply',
        }}
      />
      <AbsoluteFill
        style={{
          background:
            'radial-gradient(ellipse at center, transparent 55%, rgba(30,20,55,0.16) 82%, rgba(20,12,40,0.34) 100%)',
        }}
      />
    </AbsoluteFill>
  );
};

// ── Claymorphism recipes (DesignLab) ───────────────────────────────────────
const clayFill = `linear-gradient(180deg, ${CLAY} 0%, #EDECF3 100%)`;
const clayShadow = (lift = 1) =>
  [
    `0 ${18 * lift}px ${44 * lift}px rgba(42,27,71,0.28)`,
    `0 ${4 * lift}px ${10 * lift}px rgba(42,27,71,0.20)`,
    'inset 0 4px 7px rgba(255,255,255,0.95)',
    'inset 0 -10px 18px rgba(150,140,175,0.30)',
  ].join(', ');

// ── Beat A: the clay pile (rendered once flat, once refracted in the lens) ─
const TRAY_X = 410;
const TRAY_Y = 150;
const TRAY_W = 1100;
const TRAY_H = 520;

const MESSAGES = [
  { at: 6, t: "Where's my order?", w: 300, x: 80, rot: -1.4 },
  { at: 18, t: 'Ship to the UK?', w: 250, x: 190, rot: 1.1 },
  { at: 30, t: 'Refund please', w: 230, x: 60, rot: -0.9 },
  { at: 42, t: 'Is it back in stock?', w: 290, x: 260, rot: 1.3 },
  { at: 54, t: "My code won't apply", w: 270, x: 120, rot: -1.2 },
  { at: 66, t: 'Any 24/7 support?', w: 250, x: 200, rot: 0.9 },
];

const ROW_H = 54;
const ROW_GAP = 14;

const ClayPile: React.FC<{ frame: number }> = ({ frame }) => {
  const { fps } = useVideoConfig();
  return (
    <div
      style={{
        width: TRAY_W,
        height: TRAY_H,
        borderRadius: 44,
        position: 'relative',
        background: clayFill,
        boxShadow: clayShadow(1.1),
        overflow: 'hidden',
      }}
    >
      {/* top rim light */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '38%',
          background: 'linear-gradient(180deg, rgba(255,255,255,0.6), transparent)',
          pointerEvents: 'none',
          borderTopLeftRadius: 44,
          borderTopRightRadius: 44,
        }}
      />
      {/* little "inbox" tab on the rim */}
      <div
        style={{
          position: 'absolute',
          top: 30,
          left: '50%',
          transform: 'translateX(-50%)',
          padding: '12px 30px',
          borderRadius: 999,
          background: 'rgba(255,255,255,0.55)',
          border: '1px solid rgba(255,255,255,0.8)',
          boxShadow: '0 6px 18px rgba(42,27,71,0.16)',
          color: INK,
          fontSize: 24,
          fontWeight: 700,
          letterSpacing: '0.02em',
          opacity: 0.85,
        }}
      >
        Inbox
      </div>

      {/* the growing pile — newest row sits on top, tray fills upward */}
      {MESSAGES.map((m, i) => {
        const pop = spring({
          frame: frame - m.at,
          fps,
          config: { damping: 13, stiffness: 150, mass: 0.72 },
        });
        const o = interpolate(frame, [m.at, m.at + 6], [0, 1], {
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
          easing: EASE,
        });
        // safe from frame -1: spring with negative frame returns resting value;
        // we gate opacity so pills only appear after their landing beat.
        const rowTop = TRAY_H - 40 - ROW_H - i * (ROW_H + ROW_GAP);
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: m.x,
              top: rowTop,
              width: m.w,
              display: 'flex',
              alignItems: 'center',
              gap: 16,
              opacity: o,
              transform: `translateY(${(1 - pop) * -46}px) scale(${0.72 + 0.28 * pop}) rotate(${m.rot}deg)`,
              transformOrigin: 'center 80%',
            }}
          >
            {/* avatar chip */}
            <div
              style={{
                width: 42,
                height: 42,
                borderRadius: '50%',
                background: `linear-gradient(180deg, ${CLAY}, #EFEDF6)`,
                boxShadow: 'inset 0 2px 3px rgba(255,255,255,0.95), inset 0 -6px 10px rgba(150,140,175,0.28)',
                border: '1px solid rgba(255,255,255,0.7)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontFamily: MONO,
                fontSize: 15,
                fontWeight: 700,
                color: 'rgba(28,24,48,0.55)',
              }}
            >
              {String.fromCharCode(65 + i)}
            </div>
            {/* matte clay bubble */}
            <div
              style={{
                padding: '15px 24px',
                borderRadius: 20,
                borderTopLeftRadius: 6,
                background: clayFill,
                boxShadow: clayShadow(),
                color: INK,
                fontSize: 22,
                fontWeight: 600,
                letterSpacing: '-0.01em',
                whiteSpace: 'nowrap',
              }}
            >
              {m.t}
            </div>
          </div>
        );
      })}
    </div>
  );
};

// ── Sp / spark glyph inside the glass (unique gradient id) ─────────────────
const Spark: React.FC<{ size: number; opacity: number }> = ({ size, opacity }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" style={{ opacity }}>
    <defs>
      <radialGradient id="s1-spark" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="#FFFFFF" />
        <stop offset="100%" stopColor="#F2ECFF" />
      </radialGradient>
    </defs>
    <path
      d="M50 6 C55 34 66 45 94 50 C66 55 55 66 50 94 C45 66 34 55 6 50 C34 45 45 34 50 6 Z"
      fill="url(#s1-spark)"
    />
  </svg>
);

// ── The liquid-glass sphere — the money shot (GlassKnob technique) ─────────
const GlassSphere: React.FC<{
  frame: number;
  cx: number; // sphere centre in tray-space px
  cy: number;
  r: number;
}> = ({ frame, cx, cy, r }) => {
  const spec = 30 + breath(frame, 0.04, 5);
  const sparkPulse = 0.8 + 0.2 * (0.5 + 0.5 * Math.sin(frame * 0.08));
  const corePulse = 0.55 + 0.15 * (0.5 + 0.5 * Math.sin(frame * 0.06));
  return (
    <div
      style={{
        position: 'absolute',
        left: cx - r,
        top: cy - r,
        width: r * 2,
        height: r * 2,
        borderRadius: '50%',
        boxShadow: '0 32px 58px rgba(22,11,50,0.5), 0 8px 16px rgba(22,11,50,0.34)',
      }}
    >
      {/* clipped glass interior: refraction + frost + volume */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          borderRadius: '50%',
          overflow: 'hidden',
          backdropFilter: 'blur(2px) saturate(165%) brightness(1.05)',
          WebkitBackdropFilter: 'blur(2px) saturate(165%) brightness(1.05)',
        }}
      >
        {/* magnified + refracted copy of the tray, seen through the glass */}
        <div style={{ position: 'absolute', inset: 0, filter: 'url(#s1-liquid)', opacity: 0.88 }}>
          <div
            style={{
              position: 'absolute',
              left: r - cx,
              top: r - cy,
              width: TRAY_W,
              height: TRAY_H,
              transformOrigin: `${cx}px ${cy}px`,
              transform: 'scale(1.5)',
            }}
          >
            <ClayPile frame={Math.max(70, frame)} />
          </div>
        </div>
        {/* translucent purple core glow, pulsing */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: `radial-gradient(circle at 50% 46%,
              hsla(254, 92%, 72%, ${corePulse}),
              hsla(254, 85%, 52%, 0.22) 54%,
              transparent 72%)`,
          }}
        />
        {/* volume: darkened lower hemisphere */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background:
              'radial-gradient(circle at 50% 122%, rgba(18,9,42,0.6), transparent 56%)',
          }}
        />
        {/* AI spark inside the glass */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            filter: `drop-shadow(0 0 10px rgba(255,255,255,0.7))`,
          }}
        >
          <Spark size={72} opacity={sparkPulse} />
        </div>
        {/* broad specular arc across the top */}
        <div
          style={{
            position: 'absolute',
            top: '6%',
            left: '16%',
            width: '68%',
            height: '38%',
            borderRadius: '50%',
            background:
              'radial-gradient(circle at 50% 26%, rgba(255,255,255,0.92), transparent 62%)',
            filter: 'blur(2px)',
          }}
        />
        {/* small hot specular dot, drifting */}
        <div
          style={{
            position: 'absolute',
            left: `${spec}%`,
            top: '16%',
            width: 26,
            height: 18,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(255,255,255,0.98), transparent 72%)',
            filter: 'blur(0.5px)',
          }}
        />
      </div>

      {/* Fresnel rim outside the clip */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          borderRadius: '50%',
          boxShadow:
            'inset 0 0 0 2px rgba(255,255,255,0.62), inset 0 12px 24px rgba(255,255,255,0.38), inset 0 -24px 42px rgba(28,14,62,0.55)',
          pointerEvents: 'none',
        }}
      />
      {/* chromatic dispersion rings */}
      <div
        style={{
          position: 'absolute',
          inset: -2,
          borderRadius: '50%',
          border: '3px solid hsla(200,100%,72%,0.6)',
          transform: 'translate(-2.5px,-2.5px)',
          filter: 'blur(1.5px)',
          mixBlendMode: 'screen',
        }}
      />
      <div
        style={{
          position: 'absolute',
          inset: -2,
          borderRadius: '50%',
          border: '3px solid hsla(322,100%,70%,0.6)',
          transform: 'translate(2.5px,2.5px)',
          filter: 'blur(1.5px)',
          mixBlendMode: 'screen',
        }}
      />
    </div>
  );
};

// ── Beat B: the glass reply pill (enters with the "ding") ──────────────────
const ReplyPill: React.FC<{ frame: number }> = ({ frame }) => {
  const o = enter(frame, 97, useVideoConfig().fps, {
    damping: 13,
    stiffness: 130,
    mass: 0.75,
  });
  const glint = 18 + ((Math.sin(frame * 0.03) + 1) / 2) * 62;
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 18,
        padding: '20px 32px',
        borderRadius: 999,
        background:
          'linear-gradient(155deg, rgba(255,255,255,0.34) 0%, rgba(255,255,255,0.12) 45%, rgba(255,255,255,0.22) 100%)',
        backdropFilter: 'blur(14px) saturate(170%)',
        WebkitBackdropFilter: 'blur(14px) saturate(170%)',
        border: '1px solid rgba(255,255,255,0.55)',
        boxShadow:
          '0 24px 50px rgba(42,27,71,0.3), inset 0 1px 8px rgba(255,255,255,0.7), inset 0 -8px 18px rgba(150,140,175,0.25)',
        opacity: o,
        transform: `translateY(${(1 - o) * 26}px) scale(${0.7 + 0.3 * o})`,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* glass glint that sweeps slowly */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: `radial-gradient(160% 90% at ${glint}% -20%, rgba(255,255,255,0.5), transparent 48%)`,
          mixBlendMode: 'screen',
          pointerEvents: 'none',
        }}
      />
      <div style={{ filter: `drop-shadow(0 0 10px rgba(255,255,255,0.8))` }}>
        <Spark size={34} opacity={0.9} />
      </div>
      <div>
        <div style={{ color: INK, fontSize: 26, fontWeight: 700, letterSpacing: '-0.01em' }}>
          Instant reply
        </div>
        <div
          style={{
            color: 'rgba(28,24,48,0.55)',
            fontSize: 17,
            fontWeight: 600,
            fontFamily: MONO,
            letterSpacing: '0.02em',
          }}
        >
          ▲ 0.4s · intelligent answers
        </div>
      </div>
    </div>
  );
};

// ── SFX (MotionHook pattern, low volume, voice stays dominant) ─────────────
const Sfx: React.FC<{ from: number; file: string; volume: number }> = ({ from, file, volume }) => (
  <Sequence from={from} durationInFrames={40} layout="none">
    <Audio src={staticFile(`sfx/${file}`)} volume={volume} />
  </Sequence>
);

// ══════════════════════════════════════════════════════════════════════════
export const Seg1ClayGlass: React.FC = () => {
  const frame = useCurrentFrame();

  // beat crossfades (A stays alive under the lens — the sphere magnifies it)
  const pierA = interpolate(frame, [0, 6], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: EASE });
  const sphereIn = spring({ frame: frame - 83, fps: 30, config: { damping: 16, stiffness: 105, mass: 1.15 } });
  const sphereOp = interpolate(frame, [83, 88], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: EASE });
  const bloomOp = interpolate(frame, [83, 90, 110], [0, 0.9, 0.55], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: EASE });
  const rippleR = interpolate(frame, [97, 122], [150, 330], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: EASE });
  const rippleO = interpolate(frame, [97, 122], [0.55, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  // glass centre over the pile, in tray-space
  const r = 150;
  const cx = 420;
  const cy = 250;

  return (
    <AbsoluteFill style={{ background: ASH, fontFamily: FONT }}>
      <Audio src={staticFile('kiki.mp3')} />
      <LiquidFilters dispScale={14} />

      {/* SFX bed — exact cue sheet */}
      <Sfx from={6} file="pop.wav" volume={0.14} />
      <Sfx from={18} file="pop.wav" volume={0.14} />
      <Sfx from={30} file="pop.wav" volume={0.14} />
      <Sfx from={42} file="pop.wav" volume={0.14} />
      <Sfx from={54} file="pop.wav" volume={0.14} />
      <Sfx from={66} file="pop.wav" volume={0.14} />
      <Sfx from={89} file="whoosh.wav" volume={0.22} />
      <Sfx from={98} file="ding.wav" volume={0.3} />

      <AshBackdrop frame={frame} />

      {/* slow global camera drift */}
      <AbsoluteFill style={{ transform: cameraTransform(frame, TOTAL) }}>
        {/* Beat A — clay tray + pile (visible through the lens in Beat B) */}
        <div style={{ position: 'absolute', left: TRAY_X, top: TRAY_Y, opacity: pierA }}>
          <ClayPile frame={frame} />
        </div>

        {/* Beat B — the AI arrives */}
        <div style={{ opacity: sphereOp * pierA }}>
          {/* bloom behind the glass */}
          <div
            style={{
              position: 'absolute',
              left: TRAY_X + cx - 220,
              top: TRAY_Y + cy - 220,
              width: 440,
              height: 440,
              borderRadius: '50%',
              background: `radial-gradient(circle, ${PURPLE_GLOW}${hexA(0.32)}, transparent 62%)`,
              filter: 'blur(34px)',
              opacity: bloomOp,
            }}
          />
          {/* expanding ripple ring at the ding */}
          <div
            style={{
              position: 'absolute',
              left: TRAY_X + cx - rippleR / 2,
              top: TRAY_Y + cy - rippleR / 2,
              width: rippleR,
              height: rippleR,
              borderRadius: '50%',
              border: `2px solid ${PURPLE_GLOW}${hexA(0.4)}`,
              opacity: rippleO,
            }}
          />
          {/* the refractive sphere sweeping in from the right */}
          <div
            style={{
              position: 'absolute',
              transformStyle: 'preserve-3d',
              transform: `translateX(${(1 - sphereIn) * 900}px)`,
            }}
          >
            <div style={{ opacity: sphereOp }}>
              <GlassSphere frame={frame} cx={cx} cy={cy} r={r} />
            </div>
          </div>

          {/* the glass reply pill — resolves "instant, intelligent reply" */}
          <div style={{ position: 'absolute', left: 1400, top: 700 }}>
            <ReplyPill frame={frame} />
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

export default Seg1ClayGlass;