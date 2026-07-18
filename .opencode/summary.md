## Objective
- Wife gets a browser-accessible LTX-2.3 T2V/I2V generator (character reads script) via a shareable Gradio `gradio.live` link, paid from the funded Lightning AI account. Resolution changes must NOT alter the character — generate at base res, then pixel-upscale the finished video as a SEPARATE post-step ("Enhance").
- **Usage pattern (user-confirmed):** machine runs only in short ~1 h sessions, once/twice a day when there are videos to generate, then **PAUSE immediately**. Top up credits later and repeat. NOT 4 h straight.

## CRITICAL CREDIT RULE (save + never violate)
- Machine = **RTX 6000 = `g4-standard-48`** (Lightning labels it "RTXP 6000" / "RTX PRO 6000 Blackwell", 96 GB — the only 6000-class GPU available; required for LTX-2.3 22B).
- **Pricing: on-demand = $4.64/hr; INTERRUPTIBLE (spot) = $2.14/hr.** ALWAYS start `spot=True` (interruptible) → ~$2/hr. **NEVER on-demand** — that is the 2× credit waste the user calls "the pro version".
- **Cloud mismatch:** studio is on **GCP** (`gcp-lightning-public-prod`); the **$2.14 interruptible rate is the AWS price**. GCP's `g4-standard-48` is likely the $4.64 on-demand rate with no cheap interruptible. So the cheap RTX 6000 the user wants may require the studio to run on **AWS**, not GCP. UNRESOLVED — see Blocked.
- Billing: credits bought at org **`Fmsylvester Org`**; allocated to teamspace **`deploy-model-project`** (studio `teammate-2-deploy-model-devbox`); login user **`droidclinics`**.

## Important Details
- Termux/Android. Control venv: `/data/data/com.termux/files/home/runner_env/bin/python` (py3.14), `lightning_sdk` v2026.07.09.post0. Local files live in `/data/data/com.termux/files/home/lightning-ai/` (survive studio wipes).
- **SDK TLS bug (this env)**: `lightning_sdk` reuses pooled TLS connections through a proxy and fails with `INVALID_SESSION_ID`/`BAD_RECORD_MAC`/`RECORD_LAYER_FAILURE`. Fixed by **`sdk_patch.py`** (forces `urllib3` `keep_alive=False` per request) — MUST be imported before `lightning_sdk`.
- **SDK `Machine.RTXP_6000` is buggy**: its `.family == "RTX PRO"` (with space) ≠ cluster family `"RTXP"`, so `Studio.start()`'s `machine_is_supported()` wrongly fails. Start via raw API: `cloud_space_service_start_cloud_space_instance(body, teamspace_id, studio_id)` with `V1UserRequestedComputeConfig(name="g4-standard-48", spot=True, requested_run_duration_seconds="7200")` (NO `cluster_override` — the start body rejects it).
- **Last-used machine is persisted** in `/data/data/com.termux/files/home/lightning-ai/machine_state.json` (cloud, machine, spot, runtime, teamspace, user, org). `restart_studio.py` loads it (safe defaults) and rewrites it after a successful start, so the system "remembers" the exact machine and never drifts to a pricier config.
- Model = GGUF quantized: unet `LTX-2.3-Q4_K_M.gguf`, Gemma GGUF, MelBandRoFormer, `Lightricks/ComfyUI-LTXVideo`, `Lightricks/LTX-2.3`; `4x-UltraSharp.pth` in `ComfyUI/models/upscale/`. AICHUCKY workflow with app override node 134 LoRA.
- **UI (launch_app.py, DECOMPLED ENHANCE)**: `Generate Video` = pure LTX at `Generate At` res. Separate **Enhance** section BENEATH the output panel: `enhance_video_in` (gr.Video to add a video) + `Enhance Target` dropdown + `Enhance Video` button. `enhance_video(src_video, target)` uses the added video or `get_latest_video()`; `upscale_video` raises on unreadable output and `enhance_video` falls back to returning the ORIGINAL (never a broken file). `is_valid_video()` guard in `upscaler.py`.
- `bootstrap.py` (studio-side): deploys ComfyUI+weights only if missing, starts ComfyUI if down, **kills any running `launch_app.py` then relaunches** so updated code applies, prints `GRADIO LINK:`.
- `restart_studio.py` (control-side): imports `sdk_patch`, loads `machine_state.json`, connects via `user="droidclinics"` + `cloud` from state, starts instance (raw API, `g4-standard-48`, **interruptible**, 2 h cap), pushes the 4 files (base64), runs `bootstrap.py`, polls `bootstrap.log` for the link.
- `stop_studio.py` (control-side): one-command **pause** via `Studio.stop()` so credits stop burning the moment a batch is done.
- ComfyUI `:8188`; Gradio `:7860` `share=True`.

