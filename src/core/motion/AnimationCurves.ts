// Reusable animation-curve building blocks (Asset Vault: "Animation curves").
//
// First-class, frame-driven easing library. Every curve is a pure function
// (t: 0..1) => eased 0..1, so it can be fed directly into Remotion's
// `interpolate(..., { easing })` or used to drive any CSS property by hand.
//
// Curves are intentionally named (not anonymous lambdas) so they become a
// traceable, reusable asset of the production system.

export type CurveName =
  | "standard"
  | "smooth"
  | "quint"
  | "stripe"
  | "stripeLong"
  | "expressive"
  | "easeIn"
  | "easeOut"
  | "easeInOut"
  | "expoIn"
  | "expoOut"
  | "expoInOut"
  | "circIn"
  | "circOut"
  | "circInOut"
  | "sineIn"
  | "sineOut"
  | "sineInOut"
  | "backIn"
  | "backOut"
  | "backInOut"
  | "elastic"
  | "bounce";

// ─── Cubic-bezier solver (Newton-Raphson + bisection fallback) ───────────────
function makeCubicBezier(x1: number, y1: number, x2: number, y2: number) {
  const cx = 3 * x1;
  const bx = 3 * (x2 - x1) - cx;
  const ax = 1 - cx - bx;
  const cy = 3 * y1;
  const by = 3 * (y2 - y1) - cy;
  const ay = 1 - cy - by;

  const sampleX = (t: number) => ((ax * t + bx) * t + cx) * t;
  const sampleY = (t: number) => ((ay * t + by) * t + cy) * t;
  const sampleDX = (t: number) => (3 * ax * t + 2 * bx) * t + cx;

  const solveX = (x: number) => {
    let t = x;
    for (let i = 0; i < 8; i++) {
      const xEst = sampleX(t) - x;
      if (Math.abs(xEst) < 1e-6) return t;
      const d = sampleDX(t);
      if (Math.abs(d) < 1e-6) break;
      t -= xEst / d;
    }
    let lo = 0;
    let hi = 1;
    t = x;
    while (lo < hi) {
      const xEst = sampleX(t);
      if (Math.abs(xEst - x) < 1e-6) return t;
      if (x > xEst) lo = t;
      else hi = t;
      t = (lo + hi) / 2;
    }
    return t;
  };

  return (t: number) => {
    if (t <= 0) return 0;
    if (t >= 1) return 1;
    return sampleY(solveX(t));
  };
}

// Brand easing curves mirror `motionTokens.easing` so the two stay in lockstep.
const BEZIERS: Record<string, [number, number, number, number]> = {
  standard: [0.4, 0.0, 0.2, 1],
  smooth: [0.22, 1, 0.36, 1],
  quint: [0.23, 1, 0.32, 1],
  stripe: [0.2, 1, 0.2, 1],
  stripeLong: [0.165, 0.84, 0.44, 1],
  expressive: [0.25, 1, 0.5, 1],
  easeIn: [0.4, 0.0, 1, 1],
  easeOut: [0.0, 0.0, 0.2, 1],
  easeInOut: [0.4, 0.0, 0.2, 1],
};

const clamp01 = (t: number) => (t < 0 ? 0 : t > 1 ? 1 : t);

// Closed-form curves (not expressible as a single cubic-bezier).
const FORMS: Record<string, (t: number) => number> = {
  expoIn: (t) => (t === 0 ? 0 : Math.pow(2, 10 * t - 10)),
  expoOut: (t) => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t)),
  expoInOut: (t) =>
    t === 0 ? 0 : t === 1 ? 1 : t < 0.5 ? Math.pow(2, 20 * t - 10) / 2 : (2 - Math.pow(2, -20 * t + 10)) / 2,
  circIn: (t) => 1 - Math.sqrt(1 - t * t),
  circOut: (t) => Math.sqrt(1 - (t - 1) * (t - 1)),
  circInOut: (t) =>
    t < 0.5 ? (1 - Math.sqrt(1 - (2 * t) ** 2)) / 2 : (Math.sqrt(1 - (-2 * t + 2) ** 2) + 1) / 2,
  sineIn: (t) => 1 - Math.cos((t * Math.PI) / 2),
  sineOut: (t) => Math.sin((t * Math.PI) / 2),
  sineInOut: (t) => -(Math.cos(Math.PI * t) - 1) / 2,
  backIn: (t) => {
    const c1 = 1.70158;
    const c3 = c1 + 1;
    return c3 * t * t * t - c1 * t * t;
  },
  backOut: (t) => {
    const c1 = 1.70158;
    const c3 = c1 + 1;
    return 1 + c3 * (t - 1) ** 3 + c1 * (t - 1) ** 2;
  },
  backInOut: (t) => {
    const c1 = 1.70158;
    const c2 = c1 * 1.525;
    return t < 0.5
      ? (Math.pow(2 * t, 2) * ((c2 + 1) * 2 * t - c2)) / 2
      : (Math.pow(2 * t - 2, 2) * ((c2 + 1) * (t * 2 - 2) + c2) + 2) / 2;
  },
  elastic: (t) => {
    if (t === 0) return 0;
    if (t === 1) return 1;
    const c4 = (2 * Math.PI) / 3;
    return Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * c4) + 1;
  },
  bounce: (t) => {
    const n1 = 7.5625;
    const d1 = 2.75;
    if (t < 1 / d1) return n1 * t * t;
    if (t < 2 / d1) return n1 * (t -= 1.5 / d1) * t + 0.75;
    if (t < 2.5 / d1) return n1 * (t -= 2.25 / d1) * t + 0.9375;
    return n1 * (t -= 2.625 / d1) * t + 0.984375;
  },
};

// Assemble the full registry.
export const CURVES: Record<CurveName, (t: number) => number> = (() => {
  const out = {} as Record<CurveName, (t: number) => number>;
  (Object.keys(BEZIERS) as string[]).forEach((name) => {
    const [x1, y1, x2, y2] = BEZIERS[name];
    out[name as CurveName] = makeCubicBezier(x1, y1, x2, y2);
  });
  (Object.keys(FORMS) as string[]).forEach((name) => {
    out[name as CurveName] = FORMS[name];
  });
  return out;
})();

// Named brand beziers for direct use in Remotion `interpolate({ easing })`.
export const EASING_BEZIERS = BEZIERS;

// Sample a named curve at linear progress t (0..1).
export function sampleCurve(name: CurveName, t: number): number {
  return CURVES[name](clamp01(t));
}

// Build an ad-hoc bezier curve at runtime.
export function makeCurve(x1: number, y1: number, x2: number, y2: number) {
  return makeCubicBezier(x1, y1, x2, y2);
}
