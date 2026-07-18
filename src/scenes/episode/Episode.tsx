import { useCurrentFrame, interpolate, spring } from "remotion";
import { FONT_DISPLAY, FONT_BODY, FONT_MONO, COLOR } from "../../core/typography/typography";
import { motionTokens } from "../../core/motion/motionTokens";

const INTRO = 75; // frames of logo splash before narration
const OUTRO = 90; // frames of CTA card after narration

type Section = { heading: string; voiceover: string };
type Props = {
  title: string;
  hook: string;
  sections: Section[];
  cta: string;
  audioSrc?: string;
  audioDurationInFrames: number;
  channelName?: string;
};

export default function Episode({
  title,
  hook,
  sections,
  cta,
  audioSrc,
  audioDurationInFrames,
  channelName = "Sylvester's AI Lab",
}: Props) {
  const frame = useCurrentFrame();
  const fps = 30;

  const beats = [
    { kind: "hook", label: "THE HOOK", text: hook },
    ...sections.map((s) => ({ kind: "section", label: s.heading, text: s.voiceover })),
    { kind: "cta", label: "THE VERDICT", text: cta },
  ];

  const narrStart = INTRO;
  const narrEnd = INTRO + Math.max(audioDurationInFrames, 1);
  const total = narrEnd + OUTRO;

  const totalWeight = beats.reduce(
    (a, b) => a + Math.max(b.text.split(/\s+/).length, 1),
    0
  );
  let acc = narrStart;
  const ranges = beats.map((b) => {
    const len = (Math.max(b.text.split(/\s+/).length, 1) / totalWeight) * (narrEnd - narrStart);
    const start = acc;
    acc += len;
    return { start, end: acc };
  });

  const activeIdx = ranges.findIndex((r) => frame >= r.start && frame < r.end);
  const idx = activeIdx === -1 ? (frame < narrStart ? -1 : beats.length - 1) : activeIdx;
  const inNarration = frame >= narrStart && frame < narrEnd;

  // Static gradient backdrop (no per-frame repaint — keeps headless render fast).
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        background: COLOR.bg,
        overflow: "hidden",
        position: "relative",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: -160,
          background:
            "radial-gradient(700px circle at 28% 30%, rgba(0,217,255,0.20), transparent 60%), radial-gradient(620px circle at 74% 66%, rgba(231,184,77,0.13), transparent 60%), radial-gradient(560px circle at 52% 92%, rgba(139,92,246,0.14), transparent 60%)",
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(circle at 50% 46%, transparent 28%, rgba(0,0,0,0.74) 100%)",
        }}
      />

      {/* Audio is muxed in post-render via ffmpeg (render_trigger.py),
          which avoids Remotion's headless <Audio> duration-load timeout. */}

      {/* Intro splash */}
      {frame < narrStart && (
        <IntroSplash frame={frame} fps={fps} channelName={channelName} title={title} />
      )}

      {/* Narration cards */}
      {inNarration && idx >= 0 && (
        <NarrationCard
          frame={frame}
          entered={frame - ranges[idx].start}
          fps={fps}
          label={beats[idx].label}
          heading={beats[idx].kind === "section" ? beats[idx].label : ""}
          text={beats[idx].text}
        />
      )}

      {/* Outro CTA */}
      {frame >= narrEnd && (
        <OutroCard frame={frame} fps={fps} channelName={channelName} cta={cta} />
      )}

      {/* Progress + channel bug */}
      <div
        style={{
          position: "absolute",
          left: 0,
          bottom: 0,
          height: 5,
          width: `${(frame / total) * 100}%`,
          background: "linear-gradient(90deg, #00D9FF, #E7B84D)",
          zIndex: 20,
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: 34,
          right: 48,
          fontSize: 22,
          letterSpacing: "0.28em",
          textTransform: "uppercase",
          color: COLOR.muted,
          fontFamily: FONT_BODY,
          zIndex: 20,
        }}
      >
        {channelName}
      </div>
    </div>
  );
}

