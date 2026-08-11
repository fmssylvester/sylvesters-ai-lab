// Theme for AvatarNarration90s — visual-direction.md palette + typography.
import { Easing } from 'remotion';

export const VOID = '#07090D';
export const CYAN = '#00D9FF';
export const GOLD = '#E7B84D';
export const NEUTRAL = '#8A8F98';
export const MUTED = 'rgba(233,238,255,0.52)';
export const WHITE = '#FFFFFF';

export const FONT = "'Switzer', system-ui, -apple-system, 'Segoe UI', sans-serif";
export const MONO = "'JetBrains Mono', 'SF Mono', ui-monospace, monospace";

export const EASE = Easing.bezier(0.16, 1, 0.3, 1);

export const hexA = (o: number) =>
  Math.round(Math.max(0, Math.min(1, o)) * 255).toString(16).padStart(2, '0');

export const breath = (frame: number, speed: number, amp: number, phase = 0) =>
  Math.sin(frame * speed + phase) * amp;
