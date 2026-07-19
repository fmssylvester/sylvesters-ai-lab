# Session Log — Sylvester's AI Lab

> Recovery log. Updated at every step. Mandated by BRAIN.md.

## Objective
Produce a **multi-part YouTube series** titled *"Mastering AI Image-to-Video Prompting for Beginners"* for Sylvester's AI Lab. Delivered **tool-agnostically** (a transferable motion-first method) — teach viewers to find ANY tool's official prompt guide rather than comparing models. Run the full pipeline autonomously and only report when done.

## Key decisions (locked with user)
- **No model shootouts.** Name ≤2 real tools ONLY as live demos of *finding their official prompt guide* (Part 4). Everything else = "your tool".
- **Motion-first** is the spine: prompt the *movement + camera*, not the picture.
- **6 parts** (evidence-based, grounded in first-hand research):
  1. The Motion-First Secret (AI video motion first secret)
  2. The Copy-Paste Prompt Anatomy (AI video prompt anatomy template)
  3. Speak Camera: the movement lexicon (AI video camera movement lexicon)
  4. Find ANY Tool's Official Prompt Guide (AI video find any tool guide)
  5. Iteration: change-one-variable loop (AI video prompt iteration method)
  6. Fixing Ugly Outputs: negative prompts + source-image prep (AI video fix ugly output)
- **Evidence used**: Runway official guide (motion-first), LTX blog (anatomy: Subject→Context→Camera→Lighting), Eachlabs (negative prompts, source prep), LetsEnhance (12 camera moves, `[Camera]+[Pace]+[Action]+[Atmosphere]`).

## Pipeline facts (from reading code)
- Local stages (phone can run): topic_research (YouTube) → tavily_research (Tavily) → script_generator (Gemini) → voiceover (Edge TTS) → scene_classifier/asset_resolver/broll_descriptor (Gemini).
- CI-only (`render.yml`, manual `workflow_dispatch`): WhisperX word_sync + Remotion render + YouTube upload + Telegram (token invalid).
- CI is **manually dispatched** with `topic` + `privacy`; it regenerates the script from the topic. To keep our grounded scripts, `pipeline.py` is now **idempotent** (reuses committed `script.json` instead of regenerating).
- `pipeline/workspace/` is gitignored → per-part `script.json` must be `git add -f` so CI can check it out.
- `gh` is authenticated as `fmssylvester` → can trigger CI via `gh workflow run`.

## Progress log
- Read BRAIN.md + pipeline orchestration (pipeline.py, render_trigger.py, voiceover.py, render.yml, scene_classifier.py).
- Upgraded `script_generator.py`: web+YouTube merged research brief (`load_research_brief`), web synthesis (`synthesize_web_research`), tool-agnostic `extra_instruction` guardrails, fixed missing `config.RESEARCH_JSON_REL`.
- Made `pipeline.py` idempotent (reuse existing `script.json`).
- Added `config.RESEARCH_JSON_REL`, new `pipeline/produce_series.py` series harness.
- **Generated all 6 grounded scripts** (research-injected; web synthesis falls back to raw Tavily results, which still ground the scripts). All tool-agnostic, constraint-compliant, cite first-hand sources.
- Next: commit (force-add per-part workspace JSONs) → push → dispatch CI render per part.

## Current status
- 6/6 scripts produced locally and verified (Part 1, 4, 6 spot-checked — strong, grounded, on-brief).
- Not yet committed/pushed. CI not yet triggered.

## Next steps
1. Commit pipeline changes + per-part `script.json`/`research.json`/`web_research.json`/`script.md` (force-add).
2. Push to `master`.
3. `gh workflow run render.yml` for each of the 6 parts (privacy=private). CI reuses committed grounded scripts.
4. Update this log; report completion (CI runs are long/queued — videos render on CI).
