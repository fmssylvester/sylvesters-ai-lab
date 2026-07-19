import { useMemo } from "react";
import { EPISODE } from "../timeline/episodeTimeline";

/* ------------------------------------------------------------------ */
/* Types                                                              */
/* ------------------------------------------------------------------ */
export type Word = { word: string; start: number; end: number };

export type BeatKind = "hook" | "section" | "cta";

export interface Beat {
  index: number;
  kind: BeatKind;
  startFrame: number;
  endFrame: number;
  text: string; // spoken line for this beat
  heading?: string; // section heading (sections only)
  visualTreatment?: string;
  mood?: string;
  suggestedComponents?: string[];
  assets: { name: string; path: string }[];
  broll?: string;
  words: Word[]; // word timestamps falling within [startFrame, endFrame]
}

export interface MasterTimeline {
  fps: number;
  introFrames: number;
  outroFrames: number;
  audioStartFrame: number;
  audioEndFrame: number;
  totalFrames: number;
  beats: Beat[];
}

/** Enriched runtime shape consumed from episodeRuntime.json. */
export interface EpisodeRuntime {
  title?: string;
  hook?: string;
  cta?: string;
  audioDurationInFrames?: number;
  durationInFrames?: number;
  wordTimestamps?: Word[];
  sections?: {
    heading?: string;
    voiceover?: string;
    visualTreatment?: string;
    mood?: string;
    suggestedComponents?: string[];
    assets?: { name: string; path: string }[];
    broll?: string;
  }[];
}

const DEFAULT_TREATMENT: Record<BeatKind, string> = {
  hook: "text_statement",
  section: "text_statement",
  cta: "cta",
};
const DEFAULT_MOOD: Record<BeatKind, string> = {
  hook: "energetic",
  section: "calm",
  cta: "calm",
};

const MIN_BEAT_FRAMES = 24;

function wordCount(text: string): number {
  const t = (text || "").trim();
  if (!t) return 0;
  return t.split(/\s+/).length;
}

/* ------------------------------------------------------------------ */
/* Pure timeline computation (no frame dependency)                    */
/* ------------------------------------------------------------------ */
export function computeTimeline(rt: EpisodeRuntime): MasterTimeline {
  const fps = EPISODE.FPS;
  const intro = EPISODE.INTRO;
  const outro = EPISODE.OUTRO;
  const audio =
    rt.audioDurationInFrames ??
    Math.max(
      1,
      (rt.durationInFrames ?? intro + outro + 1) - intro - outro
    );

  type Raw = {
    kind: BeatKind;
    text: string;
    heading?: string;
    visualTreatment?: string;
    mood?: string;
    suggestedComponents?: string[];
    assets: { name: string; path: string }[];
    broll?: string;
  };

  const raw: Raw[] = [];
  raw.push({
    kind: "hook",
    text: rt.hook ?? "",
    visualTreatment: DEFAULT_TREATMENT.hook,
    mood: DEFAULT_MOOD.hook,
    assets: [],
  });
  for (const s of rt.sections ?? []) {
    raw.push({
      kind: "section",
      text: s.voiceover ?? "",
      heading: s.heading ?? "",
      visualTreatment: s.visualTreatment ?? DEFAULT_TREATMENT.section,
      mood: s.mood ?? DEFAULT_MOOD.section,
      suggestedComponents: s.suggestedComponents ?? [],
      assets: s.assets ?? [],
      broll: s.broll ?? "",
    });
  }
  raw.push({
    kind: "cta",
    text: rt.cta ?? "",
    visualTreatment: DEFAULT_TREATMENT.cta,
    mood: DEFAULT_MOOD.cta,
    assets: [],
  });

  // Allocate narration frames proportional to word count (min-clamped).
  const counts = raw.map((r) => Math.max(MIN_BEAT_FRAMES, wordCount(r.text)));
  const totalCount = counts.reduce((a, b) => a + b, 0) || 1;
  const alloc = counts.map((c) =>
    Math.max(MIN_BEAT_FRAMES, Math.round((c / totalCount) * audio))
  );
  // Fix rounding drift so the sum equals `audio` exactly.
  let drift = audio - alloc.reduce((a, b) => a + b, 0);
  let di = 0;
  while (drift !== 0) {
    const step = drift > 0 ? 1 : -1;
    alloc[di % alloc.length] += step;
    drift -= step;
    di++;
  }

  const audioStart = intro;
  let cursor = audioStart;
  const beats: Beat[] = raw.map((r, idx) => {
    const startFrame = cursor;
    const endFrame = cursor + alloc[idx];
    cursor = endFrame;
    const words = (rt.wordTimestamps ?? [])
      .filter((w) => {
        const f = audioStart + (w.start ?? 0) * fps;
        return f >= startFrame && f < endFrame;
      })
      .map((w) => ({ word: w.word, start: w.start, end: w.end }));
    return {
      index: idx,
      kind: r.kind,
      startFrame,
      endFrame,
      text: r.text,
      heading: r.heading,
      visualTreatment: r.visualTreatment,
      mood: r.mood,
      suggestedComponents: r.suggestedComponents,
      assets: r.assets,
      broll: r.broll,
      words,
    };
  });

  const audioEnd = cursor;
  const total = audioEnd + outro;
  return {
    fps,
    introFrames: intro,
    outroFrames: outro,
    audioStartFrame: audioStart,
    audioEndFrame: audioEnd,
    totalFrames: total,
    beats,
  };
}

/** Index of the beat active at `frame`, or -1 during the intro phase. */
export function activeBeatIndex(timeline: MasterTimeline, frame: number): number {
  const beats = timeline.beats;
  if (!beats.length) return -1;
  if (frame < beats[0].startFrame) return -1;
  for (let i = 0; i < beats.length; i++) {
    if (frame >= beats[i].startFrame && frame < beats[i].endFrame) return i;
  }
  return beats.length - 1;
}

/** React hook: memoized timeline for a given runtime. */
export function useMasterDirector(rt: EpisodeRuntime): MasterTimeline {
  return useMemo(() => computeTimeline(rt), [rt]);
}

/* ------------------------------------------------------------------ */
/* Lightweight singleton for non-React callers (back-compat)          */
/* ------------------------------------------------------------------ */
class MasterDirector {
  private last: MasterTimeline | null = null;
  compute(rt: EpisodeRuntime): MasterTimeline {
    this.last = computeTimeline(rt);
    return this.last;
  }
  get timeline(): MasterTimeline | null {
    return this.last;
  }
}
export default new MasterDirector();
