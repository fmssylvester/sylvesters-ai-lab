# Remote Render Guide (GitHub Actions)

**Status: WORKING** — last verified 2026-08-10. Renders n8n intro/outro in ~5 min on free runners,
instead of ~1h+ on the phone.

## The one-liner

```bash
git push origin main && gh workflow run "Render n8n Intro/Outro" --repo fmssylvester/sylvesters-ai-lab
```

Then poll: `gh run list --repo fmssylvester/sylvesters-ai-lab --limit 1`

## Download artifacts

```bash
# CRITICAL: set TMPDIR on Termux or gh fails with
# "error initializing temporary file: /data/local/tmp/..."
export TMPDIR=/data/data/com.termux/files/usr/tmp
mkdir -p ~/tmp-dl && cd ~/tmp-dl
gh run download <RUN_ID> --repo fmssylvester/sylvesters-ai-lab -n n8n-renders --dir ~/tmp-dl
cp n8n-intro.mp4 n8n-outro.mp4 /sdcard/Download/n8n-renders/
```

## How it works (the non-obvious parts)

1. **Dedicated entry point** — `src/index-n8n.tsx` registers ONLY the n8n compositions.
   Never render via `src/index.ts`: the repo's `src/Root.tsx` imports many scenes that were
   never committed, so bundling fails on CI. Add new standalone scenes to `index-n8n.tsx`.

2. **Chrome version must be pinned** — huge breaking pitfall:
   - `chrome@stable` (151) and `chrome@131`: CDP crashes → `ProtocolError: Target closed`,
     `UnhandledPromiseRejection: #<ErrorEvent>`.
   - `chrome@120` (Remotion 3.3.103 era): works.
   Install: `npx -y @puppeteer/browsers install chrome@120 --path /opt/chrome`

3. **Remotion 3.3.103 forces `--single-process` on Linux**, which crashes Chrome 120+.
   Patch it out after `npm ci` (already in `.github/workflows/n8n-render.yml`):
   ```bash
   sed -i "s/process.platform === 'linux' ? '--single-process' : null,/null,/" \
     node_modules/@remotion/renderer/dist/open-browser.js
   ```

4. **Audio must be WAV, and committed with `-f`** — `.gitignore` has `*.wav`, so WAVs are
   silently skipped by `git add`. Use `git add -f assets/audio/*.wav`.
   MP3s cause `Could not play audio ... [object MediaError]` / `ErrorEvent` on CI.
   Convert on the phone: `ffmpeg -y -i assets/audio/x.mp3 -ar 44100 -ac 2 -c:a pcm_s16le assets/audio/x.wav`

5. **Remotion public dir is `assets/`** (set in `remotion.config.ts`), so audio lives at
   `assets/audio/*.wav` and scenes use `staticFile('audio/voiceover.wav')`.

6. **CI needs Chrome libs + ffmpeg** before anything else (see workflow step
   "Install system deps"). Runner picks Chrome via `REMOTION_BROWSER_EXECUTABLE`.

## Editing scenes → re-render loop

1. Edit `src/scenes/n8n/N8nIntroScene.tsx` / `N8nOutroScene.tsx`.
2. Commit + push + trigger workflow (one-liner above).
3. Download artifact (command above), extract frames:
   ```bash
   ffmpeg -y -loglevel error -ss <SEC> -i n8n-intro.mp4 -frames:v 1 /tmp/opencode/f.png
   ```
4. Review vs `new_brain.md` design standard.

## Known per-frame cost

- Renderer at 1920x1080 on the phone: ~13.5s/frame (900 frames ≈ 1h+ with `--concurrency=2`).
- GitHub runner: ~5 min for both compositions at `--concurrency=2`.
- **Never use `--concurrency=8` on the phone** — contention blows the 28s frame timeout.
  Prefer the config file (`remotion.config.ts`): `Config.setConcurrency(2)`,
  `Config.setTimeoutInMilliseconds(300000)` — CLI flags were unreliable on this setup.

## Avoiding self-match kill (Termux gotcha)

`pkill -f "remotion render"` matches the calling shell's own command line and kills it.
Use a bracket pattern instead: `pgrep -af "remo[t]ion render"`.