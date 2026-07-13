import {
  AbsoluteFill,
  Img,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
} from "remotion";
import { GlassCard, GlowText, Counter, GradientBackground, Vignette, FilmGrain } from "../../components/motion";
import AnimatedCursor from "../../components/browser/AnimatedCursor";
import { COLLECTOR, CAPTIONS } from "./collectorTimeline";

const GOLD = "#E7B84D";
const RED = "#FF6B6B";
const INK = "#F5F7FA";

// ─── Real footage foundation (render-safe frame sequence) ────────────────────
const FOOTAGE_DIR = "footage/darkdesk";
const FOOTAGE_TOTAL = 393;
const pad = (n: number) => String(n).padStart(3, "0");

// 13 real brand logos → cycled to fill the 40-slot bookmark grid
const LOGO_FILES = [
  "openai.svg", "anthropic.svg", "figma.svg", "notion.svg", "vercel.svg",
  "canva.svg", "github.svg", "perplexity.svg", "zapier.svg", "n8n.svg",
  "googlegemini.svg", "adobephotoshop.svg", "make.svg",
];
const BOOKMARKS = Array.from({ length: 40 }, (_, i) => LOGO_FILES[i % LOGO_FILES.length]);

const ACT_ACCENT = [INK, GOLD, GOLD, RED];

// ─── Bookmark logo chip ──────────────────────────────────────────────────────
function LogoChip({ file, dim, appearsAt }: { file: string; dim: boolean; appearsAt: number }) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  void fps;
  const pop = spring({ frame: frame - appearsAt, fps, config: { damping: 16, stiffness: 150, mass: 0.7 } });
  const scale = 0.6 + pop * 0.4;
  return (
    <div
      style={{
        width: 58, height: 58, borderRadius: 13,
        background: "rgba(255,255,255,0.05)",
        border: dim ? "1px solid rgba(231,184,77,0.25)" : "1px solid rgba(255,255,255,0.1)",
        display: "flex", alignItems: "center", justifyContent: "center",
        transform: `scale(${scale})`,
        filter: dim ? "grayscale(1) brightness(0.55)" : "none",
        opacity: (dim ? 0.55 : 1) * pop,
        position: "relative",
        boxShadow: "0 6px 20px rgba(0,0,0,0.4)",
      }}
    >
      <Img src={staticFile(`logos/${file}`)} style={{ width: 32, height: 32, objectFit: "contain" }} />
      {dim && (
        <div style={{ position: "absolute", bottom: 3, fontSize: 10, fontWeight: 700, color: GOLD, letterSpacing: "0.04em" }}>
          0%
        </div>
      )}
    </div>
  );
}

// ─── Glass bookmarks panel ───────────────────────────────────────────────────
function BookmarksPanel({ frame, width, height }: { frame: number; width: number; height: number }) {
  const A = COLLECTOR;
  const panelStart = A.ACT2_BOOKMARK.START;
  const lastTenDim = frame >= A.ACT3_UNEXPLORED.TABS_REVEAL;

  // chips reveal across ACT2 (1..40) with a quick stagger
  const revealCount = frame < panelStart
    ? 0
    : Math.min(40, Math.floor(interpolate(frame, [panelStart, A.ACT2_BOOKMARK.STAR_CLICK], [0, 40], { extrapolateRight: "clamp" })));

  const panelW = 720;
  const panelH = 420;
  const px = width / 2 - panelW / 2;
  const py = height / 2 - panelH / 2 - 20;

  return (
    <div style={{ position: "absolute", left: px, top: py, zIndex: 20 }}>
      <GlassCard width={panelW} height={panelH} padding={26} enterDelay={panelStart} enterFrom="scale" glowColor="rgba(0,217,255,0.12)">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <div style={{ fontSize: 15, fontWeight: 700, letterSpacing: "0.14em", color: "rgba(245,247,250,0.85)" }}>
            AI TOOLS · BOOKMARKS
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, color: GOLD }}>
            <StarMark active={frame >= A.ACT2_BOOKMARK.STAR_CLICK} />
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(8, 1fr)", gap: 12, justifyContent: "center" }}>
          {BOOKMARKS.map((file, i) => (
            <div key={i} style={{ opacity: i < revealCount ? 1 : 0 }}>
              <LogoChip file={file} dim={lastTenDim && i >= 30} appearsAt={panelStart + i * 2} />
            </div>
          ))}
        </div>

        {/* Counter HUD (31 → 40) */}
        <div style={{ position: "absolute", right: 26, bottom: 18, display: "flex", alignItems: "baseline", gap: 10 }}>
          <Counter
            from={A.ACT2_BOOKMARK.COUNTER_FROM}
            to={A.ACT2_BOOKMARK.COUNTER_TO}
            duration={A.ACT2_BOOKMARK.COUNTER_END - A.ACT2_BOOKMARK.COUNTER_START}
            delay={A.ACT2_BOOKMARK.COUNTER_START}
            fontSize={46}
            color={GOLD}
          />
          <div style={{ fontSize: 13, color: "rgba(245,247,250,0.6)", letterSpacing: "0.04em" }}>tools bookmarked</div>
        </div>
      </GlassCard>
    </div>
  );
}

