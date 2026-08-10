export const SPACING = {
  xs: 8,
  sm: 16,
  md: 24,
  lg: 40,
  xl: 64,
};

export const RADIUS = {
  sm: 12,
  md: 20,
  lg: 28,
  pill: 999,
};

/* High-end SaaS / Apple-like palette on near-black */
export const COLORS = {
  bg: '#030405',
  canvas: '#0A0B12',
  white: '#FFFFFF',
  muted: '#9AA3B2',
  dim: '#5A6474',

  /* n8n brand accent = orange; we pivot the hero energy onto it */
  accent: '#FF6D5A',
  accentSoft: '#FF6D5A2e',

  cyan: '#38C6FF',
  violet: '#8A5CF6',
  emerald: '#2DD4BF',
  amber: '#F5B32F',
  coral: '#FF5A5F',

  /* glass utilities */
  glass: 'rgba(255,255,255,0.06)',
  glassStrong: 'rgba(255,255,255,0.10)',
  border: 'rgba(255,255,255,0.14)',
  borderAccent: 'rgba(56,198,255,0.40)',
} as const;

export const FONT = {
  display: "'Space Grotesk', 'Inter', system-ui, sans-serif",
  body: "'Inter', system-ui, sans-serif",
  mono: "'JetBrains Mono', monospace",
} as const;

/* Spring physics for the "buttery overshoot" signature */
export const SPRINGS = {
  /* pop-in: strong stiffness, low damping => overshoot snap-back */
  pop: { damping: 11, stiffness: 190, mass: 0.9 },
  /* punch card: medium */
  card: { damping: 13, stiffness: 150, mass: 1 },
  /* camera settle: heavier, minimal bounce */
  settle: { damping: 16, stiffness: 90, mass: 1.2 },
  /* text drift-in */
  text: { damping: 14, stiffness: 120, mass: 1 },
} as const;