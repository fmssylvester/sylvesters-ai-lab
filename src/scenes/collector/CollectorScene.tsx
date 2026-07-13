import {
  AbsoluteFill,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import Vignette from "../../components/postfx/Vignette";
import FilmGrain from "../../components/effects/FilmGrain";
import { COLLECTOR } from "./collectorTimeline";

const A = COLLECTOR;

// Authoritative display serif (embedded), with a robust serif fallback chain.
const SERIF =
  "'Melodrama', Georgia, 'Times New Roman', serif";
const CYAN = "#00D9FF";
const GOLD = "#E7B84D";
const RED = "#FF5A5A";
const INK = "#F4F6FA";

interface Block {
  text: string;
  emph?: boolean;
}

interface Act {
  blocks: Block[];
  first: number;
  gap: number;
  accent: string;
  style: "serif" | "sans";
}

const ACTS: Act[] = [
  {
    blocks: [{ text: "Somewhere" }, { text: "right now…" }],
    first: A.ACT1_ANON.CAPTION_IN,
    gap: 26,
    accent: INK,
    style: "serif",
  },
  {
    blocks: [
      { text: "someone is" },
      { text: "bookmarking their" },
      { text: "fortieth AI tool", emph: true },
    ],
    first: A.ACT2_BOOKMARK.CAPTION_IN,
    gap: 22,
    accent: CYAN,
    style: "serif",
  },
  {
    blocks: [
      { text: "They haven't finished" },
      { text: "exploring the" },
      { text: "last ten.", emph: true },
    ],
    first: A.ACT3_UNEXPLORED.CAPTION_IN,
    gap: 22,
    accent: GOLD,
    style: "serif",
  },
  {
    blocks: [
      { text: "They won't finish" },
      { text: "exploring this one" },
      { text: "either.", emph: true },
    ],
    first: A.ACT4_NEVER.CAPTION_IN,
    gap: 22,
    accent: RED,
    style: "serif",
  },
];

/* ---------- Per-act living backgrounds (never static) ---------- */

function Background({ actIndex }: { actIndex: number }) {
  const frame = useCurrentFrame();

  if (actIndex === 1) {
    const drift = Math.sin(frame / 70) * 60;
    const driftY = Math.cos(frame / 90) * 40;
    const hue = interpolate(frame, [0, 60], [210, 190], { extrapolateRight: "clamp" });
    return (
      <AbsoluteFill
        style={{
          background: `radial-gradient(60% 50% at ${50 + drift / 12}% ${44 + driftY / 14}%, #16243b 0%, #0b1220 55%, #06080d 100%)`,
          filter: `hue-rotate(${hue - 200}deg)`,
        }}
      />
    );
  }

  if (actIndex === 2) {
    // digital moving grid + cyan sweep
    const shift = (frame * 2.4) % 80;
    const sweep = (frame * 6) % 240;
    return (
      <AbsoluteFill style={{ background: "#05070c", overflow: "hidden" }}>
        <AbsoluteFill
          style={{
            backgroundImage:
              "linear-gradient(rgba(0,217,255,0.10) 1px, transparent 1px), linear-gradient(90deg, rgba(0,217,255,0.10) 1px, transparent 1px)",
            backgroundSize: "80px 80px",
            transform: `translateY(${-shift}px)`,
            opacity: 0.5,
          }}
        />
        <AbsoluteFill
          style={{
            background: `linear-gradient(105deg, transparent ${sweep - 40}%, rgba(0,217,255,0.18) ${sweep}%, transparent ${sweep + 40}%)`,
          }}
        />
      </AbsoluteFill>
    );
  }

  if (actIndex === 3) {
    const x = 50 + Math.sin(frame / 80) * 14;
    const y = 44 + Math.cos(frame / 100) * 10;
    return (
      <AbsoluteFill
        style={{
          background: `radial-gradient(58% 52% at ${x}% ${y}%, #2a2113 0%, #140f08 55%, #07060a 100%)`,
        }}
      />
    );
  }

  // act 4 — cold, closing
  const pulse = 0.06 + Math.sin(frame / 40) * 0.04;
  return (
    <AbsoluteFill
      style={{
        background: `radial-gradient(60% 55% at 50% 48%, #1c0d10 0%, #0c0608 55%, #05060a 100%)`,
      }}
    >
      <AbsoluteFill style={{ background: `rgba(255,90,90,${pulse})` }} />
    </AbsoluteFill>
  );
}

/* ---------- One stacked block that reveals from behind ---------- */

function StackBlock({
  text,
  emph,
  activeIndex,
  myIndex,
  first,
  gap,
  fps,
  accent,
}: {
  text: string;
  emph: boolean;
  activeIndex: number;
  myIndex: number;
  first: number;
  gap: number;
  fps: number;
  accent: string;
}) {
  const frame = useCurrentFrame();
  if (myIndex > activeIndex) return null;

  const start = first + myIndex * gap;
  const appear = spring({
    frame: frame - start,
    fps,
    config: { damping: 18, stiffness: 140, mass: 0.9 },
  });
  const sinceIn = frame - start;

  // exit: previous blocks gently dim + lift as the next appears from behind
  const exitStart = start + gap + 6;
  const exiting = frame > exitStart;
  const exit = exiting
    ? interpolate(frame, [exitStart, exitStart + 16], [0, 1], {
        extrapolateRight: "clamp",
      })
    : 0;

  const yStack = (myIndex - activeIndex) * 150; // peek above
  const rise = interpolate(appear, [0, 1], [120, 0]);
  const blur = interpolate(appear, [0, 1], [16, 0], { extrapolateRight: "clamp" });

  const fontSize = emph ? 150 : 124;
  const color = emph ? accent : INK;

  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        top: "50%",
        display: "flex",
        justifyContent: "center",
        transform: `translateY(calc(-50% + ${yStack}px + ${rise}px - ${exit * 26}px))`,
        opacity: (1 - exit) * appear,
        filter: `blur(${blur}px)`,
        pointerEvents: "none",
      }}
    >
      <span
        style={{
          fontFamily: SERIF,
          fontSize,
          fontWeight: emph ? 900 : 700,
          fontStyle: emph ? "italic" : "normal",
          letterSpacing: "-0.02em",
          lineHeight: 1,
          color,
          textShadow: emph
            ? `0 0 60px ${accent}66, 0 8px 40px rgba(0,0,0,0.7)`
            : "0 8px 40px rgba(0,0,0,0.7)",
          whiteSpace: "nowrap",
          transform: `scale(${1 + (1 - appear) * 0.12})`,
        }}
      >
        {text}
      </span>
    </div>
  );
}

