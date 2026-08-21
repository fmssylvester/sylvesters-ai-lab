import React from 'react';
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
  Easing,
} from 'remotion';
import { breath, enter, hexA } from '../motion-hook/cinematic';

// ══════════════════════════════════════════════════════════════════════════
//  DESIGN LAB — a proof-of-concept for the channel's design language.
//  Reproduces the two Pinterest references on an ASH + DARK-PURPLE palette:
//    · CLAY  (ref video 1): matte frosted pills that morph — the Apple
//      "Select → glowing blob → Done" claymorphism.
//    · LIQUID GLASS (ref video 2): a glowing pill track with a REFRACTIVE
//      glass-sphere knob that literally magnifies & bends the label behind it,
//      with chromatic-dispersion rim and specular highlight.
//
//  The refraction is real: an SVG feTurbulence + feDisplacementMap filter
//  distorts a magnified copy of the track seen *through* the sphere. That is
//  the whole point of this POC — to show hardcoded flat CSS is NOT the ceiling.
// ══════════════════════════════════════════════════════════════════════════

// ── Ash + dark-purple palette ──────────────────────────────────────────────
const ASH_HI = '#DAD8E2';   // light silver ash
const ASH = '#B7B4C2';      // mid ash
const ASH_LO = '#8E8A9E';   // shaded ash
const PURPLE = '#2A1B47';   // dark purple (the requested tweak)
const PURPLE_GLOW = '#7C5CFF';
const CLAY = '#FCFCFF';      // matte clay white
const INK = '#1C1830';       // near-black ink for text on light bg

// ── SVG filters: the real-refraction toolkit (proves it's not flat CSS) ─────
const LiquidFilters: React.FC<{ dispScale: number }> = ({ dispScale }) => (
  <svg width="0" height="0" style={{ position: 'absolute' }} aria-hidden>
    <defs>
      {/* organic glass wobble — displaces whatever's rendered through it */}
      <filter id="dl-liquid" x="-30%" y="-30%" width="160%" height="160%">
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
      {/* soft clay-edge rounding for the morphing blob */}
      <filter id="dl-goo">
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

// ── Ash + dark-purple graded backdrop ──────────────────────────────────────
const AshBackdrop: React.FC<{ frame: number }> = ({ frame }) => {
  const px = 20 + breath(frame, 0.006, 5);
  const py = 78 + breath(frame, 0.008, 4, 1.2);
  const qx = 82 + breath(frame, 0.005, 6, 2.0);
  return (
    <AbsoluteFill style={{ overflow: 'hidden' }}>
      {/* ash base — light, silver, softly graded */}
      <AbsoluteFill
        style={{
          background: `radial-gradient(135% 105% at 50% 32%, ${ASH_HI} 0%, ${ASH} 62%, ${ASH_LO} 100%)`,
        }}
      />
      {/* dark-purple bleed, lower-left */}
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
      {/* dark-purple bleed, upper-right (subtler) */}
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
      {/* gentle vignette to seat the elements */}
      <AbsoluteFill
        style={{
          background:
            'radial-gradient(ellipse at center, transparent 55%, rgba(30,20,55,0.16) 82%, rgba(20,12,40,0.34) 100%)',
        }}
      />
    </AbsoluteFill>
  );
};

// ── Claymorphism shadow recipe (matte, soft, purple-tinted ambient) ─────────
const clayShadow = (lift = 1) =>
  [
    `0 ${18 * lift}px ${44 * lift}px rgba(42,27,71,0.28)`,
    `0 ${4 * lift}px ${10 * lift}px rgba(42,27,71,0.20)`,
    'inset 0 4px 7px rgba(255,255,255,0.95)',
    'inset 0 -10px 18px rgba(150,140,175,0.30)',
  ].join(', ');

const clayFill = `linear-gradient(180deg, ${CLAY} 0%, #EDECF3 100%)`;

// A matte clay pill (with optional label / child glyph).
const ClayPill: React.FC<{
  w: number;
  h: number;
  children?: React.ReactNode;
  style?: React.CSSProperties;
}> = ({ w, h, children, style }) => (
  <div
    style={{
      width: w,
      height: h,
      borderRadius: h / 2,
      background: clayFill,
      boxShadow: clayShadow(),
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: INK,
      fontFamily: 'Inter, system-ui, sans-serif',
      fontWeight: 500,
      fontSize: h * 0.4,
      letterSpacing: '-0.01em',
      ...style,
    }}
  >
    {children}
  </div>
);

// ── The track content, rendered as a function so it can be drawn twice:
//    once flat, once again *magnified & refracted* inside the glass sphere. ──
const TRACK_W = 620;
const TRACK_H = 168;

const TrackContent: React.FC<{ frame: number; hue: number; label: string }> = ({
  frame,
  hue,
  label,
}) => {
  const glow = 0.55 + 0.12 * (0.5 + 0.5 * Math.sin(frame * 0.05));
  return (
    <div
      style={{
        width: TRACK_W,
        height: TRACK_H,
        borderRadius: TRACK_H / 2,
        position: 'relative',
        overflow: 'hidden',
        background: `linear-gradient(180deg,
          hsla(${hue}, 85%, 62%, 0.95),
          hsla(${hue + 18}, 80%, 46%, 0.98))`,
        boxShadow: `0 24px 60px hsla(${hue}, 80%, 45%, ${glow}),
                    inset 0 2px 6px rgba(255,255,255,0.5),
                    inset 0 -12px 26px rgba(0,0,0,0.28)`,
        display: 'flex',
        alignItems: 'center',
      }}
    >
      {/* inner top sheen */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '48%',
          background:
            'linear-gradient(180deg, rgba(255,255,255,0.34), transparent)',
        }}
      />
      {/* label — the detail the lens will magnify as it sweeps across */}
      <div
        style={{
          position: 'relative',
          paddingLeft: 54,
          color: 'rgba(255,255,255,0.98)',
          fontFamily: 'Inter, system-ui, sans-serif',
          fontWeight: 700,
          fontSize: 66,
          letterSpacing: '-0.02em',
          textShadow: '0 2px 14px rgba(0,0,0,0.28)',
        }}
      >
        {label}
      </div>
    </div>
  );
};

