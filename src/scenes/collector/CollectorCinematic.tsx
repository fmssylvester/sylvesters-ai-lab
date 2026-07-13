import {
  AbsoluteFill,
  Audio,
  interpolate,
  Sequence,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import Vignette from "../../components/postfx/Vignette";
import FilmGrain from "../../components/effects/FilmGrain";
import { COLLECTOR, CAPTIONS } from "./collectorTimeline";
import NodeGrid from "./NodeGrid";

const A = COLLECTOR;
const CYAN = "#00D9FF";
const GOLD = "#E7B84D";
const RED = "#FF6B6B";
const INK = "#FFFFFF";

// ─── Typography ────────────────────────────────────────────────────────────
const FONT_HEAD = "'Georgia', 'Times New Roman', serif";
const FONT_UI = "'Inter', 'Helvetica Neue', sans-serif";

interface Block { text: string; emph?: boolean; }
interface Act { blocks: Block[]; first: number; gap: number; accent: string; }

const ACTS: Act[] = [
  { blocks: [{ text: "Somewhere" }, { text: "right now…" }], first: A.ACT1_ANON.CAPTION_IN, gap: 26, accent: INK },
  { blocks: [{ text: "someone is" }, { text: "bookmarking their" }, { text: "fortieth AI tool", emph: true }], first: A.ACT2_BOOKMARK.CAPTION_IN, gap: 22, accent: CYAN },
  { blocks: [{ text: "They haven't finished" }, { text: "exploring the" }, { text: "last ten.", emph: true }], first: A.ACT3_UNEXPLORED.CAPTION_IN, gap: 22, accent: GOLD },
  { blocks: [{ text: "They won't finish" }, { text: "exploring this one" }, { text: "either.", emph: true }], first: A.ACT4_NEVER.CAPTION_IN, gap: 22, accent: RED },
];

// ─── Kinetic text block ────────────────────────────────────────────────────
function KineticBlock({ text, emph, activeIndex, myIndex, first, gap, fps, accent }: {
  text: string; emph: boolean; activeIndex: number; myIndex: number; first: number; gap: number; fps: number; accent: string;
}) {
  const frame = useCurrentFrame();
  if (myIndex > activeIndex) return null;

  const start = first + myIndex * gap;
  const pop = spring({ frame: frame - start, fps, config: { damping: 14, stiffness: 180, mass: 0.8 } });
  const isActive = myIndex === activeIndex;

  // Exit: slide up
  const exitStart = start + gap + 6;
  const exiting = frame > exitStart;
  const exitT = exiting ? interpolate(frame, [exitStart, exitStart + 12], [0, 1], { extrapolateRight: "clamp" }) : 0;
  const exitY = exitT * -60;

  // Vertical stacking offset
  const stackOffset = (myIndex - activeIndex) * 180;

  const fontSize = emph ? (text.length > 16 ? 120 : 160) : (text.length > 16 ? 100 : 130);
  const color = emph ? accent : INK;
  // No blur — use scale and opacity for hierarchy
  const opacity = isActive ? 1 : 0.4;
  const scale = isActive ? 1 : 0.85;

  return (
    <div style={{
      position: "absolute", left: 0, right: 0, top: "50%",
      display: "flex", justifyContent: "center",
      transform: `translateY(calc(-50% + ${stackOffset}px + ${(1 - pop) * 80}px + ${exitY}px)) scale(${scale})`,
      opacity: opacity * pop * (1 - exitT),
    }}>
      <span style={{
        fontFamily: FONT_HEAD, fontSize, fontWeight: emph ? 900 : 700,
        fontStyle: emph ? "italic" : "normal",
        letterSpacing: "-0.03em", lineHeight: 1.05,
        color, textAlign: "center", maxWidth: "88%",
        textShadow: emph
          ? `0 0 150px ${accent}88, 0 0 80px ${accent}44, 0 0 30px ${accent}22, 0 4px 30px rgba(0,0,0,0.9)`
          : `0 0 100px rgba(255,255,255,0.2), 0 0 40px rgba(255,255,255,0.08), 0 4px 20px rgba(0,0,0,0.85)`,
      }}>{text}</span>
    </div>
  );
}

// ─── Rolling counter ───────────────────────────────────────────────────────
function RollingCounter() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const cStart = A.ACT2_BOOKMARK.COUNTER_START;
  const cEnd = A.ACT2_BOOKMARK.COUNTER_END;

  if (frame < cStart - 20 || frame > A.ACT2_BOOKMARK.END + 10) return null;

  const n = Math.round(interpolate(frame, [cStart, cEnd], [A.ACT2_BOOKMARK.COUNTER_FROM, A.ACT2_BOOKMARK.COUNTER_TO], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  }));

  const pop = spring({ frame: frame - cEnd, fps, config: { damping: 12, stiffness: 140 } });
  const fadeIn = interpolate(frame, [cStart - 20, cStart - 5], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const fadeOut = interpolate(frame, [A.ACT2_BOOKMARK.END, A.ACT2_BOOKMARK.END + 10], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <div style={{
      position: "absolute", right: 120, bottom: 100,
      opacity: fadeIn * fadeOut,
    }}>
      <div style={{
        display: "flex", alignItems: "baseline", gap: 14,
        fontFamily: FONT_UI,
      }}>
        <span style={{
          fontSize: 180, fontWeight: 900, color: CYAN,
          transform: `scale(${1 + pop * 0.08})`,
          textShadow: `0 0 60px ${CYAN}55, 0 4px 40px rgba(0,0,0,0.9)`,
        }}>{n}</span>
        <span style={{
          fontSize: 36, fontWeight: 500, letterSpacing: "0.06em",
          color: INK, opacity: 0.7,
        }}>AI tools collected</span>
      </div>
    </div>
  );
}

