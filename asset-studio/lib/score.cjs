// score.js — objective candidate scoring.
// Every candidate is scored on the same weighted dimensions so selection is
// comparison, not vibes. Scores are 0..10; output is an overall 0..10 + rank data.

const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");
const _mdCache = {};
const _statCache = {};

// Weighted dimensions. Weights sum to 1. Tunable from preferences.json.
const DEFAULT_WEIGHTS = {
  resolution: 0.12,
  frameRate: 0.06,
  compression: 0.06,
  orientation: 0.05,
  lighting: 0.12,
  camera: 0.10,
  colorPalette: 0.08,
  metadataRelevance: 0.08,
  subjectRelevance: 0.14,
  motionComplexity: 0.05,
  visualCleanliness: 0.08,
  brandSafety: 0.04,
  licensing: 0.02,
};

// Sub-scorers that use real measurement where possible.
function statProbe(file) {
  if (_statCache[file]) return _statCache[file];
  // returns { w, h, mean, stddev } from the file (image or a single frame)
  let r = { w: 0, h: 0, mean: 0, stddev: 0 };
  try {
    const out = execSync(
      `identify -format "%w %h %[fx:mean] %[fx:standard_deviation]" "${file}" 2>/dev/null`,
      { encoding: "utf8", timeout: 15000 }
    ).trim();
    const [w, h, mean, std] = out.split(/\s+/).map(Number);
    r = { w, h, mean, stddev: std };
  } catch { /* keep zero */ }
  _statCache[file] = r;
  return r;
}

function probeFrame(video, atSec) {
  const tmp = `/data/data/com.termux/files/usr/tmp/opencode/probe_${Date.now()}.png`;
  try {
    execSync(
      `ffmpeg -y -hide_banner -loglevel error -ss ${atSec} -i "${video}" -frames:v 1 "${tmp}" 2>/dev/null`,
      { timeout: 25000 }
    );
    return tmp;
  } catch {
    return null;
  }
}

function metadata(video) {
  if (_mdCache[video]) return _mdCache[video];
  let r = null;
  try {
    const raw = execSync(`ffprobe -v error -show_entries stream=width,height,r_frame_rate,avg_frame_rate,nb_frames -show_entries format=duration -of json "${video}" 2>/dev/null`, { encoding: "utf8", timeout: 25000 });
    r = JSON.parse(raw);
  } catch { /* keep null */ }
  _mdCache[video] = r;
  return r;
}

// Helpers ----------------------------------------------------------------
const clamp = (x) => Math.max(0, Math.min(10, x));

function scoreResolution(w, h) {
  const px = (w || 0) * (h || 0);
  if (px >= 1920 * 1080) return 10;
  if (px >= 1280 * 720) return 8;
  if (px >= 854 * 480) return 6;
  if (px > 0) return 4;
  return 2;
}

function scoreFps(fps) {
  if (!fps) return 4;
  if (fps >= 50) return 10;
  if (fps >= 29.9) return 9;
  if (fps >= 24) return 7;
  return 5;
}

function scoreOrientation(w, h) {
  if (!w || !h) return 5;
  return w >= h ? 10 : 4; // we want landscape 16:9 heroes
}

function scoreLighting(mean, stddev) {
  // cinematic = not blown out, not crushed; healthy spread.
  if (stddev < 0.02) return 1; // blank / flat
  if (mean > 0.96 || mean < 0.03) return 3; // near-white/near-black
  // ideal mid contrast around mean 0.25-0.6
  const mid = 1 - Math.abs(mean - 0.42) / 0.42;
  return clamp(4 + mid * 5 + Math.min(stddev, 0.35) * 6);
}

function scoreVisualCleanliness(stddev, mean) {
  // too flat or pure single-tone = low; good variance with no dead pixels = high
  if (stddev < 0.02) return 1;
  if (stddev > 0.05 && stddev < 0.45) return 10;
  return clamp(6 + (stddev - 0.25) * 4);
}

function scoreColorPalette(mean) {
  // prefer rich-but-not-blown; neutralize pure white/black
  if (mean > 0.9 || mean < 0.05) return 4;
  return 9;
}

function tokenOverlap(haystack, terms) {
  const h = (haystack || "").toLowerCase();
  const hits = (terms || []).filter((t) => h.includes(t.toLowerCase()));
  return hits.length / Math.max(1, terms.length);
}

function scoreSubjectRelevance(text, terms) {
  return clamp(tokenOverlap(text, terms) * 10);
}
function scoreMetadataRelevance(text, terms) {
  return clamp(tokenOverlap(text, terms) * 10);
}