/* ---------- Fast count-up 1 -> 40 (Act 2) ---------- */

function CountUp() {
  const frame = useCurrentFrame();
  const cStart = A.ACT2_BOOKMARK.CURSOR_MOVE;
  const cEnd = cStart + 34; // ~1.1s, fast
  const show = frame >= cStart - 26 && frame <= A.ACT2_BOOKMARK.END + 10;
  if (!show) return null;

  const n = Math.round(
    interpolate(frame, [cStart, cEnd], [1, 40], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    })
  );
  const pop = spring({ frame: frame - cEnd, fps: 30, config: { damping: 12, stiffness: 140 } });
  const opacity = interpolate(
    frame,
    [cStart - 26, cStart - 10, A.ACT2_BOOKMARK.END, A.ACT2_BOOKMARK.END + 10],
    [0, 1, 1, 0]
  );

  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        bottom: 130,
        display: "flex",
        justifyContent: "center",
        opacity,
        pointerEvents: "none",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "baseline",
          gap: 18,
          fontFamily: SERIF,
          color: CYAN,
          textShadow: `0 0 50px ${CYAN}55`,
        }}
      >
        <span style={{ fontSize: 200, fontWeight: 900, transform: `scale(${1 + pop * 0.06})` }}>
          {n}
        </span>
        <span style={{ fontSize: 46, fontWeight: 600, letterSpacing: "0.04em", color: INK }}>
          AI tools collected
        </span>
      </div>
    </div>
  );
}

export default function CollectorScene() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const actIndex = frame < A.ACT2_BOOKMARK.START ? 0 : frame < A.ACT3_UNEXPLORED.START ? 1 : frame < A.ACT4_NEVER.START ? 2 : 3;
  const act = ACTS[actIndex];
  const activeIndex = Math.min(
    act.blocks.length - 1,
    Math.floor((frame - act.first) / act.gap)
  );

  return (
    <AbsoluteFill style={{ background: "#06080d", overflow: "hidden" }}>
      <Background actIndex={actIndex} />

      {/* centered heavy type stack */}
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
        {act.blocks.map((b, i) => (
          <StackBlock
            key={i}
            text={b.text}
            emph={!!b.emph}
            activeIndex={activeIndex}
            myIndex={i}
            first={act.first}
            gap={act.gap}
            fps={fps}
            accent={act.accent}
          />
        ))}
      </AbsoluteFill>

      {actIndex === 1 && <CountUp />}

      <Vignette />
      <FilmGrain />
    </AbsoluteFill>
  );
}