function IntroSplash({
  frame,
  fps,
  channelName,
  title,
}: {
  frame: number;
  fps: number;
  channelName: string;
  title: string;
}) {
  const s = spring({ frame, fps, config: motionTokens.spring.hero });
  const scale = interpolate(s, [0, 1], [0.7, 1]);
  const op = interpolate(frame, [0, 18], [0, 1], { extrapolateLeft: "clamp" });
  return (
    <div
      style={{
        zIndex: 10,
        textAlign: "center",
        opacity: op,
        transform: `scale(${scale})`,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 22,
      }}
    >
      <div
        style={{
          fontSize: 30,
          letterSpacing: "0.5em",
          textTransform: "uppercase",
          color: "#00D9FF",
          fontFamily: FONT_MONO,
        }}
      >
        {channelName}
      </div>
      <div
        style={{
          fontSize: 84,
          fontWeight: 700,
          fontFamily: FONT_DISPLAY,
          color: COLOR.text,
          maxWidth: 1500,
          lineHeight: 1.05,
          textShadow: "0 0 54px rgba(0,217,255,0.35)",
        }}
      >
        {title}
      </div>
    </div>
  );
}

function NarrationCard({
  frame,
  entered,
  fps,
  label,
  heading,
  text,
}: {
  frame: number;
  entered: number;
  fps: number;
  label: string;
  heading: string;
  text: string;
}) {
  const s = spring({ frame: entered, fps, config: motionTokens.spring.soft });
  const rise = interpolate(s, [0, 1], [60, 0]);
  const op = interpolate(s, [0, 1], [0, 1], { extrapolateLeft: "clamp" });
  return (
    <div
      style={{
        zIndex: 10,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 26,
        maxWidth: 1560,
        opacity: op,
        transform: `translateY(${rise}px)`,
      }}
    >
      <div
        style={{
          fontSize: 22,
          letterSpacing: "0.42em",
          textTransform: "uppercase",
          color: "#E7B84D",
          fontFamily: FONT_MONO,
        }}
      >
        {label}
      </div>
      {heading ? (
        <div
          style={{
            fontSize: 44,
            fontWeight: 600,
            fontFamily: FONT_DISPLAY,
            color: "#00D9FF",
          }}
        >
          {heading}
        </div>
      ) : null}
      <div
        style={{
          fontSize: 66,
          fontWeight: 600,
          fontFamily: FONT_DISPLAY,
          color: COLOR.text,
          lineHeight: 1.18,
          textAlign: "center",
          textShadow: "0 2px 10px rgba(0,0,0,0.6)",
        }}
      >
        {text}
      </div>
    </div>
  );
}

function OutroCard({
  frame,
  fps,
  channelName,
  cta,
}: {
  frame: number;
  fps: number;
  channelName: string;
  cta: string;
}) {
  const s = spring({ frame: frame - (frame - 0), fps, config: motionTokens.spring.soft });
  const op = interpolate(frame, [0, 12], [0, 1], { extrapolateLeft: "clamp" });
  return (
    <div
      style={{
        zIndex: 10,
        textAlign: "center",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 24,
        opacity: op,
      }}
    >
      <div
        style={{
          fontSize: 30,
          letterSpacing: "0.42em",
          textTransform: "uppercase",
          color: "#E7B84D",
          fontFamily: FONT_MONO,
        }}
      >
        {channelName}
      </div>
      <div
        style={{
          fontSize: 60,
          fontWeight: 700,
          fontFamily: FONT_DISPLAY,
          color: COLOR.text,
          maxWidth: 1500,
          lineHeight: 1.2,
          textShadow: "0 0 54px rgba(0,217,255,0.3)",
        }}
      >
        {cta}
      </div>
      <div
        style={{
          marginTop: 14,
          fontSize: 28,
          fontFamily: FONT_BODY,
          color: COLOR.muted,
          letterSpacing: "0.04em",
        }}
      >
        Subscribe for more AI lab experiments ▸
      </div>
    </div>
  );
}
