// download.js — candidate harvester + scorer.
// Strategy:
//   1. If PEXELS_API_KEY is set, use the Pexels API (clean JSON, many candidates).
//   2. Otherwise, use REAL assets already on disk as verified candidates (no
//      fabricated URLs) plus any extra real sources you add. The point of this
//      script is the scoring + ranking loop, which runs identically either way.
// Each candidate is saved to candidates/<beat>/<id>.candidate.json.

const fs = require("fs");
const path = require("path");
const { getBrief } = require("./art-direct.cjs");
const { scoreFile, scoreCandidate } = require("./score.cjs");
const { execSync } = require("child_process");
const probeCache = {};

const ROOT = path.join(__dirname, "..", "..");
const CAND_DIR = path.join(__dirname, "..", "candidates");
const ASSETS = path.join(ROOT, "assets");

function readJSON(p) {
  return JSON.parse(fs.readFileSync(p, "utf8"));
}

// Gather real candidate files already on disk (proven license-safe).
function realCandidatesOnDisk(beat) {
  const found = [];
  const dirs = ["footage", "backgrounds", "pages"];
  for (const d of dirs) {
    const full = path.join(ASSETS, d);
    if (!fs.existsSync(full)) continue;
    for (const f of fs.readdirSync(full)) {
      const fp = path.join(full, f);
      const isVid = /\.(mp4|mov|webm|mkv)$/i.test(f);
      const isImg = /\.(png|jpg|jpeg)$/i.test(f);
      if (!isVid && !isImg) continue;
      if (f.toLowerCase().includes("screenshot") ) continue; // deprecated capture set
      found.push({
        id: `${d}_${path.parse(f).name}`,
        file: fp,
        kind: isVid ? "video" : "image",
        sourceRel: `${d}/${f}`,
        searchTerms: beat.searchTerms,
        text: `${f} ${beat.searchTerms.join(" ")} ${beat.story}`,
        beat: beat.id,
      });
    }
  }
  return found;
}

// Optional: Pexels API harvest (requires PEXELS_API_KEY).
async function pexelsCandidates(beat, n = 10) {
  const key = process.env.PEXELS_API_KEY;
  if (!key) return [];
  const out = [];
  for (const term of beat.searchTerms.slice(0, 3)) {
    const url = `https://api.pexels.com/videos/search?query=${encodeURIComponent(term)}&per_page=10&size=large`;
    try {
      const res = await fetch(url, { headers: { Authorization: key }, signal: AbortSignal.timeout(8000) });
      const j = await res.json();
      for (const v of (j.videos || []).slice(0, n)) {
        const file = (v.video_files || []).find((f) => f.quality === "hd") || v.video_files[0];
        if (!file) continue;
        out.push({
          id: `pexels_${v.id}`,
          url: file.link,
          kind: "video",
          w: file.width, h: file.height, fps: file.fps,
          text: `${v.url} ${v.description || ""} ${term}`,
          searchTerms: beat.searchTerms,
          beat: beat.id,
          meta: { pexelsId: v.id },
        });
      }
    } catch (e) {
      console.error(`pexels fetch failed for "${term}": ${e.message}`);
    }
  }
  return out;
}

function downloadProbe(cand) {
  if (!cand.url) return cand; // no remote url (disk candidate)
  const dest = path.join(CAND_DIR, cand.beat, path.basename(cand.url));
  try {
    execSync(`curl -fsSL --max-time 90 -o "${dest}" "${cand.url}"`);
    cand.file = dest;
    cand.downloaded = true;
  } catch (e) {
    cand.downloaded = false;
    cand.downloadError = e.message;
  }
  return cand;
}

async function harvest(scene) {
  const brief = getBrief(scene);
  const allRanked = [];

  for (const beat of brief.beats) {
    const beatDir = path.join(CAND_DIR, beat.id);
    fs.mkdirSync(beatDir, { recursive: true });

    let cands = await pexelsCandidates(beat, 10);
    let fromDisk = false;
    if (cands.length === 0) {
      cands = realCandidatesOnDisk(beat);
      fromDisk = true;
    }

    const scored = [];
    for (const c of cands) {
      // download remote probe if needed
      if (c.url) downloadProbe(c);
      // normalise to absolute so external tools (ffprobe/identify) resolve reliably
      const absFile = c.file ? path.resolve(ROOT, c.file) : c.file;
      let result;
      if (absFile && fs.existsSync(absFile)) {
        if (!probeCache[absFile]) probeCache[absFile] = scoreFile({ ...c, file: absFile, text: c.text });
        result = probeCache[absFile];
      } else {
        // metadata-only score (no probe available)
        result = scoreCandidate({
          kind: c.kind, w: c.w, h: c.h, fps: c.fps,
          text: c.text, searchTerms: c.searchTerms,
        });
        result.probe = false;
      }
      const rec = { ...c, score: result };
      scored.push(rec);
      fs.writeFileSync(path.join(beatDir, `${c.id}.candidate.json`), JSON.stringify(rec, null, 2));
    }

    scored.sort((a, b) => b.score.overall - a.score.overall);
    // rank
    scored.forEach((s, i) => (s.rank = i + 1));

    const summary = scored.map((s) => ({
      rank: s.rank,
      id: s.id,
      overall: s.score.overall,
      kind: s.kind,
      file: s.file || s.url || null,
      probe: !!s.score.probe,
    }));
    fs.writeFileSync(
      path.join(beatDir, "ranking.json"),
      JSON.stringify({ beat: beat.id, source: fromDisk ? "disk" : "pexels", ranking: summary }, null, 2)
    );
    console.log(`\n== ${beat.id} (${fromDisk ? "disk candidates" : "pexels"}) ==`);
    summary.forEach((s) =>
      console.log(`  #${s.rank}  ${s.overall.toFixed(2)}  ${s.id}  ${s.kind}  ${s.file || ""} ${s.probe ? "" : "(meta-only)"}`)
    );
    allRanked.push(...scored);
  }
  return allRanked;
}

// CLI
if (require.main === module) {
  const scene = process.argv[2] || "Collector";
  harvest(scene).catch((e) => { console.error(e); process.exit(1); });
}
