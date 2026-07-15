// art-direct.js — build an art-direction brief BEFORE searching for assets.
// Used by the harvester and the approval loop. This is the "think like an art
// director" step: emotion, story, metaphor, pacing, palette, camera, hero/support.

const CATEGORIES = [
  "AI", "Robotics", "Programming", "Servers", "Data", "Browsers",
  "Finance", "Mobile", "Space", "Medical", "Security", "Maps",
  "UI", "Abstract", "Technology",
];

// One scene = one narrative beat. Each beat gets its own brief so the search is
// targeted instead of generic.
const COLLECTOR_BRIEF = {
  scene: "Collector",
  project: "video_001",
  scope: "opening 3 lines, stop after 'They won't finish exploring this one either.'",
  beats: [
    {
      id: "act1_anon",
      emotion: "quiet restlessness",
      story: "a person endlessly acquiring tools they never master",
      metaphor: "the digital hoarder — a desk that multiplies",
      pacing: "slow, observational",
      palette: "cool blue-teal, low key, cinematic dark",
      camera: "locked-off or slow handheld, shallow depth of field",
      heroOrSupport: "supporting ambience behind kinetic type",
      searchTerms: ["dark office desk", "hands typing keyboard night", "monitor glow"],
      categories: ["Browsers", "UI", "Technology", "Programming"],
      assetKind: "video",
      minScore: 7.0,
    },
    {
      id: "act2_bookmark",
      emotion: "compulsive momentum",
      story: "the 40th AI tool gets bookmarked without thought",
      metaphor: "a bookmark piling onto an endless stack",
      pacing: "faster, rhythmic",
      palette: "cyan accent over neutral dark",
      camera: "close-up on screen / cursor, smooth push-in",
      heroOrSupport: "supporting — the count-up is the hero type",
      searchTerms: ["browser tabs many", "web browser screen", "clicking bookmark"],
      categories: ["Browsers", "UI", "Programming"],
      assetKind: "video",
      minScore: 7.0,
    },
    {
      id: "act3_unexplored",
      emotion: "quiet realization / weight",
      story: "the last ten were never finished",
      metaphor: "open tabs left to die",
      pacing: "settling, heavier",
      palette: "warm gold against cool dark",
      camera: "static, contemplative",
      heroOrSupport: "supporting",
      searchTerms: ["many browser tabs", "messy desktop", "stacked screens"],
      categories: ["Browsers", "UI", "Technology"],
      assetKind: "video",
      minScore: 7.0,
    },
    {
      id: "act4_never",
      emotion: "resignation",
      story: "this one won't be finished either",
      metaphor: "the screen dims, the hoard remains",
      pacing: "slow pull-back",
      palette: "desaturated, cold red undertone",
      camera: "slow pull-back, vignette closing",
      heroOrSupport: "supporting",
      searchTerms: ["screen turning off", "dark room monitor", "empty desk night"],
      categories: ["Technology", "Abstract", "UI"],
      assetKind: "video",
      minScore: 7.0,
    },
  ],
  // cross-beat guardrails
  globalPalette: ["#07090D", "#00D9FF", "#E7B84D", "#FF5A5A"],
  forbid: ["cartoon", "flat illustration only", "overly saturated", "busy text overlays in source"],
};

const BRIEFS = {
  Collector: COLLECTOR_BRIEF,
};

function getBrief(scene) {
  const b = BRIEFS[scene];
  if (!b) throw new Error(`No art-direction brief for scene "${scene}"`);
  return b;
}

module.exports = { getBrief, CATEGORIES, COLLECTOR_BRIEF };

// CLI: node lib/art-direct.js <scene>  -> writes specs/<scene>.spec.json
if (require.main === module) {
  const fs = require("fs");
  const path = require("path");
  const scene = process.argv[2] || "Collector";
  const brief = getBrief(scene);
  const out = path.join(__dirname, "..", "specs", `${scene}.spec.json`);
  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.writeFileSync(out, JSON.stringify(brief, null, 2));
  console.log(`wrote ${out} (${brief.beats.length} beats)`);
}
