## Objective
- Wife gets a browser-accessible LTX-2.3 text/image-to-video generator (character reads script) via a shareable Gradio `gradio.live` link, paid from the new funded Lightning AI account (`fmssylvester-org`, $14 free credit). Resolution changes must NOT alter the character — generate at base res, then pixel-upscale the finished video.

## ⚠️ CRITICAL: Studio disk is EPHEMERAL
- `/teamspace/studios/this_studio` is **wiped on instance recycle** (spot preemption / 4 h cap). On restart, ComfyUI + 33 GB weights + all scripts are GONE. The persistent teamspace mounts (`deploy-model-devbox`, `uploads`) are **read-only** from the studio, so we CANNOT back up there. **Every restart requires a full re-deploy (~15–20 min).**
- **Re-deploy procedure (after any restart):** push `deploy_ltx.py` → run `python deploy_ltx.py` in background (downloads weights, clones ComfyUI + 5 nodes, applies kornia patch, fetches 4x model) → push `launch_app.py` + `upscaler.py` → `python launch_app.py`. `test_features.py` for smoke test (needs ComfyUI running: `cd ComfyUI && python main.py --dont-print-server &`).

## Important Details
- Termux/Android. Control venv: `/data/data/com.termux/files/home/runner_env/bin/python` (py3.14), `lightning_sdk` v2026.07.09.post0.
- Platform = Lightning AI. Machine = GCP **RTX PRO 6000 Blackwell** (97 GB VRAM, `g4-standard-48`). Interruptible ≈ $2.61/hr, **4 h auto-stop cap** (instance running since ~05:18 UTC, cap ~09:18 UTC; ~2 h left).
- **New funded account**: `LIGHTNING_USER_ID=711cfb1f-4360-4912-a362-1e1cf22f6331`, `LIGHTNING_API_KEY=c40a1b97-2846-4170-9641-69569d9b43ac`. Org `fmssylvester-org`, teamspace `deploy-model-project`, studio `teammate-2-deploy-model-devbox` (studio id `01kxkxgvvdrbm7xs3e9gznbfr3`, tsid `01kxkxc6q1zcj0vmr6k7kj9wt3`). Has **$14 free credit**.
- **Old wife account** (`chijuliet167`/`droidclinics`, org `chijuliet167-av8jl`) is **$0 and unused**.
- **Model = GGUF quantized**: unet `unsloth/LTX-2.3-GGUF/ltx-2.3-22b-dev-Q4_K_M.gguf`; Gemma GGUF `Dampfinchen/google-gemma-3-12b-it-qat-q4_0-gguf-small-fix/gemma-3-12b-it-q4_0_s.gguf`; `Kijai/MelBandRoFormer_comfy`; `Lightricks/ComfyUI-LTXVideo`; `Lightricks/LTX-2.3`. Also `philz1337x/upscaler/4x-UltraSharp.pth` (67 MB) in `ComfyUI/models/upscale/`.
- AICHUCKY workflow `https://raw.githubusercontent.com/AICHUCKY/Comfyui-Workflows/AICHUCKY-patch-1/Ltx2.3%20.json`. App overrides node 134 LoRA → `ltx-2.3-22b-distilled-lora-384-1.1.safetensors`.
- **WORKFLOW CHAIN**: start-frame = `167 LoadImage → 165 ImageResizeKJv2 → 246 ResizeImagesByLongerEdge → 162 LTXVPreprocess → 161 LTXVImgToVideoInplace`. End-frame deep-copies **165/246/162**. `LTXVImgToVideoInplace` (161) has a SINGLE `image` input → end frame overrides start frame.
- **UI**: `Aspect Ratio` + `Generate At` (720p/1080p/2K/4K) + `Upscale Output To` (Same/720p/1080p/2K/4K). `compute_dims` snaps to 32. Character consistency = generate at base res (locks via Start Frame + seed), then pixel-upscale.
- **Upscaler**: `upscaler.py` (Spandrel 0.4.2 + `4x-UltraSharp.pth`). ~1.1 s/frame at 4x. `cv2.VideoWriter` `mp4v` writes mp4 (no system ffmpeg).
- **deploy_ltx.py is now HARDENED** (one-shot): numpy==2.5.1, torch cu128, scipy==1.18, scikit-learn==1.9, matplotlib==3.11, rotary-embedding-torch, spandrel; clones ComfyUI + 5 nodes; **robust kornia patch** (`torch.nn.functional.pad(`→`F.pad`, adds `import torch.nn.functional as F` if missing); downloads all weights + 4x model; does NOT launch Gradio (we launch `launch_app.py` separately). `aria2` can't install (no root) → falls back to `requests` streaming download (works, slower).
- Env (cloudspace conda env, py3.12, torch 2.11/cu128): numpy 2.5.1, scipy 1.18, sklearn 1.9, matplotlib 3.11, rotary_embedding_torch, spandrel 0.4.2, kornia patched.
- SDK start: `Studio(name="teammate-2-deploy-model-devbox", teamspace="deploy-model-project", org="fmssylvester-org")` then `s._studio_api._client.cloud_space_service_start_cloud_space_instance(CloudSpaceServiceStartCloudSpaceInstanceBody(compute_config=V1UserRequestedComputeConfig(name="g4-standard-48", spot=True, cluster_override="gcp-lightning-public-prod", requested_run_duration_seconds="14400")), s._teamspace.id, s._studio.id)`. `Studio()` / `s.run()` intermittently hang on flaky TLS — use retry loop; for long commands run in background `> log 2>&1 &` and poll the log.
- ComfyUI `:8188`; Gradio `:7860` `share=True`. `launch_app.generate_video` auto-boots ComfyUI via `boot_server()` if not running.

