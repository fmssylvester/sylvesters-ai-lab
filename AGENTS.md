# Sylvester's AI Lab — Agent Guide

## Commands

| Action | Command |
|---|---|
| Install all deps | `npm install && npm install framer-motion` |
| Vite dev server | `node node_modules/.bin/vite` |
| Remotion studio | `npm run studio` (v3.3 uses `preview` command) |
| Render composition | `npm run render -- <compositionId> out/<name>.mp4` |
| List compositions | `npm run compositions` |
| Build for prod | `node node_modules/.bin/vite build` |

> `framer-motion` is used throughout but absent from `package.json`. Install it manually after every `npm install`.

## Entrypoints

- **Remotion compositions**: `src/index.ts` → `src/Root.tsx` (register with `<Composition>`)
- **Vite dev app**: `src/main.tsx` → `src/App.tsx` (live preview in browser)
- Both share the same `src/` tree. New scenes go into `src/scenes/<scene-name>/`.

## Architecture

- **CSS design tokens**: `src/styles/global.css` (`--bg: #07090D`, `--cyan: #00D9FF`, `--gold: #E7B84D`)
- **Motion tokens**: `src/core/motion/motionTokens.ts` — durations, easing curves, spring configs
- **Z-index system**: `src/core/layout/layers.ts` (background=0 → transition=100)
- **Timeline pattern**: Per-scene frame constants in `src/core/timeline/<scene>Timeline.ts` (30fps). Components use `useCurrentFrame()` + `interpolate()` from Remotion. Timeline files are the single source of truth for pacing.
- **Scene pattern**: Scene orchestrator in `src/scenes/<name>/` + timeline constants. Reusable components in `src/components/<category>/`.
- **Browser UI**: `src/components/browser/BrowserWindow.tsx` — reusable browser shell for the channel
- **Module registry**: `src/modules/moduleRegistry.ts` maps names to components (BROWSER, STACK, WORKFLOW)

## Conventions

- **All components use inline styles** (no CSS modules, no styled-components). Pattern: `BrowserWindow.tsx`.
- **Animation delays are frame-based** (30fps). Timeline exports frame constants; components check against them.
- **No decorative animation** — the Motion Design Constitution requires every movement to reveal, guide, explain, connect, transform, or emphasize.
- **Scene creation workflow**: Creative direction → component architecture → timeline → orchestrator → register in `Root.tsx` → verify with `vite build`.
- **File naming**: `PascalCase.tsx` for components, `camelCase.ts` for utilities and constants.

## Motion Design Constitution (summary)

- Animate ideas, not words. Visuals before text.
- Every frame could be a poster — composition quality before animation quality.
- One focal point per frame. Dominant primary, single secondary, minimal supporting.
- Negative space is a design element. Objects must breathe.
- Progressive storytelling: beginning → escalation → payoff. Never jump to the final state.
- No generic scale/fade/slide as primary animation language. Motion must feel physically motivated.
- Build reusable components. Never hardcode one-off animations.

## Gotchas

- No `tsconfig.json` — Vite handles TS internally. New files may hit strict errors without explicit types.
- ESLint config references `tsconfig.node.json` and `tsconfig.app.json` which don't exist yet.
- No test framework configured (`npm test` echoes only).
- `type: "commonjs"` in `package.json` — use `node ./node_modules/.bin/<tool>` instead of `npx`.
- On Termux/Android, Remotion needs `--browser-executable=/data/data/com.termux/files/usr/bin/chromium-browser` flag (already set in `package.json` scripts). On standard Linux/macOS/Windows, remove this flag.
