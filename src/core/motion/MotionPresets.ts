// Reusable motion-preset building blocks (Asset Vault: "Motion presets").
//
// A preset is a named, reusable motion behaviour (enter / exit / reveal / loop)
// that any scene can apply to a layer by calling `applyPreset`. Presets are
// frame-driven and resolve to plain style fragments, so they compose with the
// rest of the engine (GlassPanel, GlowText, HUDEngine, etc.) without coupling.
//
// Two kinds:
//  - "interp": eased via AnimationCurves (deterministic, timeline-friendly)
//  - "spring": physics-based via Remotion `spring` (organic settle)

import { spring, interpolate } from "remotion";
import { sampleCurve, CurveName } from "./AnimationCurves";

export type PresetKind = "interp" | "spring";

export interface PresetInput {
  frame: number; // absolute frame
  fps: number;
  start: number; // frame the preset begins
  duration: number; // frames the preset spans
  curve?: CurveName; // for "interp" presets
  // optional per-call overrides
  distance?: number;
  from?: number;
  to?: number;
}

type StyleFragment = {
  transform?: string;
  opacity?: number;
  filter?: string;
};

type PresetDef =
  | {
      kind: "interp";
      resolve: (p: number, o: PresetInput) => StyleFragment;
    }
  | {
      kind: "spring";
      config: { stiffness: number; damping: number; mass?: number };
      resolve: (s: number, o: PresetInput) => StyleFragment;
    };

const d = (o: PresetInput, fallback: number) => (o.distance ?? fallback);

export const PRESETS: Record<string, PresetDef> = {
  fadeIn: {
    kind: "interp",
    resolve: (p) => ({ opacity: p }),
  },
  riseIn: {
    kind: "interp",
    resolve: (p, o) => ({ transform: `translateY(${(1 - p) * d(o, 40)}px)`, opacity: p }),
  },
  fallIn: {
    kind: "interp",
    resolve: (p, o) => ({ transform: `translateY(${-(1 - p) * d(o, 40)}px)`, opacity: p }),
  },
  slideLeft: {
    kind: "interp",
    resolve: (p, o) => ({ transform: `translateX(${(1 - p) * d(o, 60)}px)`, opacity: p }),
  },
  slideRight: {
    kind: "interp",
    resolve: (p, o) => ({ transform: `translateX(${-(1 - p) * d(o, 60)}px)`, opacity: p }),
  },
  scaleIn: {
    kind: "interp",
    resolve: (p) => ({ transform: `scale(${0.85 + p * 0.15})`, opacity: p }),
  },
  blurIn: {
    kind: "interp",
    resolve: (p) => ({ opacity: p, filter: `blur(${(1 - p) * 14}px)` }),
  },
  popIn: {
    kind: "spring",
    config: { stiffness: 140, damping: 14 },
    resolve: (s) => ({ transform: `scale(${0.6 + s * 0.4})`, opacity: s }),
  },
  popSoft: {
    kind: "spring",
    config: { stiffness: 110, damping: 18 },
    resolve: (s) => ({ transform: `scale(${0.92 + s * 0.08})`, opacity: s }),
  },
  // Looping ambient presets (period in frames).
  breathe: {
    kind: "interp",
    resolve: (p) => ({ transform: `scale(${1 + Math.sin(p * Math.PI * 2) * 0.015})` }),
  },
  glowPulse: {
    kind: "interp",
    resolve: (p) => ({
      opacity: 0.55 + Math.abs(Math.sin(p * Math.PI * 2)) * 0.45,
    }),
  },
};

export type PresetName = keyof typeof PRESETS;

// Resolve a preset into a style fragment for the current frame.
export function applyPreset(name: PresetName, o: PresetInput): StyleFragment {
  const def = PRESETS[name];
  if (!def) return {};

  if (def.kind === "spring") {
    // Honour the preset's physics; do NOT pass durationInFrames (it would
    // override the spring config with a derived one).
    const s = spring({
      frame: o.frame - o.start,
      fps: o.fps,
      config: { ...def.config, mass: def.config.mass ?? 1 },
    });
    return def.resolve(s, o);
  }

  const raw = o.duration <= 0 ? 1 : (o.frame - o.start) / o.duration;
  const p = interpolate(raw, [0, 1], [0, 1], {
    easing: (t) => sampleCurve(o.curve ?? "smooth", t),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return def.resolve(p, o);
}

// List preset names (for the Vault registry / introspection).
export const PRESET_NAMES = Object.keys(PRESETS) as PresetName[];
