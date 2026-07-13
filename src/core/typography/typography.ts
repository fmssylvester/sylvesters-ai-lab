// Typography system for AI Lab — the locked standard for all builds.
// Display (hero/kinetic): Melodrama — serif with high contrast.
// Body / UI / lower-thirds: Switzer — grotesk.
// Accent (timestamps, data, tool versions only): JetBrains Mono
//   (Fragment Mono is not on Fontshare; JetBrains Mono is the closest
//   Fontshare mono and is used here as the technical/accent face).

export const FONT_DISPLAY = "'Melodrama', Georgia, 'Times New Roman', serif";
export const FONT_BODY = "'Switzer', system-ui, -apple-system, 'Segoe UI', sans-serif";
export const FONT_MONO = "'JetBrains Mono', ui-monospace, 'SFMono-Regular', monospace";

// Color tokens (text system standard).
export const COLOR = {
  text: "#FFFFFF", // primary text on dark navy
  textSoft: "#F1F5F9", // softer white for lower-thirds (avoids harsh contrast)
  accent: "#60A5FA", // AI Lab blue — keywords, highlights, active UI only
  bg: "#07080F", // dark navy base
  muted: "#94A3B8", // soft slate — captions, timestamps, recede
} as const;

// Size helpers (px at 1920x1080; scale proportionally elsewhere).
// Hero/statement (Melodrama): 96–140 depending on line length, bold.
export const heroSize = (len: number): number => {
  if (len > 22) return 96;
  if (len > 14) return 116;
  if (len > 8) return 130;
  return 140;
};

export const SIZE = {
  heroMax: 140,
  heroMin: 96,
  sectionTitle: 68, // 64–72
  caption: 40, // 36–44
  uiLabel: 26, // 24–28
  accent: 20, // 18–22
} as const;

// Standard font stacks for the three roles, with sensible weights.
export const TYPE = {
  hero: { font: FONT_DISPLAY, weight: 700 },
  sectionTitle: { font: FONT_DISPLAY, weight: 600 },
  caption: { font: FONT_BODY, weight: 500 },
  uiLabel: { font: FONT_BODY, weight: 500 },
  accent: { font: FONT_MONO, weight: 400 },
} as const;