// ─── Main scene ────────────────────────────────────────────────────────────
export default function CollectorCinematic() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const actIndex = frame < A.ACT2_BOOKMARK.START ? 0
    : frame < A.ACT3_UNEXPLORED.START ? 1
    : frame < A.ACT4_NEVER.START ? 2
    : 3;

  const act = ACTS[actIndex];
  const activeIndex = Math.min(act.blocks.length - 1, Math.floor((frame - act.first) / act.gap));

  // Node count: ramps gradually through entire scene
  // ACT1 (0-162): 3→8, ACT2 (162-240): 8→40, ACT3-4: hold at 40
  const nodeCount = frame < A.ACT2_BOOKMARK.START
    ? Math.min(8, Math.floor(frame / 20) + 3)
    : Math.round(interpolate(
        frame,
        [A.ACT2_BOOKMARK.START, A.ACT2_BOOKMARK.END],
        [8, 40],
        { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
      ));

  // Background tint per act
  const tint = actIndex === 0 ? "rgba(10,30,60,0.4)"
    : actIndex === 1 ? "rgba(0,60,90,0.35)"
    : actIndex === 2 ? "rgba(90,60,15,0.35)"
    : "rgba(90,15,20,0.35)";

  return (
    <AbsoluteFill style={{ background: "#07090D", overflow: "hidden" }}>
      {/* Radial gradient — breaks the flat void */}
      <AbsoluteFill style={{
        background: `radial-gradient(ellipse 70% 60% at 50% 45%, rgba(0,60,80,0.18) 0%, rgba(7,9,13,0) 70%)`,
      }} />
      {/* Abstract node grid — heavy blur for depth of field, sits BEHIND text */}
      <AbsoluteFill style={{ opacity: 0.45, filter: "blur(8px)" }}>
        <NodeGrid activeCount={nodeCount} totalNodes={40} />
      </AbsoluteFill>

      {/* Tint overlay */}
      <AbsoluteFill style={{ background: tint, mixBlendMode: "soft-light" }} />

      {/* Vignette (inner shadow) */}
      <AbsoluteFill style={{
        background: "radial-gradient(circle at 50% 50%, rgba(7,9,13,0) 35%, rgba(7,9,13,0.5) 85%)",
      }} />

      {/* Kinetic typography */}
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
        {act.blocks.map((b, i) => (
          <KineticBlock key={i} text={b.text} emph={!!b.emph} activeIndex={activeIndex} myIndex={i}
            first={act.first} gap={act.gap} fps={fps} accent={act.accent} />
        ))}
      </AbsoluteFill>

      {/* Counter (ACT2 only) */}
      {actIndex === 1 && <RollingCounter />}

      {/* Post-FX */}
      <Vignette />
      <FilmGrain />

      {/* Narration audio */}
      {CAPTIONS.map((c, i) => (
        <Sequence key={i} from={c.in}>
          <Audio src={staticFile(`audio/collector/line${i + 1}.wav`)} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
}
