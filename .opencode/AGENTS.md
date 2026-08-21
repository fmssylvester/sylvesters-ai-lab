# Project Status — Sylvester's AI Lab (LTX-2.3 Video Generator)

## Objective
Run a Gradio **LTX-2.3 video generator** on a stable public URL + build a complete free short-film studio (LTX-2.3 primary + complementary open models). User: generates **AI short films, audio is key, quality is key, NOT talking-head** → LTX-2.3 primary (native audio + 4K). **Site must be live by end of day.**

## IMPORTANT — Live App URL (NEW, 2026-07-20)
- **App is LIVE**: `https://7860-01kxrbwbzc9tn68espsgx7rd94.cloudspaces.litng.ai`
- **Auth**: user `sylvester` / pass `SylvesterAI2026`
- Exposed via `Studio.add_ports(7860)` on the **talesbychijuliet** studio. Proxy takes ~3-4 min to propagate after first add_ports.
- End-to-end verified: Gradio → ComfyUI → LTX-2.3 produced `output_00003_.mp4` ("Done!").

## Important Details
- Termux can't publicly tunnel → use Lightning's stable studio port-forward (`cloudspaces.litng.ai`). `gh` CLI authenticated as `fmssylvester`.
- R2: account `a19ab3d0c4ad04a1111d3d2169f1ea33`, bucket `r2-bucket`, prefix `drops/`. `drops.py` reads `SECRETS_PATH=.../secrets.txt`.
- SSL root cause: `lightning_sdk` drags `certifi`, breaks botocore CA. Fix = split `get6.py`/`drop6.py`.
- `/tmp` NOT writable on Termux → use `/data/data/com.termux/files/home/ai-lab-internal/.drops/`.
- **ACCOUNTS:** `accounts.json` JSON balances are FICTIONAL. ONLY `acct_talesbychijuliet` has credit. Others (starlionstudio001, chijuliet167) DRY/stopped.
- **LIVE STUDIO = `acct_talesbychijuliet`**: api_key `ffec60d3-7b4b-4610-85c9-6d8292842c1a`, user `talesbychijuliet`, teamspace `deploy-model-project`, studio `teammate-2-deploy-model-aws`, cloud `litng-ai-01`. Machine `g7e.4xlarge` (RTX PRO 6000 Blackwell, 97887 MiB VRAM, 1.6TB free).
- `Studio(name, teamspace, user, cloud)`. `s.run` needs a **string** command (not list). `s.add_ports(7860)` returns the stable URL. `sdk_patch` + `LIGHTNING_USER_ID` env required for Studio init.
- `lightning_sdk` only in `/data/data/com.termux/files/home/runner_env/bin/python` (py3.14).
- **Studio conda env** `/home/zeus/miniconda3/envs/cloudspace/bin/python` (py3.12) — this is what runs ComfyUI, the app, and tests.
- **Dependency pins that WORK on studio (CRITICAL, took many iterations):**
  - torch `2.8.0+cu128`; **torchaudio MUST be `==2.8.0+cu128 --no-deps`** (was 2.11.0 → ABI `undefined symbol: torch_library_impl`).
  - huggingface_hub `==1.24.0` (ComfyUI/LTX node + diffusers/transformers need ≥0.34; do NOT downgrade).
  - **gradio `==5.10.0`** (4.44.1 breaks on this cloud's new fastapi/starlette; 5.x works). gradio_client 1.5.3.
  - numpy `==1.26.4` + opencv-python-headless `==4.8.1.78` (opencv 5 pulled numpy 2 → breaks ComfyUI; pin both).
  - Patched gradio `oauth.py` on studio to tolerate removed `HfFolder` (harmless shim; needed only if gradio 4.x used).
  - fastapi/starlette resolved by gradio 5.10.0 (starlette 0.52.1).
- **kornia fix (correct path):** `custom_nodes/ComfyUI-LTXVideo/pyramid_blending.py` — remove `pad,` from `kornia.geometry.transform.pyramid` import; replace `pad(`→`F.pad(` (F=torch.nn.functional).
- **Gemma text encoder:** `LTXAVTextEncoderLoader` needs `comfy_gemma_3_12B_it.safetensors` in `models/text_encoders/`. Google `gemma-3-12b-it-qat-q4_0-unquantized` is GATED (401). Use ungated `GitMylo/LTX-2-comfy_gemma_fp8_e4m3fn` → `gemma_3_12B_it_fp8_e4m3fn.safetensors` renamed. 13.2GB, downloaded. ComfyUI MUST be restarted after adding it (stale model cache → "text_encoder not in list").
- **Architecture:** `launch_app.py` (Gradio :7860) → ComfyUI (:8188) via `/prompt`. The app loads **local** `ltx_api_workflow.json` (no remote fetch now).
- **Official UI workflow** `Lightricks/ComfyUI-LTXVideo@master` `example_workflows/2.3/LTX-2.3_T2V_I2V_Two_Stage_Distilled.json` (52KB) fetched as `ltx_workflow.json`. `/graph/convert` = 405 (unavailable) → wrote `convert_api.py` (UI→API via `object_info.json`).
- **Converted workflow** `ltx_api_workflow.json` (37 nodes) uses NEW node naming: `KSamplerSelect`+`SamplerCustomAdvanced`+`CFGGuider`+`ManualSigmas` (+ `LTXVImgToVideoConditionOnly`, `LTXVTiledVAEDecode`, `LTXVAudioVAEDecode`, `CreateVideo`, `SaveVideo`). Two-stage distilled: ckpt `ltx-2.3-22b-distilled-1.1.safetensors` + lora `ltx-2.3-22b-distilled-lora-384-1.1.safetensors` (strength 0.5); text_encoder `comfy_gemma_3_12B_it.safetensors`; sigmas hardcoded (stage1 9-step lcm, stage2 4-step euler_cfg_pp); cfg 1.0.
- **Free short-film stack (research done):** LTX-2.3 primary; Chatterbox+IndexTTS-2 TTS; ACE-Step music; GPT-SoVITS voice clone; PuLID/IP-Adapter+ReActor; RIFE interp; FramePack long-form; LTX Foley V2A LoRA. Wan/Hunyuan rejected (no native audio).

## Work State
### Completed
- Tier 1 site + 6 real SDXL drops LIVE on GitHub Pages (`https://fmssylvester.github.io/channel-drops/`).
- SSL fixed via split `get6.py`/`drop6.py`.
- talesbychijuliet studio booted (RTX PRO 6000, 96GB).
- Full ComfyUI + LTX install from scratch: ComfyUI cloned, deps, LTX node, all 88GB weights, torchaudio pinned, kornia patched, gemma downloaded. ComfyUI HTTP 200, LTX node imported (39 LTX classes).
- UI→API converter built; 37-node `ltx_api_workflow.json` validates (`node_errors: {}`).
- Gemma encoder downloaded (GitMylo) + ComfyUI restarted so it's listed.
- **Gradio app deployed & LIVE externally** (verified end-to-end: produced `output_00003_.mp4` via the app's own API).
- Dependency stack pinned & stabilized on studio (gradio 5.10.0, numpy 1.26.4, opencv 4.8.1.78, huggingface_hub 1.24.0, torchaudio 2.8.0+cu128).

### Known gaps / Not yet done
- **Image tab (FLUX)** in `launch_app.py` uses `flux_dev.json` which needs FLUX weights (NOT downloaded) → image gen errors. Video (the priority) works.
- **Complementary audio/layers** (Chatterbox TTS, ACE-Step, RIFE, PuLID/ReActor, FramePack) not yet added to the studio.
- Studio must stay RUNNING for the URL to work; if it stops, re-run `video_tales_boot.py` + restart ComfyUI + relaunch app.

### Blocked
- (none — app is live)

## Next Move
1. (Optional) Wire image tab: add FLUX weights OR repurpose to a model we have.
2. Add complementary layers: Chatterbox TTS → ACE-Step → RIFE → PuLID/ReActor → FramePack, building the full free short-film studio.
3. Persist: ensure studio stays up; document the run/restart procedure (`video_tales_boot.py`, `restart_comfy.py`, `relaunch_app2.py`).

## Relevant Files
- `/data/data/com.termux/files/home/ai-lab-internal/channel-drops/` — live site (6 real sdxl drops).
- `/data/data/com.termux/files/home/lightning-ai/drops.py`, `get6.py`, `drop6.py` — R2/GitHub sync.
- `/data/data/com.termux/files/home/lightning-ai/launch_app.py` — **LIVE Gradio app** (patched: loads local `ltx_api_workflow.json`, drives official distilled node IDs 2483/2612/4987/2004/4988/3059/3940/4982/4922/4831/4976/4984/4985/4828/4964/4832/4967).
- `/data/data/com.termux/files/home/lightning-ai/accounts.json` — ONLY `acct_talesbychijuliet` has credit.
- `/data/data/com.termux/files/home/lightning-ai/install_full.sh` — full ComfyUI+LTX+weights install (ran).
- `/data/data/com.termux/files/home/lightning-ai/patch_kornia.py`, `patch_hf_folder.py` — patches.
- `/data/data/com.termux/files/home/lightning-ai/convert_api.py` — UI→API converter. `ltx_workflow.json` (UI), `ltx_api_workflow.json` (API, 37 nodes).
- `/data/data/com.termux/files/home/lightning-ai/object_info.json` — dumped (888 node types).
- `/data/data/com.termux/files/home/lightning-ai/gemma_dl2.sh` — gemma download (GitMylo → renamed).
- `/data/data/com.termux/files/home/lightning-ai/{test_local.py, validate.py, e2e_app.py}` — test harnesses (e2e proved app works).
- `/data/data/com.termux/files/home/lightning-ai/{video_tales_boot.py, restart_comfy.py, relaunch_app2.py, expose.py, check_*.py}` — ops scripts.
- `/data/data/com.termux/files/home/lightning-ai/upscaler.py`, `assets_b64.py`, `flux_dev.json` — recovered from old studio.
- Studio disk `teammate-2-deploy-model-aws` (talesbychijuliet): ComfyUI at `/teamspace/studios/this_studio/ComfyUI`; node `custom_nodes/ComfyUI-LTXVideo/` (pyramid_blending.py patched); weights in `models/{checkpoints,loras,latent_upscale_models}`; gemma `models/text_encoders/comfy_gemma_3_12B_it.safetensors`; `ltx_api_workflow.json`, `launch_app.py`, `upscaler.py`, `assets_b64.py`, `flux_dev.json`, `comfyui_server.log`, `app.log`.
- **LIVE URL**: `https://7860-01kxrbwbzc9tn68espsgx7rd94.cloudspaces.litng.ai` (auth `sylvester`/`SylvesterAI2026`).
