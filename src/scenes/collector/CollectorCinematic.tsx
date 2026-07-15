import {
  AbsoluteFill,
  Audio,
  Img,
  interpolate,
  Sequence,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import Vignette from "../../components/postfx/Vignette";
import FilmGrain from "../../components/effects/FilmGrain";
import NodeGrid from "./NodeGrid";
import { COLLECTOR, CAPTIONS } from "./collectorTimeline";

const A = COLLECTOR;

// Narration: one line per act, played as each caption lands (see assets/audio/collector/).
const NARRATION = [
  { src: "line1.wav", from: A.ACT1_ANON.CAPTION_IN, frames: 30 },
  { src: "line2.wav", from: A.ACT2_BOOKMARK.CAPTION_IN, frames: 74 },
  { src: "line3.wav", from: A.ACT3_UNEXPLORED.CAPTION_IN, frames: 62 },
  { src: "line4.wav", from: A.ACT4_NEVER.CAPTION_IN, frames: 57 },
];

const CYAN = "#00D9FF";
const GOLD = "#E7B84D";
const RED = "#FF6B6B";
const WHITE = "#F5F7FA";
const FONT = "'Inter', 'Helvetica Neue', Arial, sans-serif";

// Real brand logos (downloaded + vision-verified; see ASSET_MANIFEST.md).
// These ARE the hero visual — tool overload made literal via a flying swarm.
const BRAND_LOGOS = [
  "01_LOGOS/AI/openai.svg", "01_LOGOS/AI/anthropic.svg", "01_LOGOS/Design/figma.svg",
  "01_LOGOS/Productivity/notion.svg", "01_LOGOS/Coding/vercel.svg", "01_LOGOS/Marketing/canva.png",
  "01_LOGOS/Coding/github.svg", "01_LOGOS/AI/perplexity.svg", "01_LOGOS/Productivity/zapier.svg",
  "01_LOGOS/Productivity/n8n.svg", "01_LOGOS/AI/googlegemini.svg", "01_LOGOS/Design/adobephotoshop.svg",
  "01_LOGOS/Productivity/make.svg",
];

// Deterministic pseudo-random (stable across SSR + client)
const rand = (seed: number) => {
  const x = Math.sin(seed * 12.9898) * 43758.5453;
  return x - Math.floor(x);
};

interface CollectorCinematicProps {
  footage?: string | null;
  logoFiles?: string[];
}

// ─── HERO: Logo Swarm — brand logos fly in from all directions, fill the frame ─
function LogoSwarm({ files }: { files: string[] }) {
  const { width, height, fps } = useVideoConfig();
  const frame = useCurrentFrame();

  const TILE_COUNT = 40; // ≈ the "fortieth" tool — the swarm literally fills the screen
  const COLS = 8;
  const ROWS = 5;
  const cellW = width / COLS;
  const cellH = height / ROWS;
  const SEED_COUNT = 6; // trickle in during ACT1 to seed "accumulation"

  let featured = 0;
  let best = Infinity;

  const tiles = Array.from({ length: TILE_COUNT }, (_, i) => {
    const col = i % COLS;
    const row = Math.floor(i / COLS);
    const jx = (rand(i * 1.13) - 0.5) * cellW * 0.55;
    const jy = (rand(i * 2.71) - 0.5) * cellH * 0.55;
    const tx = (col + 0.5) * cellW + jx;
    const ty = (row + 0.5) * cellH + jy;
    if (Math.hypot(tx - width / 2, ty - height / 2) < best) {
      best = Math.hypot(tx - width / 2, ty - height / 2);
      featured = i;
    }
    const depth = rand(i * 3.37); // 0=back, 1=front → scale + blur + parallax
    const ang = rand(i * 5.91) * Math.PI * 2;
    const dirX = Math.cos(ang);
    const dirY = Math.sin(ang);
    const off = Math.max(width, height) * 0.8;
    const sx = tx + dirX * off;
    const sy = ty + dirY * off;
    const enterDelay =
      i < SEED_COUNT
        ? 8 + i * 13 + (rand(i * 7.7) - 0.5) * 6
        : 96 + ((i - SEED_COUNT) / (TILE_COUNT - SEED_COUNT)) * 100 + (rand(i * 9.3) - 0.5) * 8;
    return { i, tx, ty, sx, sy, depth, enterDelay, file: files[i % files.length] };
  });

  const cameraZoom = interpolate(frame, [A.ACT1_ANON.START, A.ACT2_BOOKMARK.END], [1.02, 1.12], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const recede = interpolate(frame, [A.ACT4_NEVER.PULLBACK_START, A.ACT4_NEVER.PULLBACK_END], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  // ACT3: the "last ten" arrived remain unexplored → dim + desaturate
  const dimSet = new Set<number>();
  for (let k = TILE_COUNT - 10; k < TILE_COUNT; k++) dimSet.add(k);

  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", transform: `scale(${cameraZoom})` }}>
      <div style={{ position: "absolute", left: 900, top: 500, width: 200, height: 200, background: frame > 100 ? "lime" : "red" }} />
      <div style={{ position: "absolute", left: 1150, top: 500, width: 200, height: 200, background: frame > 150 ? "lime" : "red" }} />
      {tiles.map((t) => {
        const sv = spring({
          frame: Math.max(0, frame - t.enterDelay),
          fps,
          config: { damping: 20, stiffness: 64, mass: 1 },
        });
        if (sv <= 0.001 && recede === 0) return null;

        const isFeatured = t.i === featured;
        const dim = dimSet.has(t.i) && frame >= A.ACT3_UNEXPLORED.START;

        const x = t.sx + (t.tx - t.sx) * sv;
        const y = t.sy + (t.ty - t.sy) * sv;
        const micro = Math.sin(frame * 0.02 + t.i) * 2;

        const depthScale = 0.55 + t.depth * 0.85;
        let scale = depthScale;
        let blur = (1 - t.depth) * 9;
        let opacity = Math.min(1, sv);
        let px = x + micro;
        let py = y + micro * 0.6;
        let glow = 0.25 + t.depth * 0.35;

        if (isFeatured && recede > 0) {
          px = px + (width / 2 - px) * recede;
          py = py + (height / 2 - py) * recede;
          scale = depthScale * (1 + recede * 2.6);
          blur = 0;
          opacity = 1;
          glow = 0.65 + recede * 0.35;
        } else if (recede > 0) {
          const cx = width / 2;
          const cy = height / 2;
          const d = Math.hypot(px - cx, py - cy) || 1;
          px += ((px - cx) / d) * recede * 150;
          py += ((py - cy) / d) * recede * 150;
          scale *= 1 - recede * 0.32;
          blur += recede * 8;
          opacity = Math.min(1, sv) * (1 - recede * 0.5);
        }
        if (dim) {
          opacity *= 0.32;
          blur += 1.5;
        }

        const base = 150;
        const size = base * scale;
        const accent = t.i % 3 === 0 ? CYAN : t.i % 3 === 1 ? GOLD : RED;
        const haloA = Math.min(255, Math.round(glow * 210))
          .toString(16)
          .padStart(2, "0");

        return (
          <div
            key={t.i}
            style={{
              position: "absolute",
              left: px,
              top: py,
              width: size,
              height: size,
              marginLeft: -size / 2,
              marginTop: -size / 2,
              opacity,
              filter: `blur(${blur}px)`,
              transform: `translateZ(0)`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {isFeatured && recede > 0 && (
              <div
                style={{
                  position: "absolute",
                  width: size * 6,
                  height: size * 6,
                  borderRadius: "50%",
                  background: `radial-gradient(circle, rgba(255,255,255,${(0.10 + recede * 0.18).toFixed(3)}) 0%, ${accent}${(0.12 * recede).toString(16).padStart(2, "0")} 28%, rgba(7,9,13,0) 62%)`,
                  filter: "blur(20px)",
                }}
              />
            )}
            <div
              style={{
                position: "absolute",
                inset: -size * 0.4,
                borderRadius: "50%",
                background: `radial-gradient(circle, ${accent}${haloA} 0%, rgba(7,9,13,0) 70%)`,
                filter: "blur(16px)",
              }}
            />
            <div
              style={{
                width: "100%",
                height: "100%",
                borderRadius: "22px",
                background: "linear-gradient(135deg, rgba(232,237,245,0.92), rgba(198,206,218,0.80))",
                boxShadow: "0 4px 14px rgba(0,0,0,0.4), inset 0 1px 2px rgba(255,255,255,0.6)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                filter: dim ? "grayscale(1)" : "none",
              }}
            >
              <Img
                src={staticFile(t.file)}
                style={{ width: size * 0.56, height: size * 0.4, objectFit: "contain" }}
              />
            </div>
          </div>
        );
      })}
    </AbsoluteFill>
  );
}

// ─── Caption: text is a SUPPORTING layer (Inter, anchored, keyword-highlighted) ─
function CaptionLine({
  text, emphWords, first, frame, fps, accent, size,
}: { text: string; emphWords: string[]; first: number; frame: number; fps: number; accent: string; size: number }) {
  const words = text.split(" ");
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: "0.26em", justifyContent: "flex-start", maxWidth: "58%" }}>
      {words.map((w, i) => {
        const t = first + i * 3;
        const op = interpolate(frame, [t, t + 10], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
        const yy = interpolate(frame, [t, t + 10], [14, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
        const emph = emphWords.includes(w.replace(/[.,!]/g, ""));
        return (
          <span
            key={i}
            style={{
              fontFamily: FONT,
              fontSize: size,
              fontWeight: emph ? 800 : 600,
              color: emph ? accent : "rgba(255,255,255,0.82)",
              opacity: op * (emph ? 1 : 0.9),
              transform: `translateY(${yy}px)`,
              textShadow: emph ? `0 0 50px ${accent}55` : "none",
              lineHeight: 1.08,
            }}
          >
            {w}{" "}
          </span>
        );
      })}
    </div>
  );
}

// ─── Counter (UI chrome / data-viz, per visual-direction) ─────────────────────
function RollingCounter() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const cStart = A.ACT2_BOOKMARK.COUNTER_START;
  const cEnd = A.ACT2_BOOKMARK.COUNTER_END;
  if (frame < cStart - 20 || frame > A.ACT2_BOOKMARK.END + 10) return null;

  const n = Math.round(interpolate(frame, [cStart, cEnd], [A.ACT2_BOOKMARK.COUNTER_FROM, A.ACT2_BOOKMARK.COUNTER_TO], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  }));
  const pop = spring({ frame: frame - cEnd, fps, config: { damping: 9, stiffness: 120, mass: 0.9 } });
  const fadeIn = interpolate(frame, [cStart - 20, cStart - 5], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const fadeOut = interpolate(frame, [A.ACT2_BOOKMARK.END, A.ACT2_BOOKMARK.END + 10], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{ justifyContent: "flex-end", alignItems: "flex-end", paddingBottom: 120, paddingRight: 120, opacity: fadeIn * fadeOut }}>
      <div style={{ display: "flex", alignItems: "baseline", gap: 14, fontFamily: FONT }}>
        <span style={{ fontSize: 150, fontWeight: 900, color: CYAN, transform: `scale(${1 + pop * 0.12})`, textShadow: `0 0 70px ${CYAN}66` }}>{n}</span>
        <span style={{ fontSize: 30, fontWeight: 500, letterSpacing: "0.05em", color: WHITE, opacity: 0.7 }}>AI tools bookmarked</span>
      </div>
    </AbsoluteFill>
  );
}

// ─── Foreground light leaks (depth / premium sheen) ────────────────────────────
function LightLeaks() {
  const frame = useCurrentFrame();
  const drift = interpolate(frame, [0, A.TOTAL_FRAMES], [0, 240], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <AbsoluteFill style={{ mixBlendMode: "screen", opacity: 0.5, pointerEvents: "none" }}>
      <div style={{ position: "absolute", top: -160, left: -200 + drift, width: 720, height: 720, borderRadius: "50%", background: `radial-gradient(circle, ${GOLD}22 0%, rgba(7,9,13,0) 65%)`, filter: "blur(40px)" }} />
      <div style={{ position: "absolute", bottom: -200, right: -160 - drift, width: 760, height: 760, borderRadius: "50%", background: `radial-gradient(circle, ${CYAN}22 0%, rgba(7,9,13,0) 65%)`, filter: "blur(40px)" }} />
    </AbsoluteFill>
  );
}

// ─── Scene copy (supporting captions, not hero) ───────────────────────────────
const ACTS = [
  { lines: ["Somewhere", "right now…"], emph: ["Somewhere"], first: A.ACT1_ANON.CAPTION_IN, accent: WHITE },
  { lines: ["someone is bookmarking", "their fortieth AI tool"], emph: ["fortieth"], first: A.ACT2_BOOKMARK.CAPTION_IN, accent: GOLD },
  { lines: ["they haven't finished", "exploring the last ten."], emph: ["last", "ten."], first: A.ACT3_UNEXPLORED.CAPTION_IN, accent: CYAN },
  { lines: ["they won't finish", "exploring this one", "either."], emph: ["won't", "finish"], first: A.ACT4_NEVER.CAPTION_IN, accent: RED },
  { lines: ["every open tab is", "a promise you", "won't keep."], emph: ["promise", "keep."], first: A.ACT5_OVERWHELM.CAPTION_IN, accent: RED },
  { lines: ["a folder named", "'AI Tools.'", "Forty-one saved. Zero opened."], emph: ["Forty-one", "Zero"], first: A.ACT6_ABANDON.CAPTION_IN, accent: GOLD },
  { lines: ["so what if you", "actually finished", "just one?"], emph: ["one?"], first: A.ACT7_RESOLVE.CAPTION_IN, accent: CYAN },
];

function actIndexFor(frame: number) {
  return frame < A.ACT2_BOOKMARK.START ? 0
    : frame < A.ACT3_UNEXPLORED.START ? 1
    : frame < A.ACT4_NEVER.START ? 2
    : frame < A.ACT5_OVERWHELM.START ? 3
    : frame < A.ACT6_ABANDON.START ? 4
    : frame < A.ACT7_RESOLVE.START ? 5
    : 6;
}

function CaptionBlock({ frame, fps }: { frame: number; fps: number }) {
  const actIndex = actIndexFor(frame);
  const act = ACTS[actIndex];
  // Caption placement VARIES per beat (never glued bottom-left); ACT7 question sits ABOVE the hero.
  const pos = actIndex <= 3
    ? { justify: "flex-end", align: "flex-start", padX: 100, padY: 100, side: "left" as const }
    : actIndex === 4
      ? { justify: "flex-start", align: "flex-end", padX: 70, padY: 96, side: "right" as const }
      : actIndex === 5
        ? { justify: "flex-end", align: "flex-start", padX: 100, padY: 100, side: "left" as const }
        : { justify: "flex-start", align: "center", padX: 0, padY: 110, side: "top" as const };
  const padStyle = pos.side === "right"
    ? { paddingTop: pos.padY, paddingRight: pos.padX }
    : pos.side === "top"
      ? { paddingTop: pos.padY }
      : { paddingBottom: pos.padY, paddingLeft: pos.padX };
  // ACT5-7 captions are clearly SUPPORTING (smaller) so the visual stays the focal point.
  // A subtle drift gives the text physical mass (per creative-director critique).
  const size = actIndex <= 3 ? 84 : 46;
  const drift = actIndex >= 4 ? Math.sin(frame / 16) * 4 : 0;
  return (
    <AbsoluteFill style={{ justifyContent: pos.justify as "flex-start" | "flex-end", alignItems: pos.align as "flex-start" | "flex-end" | "center", ...padStyle }}>
      <div style={{ background: "rgba(7,9,13,0.40)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 16, padding: "18px 26px", maxWidth: "56%", transform: `translateY(${drift}px)` }}>
        {act.lines.map((ln, i) => (
          <CaptionLine key={i} text={ln} emphWords={act.emph} first={act.first + i * 18} frame={frame} fps={fps} accent={act.accent} size={size} />
        ))}
      </div>
    </AbsoluteFill>
  );
}

// ─── ACT5: THE OVERWHELM — a cluttered workstation, not floating logos ───────
function OverwhelmScene({ frame }: { frame: number }) {
  const a5 = A.ACT5_OVERWHELM;
  const flood = interpolate(frame, [a5.TAB_FLOOD_START, a5.TAB_FLOOD_END], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const devA = interpolate(frame, [a5.TAB_FLOOD_START, a5.TAB_FLOOD_START + 24], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const devS = interpolate(frame, [a5.TAB_FLOOD_START, a5.TAB_FLOOD_START + 30], [0.92, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  // atmosphere ONLY: a few small, blurred, drifting windows hugging the edges — they never compete with the hero.
  const atm = [
    { x: 70, y: 120, r: -8, d: 4 },
    { x: 40, y: 760, r: 6, d: 14 },
    { x: 1640, y: 130, r: 9, d: 22 },
    { x: 1660, y: 780, r: -6, d: 30 },
  ];
  const tabs = Array.from({ length: 16 }, (_, i) => (
    <div key={i} style={{ minWidth: 42, maxWidth: 58, height: 18, marginRight: 3, borderRadius: 4, background: i % 4 === 0 ? "rgba(0,217,255,0.22)" : "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.10)", display: "flex", alignItems: "center", paddingLeft: 5, overflow: "hidden" }}>
      <span style={{ width: 5, height: 5, borderRadius: "50%", background: i % 3 === 0 ? "#E7B84D" : "#00D9FF", opacity: 0.8 }} />
      <span style={{ width: 26, height: 3, borderRadius: 2, background: "rgba(255,255,255,0.16)", marginLeft: 4 }} />
    </div>
  ));
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ background: "radial-gradient(46% 48% at 50% 50%, rgba(0,217,255,0.14) 0%, rgba(7,9,13,0) 70%)", mixBlendMode: "screen" }} />
      {atm.map((w, i) => (
        <div key={i} style={{ position: "absolute", left: w.x, top: w.y + Math.sin((frame + w.d * 10) / 40) * 14, width: 240, height: 155, transform: `rotate(${w.r}deg)`, opacity: 0.3 * flood, filter: "blur(6px)", borderRadius: 10, background: "rgba(12,18,26,0.92)", border: "1px solid rgba(0,217,255,0.10)" }} />
      ))}
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
        <div style={{ position: "relative", opacity: devA, transform: `translateY(${(1 - devA) * 24}px) scale(${devS})`, width: 1040, height: 664, zIndex: 2 }}>
          <Img src={staticFile("04_DEVICE_FRAMES/Desktop/desktop.svg")} style={{ width: 1040, height: 664, objectFit: "contain" }} />
          {/* screen fill lifts the monitor off the void so it reads as the hero; faux content conveys "overwhelm" */}
          <div style={{ position: "absolute", left: 92, top: 41, width: 856, height: 445, background: "linear-gradient(180deg,#141B28,#0C1119)", overflow: "hidden", borderRadius: 8 }}>
            <div style={{ position: "absolute", left: 14, top: 14, right: 14, height: 26, display: "flex", overflow: "hidden" }}>{tabs}</div>
            <div style={{ position: "absolute", left: 14, top: 52, right: 14, height: 108, borderRadius: 8, background: "linear-gradient(120deg, rgba(0,217,255,0.22), rgba(231,184,77,0.12))" }} />
            <div style={{ position: "absolute", left: 18, top: 174, width: 520, height: 12, borderRadius: 6, background: "rgba(255,255,255,0.14)" }} />
            <div style={{ position: "absolute", left: 18, top: 194, width: 420, height: 12, borderRadius: 6, background: "rgba(255,255,255,0.09)" }} />
            <div style={{ position: "absolute", left: 18, top: 214, width: 460, height: 12, borderRadius: 6, background: "rgba(255,255,255,0.07)" }} />
            {Array.from({ length: 12 }, (_, i) => {
              const col = i % 4, row = Math.floor(i / 4);
              return (
                <div key={i} style={{ position: "absolute", left: 14 + col * 210, top: 248 + row * 58, width: 200, height: 50, borderRadius: 6, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}>
                  <div style={{ position: "absolute", left: 8, top: 8, width: 34, height: 34, borderRadius: 5, background: "linear-gradient(140deg, rgba(0,217,255,0.30), rgba(231,184,77,0.18))" }} />
                  <div style={{ position: "absolute", left: 50, top: 12, width: 120, height: 7, borderRadius: 3, background: "rgba(255,255,255,0.14)" }} />
                  <div style={{ position: "absolute", left: 50, top: 26, width: 90, height: 7, borderRadius: 3, background: "rgba(255,255,255,0.09)" }} />
                </div>
              );
            })}
          </div>
        </div>
      </AbsoluteFill>
      <OverwhelmCounter frame={frame} />
    </AbsoluteFill>
  );
}

function OverwhelmCounter({ frame }: { frame: number }) {
  const a5 = A.ACT5_OVERWHELM;
  const o = interpolate(frame, [a5.COUNTER_IN, a5.COUNTER_IN + 18], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const count = Math.round(interpolate(frame, [a5.COUNTER_IN, a5.COUNTER_IN + 70], [12, 47], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }));
  const jitter = Math.sin(frame / 2) * 1.5;
  return (
    <AbsoluteFill style={{ justifyContent: "flex-start", alignItems: "flex-start", paddingTop: 96, paddingLeft: 70, opacity: o }}>
      <div style={{ transform: `translateX(${jitter}px)`, background: "rgba(120,15,20,0.40)", border: "1px solid rgba(255,107,107,0.45)", borderRadius: 999, padding: "13px 28px", color: "#FF6B6B", fontFamily: "Sora, system-ui, sans-serif", fontSize: 28, fontWeight: 700, letterSpacing: 1 }}>
        {count} open tabs
      </div>
    </AbsoluteFill>
  );
}

// ─── ACT6: THE ABANDONMENT — one isolated folder, a cursor that won't click, then the lid closes ──
function AbandonFolder({ frame }: { frame: number }) {
  const a6 = A.ACT6_ABANDON;
  const a = interpolate(frame, [a6.FOLDER_IN, a6.FOLDER_SETTLE], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const zoom = interpolate(frame, [a6.FOLDER_IN, a6.FOLDER_SETTLE + 60], [1, 1.06], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const cells = 41, perRow = 8;
  const logoCells = [];
  for (let i = 0; i < cells; i++) {
    const r = Math.floor(i / perRow), c = i % perRow;
    const delay = r * 4;
    const ca = interpolate(a * 100, [delay, delay + 14], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const logo = BRAND_LOGOS[i % BRAND_LOGOS.length];
    logoCells.push(
      <div key={i} style={{ position: "absolute", left: 34 + c * 92, top: 76 + r * 84, width: 56, height: 56, opacity: ca * 0.85, filter: "grayscale(1) brightness(0.82)", display: "flex", justifyContent: "center", alignItems: "center" }}>
        <Img src={staticFile(logo)} style={{ width: 46, height: 46, objectFit: "contain" }} />
      </div>
    );
  }
  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
      {/* glow centered on the folder makes it the unambiguous focal point */}
      <AbsoluteFill style={{ background: "radial-gradient(40% 40% at 50% 50%, rgba(231,184,77,0.18) 0%, rgba(7,9,13,0) 70%)", mixBlendMode: "screen" }} />
      <div style={{ position: "relative", width: 820, height: 600, opacity: a, transform: `translate(${300 - 300 * a}px, 0) scale(${zoom})`, transformOrigin: "center", zIndex: 2 }}>
        <div style={{ position: "absolute", left: 0, top: -30, width: 200, height: 34, background: "linear-gradient(180deg, rgba(40,50,66,0.98), rgba(26,34,48,0.98))", border: "1.5px solid rgba(255,255,255,0.22)", borderBottom: "none", borderTopLeftRadius: 12, borderTopRightRadius: 12 }} />
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, background: "linear-gradient(180deg, rgba(26,34,48,0.96), rgba(14,20,30,0.96))", border: "1.5px solid rgba(255,255,255,0.22)", borderRadius: 18, overflow: "hidden", boxShadow: "0 40px 120px rgba(0,0,0,0.8), inset 0 0 60px rgba(231,184,77,0.06)" }}>
          <div style={{ position: "absolute", top: 24, left: 30, color: GOLD, fontFamily: "Sora, system-ui, sans-serif", fontSize: 28, fontWeight: 700 }}>AI Tools</div>
          {logoCells}
        </div>
      </div>
    </AbsoluteFill>
  );
}

function HoverCursor({ frame }: { frame: number }) {
  const a6 = A.ACT6_ABANDON;
  const approach = interpolate(frame, [a6.CURSOR_DRIFT, a6.CURSOR_HOVER], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const retreat = interpolate(frame, [a6.CURSOR_HOVER + 28, a6.CURSOR_HOVER + 58], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const x = interpolate(approach, [0, 1], [640, 980]) - retreat * 360;
  const y = 360 + Math.sin(frame / 14) * 6;
  const press = interpolate(frame, [a6.CURSOR_HOVER, a6.CURSOR_HOVER + 10], [1, 0.9], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", left: x, top: y, transform: `scale(${press})`, filter: "drop-shadow(0 4px 8px rgba(0,0,0,0.7))" }}>
        <svg width="34" height="34" viewBox="0 0 24 24" fill="none"><path d="M4 2 L4 20 L9 15 L12 22 L15 21 L12 14 L19 14 Z" fill="white" stroke="rgba(0,0,0,0.6)" strokeWidth="1" /></svg>
      </div>
    </AbsoluteFill>
  );
}

function LidClose({ frame }: { frame: number }) {
  const a6 = A.ACT6_ABANDON;
  const cover = interpolate(frame, [a6.LID_CLOSE, a6.LID_END], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  if (cover <= 0) return null;
  return <AbsoluteFill style={{ background: "#05070B", transform: `translateY(${-(1 - cover) * 1080}px)` }} />;
}

// ─── ACT7: RESOLUTION — the payoff: a SINGLE tool, finished. No channel sign-off (this is a continuation). ──
function ResolutionScene({ frame }: { frame: number }) {
  const a7 = A.ACT7_RESOLVE;
  const e = Math.max(0, spring({ frame: frame - a7.DOT_IN, fps: 30, config: { damping: 16, stiffness: 80, mass: 1 } }));
  const glow = 0.5 + 0.5 * Math.sin(frame / 14);
  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
      {/* gold light pools around the one tool — the hero owns the frame */}
      <AbsoluteFill style={{ background: `radial-gradient(42% 42% at 50% 52%, rgba(231,184,77,${0.16 + 0.06 * glow}) 0%, rgba(7,9,13,0) 70%)`, mixBlendMode: "screen" }} />
      <div style={{ position: "relative", width: 1040, height: 664, opacity: Math.min(1, e), transform: `scale(${0.86 + 0.14 * e})`, transformOrigin: "center", zIndex: 2 }}>
        <Img src={staticFile("04_DEVICE_FRAMES/Desktop/desktop.svg")} style={{ width: 1040, height: 664, objectFit: "contain" }} />
        <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center" }}>
          <div style={{ width: 172, height: 172, borderRadius: "50%", border: "1px solid rgba(231,184,77,0.45)", background: "radial-gradient(circle, rgba(231,184,77,0.18) 0%, rgba(231,184,77,0) 70%)", display: "flex", justifyContent: "center", alignItems: "center", boxShadow: `0 0 ${40 + 30 * glow}px rgba(231,184,77,${0.25 + 0.15 * glow})` }}>
            <Img src={staticFile(BRAND_LOGOS[1])} style={{ width: 96, height: 96, objectFit: "contain" }} />
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
}

// ─── Main scene ────────────────────────────────────────────────────────────────
export default function CollectorCinematic({
  footage = null,
  logoFiles = BRAND_LOGOS,
}: CollectorCinematicProps) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const actIndex = actIndexFor(frame);

  const nodeCount = frame < A.ACT2_BOOKMARK.START
    ? Math.min(8, Math.floor(frame / 20) + 3)
    : Math.round(interpolate(frame, [A.ACT2_BOOKMARK.START, A.ACT2_BOOKMARK.END], [8, 40], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }));

  const act4Glow = interpolate(frame, [A.ACT4_NEVER.PULLBACK_START, A.ACT4_NEVER.PULLBACK_END], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const tint = actIndex === 0 ? "rgba(10,30,60,0.4)"
    : actIndex === 1 ? "rgba(0,60,90,0.35)"
    : actIndex === 2 ? "rgba(90,60,15,0.35)"
    : actIndex === 3 ? "rgba(90,15,20,0.35)"
    : actIndex === 4 ? "rgba(120,18,28,0.42)"
    : actIndex === 5 ? "rgba(6,8,14,0.62)"
    : "rgba(20,16,4,0.50)";

  return (
    <AbsoluteFill style={{ background: "#07090D", overflow: "hidden" }}>
      {/* Background: gradient mesh over the void (z-0) — never flat (#07090D) */}
      <AbsoluteFill style={{ background: `radial-gradient(60% 50% at 18% 20%, rgba(0,120,160,0.16) 0%, rgba(7,9,13,0) 60%), radial-gradient(55% 50% at 85% 85%, rgba(231,184,77,0.12) 0%, rgba(7,9,13,0) 60%), radial-gradient(70% 60% at 50% 50%, rgba(0,60,80,0.10) 0%, rgba(7,9,13,0) 70%)` }} />

      {/* Ambient particles (z-10) — only in the opening beats; suppressed in ACT5-7 so the hero owns the frame */}
      <AbsoluteFill style={{ opacity: actIndex <= 3 ? 0.45 : 0, filter: "blur(8px)" }}>
        <NodeGrid activeCount={nodeCount} totalNodes={40} />
      </AbsoluteFill>

      {/* Tint overlay (normal blend — mixBlendMode soft-light is unstable in headless GPU-less render) */}
      <AbsoluteFill style={{ background: tint, opacity: 0.5 }} />

      {/* ACT4 center spotlight — lifts the void, focuses the hero */}
      <AbsoluteFill
        style={{
          background: `radial-gradient(42% 42% at 50% 50%, rgba(255,255,255,${(0.05 * act4Glow).toFixed(3)}) 0%, rgba(0,217,255,${(0.05 * act4Glow).toFixed(3)}) 30%, rgba(7,9,13,0) 70%)`,
          mixBlendMode: "screen",
        }}
      />

      {/* HERO: real brand-logo swarm flying in from all directions (z-50) — through ACT4 */}
      {actIndex <= 3 && <LogoSwarm files={logoFiles} />}

      {/* ACT5: THE OVERWHELM — a cluttered workstation, distinct visual system (z-50) */}
      {actIndex === 4 && <OverwhelmScene frame={frame} />}

      {/* ACT6: THE ABANDONMENT — one isolated folder + a cursor that won't click + lid close (z-50) */}
      {actIndex === 5 && <AbandonFolder frame={frame} />}
      {actIndex === 5 && <HoverCursor frame={frame} />}
      {actIndex === 5 && <LidClose frame={frame} />}

      {/* ACT7: RESOLUTION — from black, a single gold focal point, calm (z-50) */}
      {actIndex === 6 && <ResolutionScene frame={frame} />}

      {/* Typography: SUPPORTING caption, anchored inside a glass panel (z-100) */}
      <CaptionBlock frame={frame} fps={fps} />

      {/* UI chrome: counters (z-150) */}
      {actIndex === 1 && <RollingCounter />}
      {actIndex === 4 && <OverwhelmCounter frame={frame} />}

      {/* Post-FX (z-200) */}
      <LightLeaks />
      <Vignette />
      <FilmGrain />

      {/* Narration: each line plays as its caption lands */}
      {NARRATION.map((n, i) => (
        <Sequence key={i} from={n.from} durationInFrames={n.frames}>
          <Audio src={staticFile(`audio/collector/${n.src}`)} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
}
