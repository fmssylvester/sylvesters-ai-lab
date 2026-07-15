// verify-scene.js — scene-completion checklist (principle 9).
// Runs against a rendered frame (png) or a still. Returns a checklist with
// PASS/WARN/FAIL per item. Objective where possible; the rest are guards.

const { execSync } = require("child_process");
const fs = require("fs");

function stat(file, geom) {
  const g = geom || "";
  return execSync(`identify -format "%w %h %[fx:mean] %[fx:standard_deviation] ${g}" "${file}" 2>/dev/null`, { encoding: "utf8" }).trim();
}

function band(file, gravity, w, h) {
  const tmp = `/data/data/com.termux/files/usr/tmp/opencode/vb_${Date.now()}.png`;
  execSync(`magick "${file}" -gravity ${gravity} -crop ${w}x${h}+0+0 +repage "${tmp}" 2>/dev/null`);
  return tmp;
}

function verify(renderPath, opts = {}) {
  if (!fs.existsSync(renderPath)) return { fatal: `file not found: ${renderPath}` };
  const checks = [];

  // 1. loads correctly (we got a valid image)
  const [w, h, mean, std] = stat(renderPath).split(/\s+/).map(Number);
  checks.push({ item: "asset loads", pass: w > 0 && h > 0, detail: `${w}x${h}` });

  // 2. not blank
  checks.push({ item: "not blank", pass: std > 0.02, warn: std < 0.06, detail: `stddev=${std.toFixed(3)}` });

  // 3. resolution sufficient (>= 1280x720 for a 1080p master)
  checks.push({ item: "resolution sufficient", pass: w >= 1280 && h >= 720, detail: `${w}x${h}` });

  // 4. framing appropriate — center band should carry content (not all black)
  const ctmp = band(renderPath, "center", 1700, 360);
  const [, , cmean, cstd] = stat(ctmp).split(/\s+/).map(Number);
  checks.push({ item: "framing carries content", pass: cstd > 0.05, warn: cstd < 0.1, detail: `center stddev=${cstd.toFixed(3)}` });

  // 5. typography readable — high-contrast text present (type pixels far from bg)
  //    measure spread of the center band; a readable title raises peak variance.
  checks.push({ item: "typography readable", pass: cstd > 0.1, warn: cstd < 0.15, detail: `text-band stddev=${cstd.toFixed(3)}` });

  // 6. colors consistent — overall mean within a sane cinematic range (not blown)
  checks.push({ item: "colors not blown out", pass: mean < 0.93 && mean > 0.02, detail: `mean=${mean.toFixed(3)}` });

  // 7. animation supports story / cinematic not slideshow — handled by human;
  //    automation flags if the frame is suspiciously flat (slideshow-like).
  checks.push({ item: "not a flat slideshow", pass: std > 0.04, detail: `frame stddev=${std.toFixed(3)}` });

  const failed = checks.filter((c) => c.pass === false);
  const warned = checks.filter((c) => c.warn && c.pass !== false);
  return { render: renderPath, checks, failed: failed.length, warned: warned.length, ok: failed.length === 0 };
}

// CLI
if (require.main === module) {
  const f = process.argv[2];
  if (!f) { console.error("usage: verify-scene.js <render.png>"); process.exit(2); }
  const r = verify(f);
  if (r.fatal) { console.error(r.fatal); process.exit(1); }
  for (const c of r.checks) {
    const tag = c.pass ? "PASS" : "FAIL";
    console.log(`[${tag}] ${c.item} — ${c.detail}`);
  }
  console.log(`\n${r.ok ? "SCENE OK" : "SCENE NEEDS WORK"} (fail=${r.failed}, warn=${r.warned})`);
  process.exit(r.ok ? 0 : 1);
}
