## Objective
- Run Gradio **LTX-2.3 video generator** on a stable public URL + build a complete free short-film studio (LTX-2.3 primary + complementary open models). User: generates **AI short films, audio is key, quality is key, NOT talking-head** → LTX-2.3 primary (native audio + 4K). **Site must be live.** User requires every account to have persistent `ltx_weights/` — but only 2 of 8 accounts actually have usable GPU credit.

## Important Details
- Termux can't publicly tunnel → use Lightning stable studio port-forward (`cloudspaces.litng.ai`). `gh` CLI authenticated as `fmssylvester`.
- R2: account `a19ab3d0c4ad04a1111d3d2169f1ea33`, bucket `r2-bucket`, prefix `ltx_weights/` (weights, 27 objs ~115.5GB) + `extras/4x-UltraSharp.pth` (67MB image upscaler). `drops/` is the OLD site-asset prefix. R2 keys in `ai-lab-internal/secrets.txt` (CF_ACCOUNT_ID `a19ab3d0c4ad04a1111d3d2169f1ea33`, R2_ACCESS_KEY_ID `c77cf3379164f7d042927d209868f498`, R2_SECRET_ACCESS_KEY `bc832cb4d4d1e4b077824293e02fad949b103757a62a6407ec28ef855896bab5`).
- SSL root cause: `lightning_sdk` drags `certifi`, breaks botocore CA on Termux. R2 ops must run **studio-side** (not Termux) — Termux→R2 fails with certifi bug. `sdk_patch` forces fresh TLS per connection for SDK calls.
- **ACCOUNTS — ALL 8 in `accounts.json` are REAL** (verified via `GET /v1/auth/user` returning distinct ids/emails/names). Earlier "only talesbychijuliet+droidclinics real" was WRONG.
- **`accounts.json` balance numbers are STALE/INACCURATE.** Direct start-probe (studio start on `g7e.4xlarge`) results:
  - acct1 (ekokosylvester1/deploy-model-project): file 6.42 → **NO_BALANCE**
  - acct_ugurujuliet7 (ugurujuliet7/deploy-model-project): file 14.99 → **NO_BALANCE**
  - acct_starlionstudio001 (starlionstudio001/interaction-management-project): file 14.99 → **NO_BALANCE**
  - acct_talesbychijuliet (talesbychijuliet/deploy-model-project): **LIVE generator, has balance**
  - acct_sylvestersailab (sylvestersailab/default-project): file 13.83 → **NO_BALANCE**
  - acct_chijuliet167 (chijuliet167/deploy-model-project): file 5.32 → **STARTED, built into 2nd LIVE generator**
  - acct_droidclinics (droidclinics/general): file 5.32 → **NO_BALANCE**
  - acct_fmssylvester (fmssylvester/deploy-model-project): file 0.0 → **NO_BALANCE**