// ── A crisp AI "spark" glyph that sits inside the glass core ────────────────
const Spark: React.FC<{ size: number; opacity: number }> = ({ size, opacity }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" style={{ opacity }}>
    <defs>
      <radialGradient id="dl-spark" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="#FFFFFF" />
        <stop offset="100%" stopColor="#F2ECFF" />
      </radialGradient>
    </defs>
    <path
      d="M50 6 C55 34 66 45 94 50 C66 55 55 66 50 94 C45 66 34 55 6 50 C34 45 45 34 50 6 Z"
      fill="url(#dl-spark)"
    />
  </svg>
);

// ── The refractive glass sphere knob — the money shot ──────────────────────
const GlassKnob: React.FC<{
  frame: number;
  cx: number; // knob centre, in track-space px
  hue: number;
  label: string;
}> = ({ frame, cx, hue, label }) => {
  const r = 112;
  const cy = TRACK_H / 2;
  const spec = 30 + breath(frame, 0.04, 5); // drifting specular hot-spot
  const sparkPulse = 0.82 + 0.18 * (0.5 + 0.5 * Math.sin(frame * 0.08));

  return (
    <div
      style={{
        position: 'absolute',
        left: cx - r,
        top: cy - r,
        width: r * 2,
        height: r * 2,
        borderRadius: '50%',
        // contact + ambient shadow so the sphere sits above the track
        boxShadow: '0 32px 58px rgba(22,11,50,0.5), 0 8px 16px rgba(22,11,50,0.34)',
      }}
    >
      {/* CLIPPED GLASS INTERIOR: frost + refraction + core glow */}
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
        {/* MAGNIFIED + REFRACTED copy of the track, seen through the glass.
            feDisplacementMap wobbles it; scale() lenses it. Kept translucent
            so the frosted background still reads at the rim = real glass. */}
        <div style={{ position: 'absolute', inset: 0, filter: 'url(#dl-liquid)', opacity: 0.88 }}>
          <div
            style={{
              position: 'absolute',
              left: r - cx,
              top: r - cy,
              width: TRACK_W,
              height: TRACK_H,
              transformOrigin: `${cx}px ${cy}px`,
              transform: 'scale(1.5)',
            }}
          >
            <TrackContent frame={frame} hue={hue} label={label} />
          </div>
        </div>
        {/* translucent coloured core glow */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: `radial-gradient(circle at 50% 46%,
              hsla(${hue}, 92%, 72%, 0.55),
              hsla(${hue}, 85%, 52%, 0.22) 54%,
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
        {/* the icon, sitting inside the glass */}
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
          <Spark size={70} opacity={sparkPulse} />
        </div>
        {/* broad specular arc across the top (the glass catch-light) */}
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

      {/* FRESNEL RIM (outside the clip, so it reads as the glass edge) */}
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
      {/* chromatic dispersion — offset colour rings read as prism edges */}
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

// ── Beat 2: the full liquid-glass toggle ───────────────────────────────────
const LiquidToggle: React.FC<{ frame: number; hue: number; label: string }> = ({
  frame,
  hue,
  label,
}) => {
  const { fps } = useVideoConfig();
  const r = 112;
  // knob slides left → right with a springy settle (jelly), then breathes
  const slide = spring({ frame: frame - 14, fps, config: { damping: 14, stiffness: 90, mass: 1.1 } });
  const restL = r + 8;
  const restR = TRACK_W - r - 8;
  const cx = interpolate(slide, [0, 1], [restL, restR]) + breath(frame, 0.04, 4);

  return (
    <div style={{ position: 'relative', width: TRACK_W, height: TRACK_H }}>
      {/* extra bloom on the track directly under the sphere */}
      <div
        style={{
          position: 'absolute',
          left: cx - 150,
          top: TRACK_H / 2 - 150,
          width: 300,
          height: 300,
          borderRadius: '50%',
          background: `radial-gradient(circle, hsla(${hue},95%,66%,0.6), transparent 62%)`,
          filter: 'blur(30px)',
        }}
      />
      {/* the flat track (what the sphere will magnify) */}
      <TrackContent frame={frame} hue={hue} label={label} />
      <GlassKnob frame={frame} cx={cx} hue={hue} label={label} />
    </div>
  );
};

// ── Beat 1: the clay morph (Select → blob → Done) ──────────────────────────
const ClayMorph: React.FC<{ frame: number }> = ({ frame }) => {
  const { fps } = useVideoConfig();
  // phase 1: "Select" present (0..34) → dissolves to blob (34..48) → Done set (48+)
  const selOut = interpolate(frame, [30, 46], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const blob = interpolate(frame, [34, 44, 56], [0, 1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const e1 = enter(frame, 50, fps);
  const e2 = enter(frame, 56, fps);
  const e3 = enter(frame, 62, fps);
  const bob = breath(frame, 0.05, 5);

  return (
    <div
      style={{
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 34,
        height: 260,
        transform: `translateY(${bob}px)`,
      }}
    >
      {/* "Select" pill fading/scaling out */}
      {selOut > 0.01 && (
        <div
          style={{
            position: 'absolute',
            opacity: selOut,
            transform: `scale(${0.9 + 0.1 * selOut})`,
          }}
        >
          <ClayPill w={300} h={128}>
            Select
          </ClayPill>
        </div>
      )}

      {/* glowing morph blob mid-transition */}
      {blob > 0.01 && (
        <div
          style={{
            position: 'absolute',
            width: 240,
            height: 150,
            borderRadius: 80,
            background:
              'radial-gradient(circle at 50% 40%, #FFFFFF, #EFEBFA 70%)',
            filter: `url(#dl-goo) blur(${2 + 6 * blob}px)`,
            boxShadow: `0 0 ${40 + 60 * blob}px ${PURPLE_GLOW}${hexA(0.5 * blob)}`,
            opacity: blob,
            transform: `scale(${0.8 + 0.5 * blob})`,
          }}
        />
      )}

      {/* resolved trio: ○  △  Done */}
      <div style={{ opacity: e1, transform: `scale(${0.6 + 0.4 * e1})` }}>
        <ClayPill w={128} h={128} style={{ borderRadius: '50%' }}>
          <div
            style={{
              width: 46,
              height: 46,
              borderRadius: '50%',
              border: `5px solid ${INK}`,
            }}
          />
        </ClayPill>
      </div>
      <div style={{ opacity: e2, transform: `scale(${0.6 + 0.4 * e2})` }}>
        <ClayPill w={128} h={128} style={{ borderRadius: '50%' }}>
          <div
            style={{
              width: 0,
              height: 0,
              borderLeft: '26px solid transparent',
              borderRight: '26px solid transparent',
              borderBottom: `44px solid transparent`,
              position: 'relative',
            }}
          >
            {/* hollow triangle via two stacked strokes */}
            <svg width="60" height="54" style={{ position: 'absolute', left: -30, top: -2 }}>
              <polygon
                points="30,6 54,48 6,48"
                fill="none"
                stroke={INK}
                strokeWidth="5"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </ClayPill>
      </div>
      <div style={{ opacity: e3, transform: `scale(${0.6 + 0.4 * e3})` }}>
        <ClayPill w={280} h={128}>
          Done
        </ClayPill>
      </div>
    </div>
  );
};

