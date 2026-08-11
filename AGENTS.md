# Project: Sylvester's AI Lab Internal

## Always Read First
- Read CONTEXT.md at the start of every session for working memory
- Never re-ask questions already answered in CONTEXT.md
- Using GitHub Actions to render Remotion videos? Read REMOTE_RENDER_GUIDE.md FIRST — it contains pinned Chrome version, single-process patch, WAV-asset and entry-point requirements that took hours to discover.

## Stack
- Runtime: Termux on Android (no sudo, no systemd)
- Models: DeepSeek via OpenCode
- Pipeline: ~/ai-lab-internal/pipeline/ – Remotion + WhisperX + GitHub Actions
- Video gen: Lightning AI + LTX-2.3, weights at /teamspace/studios/this_studio/ltx_weights/
- Storage: Cloudflare R2
- Automation: n8n Cloud

## Rules
- Always use heredoc method for writing files (cat > file << 'EOF')
- No pip installs without --break-system-packages
- Prefer free-tier solutions

## STANDING ORDER — RENDERING
- **NEVER render videos on this phone/device.** It takes ~1h+ per composition and
  competes for resources with the live services. Phone is for editing/writing code only.
- **ALWAYS render via GitHub Actions:** commit, push to origin, then trigger the matching
  workflow: `gh workflow run "<Workflow>" --repo fmssylvester/sylvesters-ai-lab` and poll
  `gh run list --repo fmssylvester/sylvesters-ai-lab --limit 1`. Download artifacts with
  `TMPDIR=/data/data/com.termux/files/usr/tmp gh run download <RUN_ID> -n <artifact>`.
- Follow REMOTE_RENDER_GUIDE.md: dedicated entry point per render (never `src/index.ts`),
  audio as WAV committed with `-f` (gitignore skips *.wav), Chrome pinned 120, single-process
  patch applied by the workflow.
- The Visual Director storyboard → implementation flow ends with "push + trigger workflow",
  NOT a local render. Local `remotion render` is only acceptable for quick frame probes
  (still/still frame extraction) when explicitly asked.

## Agent Orchestration Pipeline
You are a strict coordinator. You DO NOT write scripts, generate visual assets, or write code yourself. 
Your ONLY job is to delegate tasks to specialized sub-agents:

1. SCRIPT STAGE: Delegate topic requests to `script_writer`. Explicitly instruct it to inspect local workspace retention guides, hook frameworks, and channel outro files before drafting.
2. TEMPLATE STAGE: If an n8n workflow is needed, trigger `n8n_builder` to scaffold and document the JSON asset.
3. VISUAL STAGE: Once the script is approved, trigger `avatar_director` and `b_roll_producer` in parallel using the scene intent notes in the script.
4. TOOL ROUTING: Force sub-agents to use the active image, video, and avatar tools present in the workspace files without hardcoding provider names.
5. HAND-OFF: Once all renders complete, halt execution. Output a clean, organized list of local `.mp4` file paths for manual editing in CapCut. Keep your context window pristine.