## Work State
### Completed (this recovery)
- Discovered studio disk was wiped (ephemeral). Hardened `deploy_ltx.py` into a one-shot installer.
- Re-ran `deploy_ltx.py`: cloned ComfyUI + 5 nodes, downloaded 33 GB weights + 4x model, applied kornia patch, installed scipy/sklearn/matplotlib/rotary.
- Patched kornia on studio (confirmed `torch.nn.functional.pad`→`F.pad`).
- Pushed `launch_app.py` + `upscaler.py`; launched Gradio.
- Started ComfyUI backend; **smoke test `test_features.py` → T2V=True, I2V+endframe=True**.
- **Current live link: `https://ca6bc00ca69ce3ed64.gradio.live`** (Gradio + ComfyUI running).

### Active
- Feature complete & verified. Wife workflow: **Generate At = 720p** (fast, locks character), **Upscale Output To = 1080p/2K/4K**.

### Blocked
- Persistent backup impossible (teamspace mounts read-only from studio). Mitigation = fast re-deploy via hardened `deploy_ltx.py`.

## Next Move
1. Hand wife link `https://ca6bc00ca69ce3ed64.gradio.live`.
2. If studio stops (~09:18 UTC / credit out): re-deploy per procedure above (push deploy_ltx.py → run it → push launch_app.py+upscaler.py → launch).
3. Optional future: investigate non-spot instance or a writable persistent mount to avoid re-downloads.

## Relevant Files
- `/data/data/com.termux/files/home/lightning-ai/deploy_ltx.py` — HARDENED one-shot installer (numpy 2.5.1, scipy/sklearn/matplotlib/rotary, robust kornia patch, 4x model, no gradio). **Push + run on restart.**
- `/data/data/com.termux/files/home/lightning-ai/launch_app.py` — main Gradio UI (`Generate At` + `Upscale Output To`, end-frame, extend). **Push + launch.**
- `/data/data/com.termux/files/home/lightning-ai/upscaler.py` — Spandrel 4x upscaler. **Push.**
- `/data/data/com.termux/files/home/lightning-ai/test_features.py` — T2V + I2V end-frame smoke test (needs ComfyUI running). **Push for testing.**
- Studio: `/teamspace/studios/this_studio/{deploy_ltx.py, launch_app.py, upscaler.py, test_features.py, ComfyUI, ComfyUI/models/upscale/4x-UltraSharp.pth, ComfyUI/output/video/}` — all rebuilt this session; will be wiped on next restart.
- AICHUCKY workflow: `https://raw.githubusercontent.com/AICHUCKY/Comfyui-Workflows/AICHUCKY-patch-1/Ltx2.3%20.json`.