// ── Small caption ──────────────────────────────────────────────────────────
const Caption: React.FC<{ frame: number; start: number; text: string }> = ({
  frame,
  start,
  text,
}) => {
  const o = interpolate(frame, [start, start + 12], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  return (
    <div
      style={{
        position: 'absolute',
        bottom: 96,
        left: 0,
        right: 0,
        textAlign: 'center',
        opacity: o,
        color: INK,
        fontFamily: 'Inter, system-ui, sans-serif',
        fontWeight: 600,
        fontSize: 30,
        letterSpacing: '0.04em',
        textTransform: 'uppercase',
        transform: `translateY(${(1 - o) * 8}px)`,
      }}
    >
      {text}
    </div>
  );
};

// ── Main ────────────────────────────────────────────────────────────────────
export const DesignLab: React.FC = () => {
  const frame = useCurrentFrame();

  // Two beats, crossfaded on one continuous background.
  const CLAY_END = 96;
  const clayOpacity = interpolate(frame, [0, 8, 84, 96], [0, 1, 1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const glassOpacity = interpolate(frame, [92, 108], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const localGlass = Math.max(0, frame - 100);

  return (
    <AbsoluteFill style={{ background: ASH }}>
      <LiquidFilters dispScale={16} />
      <AshBackdrop frame={frame} />

      {/* Beat 1 — CLAY */}
      {clayOpacity > 0.01 && (
        <AbsoluteFill
          style={{
            opacity: clayOpacity,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <ClayMorph frame={frame} />
          <Caption frame={frame} start={16} text="Clay — matte, soft, tactile" />
        </AbsoluteFill>
      )}

      {/* Beat 2 — LIQUID GLASS */}
      {glassOpacity > 0.01 && (
        <AbsoluteFill
          style={{
            opacity: glassOpacity,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <div style={{ transform: `scale(${1 + 0.02 * Math.sin(localGlass * 0.03)})` }}>
            <LiquidToggle frame={localGlass} hue={266} label="Automate" />
          </div>
          <Caption frame={frame} start={112} text="Liquid glass — real refraction" />
        </AbsoluteFill>
      )}
    </AbsoluteFill>
  );
};

export default DesignLab;