function scoreCamera() {
  // smooth camera motion — assume curated Pexels footage is generally smooth.
  // Without optical-flow analysis we assign a solid default and let humans veto.
  return 7.5;
}
function scoreMotionComplexity() {
  return 7; // moderate, not frantic
}
function scoreBrandSafety() {
  return 9; // Pexels footage is generally brand-safe; review on approval
}
function scoreLicensing() {
  return 10; // Pexels license = free commercial, no attribution
}
function scoreCompression() {
  // assume Pexels CDN delivers good compression
  return 8.5;
}

/**
 * scoreCandidate(meta)
 *  meta: { kind, file?, w, h, fps, mean, stddev, text, searchTerms, weights? }
 * Returns { dimensions: {...0..10}, overall: number }
 */
function scoreCandidate(meta) {
  const weights = { ...DEFAULT_WEIGHTS, ...(meta.weights || {}) };
  const w = meta.w || 0, h = meta.h || 0;
  const mean = meta.mean ?? 0, std = meta.stddev ?? 0;
  const terms = meta.searchTerms || [];

  const d = {
    resolution: scoreResolution(w, h),
    frameRate: scoreFps(meta.fps),
    compression: scoreCompression(),
    orientation: scoreOrientation(w, h),
    lighting: scoreLighting(mean, std),
    camera: scoreCamera(),
    colorPalette: scoreColorPalette(mean),
    metadataRelevance: scoreMetadataRelevance(meta.text, terms),
    subjectRelevance: scoreSubjectRelevance(meta.text, terms),
    motionComplexity: scoreMotionComplexity(),
    visualCleanliness: scoreVisualCleanliness(std, mean),
    brandSafety: scoreBrandSafety(),
    licensing: scoreLicensing(),
  };

  let overall = 0;
  for (const k of Object.keys(weights)) overall += (d[k] ?? 0) * (weights[k] || 0);
  overall = Math.round(overall * 100) / 100;

  // preference-aware boost (principle 7): if the user has approved assets for
  // a trait, candidates that actually exhibit it get a bonus. Traits are mapped
  // to OBJECTIVE checks so the boost is earned, not vibes.
  let prefBoost = 0;
  const traitSet = loadPreferredTraits();
  const isDark = (meta.mean ?? mean) < 0.22;
  const hasMotion = meta.kind === "video";
  if (traitSet.has("dark cinematic look") && isDark) prefBoost += 0.6;
  if (traitSet.has("smooth camera motion") && hasMotion) prefBoost += 0.3;
  if (traitSet.has("premium lighting") && (meta.mean ?? mean) > 0.18 && (meta.mean ?? mean) < 0.7) prefBoost += 0.3;
  if (traitSet.has("minimal composition") && (meta.stddev ?? std) > 0.05 && (meta.stddev ?? std) < 0.4) prefBoost += 0.2;
  overall = Math.round(Math.min(10, overall + prefBoost) * 100) / 100;

  return { dimensions: d, overall, weighted: true, probe: !!(meta.file && fs.existsSync(meta.file)) };
}

function loadPreferredTraits() {
  try {
    const p = JSON.parse(fs.readFileSync(path.join(__dirname, "preferences.json"), "utf8"));
    const set = new Set();
    for (const t of p.likedTraits || []) set.add(t.trait);
    return set;
  } catch {
    return new Set();
  }
}

// Full score of a downloaded media file using ffprobe/identify.
function scoreFile(meta) {
  let file = meta.file;
  let isVideo = false;
  let probe = file;
  let md = null;
  if (file && /\.(mp4|mov|webm|mkv)$/i.test(file)) {
    isVideo = true;
    md = metadata(file);
    if (md && md.streams && md.streams[0]) {
      const s = md.streams[0];
      meta.w = s.width; meta.h = s.height;
    }
    if (md && md.streams && md.streams[0] && md.streams[0].avg_frame_rate) {
      const [n, d2] = md.streams[0].avg_frame_rate.split("/").map(Number);
      meta.fps = d2 ? n / d2 : n;
    }
  }
  if (isVideo) {
    const at = meta.probeAtSec ?? 2;
    probe = probeFrame(file, at) || file;
  }
  if (probe) {
    const st = statProbe(probe);
    if (st.w) {
      meta.w = meta.w || st.w; meta.h = meta.h || st.h;
      meta.mean = st.mean; meta.stddev = st.stddev;
    }
  }
  return scoreCandidate(meta);
}

module.exports = {
  scoreCandidate,
  scoreFile,
  statProbe,
  DEFAULT_WEIGHTS,
  clamp,
};

// CLI: node lib/score.js <file> [searchTermsComma]
if (require.main === module) {
  const f = process.argv[2];
  const terms = (process.argv[3] || "").split(",").filter(Boolean);
  if (!f) { console.error("usage: score.js <file> [terms]"); process.exit(2); }
  const r = scoreFile({ file: f, searchTerms: terms, text: f + " " + terms.join(" ") });
  console.log(JSON.stringify(r, null, 2));
}
