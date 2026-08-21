// Part 1 frame plan — "The Motion-First Secret" (vertical 9:16, 30fps).
// Durations derived from the script's timestamps (0:00 / 1:30 / 3:45 / 6:15 / 8:30).
// Pure constants — no content here (words live in part1Runtime.json).

export const FPS = 30;

export const PART1 = {
  HOOK: { start: 0, end: 600 },
  trap: { start: 600, end: 2700 },
  shift: { start: 2700, end: 6750 },
  formula: { start: 6750, end: 11250 },
  demo: { start: 11250, end: 13500 },
  limits: { start: 13500, end: 15300 },
  verdict: { start: 15300, end: 16200 },
  cta: { start: 16200, end: 17400 },
} as const;

export type SectionId = keyof typeof PART1;

export const TOTAL = 17400;

export function sectionAtFrame(frame: number): SectionId {
  for (const [id, r] of Object.entries(PART1)) {
    if (frame >= r.start && frame < r.end) return id as SectionId;
  }
  return "verdict";
}

export function progressIn(frame: number, id: SectionId): number {
  const r = PART1[id];
  return (frame - r.start) / (r.end - r.start);
}