## Work State
### Completed
- Fixed SDK TLS connectivity (`sdk_patch.py`).
- Determined access path (user `droidclinics`, cloud `gcp-lightning-public-prod`, machine `g4-standard-48`), bypassed buggy `machine_is_supported` with raw start API.
- Decoupled Enhance UI (local, compiles) + upscaler hardening.
- **Persisted last-used machine** (`machine_state.json`) + added `stop_studio.py`; `restart_studio.py` now loads/saves state and uses 2 h interruptible cap.
- Screenshot (9:48) confirmed the RTX 6000 is **$4.64 on-demand / $2.14 interruptible**; user wants the interruptible rate.

### Active
- All local code (launch_app.py, upscaler.py, bootstrap.py, deploy_ltx.py, restart_studio.py, stop_studio.py, sdk_patch.py, machine_state.json) is ready and compiles.

### Blocked
- **STUDIO STILL CANNOT START — `insufficient balance`.** Confirmed: studio is on GCP; user transferred ~$3 to teamspace `deploy-model-project`, but start still fails "user has insufficient balance". Two likely causes (unresolved):
  1. GCP's `g4-standard-48` costs the **$4.64 on-demand** rate (no $2.14 interruptible on GCP), so ~$3 can't cover even 1 h → need more credits, OR move studio to **AWS** for the $2.14 rate.
  2. The studio bills the **org wallet** (`Fmsylvester Org`), and the org→teamspace transfer drained it; credits need to stay in / be added to the org.
- Billing REST API needs a session token (not the API key), so balances can't be read programmatically from here — user must verify in the Lightning UI.
- True disk-persistence still needs a writable Cloud Account bucket; not done.

## Next Move
1. **Resolve credits/cloud** (user action): either (a) buy enough credits to cover GCP's RTX 6000 rate (≈$10+ for a couple of hours) keeping GCP, or (b) move/recreate the studio on **AWS** to get the $2.14 interruptible RTX 6000. Also confirm credits sit in the wallet the studio bills (org, not just teamspace).
2. Once startable: run `python restart_studio.py` → starts interruptible `g4-standard-48`, pushes files, deploys-if-missing, relaunches Gradio with new Enhance UI; capture `gradio.live` link.
3. Verify Enhance panel + a test generate/enhance (no broken file); confirm instance is interruptible (~$2.14).
4. When done: `python stop_studio.py` to pause. Top up → repeat.

## Relevant Files
- `/data/data/com.termux/files/home/lightning-ai/machine_state.json` — persists last-used machine (cloud, machine, spot, runtime, teamspace, user, org) + credit note.
- `/data/data/com.termux/files/home/lightning-ai/sdk_patch.py` — fixes SDK TLS connection-reuse failures.
- `/data/data/com.termux/files/home/lightning-ai/restart_studio.py` — loads/saves state; start (interruptible, 2h) + push + relaunch.
- `/data/data/com.termux/files/home/lightning-ai/stop_studio.py` — one-command pause.
- `/data/data/com.termux/files/home/lightning-ai/bootstrap.py` — deploy-if-missing + kill/relaunch Gradio + print link.
- `/data/data/com.termux/files/home/lightning-ai/launch_app.py` — UI with decoupled Enhance panel beneath output.
- `/data/data/com.termux/files/home/lightning-ai/upscaler.py` — Spandrel 4x + `is_valid_video` guard.
- `/data/data/com.termux/files/home/lightning-ai/deploy_ltx.py` — hardened one-shot ComfyUI+weights installer.
- Studio: `/teamspace/studios/this_studio/` (ephemeral) — rebuilt on restart; local copies are source of truth.
