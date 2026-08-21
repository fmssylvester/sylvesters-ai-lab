// Shared phrase animation for Part 1 — word-by-word reveal of the spoken
// script line, with gold emphasis on key motion-first terms. Used by both the
// orchestrator (Hook/CTA) and the beat renderer (section panels).

import React from "react";

export interface Phrase {
  shown: string;
  op: number;
}

export const GOLD_WORDS = new Set([
  "motion-first", "camera", "temporal", "morphing", "hard", "truth", "ai",
  "physics", "environmental", "prompt", "chaotic", "reference", "image", "time",
]);

export const renderGold = (text: string): React.ReactNode =>
  text.split(/(\s+)/).map((tok, i) => {
    const w = tok.toLowerCase().replace(/[^a-z0-9-]/g, "");
    if (GOLD_WORDS.has(w)) return <span key={i} style={{ color: "#E7B84D", fontWeight: 700 }}>{tok}</span>;
    return <React.Fragment key={i}>{tok}</React.Fragment>;
  });

export const phraseState = (text: string, local: number, startPad = 40): Phrase => {
  const words = text.split(/\s+/).filter(Boolean);
  const PER = 8;
  const chunkDur = 50;
  const total = Math.ceil(words.length / PER);
  const idx = Math.max(0, Math.min(total - 1, Math.floor((local - startPad) / chunkDur)));
  const chunk = words.slice(idx * PER, idx * PER + PER);
  const within = local - startPad - idx * chunkDur;
  const rev = Math.floor(interpolate(within, [0, chunkDur * 0.7], [0, PER], { extrapolateRight: "clamp" }));
  return {
    shown: chunk.slice(0, rev).join(" "),
    op: interpolate(within, [0, 10], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
  };
};

// local helper (kept here to avoid importing interpolate everywhere)
function interpolate(
  input: number,
  inputRange: [number, number],
  outputRange: [number, number],
  opts?: { extrapolateLeft?: "clamp"; extrapolateRight?: "clamp" }
): number {
  const [i0, i1] = inputRange;
  const [o0, o1] = outputRange;
  if (input <= i0) return opts?.extrapolateLeft === "clamp" ? o0 : o0 + ((input - i0) / (i1 - i0)) * (o1 - o0);
  if (input >= i1) return opts?.extrapolateRight === "clamp" ? o1 : o1 + ((input - i1) / (i1 - i0)) * (o1 - o0);
  const t = (input - i0) / (i1 - i0);
  return o0 + t * (o1 - o0);
}