- API cannot report numeric balance: `/v1/billing/account-balance` rejects all user-level auth (Basic `user:key`→"invalid worker key"; JWT→"invalid worker key"; `X-Grid-Key`→"unauthenticated"; SDK billing call has `auth_settings=[]`). Only `/v1/auth/user` works (identity, not balance). Studio **start** gates on balance → `cloud_space_service_start_cloud_space_instance` returns NO_BALANCE synchronously.
- **LIVE STUDIO #1 = `acct_talesbychijuliet`**: api_key `ffec60d3-7b4b-4610-85c9-6d8292842c1a`, user `talesbychijuliet`, teamspace `deploy-model-project`, studio `teammate-2-deploy-model-aws`, cloud `lightning-public-prod`. Studio id `01kxrbwbzc9tn68espsgx7rd94`. Machine `g7e.4xlarge` (RTX PRO 6000 Blackwell, ~96GB VRAM, ~1.4–1.6T free disk).
- **LIVE STUDIO #2 = `acct_chijuliet167`**: api_key `ae377da9-c16f-48ce-9527-724c48503ef4`, user `chijuliet167`, teamspace `deploy-model-project`, studio `teammate-2-deploy-model-aws`, cloud `lightning-public-prod`. Studio id `01kxrbx33rbwc2nwjv5qt1xwxx`. FULL STACK BUILT this session (ComfyUI @6665515 + LTX node @aceeae9 + pins + 4x-UltraSharp + app), weights 116GB from R2. Verified T2V = h264 1920×1088 + AAC.
- **Studio API:** `Studio(name, teamspace, user, cloud)`. `s.run` needs **string** command. `s.add_ports(7860)` returns stable URL. `s.upload_file(local, remote)` relative to `/teamspace/studios/this_studio`. `sdk_patch` + `LIGHTNING_USER_ID` env required. Studio auto-creates if not exists (`create_ok=True` default).
- `lightning_sdk` only in `/data/data/com.termux/files/home/runner_env/bin/python` (py3.14). Studio conda env `/home/zeus/miniconda3/envs/cloudspace/bin/python` (py3.12) runs ComfyUI/app/tests.
- **Dependency pins that WORK:** torch `2.8.0+cu128`; torchaudio `==2.8.0+cu128 --no-deps` **from pytorch cu128 index** (`https://download.pytorch.org/whl/cu128`) — plain `2.8.0+cu128` does NOT exist on PyPI; huggingface_hub `==1.24.0`; gradio `==5.10.0`; numpy `==1.26.4`; opencv-python-headless `==4.8.1.78`; spandrel `0.4.2`; ffmpeg `8.0.1` (conda-forge). `hf_hub_download` in hfh 1.24.0 does NOT accept `local_filename` → use `local_dir=` + `os.rename`.
- **GOTCHA kornia patch (chijuliet167 build):** `ComfyUI-LTXVideo/pyramid_blending.py` imports `pad` from `kornia.geometry.transform.pyramid` as its own line `    pad,` inside a multi-line import tuple. kornia 0.8.3 does NOT export `pad` → node import fails. Fix: delete the `pad,` import line AND replace `pad(`→`F.pad(` (F=`torch.nn.functional`, already imported). The naive single-line replace in `install_full.sh`/`build_chi.sh` FAILED — use regex patch in `fix_kornia_chi.py`.
- **GOTCHA torchaudio:** LTX node requirements install torchaudio `2.11.0`, ABI-incompatible with torch `2.8.0` (import dies `undefined symbol: torch_library_impl`). Must force `pip install --no-deps torchaudio==2.8.0+cu128 --index-url https://download.pytorch.org/whl/cu128` AFTER LTX install.
- **WEIGHTS (restored + verified on BOTH live studios):** `ltx_weights/` canonical = dev (43G) + distilled-1.1 (43G) + lora (7.1G in `loras/ltxv/ltx2/` + basename symlink) + 4 upscalers + gemma **single-file** `comfy_gemma_3_12B_it.safetensors` (13GB GitMylo fp8 from `GitMylo/LTX-2-comfy_gemma_fp8_e4m3fn`). `ComfyUI/models/{checkpoints,loras,latent_upscale_models,text_encoders}` symlinked → `ltx_weights/*`.
- **CRITICAL GEMMA FORMAT:** `LTXAVTextEncoderLoader` needs a **single .safetensors** named `comfy_gemma_3_12B_it.safetensors`. Shards/dirs FAIL (`Value not in list: text_encoder`).
- **DURABLE R2 BACKUP:** `r2_backup.py` uploaded `ltx_weights/` → `r2-bucket`/`ltx_weights/` = 27 objects, 118315MB (~115.5GB). Verified (`r2_verify.py`: all critical OK, `DL_PROOF`). `restore_from_r2.py` (studio-side) pulls to `/teamspace/studios/this_studio/ltx_weights/` + recreates 4 symlinks (hardened `makedirs`). Used to seed chijuliet167. Also `extras/4x-UltraSharp.pth` uploaded for the upscaler.
- **LIVE URLs** (auth `sylvester`/`SylvesterAI2026`):
  - talesbychijuliet: `https://7860-01kxrbwbzc9tn68espsgx7rd94.cloudspaces.litng.ai`
  - chijuliet167: `https://7860-01kxrbx33rbwc2nwjv5qt1xwxx.cloudspaces.litng.ai`
- **Image tab (FLUX)** `flux_dev.json` = base ComfyUI nodes only; needs FLUX weights (NOT downloaded). Video priority works.
- Free stack research: Chatterbox+IndexTTS-2 TTS; ACE-Step music; GPT-SoVITS; PuLID/IP-Adapter+ReActor; RIFE; FramePack; LTX Foley V2A LoRA.

