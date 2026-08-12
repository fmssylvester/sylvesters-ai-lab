import { Easing } from 'remotion';

// AvatarNarration90s — "rich editorial" palette per client direction:
// flat ink-navy background (NO gradients, NO poster colors),
// ivory text, single brass accent, steel-blue secondary.
export const VOID = '#0E1B2C'; // flat rich navy — the background
export const DEEP = '#0A1626'; // darker wells (browser chrome, panels)
export const CREAM = '#F4EDE0'; // primary text — warm ivory
export const GOLD = '#C9A24B'; // brass — the heavyweight accent
export const SOFT = '#8FA8C8'; // steel blue — secondary accent
export const NEUTRAL = '#8FA0B5'; // muted steel for gray states
export const MUTED = 'rgba(244,237,224,0.55)';
export const WHITE = '#FFFFFF';

export const FONT = "'Playfair Display', Georgia, 'Times New Roman', serif";
export const BODY = "'Inter', system-ui, -apple-system, 'Segoe UI', sans-serif";
export const MONO = "'JetBrains Mono', 'SF Mono', ui-monospace, monospace";

export const EASE = Easing.bezier(0.16, 1, 0.3, 1);

export const hexA = (o: number) =>
  Math.round(Math.max(0, Math.min(1, o)) * 255).toString(16).padStart(2, '0');

export const breath = (frame: number, speed: number, amp: number, phase = 0) =>
  Math.sin(frame * speed + phase) * amp;