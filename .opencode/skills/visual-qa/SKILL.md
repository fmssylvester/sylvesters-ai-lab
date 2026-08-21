# Visual QA — Dual Vision Inspection (DeepSeek primary agent)

<!-- INSTALL_MODE: lite -->

## Purpose

Give the primary coding agent (DeepSeek) eyes: after rendering a Remotion composition,
run `visual_qa.py` to have two independent vision models inspect the actual rendered
frames and return a structured consensus report. DeepSeek stays the brain; Gemma and
Nemotron are sensory tools only. They never write code.

## When to use

Use after a **meaningful visual render** (composition, layout, typography, animation
timing changed). Do NOT use for pure logic changes (e.g. `console.log`, data plumbing,
state refactors with no visual effect) — vision calls are rate-limited and cached.

## How to invoke

```bash
cd /data/data/com.termux/files/home/ai-lab-internal
python3 visual_qa.py <path/to/render.mp4|image.png> [--frames 8] [--report]
```

- `--report` → machine-readable consensus JSON on stdout (preferred for the agent)
- default human report → readable summary
- `--compare iteration_001 iteration_002` → did the latest change actually improve the design?
- `--only gemma|nemotron` → run a single reviewer (economy)

## Reading the consensus

- `design_compliance` → weighted 0-100 score of how well the render follows
  `visual-direction.md` (the project design system). Low compliance with no issues
  listed usually means the design doc changed or the reviewers couldn't judge it.
- `high_confidence_issues` → BOTH models agreed (2/2). Fix these first, highest priority.
- `single_model_issues` → one model only. **Gemma is the stronger vision reviewer**:
  its critical/high findings get `confidence: HIGH` even when Nemotron missed them
  — do not dismiss them. Nemotron-only findings are MEDIUM (advisory).
- `disagreements` → models contradict each other. Gemma's verdict takes priority;
  inspect manually before changing (e.g. Gemma 15/100 + Nemotron 95/100 = the
  design is likely genuinely flawed — Gemma sees what Nemotron misses).
- `overall_score` is **weighted** (Gemma 1.0, Nemotron 0.6) so a lenient reviewer
  cannot average down Gemma's findings. Adjust via `REVIEWER_WEIGHT_GEMMA` /
  `REVIEWER_WEIGHT_NEMOTRON` in `.env`.
- `approved` = true → weighted overall_score >= VISUAL_QA_MIN_SCORE (85), no
  critical issues, all reviewers ready. That is the stop condition.
- Vision models say WHAT looks wrong; DeepSeek decides HOW to fix it in Remotion code
  (inspect the actual composition before editing — never blindly apply coordinates
  the vision models suggest).

## Design direction integration

Both reviewers receive the full `visual-direction.md` as project context and must
judge the render against it, not just generic visual quality. Gemma checks the design
rules (palette, typography, composition principles, anti-patterns); Nemotron checks the
motion principles and transition language. A `design_direction` issue category exists
in their reports.

- Change the design doc → point `VISUAL_QA_DESIGN_DIRECTION` at the new file, or
  just edit `visual-direction.md` — the cache key includes a hash of the doc, so
  stale verdicts are automatically invalidated.
- If a render violates an anti-pattern (e.g. pure-black background, text <60px,
  >3 colors, linear animations), reviewers flag it as `design_direction` violations
  even if it "looks fine" in isolation.

## Safety controls

- `MAX_VISUAL_ITERATIONS=5` — stop after 5 iterations, report the disagreement.
- Results are cached in `.visual_qa/cache/` (hash of frames + model IDs).
- Full history in `.visual_qa/iterations/iteration_XXX/` (frames, per-model JSON, consensus).
- If one model fails, continue with the other. If both fail, stop QA gracefully — never crash.

## Config (project `.env`)

| Variable | Default |
|---|---|
| `OPENROUTER_API_KEY` | required |
| `VISION_MODEL_GEMMA` | `google/gemma-4-26b-a4b-it:free` |
| `VISION_MODEL_NEMOTRON` | `nvidia/nemotron-nano-12b-v2-vl:free` |
| `ENABLE_GEMMA` / `ENABLE_NEMOTRON` | `true` / `true` |
| `VISUAL_QA_FRAME_COUNT` | 8 |
| `VISUAL_QA_MAX_WIDTH` | 1280 |
| `VISUAL_QA_MIN_SCORE` | 85 |
| `MAX_VISUAL_ITERATIONS` | 5 |
| `REVIEWER_WEIGHT_GEMMA` | 1.0 |
| `REVIEWER_WEIGHT_NEMOTRON` | 0.6 |
| `VISUAL_QA_DESIGN_DIRECTION` | `visual-direction.md` (project root) |

## Roles

- **Gemma** (stronger vision, weight 1.0) = design/composition critic: judges the
  render against `visual-direction.md` design rules + general hierarchy, scale,
  spacing, alignment, typography, balance, density, color, contrast, polish.
  Its critical/high findings carry HIGH confidence even when single-model.
- **Nemotron** (weight 0.6) = motion/sequence critic: judges the render against the
  design doc's motion principles (physical momentum, depth blur, parallax, transition
  language) + frame consistency, transitions, animation states, timing, coherence.