## Work State
### Completed
- Tier 1 site + 6 real SDXL drops LIVE on GitHub Pages (`https://fmssylvester.github.io/channel-drops/`).
- SSL fixed via split `get6.py`/`drop6.py`.
- talesbychijuliet studio booted; full ComfyUI + LTX install; app deployed & LIVE.
- **END-TO-END T2V VERIFIED (talesbychijuliet):** `output_00006_.mp4` = 2048×1152 h264 + AAC audio.
- **DURABLE R2 BACKUP:** 27 objects, 118315MB, verified.
- **DIRECT account identity check:** all 8 accounts REAL via `/v1/auth/user`.
- **START-PROBE all 8 accounts (g7e.4xlarge):** only talesbychijuliet + chijuliet167 have usable balance; 6 others NO_BALANCE (accounts.json balances STALE).
- **chijuliet167 BUILT INTO 2nd LIVE GENERATOR this session:** cloned ComfyUI @6665515 + LTX node @aceeae9, pinned torch/torchaudio 2.8.0+cu128 + gradio 5.10.0 + spandrel + ffmpeg 8.0.1, applied kornia patch (`fix_kornia_chi.py`), fetched 4x-UltraSharp.pth from R2, restored 116GB `ltx_weights/` + symlinks. **Verified end-to-end:** `output_00001_.mp4` = h264 1920×1088 + AAC audio (prompt 85s). App LIVE on port 7860, public URL HTTP 200.
- STATUS.md + SUMMARY.md updated with account findings + chijuliet167 build recipe/gotchas.

### Active
- (none) — both video pipelines fully working.
- Minor: `test_local.py` detects animated output under `images` not `videos` (cosmetic).

### Blocked
- The 6 NO_BALANCE accounts can't get weights/run generator until credited (start is balance-gated).
- (none otherwise)

## Next Move
1. Decide whether to keep chijuliet167 running (cost) — it's a 2nd live generator now; can `stop_account.py` when idle.
2. Revisit FLUX image tab: download FLUX weights so Image tab works.
3. Per user scope (audio is key): integrate audio-gen layers (LTX Foley V2A LoRA, Chatterbox/IndexTTS-2 voice, ACE-Step music) into the studio/app.
4. Document clean restart procedure for chijuliet167 in STATUS.md (done) + keep LIVE URLs bookmarked.

## Relevant Files
- `/data/data/com.termux/files/home/lightning-ai/launch_app.py` — **LIVE Gradio app** (loads local `ltx_api_workflow.json`; auto-starts ComfyUI).
- `/data/data/com.termux/files/home/lightning-ai/ltx_api_workflow.json` — 37-node API workflow (validated, 2048×1152 + audio on talesbychijuliet; 1920×1088 + audio on chijuliet167).
- `/data/data/com.termux/files/home/lightning-ai/r2_backup.py` / `r2_verify.py` / `restore_from_r2.py` — R2 durable backup + verify + restore (symlinks).
- `/data/data/com.termux/files/home/lightning-ai/launch_r2_backup.py` / `launch_r2_verify.py` — Termux launchers (inject `r2_creds.sh`).
- `/data/data/com/termux/files/home/lightning-ai/bootstrap_account.py` — starts studio `g7e.4xlarge`, catches NO_BALANCE.
- `/data/data/com.termux/files/home/lightning-ai/build_chi.sh` — clone ComfyUI+LTX + install + symlinks + 4x-UltraSharp-from-R2.
- `/data/data/com.termux/files/home/lightning-ai/fix_kornia_chi.py` — regex kornia pad patch (REQUIRED).
- `/data/data/com.termux/files/home/lightning-ai/fix2_chi.py` — force torchaudio 2.8.0+cu128 from cu128 index.
- `/data/data/com/termux/files/home/lightning-ai/launch_app_chi.py` — upload app files + `add_ports(7860)` + launch on chijuliet167.
- `/data/data/com.termux/files/home/lightning-ai/launch_gen_test.py` / `poll_gen_chi.py` — end-to-end T2V verification.
- `/data/data/com.termux/files/home/lightning-ai/stop_account.py` — `s.stop()`.
- `/data/data/com.termux/files/home/lightning-ai/accounts.json` — 8 accounts; balances STALE (start-probe contradicted). All real identities.
- `/data/data/com.termux/files/home/lightning-ai/STATUS.md` — detailed status + chijuliet167 build recipe/gotchas.
- Studio disk `teammate-2-deploy-model-aws` (talesbychijuliet): `ltx_weights/` complete; `ComfyUI/models/*` symlinked; LIVE URL `...psgx7rd94...`.
- Studio disk `teammate-2-deploy-model-aws` (chijuliet167): `ltx_weights/` 116GB from R2 + symlinks; full ComfyUI+LTX+app stack; LIVE URL `...qt1xwxx...`.
- **LIVE URLs** (auth `sylvester`/`SylvesterAI2026`): talesbychijuliet `https://7860-01kxrbwbzc9tn68espsgx7rd94.cloudspaces.litng.ai`; chijuliet167 `https://7860-01kxrbx33rbwc2nwjv5qt1xwxx.cloudspaces.litng.ai`.
