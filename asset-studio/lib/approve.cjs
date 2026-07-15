// approve.js — human approval loop. Bank the chosen candidate into the
// permanent library, tag + categorize it, record WHY it was approved (prefs),
// and never re-search for it.
//
// Usage:
//   node lib/approve.js <candidate.json> --category Browsers --tags "dark,screen,cinematic" --why "premium lighting, smooth camera, dark cinematic look"
//   node lib/approve.js <candidate.json> --reject
// If the candidate was meta-only, this downloads + probes it first, then scores
// for real before banking.

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");
const { scoreFile } = require("./score.cjs");

const LIB = path.join(__dirname, "..", "library");
const PREFS = path.join(__dirname, "preferences.json");

function loadPrefs() {
  if (!fs.existsSync(PREFS)) return { likedTraits: [], weightOverrides: {}, approvedCount: 0 };
  return JSON.parse(fs.readFileSync(PREFS, "utf8"));
}
function savePrefs(p) {
  fs.writeFileSync(PREFS, JSON.stringify(p, null, 2));
}

function ensureCategory(cat) {
  const d = path.join(LIB, cat);
  fs.mkdirSync(d, { recursive: true });
  return d;
}

function bank(candPath, opts) {
  const cand = JSON.parse(fs.readFileSync(candPath, "utf8"));

  // download if remote + not yet local
  if (cand.url && !cand.file) {
    const dest = path.join(require("os").tmpdir(), path.basename(cand.url));
    try {
      execSync(`curl -fsSL --max-time 120 -o "${dest}" "${cand.url}"`);
      cand.file = dest;
    } catch (e) {
      console.error("download failed:", e.message);
      process.exit(1);
    }
  }

  // real score if we have a local file
  let finalScore = cand.score;
  if (cand.file && fs.existsSync(cand.file)) {
    finalScore = scoreFile({ ...cand, text: cand.text });
    cand.score = finalScore;
  }

  // blank guard — refuse to bank a dead asset
  if (finalScore.dimensions && finalScore.dimensions.lighting <= 1.5) {
    console.error("REJECTED by guard: candidate is blank/flat (lighting score too low). Not banked.");
    process.exit(1);
  }

  const cat = opts.category || "Technology";
  const catDir = ensureCategory(cat);
  const ext = path.extname(cand.file || cand.url || ".mp4") || ".mp4";
  const safeId = cand.id.replace(/[^a-z0-9_-]/gi, "_");
  const destName = `${safeId}${ext}`;
  const dest = path.join(catDir, destName);

  if (cand.file && fs.existsSync(cand.file)) {
    fs.copyFileSync(cand.file, dest);
  } else {
    console.error("No local file to bank; cannot verify asset. Aborting.");
    process.exit(1);
  }

  const record = {
    id: safeId,
    bankedAt: new Date().toISOString(),
    sourceRel: `asset-studio/library/${cat}/${destName}`,
    original: cand.url || cand.sourceRel || null,
    kind: cand.kind,
    category: cat,
    tags: (opts.tags || "").split(",").map((s) => s.trim()).filter(Boolean),
    whyApproved: (opts.why || "").split(",").map((s) => s.trim()).filter(Boolean),
    beat: cand.beat,
    score: finalScore.overall,
    scoreBreakdown: finalScore.dimensions,
    license: "Pexels License (free commercial, no attribution)", // verify if from other source
  };
  fs.writeFileSync(path.join(catDir, `${safeId}.json`), JSON.stringify(record, null, 2));

  // record preferences
  const prefs = loadPrefs();
  prefs.approvedCount = (prefs.approvedCount || 0) + 1;
  for (const t of record.whyApproved) {
    const key = t.toLowerCase();
    prefs.likedTraits = prefs.likedTraits || [];
    const ex = prefs.likedTraits.find((x) => x.trait === key);
    if (ex) ex.count = (ex.count || 0) + 1;
    else prefs.likedTraits.push({ trait: key, count: 1 });
  }
  savePrefs(prefs);

  console.log(`BANKED -> library/${cat}/${destName}`);
  console.log(`  score ${record.score}  tags [${record.tags.join(", ")}]  why [${record.whyApproved.join(", ")}]`);
  console.log(`  preference DB updated (${prefs.approvedCount} approved)`);
}

function reject(candPath) {
  const cand = JSON.parse(fs.readFileSync(candPath, "utf8"));
  console.log(`REJECTED candidate ${cand.id} (not banked).`);
}

// CLI
if (require.main === module) {
  const file = process.argv[2];
  if (!file) { console.error("usage: approve.js <candidate.json> [--category X] [--tags a,b] [--why a,b] | --reject"); process.exit(2); }
  const args = process.argv.slice(3);
  const isReject = args.includes("--reject");
  const get = (k) => { const i = args.indexOf(k); return i >= 0 ? args[i + 1] : ""; };
  if (isReject) reject(file);
  else bank(file, { category: get("--category"), tags: get("--tags"), why: get("--why") });
}