function StarMark({ active }: { active: boolean }) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const pop = spring({ frame: frame - COLLECTOR.ACT2_BOOKMARK.STAR_CLICK, fps, config: { damping: 10, stiffness: 200 } });
  return (
    <div
      style={{
        width: 22, height: 22,
        transform: active ? `scale(${0.8 + pop * 0.4})` : "scale(0.8)",
        color: active ? GOLD : "rgba(245,247,250,0.4)",
        filter: active ? `drop-shadow(0 0 10px ${GOLD}aa)` : "none",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 20,
      }}
    >
      ★
    </div>
  );
}

// ─── Caption (lower-third whisper) ───────────────────────────────────────────
function Caption() {
  const frame = useCurrentFrame();
  const current = CAPTIONS.find((c) => frame >= c.in && frame <= c.out);
  if (!current) return null;
  const accent = ACT_ACCENT[CAPTIONS.indexOf(current)];
  const keywords = Object.fromEntries(current.emphasis.map((e) => [e.replace(/[.,!?;:]/g, ""), accent]));
  return (
    <GlowText
      text={current.text}
      keywords={keywords}
      fontSize={34}
      color="rgba(245,247,250,0.95)"
      keywordColor={accent}
      maxWidth={1100}
      style={{
        position: "absolute", bottom: 64, left: 0, right: 0, textAlign: "center",
        textShadow: "0 2px 24px rgba(0,0,0,0.85), 0 0 40px rgba(0,0,0,0.4)",
      }}
    />
  );
}

// ─── Main opening ────────────────────────────────────────────────────────────
export default function OpeningSequence() {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const A = COLLECTOR;
  const TOTAL = A.TOTAL_FRAMES;

  // Footage frame mapping (plays the real clip across the scene)
  const fIdx = Math.min(FOOTAGE_TOTAL, Math.max(1, Math.floor((frame / TOTAL) * FOOTAGE_TOTAL) + 1));
  const footSrc = staticFile(`${FOOTAGE_DIR}/f-${pad(fIdx)}.jpg`);

  // Camera: slow push-in, then pull-back in final act
  const pushIn = interpolate(frame, [0, TOTAL], [1.0, 1.08]);
  const pullback = interpolate(frame, [A.ACT4_NEVER.PULLBACK_START, A.ACT4_NEVER.PULLBACK_END], [1, 0.82], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });
  const footageScale = pushIn * pullback;

  // Despair grade in final act
  const dim = interpolate(frame, [A.ACT4_NEVER.NEWEST_DIM, A.ACT4_NEVER.PULLBACK_END], [1, 0.5], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });
  const desat = interpolate(frame, [A.ACT4_NEVER.NEWEST_DIM, A.ACT4_NEVER.PULLBACK_END], [1, 0.35], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });

  // Cursor path: rests bottom-left, moves to the bookmark star in ACT2
  const cursorPath = [
    { frame: 0, x: width * 0.2, y: height * 0.78 },
    { frame: A.ACT2_BOOKMARK.CURSOR_MOVE - 20, x: width * 0.4, y: height * 0.62 },
    { frame: A.ACT2_BOOKMARK.STAR_CLICK, x: width / 2 + 300, y: height / 2 - 190 },
  ];

  return (
    <AbsoluteFill style={{ background: "#07090D", overflow: "hidden" }}>
      {/* Real footage foundation */}
      <AbsoluteFill style={{ transform: `scale(${footageScale})`, transformOrigin: "50% 50%" }}>
        <Img
          src={footSrc}
          style={{
            width: "100%", height: "100%", objectFit: "cover",
            filter: `brightness(${0.95 * dim}) saturate(${desat}) contrast(1.05)`,
          }}
        />
        {/* key-light wash so overlays feel lit, not pasted */}
        <AbsoluteFill
          style={{ background: "radial-gradient(ellipse 46% 42% at 50% 48%, rgba(0,217,255,0.08) 0%, rgba(0,0,0,0) 70%)" }}
        />
      </AbsoluteFill>

      {/* Ambient cyan bloom (depth) */}
      <GradientBackground variant="bloom" bloomColor="rgba(0,120,160,0.10)" bloomPosition={{ x: "50%", y: "44%" }} />

      {/* Glass bookmarks HUD (ACT2+) */}
      {frame >= A.ACT2_BOOKMARK.START - 30 && (
        <BookmarksPanel frame={frame} width={width} height={height} />
      )}

      {/* Animated cursor — bookmarks the star */}
      <div style={{ position: "absolute", inset: 0, zIndex: 60 }}>
        <AnimatedCursor path={cursorPath} clickFrame={A.ACT2_BOOKMARK.STAR_CLICK} size={26} />
      </div>

      {/* Narration caption */}
      <Caption />

      {/* Post-FX */}
      <Vignette />
      <FilmGrain />
    </AbsoluteFill>
  );
}
