import { useCurrentFrame } from "remotion";
import { COLOR, FONT_DISPLAY } from "../../core/typography/typography";

interface KineticScriptProps {
  /** Word timestamps (seconds, relative to audio start) for this beat. */
  words: { word: string; start: number; end: number }[];
  /** Frame at which the audio (and thus word 0) begins. */
  audioStartFrame: number;
  fps?: number;
  frame?: number;
  fontSize?: number;
  /** How many recent words to keep on screen (rolling window). */
  maxWords?: number;
  align?: "left" | "center" | "right";
}

/**
 * Word-synced kinetic caption. Driven entirely by the Remotion frame: each word
 * lights up (brand accent) only while its [start,end] window is active, then
 * dims — a karaoke reveal tied to the actual voiceover (WhisperX timestamps).
 * A rolling window keeps the lower-third compact.
 */
export default function KineticScript({
  words,
  audioStartFrame,
  fps = 30,
  frame,
  fontSize = 46,
  maxWords = 9,
  align = "center",
}: KineticScriptProps) {
  const f = frame ?? useCurrentFrame();
  if (!words || words.length === 0) return null;

  const wf = words.map((w) => ({
    ...w,
    s: audioStartFrame + (w.start ?? 0) * fps,
    e: audioStartFrame + (w.end ?? 0) * fps,
  }));

  let active = -1;
  for (let i = 0; i < wf.length; i++) {
    if (wf[i].s <= f) active = i;
    else break;
  }
  if (active < 0) return null;

  const start = Math.max(0, active - maxWords + 2);
  const visible = wf.slice(start, active + 2);

  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        gap: "0.28em",
        justifyContent: align,
        maxWidth: 1500,
        fontSize,
        fontFamily: FONT_DISPLAY,
        fontWeight: 700,
        lineHeight: 1.25,
        textAlign: align,
      }}
    >
      {visible.map((w, i) => {
        const isActive = w.s <= f && f <= w.e;
        const isPast = f > w.e;
        const op = isActive ? 1 : isPast ? 0.4 : 0;
        return (
          <span
            key={i}
            style={{
              color: isActive ? COLOR.accent : COLOR.text,
              opacity: op,
              textShadow: isActive
                ? `0 0 24px ${COLOR.accent}66`
                : "none",
            }}
          >
            {w.word}
          </span>
        );
      })}
    </div>
  );
}
