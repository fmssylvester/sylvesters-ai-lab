// AvatarNarration90s — master timeline (30fps, 1920x1080, 2728 frames = 90.94s)
// Approved storyboard: storyboards/n8n_full_script_1-storyboard-v2.md

export const FPS = 30;
export const WIDTH = 1920;
export const HEIGHT = 1080;
export const TOTAL = 2728;

// Scene windows (absolute frames), from the approved storyboard.
export const S = {
  S1: { start: 0, end: 317 }, // The Question (hook)
  S2: { start: 346, end: 662 }, // The Promise
  S3: { start: 691, end: 854 }, // The Lab
  S4: { start: 883, end: 1265 }, // The Problem
  S5: { start: 1291, end: 1462 }, // The Solution
  S6: { start: 1462, end: 1634 }, // The Agent's Promise
  S7: { start: 1663, end: 2095 }, // Pipeline Overview
  S8: { start: 2095, end: 2270 }, // Speed
  S9: { start: 2270, end: 2728 }, // Handoff to Screen
};

export const SCENES = [
  { id: 'S1', label: 'The Question', ...S.S1 },
  { id: 'S2', label: 'The Promise', ...S.S2 },
  { id: 'S3', label: 'The Lab', ...S.S3 },
  { id: 'S4', label: 'The Problem', ...S.S4 },
  { id: 'S5', label: 'The Solution', ...S.S5 },
  { id: 'S6', label: "The Agent's Promise", ...S.S6 },
  { id: 'S7', label: 'Pipeline Overview', ...S.S7 },
  { id: 'S8', label: 'Speed', ...S.S8 },
  { id: 'S9', label: 'Handoff to Screen', ...S.S9 },
];

// Scene-local helpers: a scene component receives `frame` = local frame (0-based
// within its own Sequence), and uses these windows' local deltas.
export const L = Object.fromEntries(
  SCENES.map((sc) => [sc.id, { start: 0, end: sc.end - sc.start, length: sc.end - sc.start }])
) as Record<string, { start: number; end: number; length: number }>;
