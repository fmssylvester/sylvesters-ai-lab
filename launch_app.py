import os, sys, json, glob, socket, threading, time, urllib.request, urllib.error, subprocess, shutil
from pathlib import Path
from PIL import Image
import gradio as gr
from upscaler import upscale_video, is_valid_video, upscale_image
from assets_b64 import ASSETS_B64
from voiceover import generate as vo_generate, combine as vo_combine, strip_audio, VOICE_PRESETS
from voice_cloner import clone_voice as vc_clone, list_backends as vc_backends, LANGUAGES as VC_LANGUAGES
from swapper import swap_face, swap_video, extract_faces as sw_extract_faces
from interpolator import interpolate_video
from scene import linear_pipeline, script_to_scenes
from avatars import AvatarGenerator, SCRIPT_PRESETS, AVATAR_STYLES

# Director Agent (AI prompt expansion). Optional module; if absent, auto-direct is a no-op.
try:
    import director
except Exception:
    director = None

# --- work around a gradio_client bug: component api_info schemas can carry a
# boolean `additionalProperties`/`const`, which crashes the type parser. ---
try:
    import gradio_client.utils as _gcu
    _gcu_j = _gcu._json_schema_to_python_type
    _gcu_g = _gcu.get_type
    def _safe_j(schema, defs=None):
        return _gcu_j(schema, defs) if isinstance(schema, dict) else "str"
    def _safe_g(schema, *a, **k):
        return _gcu_g(schema) if isinstance(schema, dict) else "str"
    _gcu._json_schema_to_python_type = _safe_j
    _gcu.get_type = _safe_g
except Exception:
    pass

# --- container workaround: gradio's localhost self-check can fail inside the
# studio's network namespace even though the server is reachable locally. ---
try:
    import gradio.networking as _net
    _net.url_ok = lambda *a, **k: True
except Exception:
    pass

LIGHTNING_WORKSPACE = Path("/teamspace/studios/this_studio")
BASE_PATH = LIGHTNING_WORKSPACE if LIGHTNING_WORKSPACE.exists() else Path.cwd()
COMFY_PATH = str(BASE_PATH / "ComfyUI")
LORA_11_NAME = "ltx-2.3-22b-distilled-lora-384-1.1.safetensors"
COMFY_LOG_PATH = str(BASE_PATH / "comfyui_server.log")
OUTPUT_PATH = f"{COMFY_PATH}/output"
INPUT_PATH = f"{COMFY_PATH}/input"
FLUX_WF = str(BASE_PATH / "flux_dev.json") if (BASE_PATH / "flux_dev.json").exists() else str(Path.cwd() / "flux_dev.json")
os.makedirs(INPUT_PATH, exist_ok=True)

# Brand assets (logo + avatar) are embedded as base64 in assets_b64.py.
# Decode the avatar once so it can be used as the default I2V "character" frame.
AVATAR_FRAME_PATH = str(BASE_PATH / "lab_avatar.png")
try:
    import base64 as _b64
    with open(AVATAR_FRAME_PATH, "wb") as _f:
        _f.write(_b64.b64decode(ASSETS_B64["avatar_frame"]))
except Exception:
    AVATAR_FRAME_PATH = None


# ---- Phase B: stable Cloudflare Tunnel + R2 gallery + Telegram notify ----
_PHASE_B = False
_SECRETS = None
_tunnel_proc = [None]
try:
    from phase_b import tunnel_manager, r2_gallery, telegram_notify
    from phase_b.secrets import load as _load_secrets
    _SECRETS = _load_secrets()
    _PHASE_B = False  # exposure handled by Lightning's stable studio port-forward
    print(f"[phase_b] enabled (secrets: {_SECRETS.path})")
except Exception as _e:
    print(f"[phase_b] disabled: {_e}")
    _SECRETS = None


def _publish(kind, prompt, media_path):
    """Upload generated media to R2 and ping Telegram. Best-effort."""
    if not _PHASE_B:
        return
    try:
        url = None
        if media_path and os.path.exists(media_path) and _SECRETS.r2_access_key:
            try:
                _, url = r2_gallery.upload_file(media_path)
            except Exception as _up:
                print(f"[phase_b] r2 upload failed: {_up}")
        if url:
            telegram_notify.notify_generation(kind, prompt, url, media_path)
        else:
            telegram_notify.notify_generation(kind, prompt, None, media_path)
    except Exception as _p:
        print(f"[phase_b] publish failed: {_p}")


def is_server_running(port=8188):
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        return s.connect_ex(("127.0.0.1", port)) == 0


def boot_server():
    os.environ["PYTORCH_CUDA_ALLOC_CONF"] = "expandable_segments:True"
    log = open(COMFY_LOG_PATH, "a", encoding="utf-8")
    proc = subprocess.Popen(["python", "main.py", "--normalvram", "--dont-print-server"], cwd=COMFY_PATH,
                             stdout=log, stderr=subprocess.STDOUT)
    start_time = time.time()
    while not is_server_running():
        if time.time() - start_time > 300:
            raise RuntimeError(f"Backend server failed to start within 5 minutes. Check {COMFY_LOG_PATH}.")
        time.sleep(2)


def load_workflow():
    p = os.path.join(BASE_PATH, "ltx_api_workflow.json")
    with open(p) as f:
        return json.load(f)


def queue_prompt(wf):
    data = json.dumps({"prompt": wf}).encode("utf-8")
    req = urllib.request.Request("http://127.0.0.1:8188/prompt", data=data)
    try:
        return json.loads(urllib.request.urlopen(req).read())
    except urllib.error.HTTPError as e:
        raise RuntimeError(f"API ERROR: {e.read().decode()}")


def get_latest_video():
    mp4s = glob.glob(f"{OUTPUT_PATH}/**/*.mp4", recursive=True) + glob.glob(f"{OUTPUT_PATH}/*.mp4")
    if not mp4s:
        return None
    return max(mp4s, key=os.path.getctime)


QUALITY_EDGE = {"720p": 1280, "1080p (1K)": 1920, "1440p (2K)": 2560, "2160p (4K)": 3840}


def compute_dims(aspect, quality):
    long_edge = QUALITY_EDGE[quality]
    num, den = aspect.split(":")
    num, den = int(num), int(den)
    if num >= den:
        w = long_edge
        h = int(round(long_edge * den / num / 32) * 32)
    else:
        h = long_edge
        w = int(round(long_edge * num / den / 32) * 32)
    return max(256, w), max(256, h)


def compute_image_dims(aspect):
    long_edge = 1024
    num, den = aspect.split(":")
    num, den = int(num), int(den)
    if num >= den:
        w = long_edge
        h = int(round(long_edge * den / num / 16) * 16)
    else:
        h = long_edge
        w = int(round(long_edge * num / den / 16) * 16)
    return max(256, w), max(256, h)


def _has_exec_error(entry):
    for m in entry.get("status", {}).get("messages", []):
        if isinstance(m, (list, tuple)) and m and m[0] == "execution_error":
            return True
    return False


def _exec_error_message(entry):
    for m in entry.get("status", {}).get("messages", []):
        if isinstance(m, (list, tuple)) and m and m[0] == "execution_error":
            return (m[1].get("exception_message") or m[1].get("exception_type") or "unknown error")
    return "unknown execution error"


def _wait_for_pid(pid, progress, desc_busy):
    pid = str(pid)
    while True:
        try:
            h = json.loads(urllib.request.urlopen(f"http://127.0.0.1:8188/history/{pid}").read())
            if pid in h:
                entry = h[pid]
                if _has_exec_error(entry):
                    raise gr.Error("Generation failed: " + _exec_error_message(entry)[:400])
                return entry
            q = json.loads(urllib.request.urlopen("http://127.0.0.1:8188/queue").read())
            in_q = any(str(j[1]) == pid for j in q.get("queue_running", []) + q.get("queue_pending", []))
            if not in_q:
                # fast/cached run can finish before history is written -> brief re-check
                time.sleep(1)
                h2 = json.loads(urllib.request.urlopen(f"http://127.0.0.1:8188/history/{pid}").read())
                if pid in h2:
                    entry = h2[pid]
                    if _has_exec_error(entry):
                        raise gr.Error("Generation failed: " + _exec_error_message(entry)[:400])
                    return entry
                raise gr.Error("Generation failed or crashed.")
        except Exception as e:
            if "Generation failed" in str(e) or "failed or crashed" in str(e):
                raise e
        time.sleep(3)


def generate_video(mode, start_frame, end_frame, prompt, aspect_ratio, gen_quality, duration, steps, seed, auto_direct=True, progress=gr.Progress()):
    progress(0, desc="Starting Server...")
    if not os.path.exists(COMFY_PATH):
        raise gr.Error("Engine not found. Run setup first.")
    if not is_server_running():
        boot_server()
    os.makedirs(INPUT_PATH, exist_ok=True)
    directed = prompt
    if auto_direct and director is not None and prompt and prompt.strip():
        try:
            progress(0.05, desc="Auto-Directing prompt...")
            directed = director.direct_prompt(prompt)
        except Exception:
            directed = prompt
    W, H = compute_dims(aspect_ratio, gen_quality)
    wf = load_workflow()
    wf["2483"]["inputs"]["text"] = directed
    wf["2612"]["inputs"]["text"] = ""
    is_t2v = (mode == "Text-to-Video") or (not start_frame)
    wf["4987"]["inputs"]["value"] = bool(is_t2v)
    if is_t2v:
        dummy = "dummy_t2v.png"
        Image.new("RGB", (W, H), "black").save(os.path.join(INPUT_PATH, dummy))
        wf["2004"]["inputs"]["image"] = dummy
    else:
        fn = os.path.basename(start_frame)
        shutil.copy(start_frame, os.path.join(INPUT_PATH, fn))
        wf["2004"]["inputs"]["image"] = fn
    frames = 8 * round(duration * 3) + 1
    wf["4988"]["inputs"]["value"] = frames
    wf["3059"]["inputs"]["width"] = W
    wf["3059"]["inputs"]["height"] = H
    wf["3940"]["inputs"]["ckpt_name"] = "ltx-2.3-22b-distilled-1.1.safetensors"
    wf["4982"]["inputs"]["ckpt_name"] = "ltx-2.3-22b-distilled-1.1.safetensors"
    # Audio-VAE loader must use the SAME distilled checkpoint, otherwise BOTH the
    # 43GB dev and 43GB distilled checkpoints load at once -> VRAM overflow -> ~5x slower.
    wf["4010"]["inputs"]["ckpt_name"] = "ltx-2.3-22b-distilled-1.1.safetensors"
    wf["4922"]["inputs"]["lora_name"] = LORA_11_NAME
    wf["4922"]["inputs"]["strength_model"] = 0.5
    wf["4831"]["inputs"]["sampler_name"] = "lcm"
    wf["4976"]["inputs"]["sampler_name"] = "euler_cfg_pp"
    wf["4984"]["inputs"]["sigmas"] = "1.0, 0.99375, 0.9875, 0.98125, 0.975, 0.909375, 0.725, 0.421875, 0.0"
    wf["4985"]["inputs"]["sigmas"] = "0.85, 0.7250, 0.4219, 0.0"
    wf["4828"]["inputs"]["cfg"] = 1.0
    wf["4964"]["inputs"]["cfg"] = 1.0
    wf["4832"]["inputs"]["noise_seed"] = int(seed)
    wf["4967"]["inputs"]["noise_seed"] = int(seed) + 1
    progress(0.1, desc="Preparing Inputs...")
    progress(0.2, desc="Queuing Generation...")
    pid = queue_prompt(wf)["prompt_id"]
    progress(0.3, desc="Rendering Video. This can take a while...")
    _wait_for_pid(pid, progress, "Rendering Video")
    vid = get_latest_video()
    if vid:
        _publish("video", directed, vid)
    progress(1.0, desc="Done!")
    directed_note = f"\n\n**Auto-Directed prompt:**\n{directed}" if (auto_direct and directed != prompt) else ""
    return vid, "Done!" + directed_note, vid


def enhance_video(src_video, target, progress=gr.Progress()):
    progress(0, desc="Preparing Enhance...")
    vid = src_video or get_latest_video()
    if not vid:
        raise gr.Error("No video to enhance. Generate one, or add a video above.")
    if target == "Same as generated":
        return vid, "Nothing to enhance (target = Same)."
    progress(0.1, desc=f"Enhancing to {target}...")
    outp = str(Path(vid).with_name(Path(vid).stem + f"_enhanced_{target.split()[0]}.mp4"))
    try:
        upscale_video(vid, outp, target, progress=lambda p: progress(0.1 + 0.9 * p))
    except Exception as e:
        return vid, f"Enhance failed ({e}); returned original video."
    if not is_valid_video(outp):
        return vid, "Enhance produced an unreadable file; returned original video."
    _publish("enhance", f"Enhanced to {target}", outp)
    progress(1.0, desc="Enhanced!")
    return outp, "Enhanced!"


def extend_last(progress=gr.Progress()):
    import cv2
    vid = get_latest_video()
    if not vid:
        return gr.update(value=None), gr.update(value="Text-to-Video"), "No video generated yet."
    cap = cv2.VideoCapture(vid)
    total = int(cap.get(cv2.CAP_PROP_FRAME_COUNT)) or 1
    cap.set(cv2.CAP_PROP_POS_FRAMES, max(0, total - 1))
    ret, frame = cap.read()
    cap.release()
    if not ret:
        return gr.update(value=None), gr.update(value="Text-to-Video"), "Could not read last frame."
    frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
    p = os.path.join(INPUT_PATH, "extend_frame.jpg")
    Image.fromarray(frame).save(p)
    return gr.update(value=p), gr.update(value="Image-to-Video"), f"Loaded last frame of {os.path.basename(vid)} as Start Frame - click Generate to extend."


def generate_image(prompt, negative, aspect, steps, guidance, seed, ref_img=None, progress=gr.Progress()):
    progress(0, desc="Starting Server...")
    if not os.path.exists(COMFY_PATH):
        raise gr.Error("Engine not found. Run setup first.")
    if not is_server_running():
        boot_server()
    W, H = compute_image_dims(aspect)
    with open(FLUX_WF) as f:
        wf = json.load(f)
    wf["pos"]["inputs"]["text"] = prompt
    wf["neg"]["inputs"]["text"] = negative or ""
    wf["guid_pos"]["inputs"]["guidance"] = float(guidance)
    wf["guid_neg"]["inputs"]["guidance"] = float(guidance)
    ref_name = None
    if ref_img:
        ref_pil = Image.open(ref_img).convert("RGB")
        ref_name = "ref_" + os.path.basename(str(ref_img))
        ref_pil.save(os.path.join(INPUT_PATH, ref_name))
        wf["load_img"]["inputs"]["image"] = ref_name
        wf["scale_img"]["inputs"]["width"] = W
        wf["scale_img"]["inputs"]["height"] = H
        wf["ksampler"]["inputs"]["latent_image"] = ["vae_encode", 0]
        wf["ksampler"]["inputs"]["denoise"] = 0.62
    else:
        wf["latent"]["inputs"]["width"] = W
        wf["latent"]["inputs"]["height"] = H
        wf["ksampler"]["inputs"]["latent_image"] = ["latent", 0]
        wf["ksampler"]["inputs"]["denoise"] = 1.0
    wf["ksampler"]["inputs"]["steps"] = int(steps)
    wf["ksampler"]["inputs"]["seed"] = int(seed)
    progress(0.1, desc="Queuing Image Generation...")
    pid = queue_prompt(wf)["prompt_id"]
    progress(0.3, desc="Rendering Image...")
    hist = _wait_for_pid(pid, progress, "Rendering Image")
    img = None
    for node in hist.get("outputs", {}).values():
        if isinstance(node, dict) and node.get("images"):
            im = node["images"][0]
            img = os.path.join(OUTPUT_PATH, im.get("subfolder", ""), im["filename"])
            break
    if not img or not os.path.exists(img):
        raise gr.Error("Image generation produced no output.")
    _publish("image", prompt, img)
    progress(1.0, desc="Done!")
    return img, "Done!"


def use_as_video_input(img):
    if not img:
        return gr.update(), gr.update(), "No image to use."
    return gr.update(value=img), gr.update(value="Image-to-Video"), "Loaded image as Start Frame - go to Video tab and Generate."


def upscale_image_ui(img, progress=gr.Progress()):
    if not img:
        raise gr.Error("No image to upscale.")
    outp = str(Path(img).with_name(Path(img).stem + "_4x.png"))
    progress(0.1, desc="Upscaling 4x...")
    try:
        upscale_image(img, outp)
    except Exception as e:
        return img, f"Upscale failed: {e}"
    progress(1.0, desc="Upscaled!")
    return outp, "Upscaled 4x!"


# ---------- Voiceover Tab ----------
def do_voiceover(text, voice, pitch, rate, progress=gr.Progress()):
    progress(0, desc="Generating voiceover...")
    out = vo_generate(text, voice=voice, pitch=pitch, rate=rate)
    progress(1, desc="Done!")
    return out, "Voiceover generated!"

def do_combine_video_audio(video_path, audio_path, volume, mix):
    if not video_path or not os.path.exists(str(video_path)):
        raise gr.Error("No video selected. Generate one first, or upload above.")
    if not audio_path or not os.path.exists(str(audio_path)):
        raise gr.Error("No audio generated yet. Click Generate Voiceover first.")
    return vo_combine(str(video_path), str(audio_path), volume=volume, mix=mix), "Combined!"

# ---------- Voice Clone Tab ----------
def do_voice_clone(text, ref_audio, backend, language, edge_fallback, progress=gr.Progress()):
    progress(0, desc="Cloning voice...")
    langs = {v: k for k, v in VC_LANGUAGES.items()}
    lang_code = langs.get(language, "en")
    out = vc_clone(
        text=text,
        reference_audio=str(ref_audio) if ref_audio else None,
        backend=backend,
        language=lang_code,
        edge_voice=edge_fallback,
        progress=lambda p, desc=None: progress(p, desc=desc or "Cloning..."),
    )
    progress(1, desc="Done!")
    return out, f"Voice clone complete! (backend: {backend})"

# ---------- Face Swap Tab ----------
def do_extract_faces(image_path, progress=gr.Progress()):
    if not image_path:
        return "Upload an image first."
    try:
        faces = sw_extract_faces(image_path)
        lines = [f"  Face {f['idx']}: gender={f['gender']}, age={f['age']}, score={f['score']:.2f}" for f in faces]
        return "\n".join(lines) if lines else "No faces detected."
    except Exception as e:
        return f"Error: {e}"

def do_swap_image(source_img, target_img, src_idx, tgt_idx, restore, progress=gr.Progress()):
    progress(0, desc="Swapping faces...")
    out = swap_face(str(source_img), str(target_img), source_idx=int(src_idx), target_idx=int(tgt_idx), restore=restore)
    progress(1, desc="Done!")
    return out, "Face swap complete!"

def do_swap_video_task(source_img, video_path, src_idx, tgt_idx, restore, every_n, progress=gr.Progress()):
    progress(0, desc="Swapping faces in video (this may take a while)...")
    out = swap_video(str(source_img), str(video_path), source_idx=int(src_idx), target_idx=int(tgt_idx), restore=restore, every_n=int(every_n))
    progress(1, desc="Done!")
    return out, "Video face swap complete!"

# ---------- Frame Interpolation Tab ----------
def do_interpolate(video_path, multiplier, model, progress=gr.Progress()):
    if not video_path or not os.path.exists(str(video_path)):
        raise gr.Error("No video selected.")
    progress(0, desc=f"Interpolating {multiplier}x...")
    out = interpolate_video(str(video_path), multiplier=int(multiplier), model=model)
    progress(1, desc="Done!")
    return out, f"Interpolated {multiplier}x!"

# ---------- Pipeline Tab ----------
def do_pipeline(prompt, voice_text, voice_name, face_source,
                aspect, quality, duration, steps, seed, interpolate_mult,
                auto_direct, progress=gr.Progress()):
    progress(0, desc="Starting film pipeline...")
    result = linear_pipeline(
        prompt=prompt,
        voice_text=voice_text if voice_text else None,
        voice_name=voice_name,
        face_source=str(face_source) if face_source else None,
        interpolate_multiplier=int(interpolate_mult),
        aspect_ratio=aspect,
        quality=quality,
        duration=int(duration),
        steps=int(steps),
        seed=int(seed),
        auto_direct=auto_direct,
        progress=progress,
    )
    final = result.get("final_path") or result.get("video_path")
    steps_str = "\n".join(f"  • {s}" for s in result.get("status", [])) or "(no steps)"
    return final, f"**Pipeline complete!**\n{steps_str}"


# ---------- Avatar Tab ----------
_avatar_gen = None
def get_avatar_gen():
    global _avatar_gen
    if _avatar_gen is None:
        _avatar_gen = AvatarGenerator()
    return _avatar_gen

AVATAR_PRESET_KEYS = list(SCRIPT_PRESETS.keys())

def do_generate_avatar(script_text, character_img, voice, style, ref_audio, progress=gr.Progress()):
    gen = get_avatar_gen()
    result = gen.generate_avatar(
        script_text=script_text,
        character_image=str(character_img) if character_img else None,
        voice=voice,
        avatar_style=style,
        reference_audio=str(ref_audio) if ref_audio else None,
        progress=progress,
    )
    status_str = "\n".join(f"  • {s}" for s in result.get("status", []))
    return result.get("video_path"), f"**Avatar Result**\n{status_str}"

def do_parse_script(script_text):
    gen = get_avatar_gen()
    segments = gen.parse_script(script_text)
    lines = [f"**{s['timing']}**: {s['text'][:80]}..." for s in segments[:6]]
    return "\n".join(lines) if lines else "Enter a script to analyze."


CSS = """
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');
:root{
  --hf-bg:#050505; --hf-panel:#0a0a0a; --hf-card:#141414;
  --hf-primary:#d9ff00; --hf-primary-hover:#c4e600;
  --hf-text:#ffffff; --hf-secondary:#a1a1aa; --hf-muted:#52525b;
  --hf-border:rgba(255,255,255,0.08); --hf-border-light:rgba(255,255,255,0.05);
}
*, *::before, *::after{ box-sizing:border-box; }
body{
  background:var(--hf-bg) !important; color:var(--hf-text) !important;
  font-family:'Inter',system-ui,-apple-system,sans-serif !important;
  -webkit-font-smoothing:antialiased; overflow-x:hidden;
}
.gradio-container{
  max-width:1200px !important; margin:0 auto !important;
  font-family:'Inter',system-ui,-apple-system,sans-serif !important;
  background:transparent !important; padding:0 16px !important;
}
/* ---------- HEADER ---------- */
.hf-header{
  display:flex; align-items:center; justify-content:space-between;
  padding:12px 0; margin:8px 0 4px;
  border-bottom:1px solid var(--hf-border);
}
.hf-brand{display:flex; align-items:center; gap:12px;}
.hf-logo{
  width:36px; height:36px; border-radius:10px;
  background:var(--hf-primary); display:flex; align-items:center; justify-content:center;
  font-size:16px; font-weight:900; color:#000;
}
.hf-name{font-weight:800; font-size:14px; letter-spacing:1px; color:var(--hf-text);}
.hf-name .accent{color:var(--hf-primary);}
.hf-tag{font-size:10px; font-weight:600; color:var(--hf-muted); letter-spacing:2px; text-transform:uppercase;}
.hf-right{display:flex; align-items:center; gap:12px;}
.hf-right .hf-status{font-size:10px; font-weight:600; color:var(--hf-secondary); text-transform:uppercase; letter-spacing:1px;}
.hf-right .hf-dot{
  width:6px; height:6px; border-radius:50%; background:var(--hf-primary);
  box-shadow:0 0 12px var(--hf-primary);
}
/* ---------- TABS (Pill-style like Cinema Studio) ---------- */
.gradio-container .tab-nav{
  display:flex !important; flex-wrap:wrap !important; gap:4px !important;
  padding:6px 0 14px !important; border:none !important;
  background:transparent !important;
}
.gradio-container .tab-nav button{
  font-family:'Inter',sans-serif !important;
  font-size:11px !important; font-weight:700 !important;
  padding:6px 14px !important; border-radius:20px !important;
  background:rgba(255,255,255,0.04) !important;
  border:1px solid rgba(255,255,255,0.06) !important;
  color:var(--hf-secondary) !important;
  letter-spacing:0.5px !important;
  transition:all 0.15s ease !important;
  text-transform:uppercase !important;
  box-shadow:none !important;
}
.gradio-container .tab-nav button:hover{
  background:rgba(255,255,255,0.08) !important;
  color:var(--hf-text) !important; border-color:rgba(255,255,255,0.12) !important;
}
.gradio-container .tab-nav button.selected{
  background:rgba(217,255,0,0.12) !important;
  color:var(--hf-primary) !important;
  border-color:var(--hf-primary) !important;
  box-shadow:0 0 20px rgba(217,255,0,0.15) !important;
}
/* ---------- BLOCKS / PANELS (Glass cards) ---------- */
.gradio-container .block, .gradio-container .panel{
  background:var(--hf-card) !important;
  border:1px solid var(--hf-border) !important;
  border-radius:16px !important;
  box-shadow:0 8px 30px rgba(0,0,0,0.4) !important;
}
.tabitem{ background:transparent !important; border:none !important; padding:0 !important; }
/* ---------- TYPOGRAPHY ---------- */
.gradio-container label, .gradio-container .label, .gradio-container span.label{
  font-size:10px !important; font-weight:700 !important;
  color:var(--hf-secondary) !important;
  text-transform:uppercase !important; letter-spacing:0.8px !important;
  font-family:'Inter',sans-serif !important;
}
.gradio-container h1, .gradio-container h2, .gradio-container h3{
  font-family:'Inter',sans-serif !important;
  font-weight:800 !important; color:var(--hf-text) !important; letter-spacing:-0.02em;
}
.gradio-container h1{font-size:22px !important;}
.gradio-container h2{font-size:16px !important;}
.gradio-container h3{font-size:13px !important;}
.gradio-container p, .gradio-container .prose{ color:var(--hf-secondary) !important; font-size:12px !important; }
/* ---------- INPUTS ---------- */
.gradio-container textarea, .gradio-container input[type="text"],
.gradio-container input[type="number"], .gradio-container input[type="email"],
.gradio-container input[type="password"]{
  background:rgba(255,255,255,0.03) !important;
  border:1px solid rgba(255,255,255,0.08) !important;
  border-radius:10px !important; color:var(--hf-text) !important;
  font-size:13px !important; font-family:'Inter',sans-serif !important;
  transition:all 0.15s ease !important;
}
.gradio-container textarea:focus, .gradio-container input:focus{
  background:rgba(255,255,255,0.05) !important;
  border-color:var(--hf-primary) !important;
  box-shadow:0 0 0 2px rgba(217,255,0,0.1) !important;
}
.gradio-container textarea::placeholder, .gradio-container input::placeholder{ color:var(--hf-muted) !important; }
/* ---------- BUTTONS ---------- */
.gradio-container button.primary{
  background:var(--hf-primary) !important;
  color:#000 !important; font-weight:800 !important;
  font-size:11px !important; letter-spacing:0.8px !important;
  border:none !important; border-radius:12px !important;
  padding:10px 22px !important;
  text-transform:uppercase !important;
  box-shadow:none !important;
  transition:all 0.15s ease !important;
}
.gradio-container button.primary:hover{
  background:var(--hf-primary-hover) !important;
  box-shadow:0 0 24px rgba(217,255,0,0.35) !important;
  transform:translateY(-1px);
}
.gradio-container button.secondary{
  background:rgba(255,255,255,0.06) !important;
  color:var(--hf-text) !important; font-weight:600 !important;
  font-size:11px !important; letter-spacing:0.3px !important;
  border:1px solid rgba(255,255,255,0.08) !important;
  border-radius:10px !important; padding:8px 16px !important;
  transition:all 0.15s ease !important;
}
.gradio-container button.secondary:hover{
  background:rgba(255,255,255,0.10) !important;
  border-color:rgba(255,255,255,0.15) !important;
}
/* ---------- PILL RADIO / CHECKBOX ---------- */
.gradio-container .lab-pills .wrap, .gradio-container .lab-pills .grid{
  display:flex !important; flex-wrap:wrap; gap:4px;
}
.gradio-container .lab-pills .gr-radio-item, .gradio-container .lab-pills label{
  border:1px solid rgba(255,255,255,0.08) !important;
  border-radius:8px !important;
  padding:5px 12px !important; margin:0 !important;
  background:rgba(255,255,255,0.03) !important;
  color:var(--hf-secondary) !important;
  font-size:10px !important; font-weight:700 !important;
  text-transform:uppercase !important; letter-spacing:0.5px !important;
  transition:all 0.12s ease !important;
  cursor:pointer !important;
}
.gradio-container .lab-pills .gr-radio-item:hover, .gradio-container .lab-pills label:hover{
  background:rgba(255,255,255,0.06) !important;
  color:var(--hf-text) !important; border-color:rgba(255,255,255,0.15) !important;
}
.gradio-container .lab-pills .gr-radio-item.selected,
.gradio-container .lab-pills .gr-radio-item[aria-checked="true"],
.gradio-container .lab-pills label.selected{
  background:rgba(217,255,0,0.1) !important;
  color:var(--hf-primary) !important;
  border-color:var(--hf-primary) !important;
  box-shadow:0 0 12px rgba(217,255,0,0.12) !important;
}
/* ---------- SLIDER ---------- */
.gradio-container .gr-slider .handle{
  background:var(--hf-primary) !important;
  box-shadow:0 0 12px rgba(217,255,0,0.4) !important;
  border:none !important;
}
.gradio-container .gr-slider .track{
  background:rgba(255,255,255,0.08) !important;
}
/* ---------- DROPDOWN ---------- */
.gradio-container select, .gradio-container .gr-dropdown{
  background:rgba(255,255,255,0.03) !important;
  border:1px solid rgba(255,255,255,0.08) !important;
  border-radius:10px !important;
  color:var(--hf-text) !important;
  font-size:12px !important; font-family:'Inter',sans-serif !important;
}
/* ---------- AUDIO / VIDEO ---------- */
.gradio-container .gr-video, .gradio-container .gr-audio{
  border:1px solid var(--hf-border) !important;
  border-radius:14px !important; overflow:hidden !important;
}
/* ---------- IMAGE ---------- */
.gradio-container .gr-image{ border:1px solid var(--hf-border) !important; border-radius:14px !important; overflow:hidden !important; }
/* ---------- MARKDOWN ---------- */
.gradio-container .gr-markdown{
  color:var(--hf-secondary) !important; font-size:12px !important; line-height:1.6 !important;
}
.gradio-container .gr-markdown strong{ color:var(--hf-text) !important; }
/* ---------- CHECKBOX ---------- */
.gradio-container input[type="checkbox"]{
  accent-color:var(--hf-primary) !important;
}
/* ---------- CONTAINER OVERRIDES ---------- */
.gradio-container .contain, .gradio-container .main, .gradio-container .wrap{
  background:transparent !important; border:none !important; box-shadow:none !important;
}
.gradio-container .tabs{ background:transparent !important; border:none !important; }
/* ---------- TIP BOX (like Higgsfield's shot builder info) ---------- */
.hf-tip{
  background:rgba(217,255,0,0.04); border:1px solid rgba(217,255,0,0.12);
  border-radius:12px; padding:12px 16px; margin:8px 0;
  font-size:11px; color:var(--hf-secondary); line-height:1.5;
}
.hf-tip strong{ color:var(--hf-primary); }
/* ---------- FOOTER ---------- */
.hf-footer{
  margin-top:24px; padding:16px 0; text-align:center;
  border-top:1px solid var(--hf-border);
  font-size:10px; font-weight:600; color:var(--hf-muted);
  letter-spacing:1px; text-transform:uppercase;
}
.hf-footer .hf-accent{ color:var(--hf-primary); }
/* ---------- RESPONSIVE ---------- */
@media (max-width: 720px){
  .gradio-container{ padding:0 8px !important; }
  .gradio-container .tab-nav button{ font-size:10px !important; padding:5px 10px !important; }
  .gradio-container button.primary{ font-size:13px !important; padding:12px 18px !important; }
  .gradio-container textarea, .gradio-container input{ font-size:15px !important; }
  .gradio-container .lab-pills .gr-radio-item, .gradio-container .lab-pills label{ font-size:9px !important; padding:4px 10px !important; }
}
/* ---------- SCROLLBAR ---------- */
::-webkit-scrollbar{ width:4px; height:4px; }
::-webkit-scrollbar-track{ background:transparent; }
::-webkit-scrollbar-thumb{ background:rgba(255,255,255,0.08); border-radius:4px; }
::-webkit-scrollbar-thumb:hover{ background:rgba(255,255,255,0.15); }
"""

HEADER = f'''
<div class="hf-header">
  <div class="hf-brand">
    <div class="hf-logo">S</div>
    <div>
      <div class="hf-name">SYLVESTER'S <span class="accent">LAB</span></div>
      <div class="hf-tag">AI Film &amp; Image Studio</div>
    </div>
  </div>
  <div class="hf-right">
    <span class="hf-status">Online</span>
    <span class="hf-dot"></span>
  </div>
</div>
'''

FOOTER = """
<div class="hf-footer">
  SYLVESTER'S <span class="hf-accent">LAB</span>
  <span style="margin:0 8px; opacity:0.3;">·</span>
  LTX-2.3 · FLUX.1 · Wav2Lip · ReActor
  <span style="margin:0 8px; opacity:0.3;">·</span>
  <span class="hf-accent">Infinite Budget</span>
</div>
"""

theme = (
    gr.themes.Default(
        primary_hue=gr.themes.colors.green,
        secondary_hue=gr.themes.colors.zinc,
        neutral_hue=gr.themes.colors.zinc,
    )
    .set(
        body_background_fill="#050505",
        body_background_fill_dark="#050505",
        block_background_fill="#141414",
        block_background_fill_dark="#141414",
        block_border_color="rgba(255,255,255,0.08)",
        block_border_color_dark="rgba(255,255,255,0.08)",
        button_primary_background_fill="#d9ff00",
        button_primary_background_fill_dark="#d9ff00",
        button_primary_text_color="#000000",
        button_primary_border_color="#d9ff00",
        button_primary_border_color_dark="#d9ff00",
        input_background_fill="rgba(255,255,255,0.03)",
        input_border_color="rgba(255,255,255,0.08)",
        input_border_color_dark="rgba(255,255,255,0.08)",
    )
)

VIDEO_PRESETS = [
    ("Cinematic Drone", "aerial drone shot sweeping over misty mountains at golden hour, volumetric light, 35mm film grain, cinematic"),
    ("Liquid Gold", "streams of molten gold flowing like liquid silk, macro, reflections, ultra detailed, studio lighting"),
    ("Neon City", "futuristic neon city street at night, rain-slicked pavement, cyberpunk, bokeh, cinematic"),
    ("Cozy Interior", "warm sunlit living room, soft shadows, dust particles in light beams, peaceful, 35mm"),
    ("Ocean Calm", "calm ocean waves at sunset, slow motion, pastel sky, meditative, cinematic"),
]
IMG_PRESETS = [
    ("Cinematic Portrait", "cinematic portrait, dramatic rim light, shallow depth of field, highly detailed skin, 35mm"),
    ("Product Hero", "studio product shot, floating object, dramatic lighting, reflections, ultra clean, 8k"),
    ("Fantasy Creature", "majestic fantasy creature, intricate details, epic lighting, volumetric fog, concept art"),
    ("Architecture", "brutalist architecture, golden hour, long shadows, minimal, architectural photography"),
]

_SHOTBUILDER_HTML = None
def get_shotbuilder_html():
    global _SHOTBUILDER_HTML
    if _SHOTBUILDER_HTML is None:
        p = Path(BASE_PATH / "shotbuilder.html")
        if p.exists():
            _SHOTBUILDER_HTML = p.read_text(encoding="utf-8")
        else:
            _SHOTBUILDER_HTML = "<p style='color:#9fb3c8;padding:40px;text-align:center;'>Shot Builder not found. Upload shotbuilder.html to the studio root.</p>"
    return _SHOTBUILDER_HTML

with gr.Blocks(css=CSS, theme=theme) as demo:
    gr.HTML(HEADER)
    status_md = gr.Markdown("**Ready.** Generate a video or image to begin — your clip auto-loads into Enhance.")
    with gr.Tabs():
        with gr.Tab("Video Generator"):
            gr.Markdown(f"Engine: **LTX-2.3** distilled model with LoRA `{LORA_11_NAME}`")
            with gr.Row():
                with gr.Column(scale=1):
                    mode_selector = gr.Radio(["Text-to-Video", "Image-to-Video"], value="Text-to-Video", label="Mode")
                    start_frame = gr.Image(type="filepath", label="Start Frame (optional - enables Image-to-Video)", value=AVATAR_FRAME_PATH)
                    end_frame = gr.Image(type="filepath", label="End Frame (optional)")
                    prompt_input = gr.Textbox(label="Prompt", placeholder="A cinematic shot...", lines=3)
                    with gr.Row():
                        for _l, _t in VIDEO_PRESETS:
                            gr.Button(_l).click(lambda t=_t: t, [], prompt_input)
                    with gr.Row():
                        aspect_ratio = gr.Radio(choices=["16:9", "9:16", "1:1", "4:3", "3:4", "21:9", "9:21"], value="16:9", label="Aspect Ratio", elem_classes="lab-pills")
                        gen_quality = gr.Radio(choices=["720p", "1080p (1K)", "1440p (2K)", "2160p (4K)"], value="720p", label="Generate At", elem_classes="lab-pills")
                    with gr.Row():
                        steps_slider = gr.Slider(minimum=4, maximum=24, step=1, value=8, label="Quality (steps)")
                        duration_slider = gr.Slider(minimum=1, maximum=10, step=1, value=3, label="Duration (s)")
                    with gr.Row():
                        seed_input = gr.Number(value=43, label="Seed", precision=0)
                    with gr.Row():
                        auto_direct = gr.Checkbox(label="Auto-Direct (AI expands your prompt)", value=True, elem_classes="lab-pills")
                    with gr.Row():
                        generate_btn = gr.Button("Generate Video", variant="primary")
                        extend_btn = gr.Button("Extend Last Video")
                with gr.Column(scale=1):
                    video_output = gr.Video(label="Generated Output")
                    gr.Markdown("### Enhance / Upscale\n*Your generated clip loads here automatically — pick a target quality, then click Enhance Video.*")
                    enhance_video_in = gr.Video(label="Video to Enhance (auto-filled after generation)", include_audio=False)
                    with gr.Row():
                        enhance_target = gr.Radio(choices=["Same as generated", "720p", "1080p (1K)", "1440p (2K)", "2160p (4K)"], value="Same as generated", label="Enhance Target", elem_classes="lab-pills")
                    with gr.Row():
                        enhance_btn = gr.Button("Enhance Video")
        with gr.Tab("Image Generator"):
            gr.Markdown("**FLUX.1 [dev]** — high-end text-to-image. Output can be fed into the Video tab as a Start Frame.")
            with gr.Row():
                with gr.Column(scale=1):
                    img_prompt = gr.Textbox(label="Prompt", placeholder="A cinematic portrait, highly detailed...", lines=3)
                    with gr.Row():
                        for _l, _t in IMG_PRESETS:
                            gr.Button(_l).click(lambda t=_t: t, [], img_prompt)
                    img_neg = gr.Textbox(label="Negative Prompt", placeholder="blurry, low quality, deformed...", lines=2)
                    img_ref = gr.Image(label="Image Reference (optional — img2img)", type="filepath", sources=["upload"], elem_id="img_ref")
                    with gr.Row():
                        img_aspect = gr.Radio(choices=["1:1", "16:9", "9:16", "4:3", "3:4", "21:9", "9:21"], value="1:1", label="Aspect Ratio", elem_classes="lab-pills")
                    with gr.Row():
                        img_steps = gr.Slider(minimum=1, maximum=50, step=1, value=20, label="Steps")
                        img_guidance = gr.Slider(minimum=0.0, maximum=10.0, step=0.1, value=3.5, label="Guidance")
                    with gr.Row():
                        img_seed = gr.Number(value=42, label="Seed", precision=0)
                    with gr.Row():
                        img_generate_btn = gr.Button("Generate Image", variant="primary")
                        img_use_btn = gr.Button("Use as Video Start Frame")
                with gr.Column(scale=1):
                    img_output = gr.Image(label="Generated Image", type="filepath")
                    with gr.Row():
                        img_upscale_btn = gr.Button("Upscale 4x")

        with gr.Tab("Voiceover"):
            gr.Markdown("**edge-tts** — neural text-to-speech voiceover. Combine with your generated video.")
            with gr.Row():
                with gr.Column(scale=1):
                    vo_text = gr.Textbox(label="Voiceover Text", placeholder="Enter the narration or dialogue...", lines=4)
                    with gr.Row():
                        vo_voice = gr.Dropdown(choices=list(VOICE_PRESETS.keys()), value="Narrator (US Male)", label="Voice")
                        vo_pitch = gr.Radio(["x-low", "low", "medium", "high", "x-high"], value="medium", label="Pitch", elem_classes="lab-pills")
                    with gr.Row():
                        vo_rate = gr.Radio(["x-slow", "slow", "medium", "fast", "x-fast"], value="medium", label="Speed", elem_classes="lab-pills")
                    with gr.Row():
                        vo_generate_btn = gr.Button("Generate Voiceover", variant="primary")
                with gr.Column(scale=1):
                    vo_audio = gr.Audio(label="Voiceover Preview", type="filepath")
                    vo_status = gr.Markdown("Ready.")
                    gr.Markdown("### Combine with Video")
                    vo_video_in = gr.Video(label="Video (auto-filled after generation)", include_audio=False)
                    with gr.Row():
                        vo_volume = gr.Slider(minimum=0.0, maximum=2.0, step=0.1, value=1.0, label="Volume")
                        vo_mix = gr.Checkbox(label="Mix (replace existing audio)", value=True)
                    vo_combine_btn = gr.Button("Add Voiceover to Video")
                    vo_output = gr.Video(label="Combined Output")

        with gr.Tab("Voice Clone"):
            gr.Markdown("**Voice Cloner** — clone any voice from a 3-second audio sample using Coqui XTTS v2. Falls back to OpenVoice or edge-tts automatically.")
            with gr.Row():
                with gr.Column(scale=1):
                    vc_ref = gr.Audio(label="Reference Audio (3-30s of target speaker)", type="filepath", sources=["upload"])
                    vc_text = gr.Textbox(label="Text to Speak", placeholder="Enter the text you want in the cloned voice...", lines=4)
                    with gr.Row():
                        vc_backend = gr.Dropdown(choices=vc_backends(), value="coqui-xtts", label="Backend")
                        vc_language = gr.Dropdown(choices=list(VC_LANGUAGES.values()), value="English", label="Language")
                    vc_edge_fallback = gr.Dropdown(choices=list(VOICE_PRESETS.keys()), value="Narrator (US Male)", label="Fallback Voice (if no reference)")
                    with gr.Row():
                        vc_clone_btn = gr.Button("Clone Voice", variant="primary")
                    vc_batch_btn = gr.Button("Batch — one line per paragraph → combined audio", variant="secondary")
                with gr.Column(scale=1):
                    vc_output = gr.Audio(label="Cloned Voice Output", type="filepath")
                    vc_status = gr.Markdown("Upload a reference audio and enter text to start.")
                    gr.Markdown("### Tips")
                    gr.Markdown(
                        "- **Reference audio**: 3-30 seconds, clean recording, single speaker, no background noise\n"
                        "- **First run** downloads the XTTS v2 model (~1.8GB)\n"
                        "- **Batch mode** splits text on blank lines, clones each line, then concatenates\n"
                        "- **Language** should match the reference speaker's language"
                    )

        with gr.Tab("Face Swap"):
            gr.Markdown("**ReActor** — swap faces using InsightFace. Upload a source face and a target image/video.")
            with gr.Row():
                with gr.Column(scale=1):
                    sw_source = gr.Image(label="Source Face", type="filepath", sources=["upload"])
                    sw_target_img = gr.Image(label="Target Image", type="filepath", sources=["upload"])
                    with gr.Row():
                        sw_src_idx = gr.Number(value=0, label="Source Face Index", precision=0)
                        sw_tgt_idx = gr.Number(value=0, label="Target Face Index", precision=0)
                    with gr.Row():
                        sw_restore = gr.Checkbox(label="Face Restoration (GFPGAN)", value=True)
                    with gr.Row():
                        sw_detect_btn = gr.Button("Detect Faces")
                        sw_swap_img_btn = gr.Button("Swap in Image", variant="primary")
                with gr.Column(scale=1):
                    sw_faces_md = gr.Markdown("Upload a source image and click **Detect Faces**.")
                    sw_output = gr.Image(label="Swapped Output", type="filepath")
                    sw_status = gr.Markdown("")
                    gr.Markdown("### Swap in Video")
                    sw_target_video = gr.Video(label="Target Video", include_audio=False)
                    with gr.Row():
                        sw_every_n = gr.Slider(minimum=1, maximum=30, step=1, value=1, label="Process every N frames")
                    sw_swap_vid_btn = gr.Button("Swap in Video")
                    sw_video_output = gr.Video(label="Swapped Video Output")

        with gr.Tab("Frame Interpolation"):
            gr.Markdown("**RIFE** — smooth frame interpolation. Upload a video and choose your multiplier.")
            with gr.Row():
                with gr.Column(scale=1):
                    fi_video = gr.Video(label="Source Video", include_audio=False)
                    with gr.Row():
                        fi_multiplier = gr.Radio([2, 4, 8], value=2, label="Multiplier", elem_classes="lab-pills")
                        fi_model = gr.Dropdown(choices=["rife4.25", "rife4.22", "rife4.13"], value="rife4.25", label="Model")
                    fi_interpolate_btn = gr.Button("Interpolate", variant="primary")
                with gr.Column(scale=1):
                    fi_output = gr.Video(label="Interpolated Output")
                    fi_status = gr.Markdown("Ready.")

        with gr.Tab("Film Pipeline"):
            gr.Markdown("**One-click short film pipeline** — generate video, swap faces, interpolate, and add voiceover in a single pass.")
            with gr.Row():
                with gr.Column(scale=1):
                    pl_prompt = gr.Textbox(label="Scene Prompt", placeholder="A cinematic drone shot...", lines=3)
                    pl_voice_text = gr.Textbox(label="Voiceover Text (optional)", placeholder="Narration or dialogue...", lines=2)
                    pl_face_source = gr.Image(label="Character Face (optional)", type="filepath", sources=["upload"])
                    with gr.Row():
                        pl_aspect = gr.Radio(choices=["16:9", "9:16", "1:1", "4:3", "21:9"], value="16:9", label="Aspect", elem_classes="lab-pills")
                        pl_quality = gr.Radio(choices=["720p", "1080p (1K)"], value="720p", label="Quality", elem_classes="lab-pills")
                    with gr.Row():
                        pl_duration = gr.Slider(minimum=1, maximum=10, step=1, value=3, label="Duration (s)")
                        pl_steps = gr.Slider(minimum=4, maximum=24, step=1, value=8, label="Steps")
                    with gr.Row():
                        pl_seed = gr.Number(value=43, label="Seed", precision=0)
                        pl_interpolate = gr.Radio(choices=[1, 2, 4], value=1, label="Smooth Frames", elem_classes="lab-pills")
                    pl_voice_name = gr.Dropdown(choices=list(VOICE_PRESETS.keys()), value="Narrator (US Male)", label="Voice (if no text above, ignored)")
                    pl_auto = gr.Checkbox(label="Auto-Direct", value=True)
                    pl_generate_btn = gr.Button("Generate Film", variant="primary")
                with gr.Column(scale=1):
                    pl_output = gr.Video(label="Final Film Output")
                    pl_status = gr.Markdown("Ready.")

        with gr.Tab("Shot Builder"):
            gr.Markdown("**Cinematic Prompt Studio** — design shots like a filmmaker. Select shot type, camera movement, lighting, and more to build professional LTX/FLUX prompts.")
            sb_html = gr.HTML(value=get_shotbuilder_html())

        with gr.Tab("AI Avatar"):
            gr.Markdown("**AI Avatar Generator** — create a talking avatar with lip-sync from any script and character photo.")
            with gr.Row():
                with gr.Column(scale=1):
                    av_script = gr.Textbox(label="Script / Speech Text", placeholder="Enter the script you want the avatar to say...", lines=5)
                    av_character = gr.Image(label="Character Photo (optional — uses generated face if empty)", type="filepath", sources=["upload"])
                    av_ref_audio = gr.Audio(label="Reference Audio (optional — voice clone)", type="filepath", sources=["upload"])
                    with gr.Row():
                        av_voice = gr.Dropdown(choices=list(VOICE_PRESETS.keys()), value="Narrator (US Male)", label="Voice (or fallback for clone)")
                        av_style = gr.Dropdown(choices=list(AVATAR_STYLES.keys()), value="Warm Presenter", label="Avatar Style")
                    with gr.Row():
                        av_presets = gr.Radio(choices=AVATAR_PRESET_KEYS, value=None, label="Script Preset (optional)")
                    with gr.Row():
                        av_parse_btn = gr.Button("Analyze Script", variant="secondary")
                    av_generate_btn = gr.Button("Generate Avatar", variant="primary")
                with gr.Column(scale=1):
                    av_analysis = gr.Markdown("Enter a script and click **Analyze Script** to see timing segments.")
                    av_output = gr.Video(label="Avatar Output")
                    av_status = gr.Markdown("Ready.")

    mode_selector.change(fn=lambda m: gr.update(visible=(m == "Image-to-Video")), inputs=mode_selector, outputs=start_frame)
    extend_btn.click(fn=extend_last, inputs=[], outputs=[start_frame, mode_selector, status_md])
    generate_btn.click(fn=generate_video,
                       inputs=[mode_selector, start_frame, end_frame, prompt_input, aspect_ratio, gen_quality, duration_slider, steps_slider, seed_input, auto_direct],
                       outputs=[video_output, status_md, enhance_video_in])
    enhance_btn.click(fn=enhance_video, inputs=[enhance_video_in, enhance_target], outputs=[video_output, status_md])
    img_generate_btn.click(fn=generate_image,
                           inputs=[img_prompt, img_neg, img_aspect, img_steps, img_guidance, img_seed, img_ref],
                           outputs=[img_output, status_md])
    img_use_btn.click(fn=use_as_video_input, inputs=[img_output], outputs=[start_frame, mode_selector, status_md])
    img_upscale_btn.click(fn=upscale_image_ui, inputs=[img_output], outputs=[img_output, status_md])

    # --- Voiceover handlers ---
    vo_generate_btn.click(fn=do_voiceover,
                          inputs=[vo_text, vo_voice, vo_pitch, vo_rate],
                          outputs=[vo_audio, vo_status])
    vo_combine_btn.click(fn=do_combine_video_audio,
                         inputs=[vo_video_in, vo_audio, vo_volume, vo_mix],
                         outputs=[vo_output, vo_status])
    # --- Voice Clone handlers ---
    vc_clone_btn.click(fn=do_voice_clone,
                       inputs=[vc_text, vc_ref, vc_backend, vc_language, vc_edge_fallback],
                       outputs=[vc_output, vc_status])
    vc_batch_btn.click(fn=lambda t, r, b, l, e: (None, "Batch: split paragraphs and clone each..."),
                       inputs=[vc_text, vc_ref, vc_backend, vc_language, vc_edge_fallback],
                       outputs=[vc_output, vc_status])
    # Auto-fill text from voiceover tab into voice clone tab
    vo_generate_btn.click(fn=lambda t: t,
                          inputs=[vo_text],
                          outputs=[vc_text])
    # Auto-fill latest video into voiceover, interpolation, face swap tabs
    generate_btn.click(fn=generate_video,
                       inputs=[mode_selector, start_frame, end_frame, prompt_input,
                               aspect_ratio, gen_quality, duration_slider, steps_slider,
                               seed_input, auto_direct],
                       outputs=[video_output, status_md, enhance_video_in]
    ).then(fn=lambda v: (v, v, v),
           inputs=[video_output],
           outputs=[vo_video_in, fi_video, sw_target_video])
    img_generate_btn.click(fn=generate_image,
                           inputs=[img_prompt, img_neg, img_aspect, img_steps,
                                   img_guidance, img_seed, img_ref],
                           outputs=[img_output, status_md]
    ).then(fn=lambda v: v,
           inputs=[img_output],
           outputs=[sw_target_img])

    # --- Face Swap handlers ---
    sw_detect_btn.click(fn=do_extract_faces,
                        inputs=[sw_source],
                        outputs=[sw_faces_md])
    sw_swap_img_btn.click(fn=do_swap_image,
                          inputs=[sw_source, sw_target_img, sw_src_idx, sw_tgt_idx, sw_restore],
                          outputs=[sw_output, sw_status])
    sw_swap_vid_btn.click(fn=do_swap_video_task,
                          inputs=[sw_source, sw_target_video, sw_src_idx, sw_tgt_idx, sw_restore, sw_every_n],
                          outputs=[sw_video_output, sw_status])

    # --- Frame Interpolation handlers ---
    fi_interpolate_btn.click(fn=do_interpolate,
                             inputs=[fi_video, fi_multiplier, fi_model],
                             outputs=[fi_output, fi_status])

    # --- Pipeline handlers ---
    pl_generate_btn.click(fn=do_pipeline,
                          inputs=[pl_prompt, pl_voice_text, pl_voice_name, pl_face_source,
                                  pl_aspect, pl_quality, pl_duration, pl_steps, pl_seed,
                                  pl_interpolate, pl_auto],
                           outputs=[pl_output, pl_status])

    # --- Avatar handlers ---
    av_generate_btn.click(fn=do_generate_avatar,
                          inputs=[av_script, av_character, av_voice, av_style, av_ref_audio],
                          outputs=[av_output, av_status])
    av_parse_btn.click(fn=do_parse_script,
                       inputs=[av_script],
                       outputs=[av_analysis])
    av_presets.change(fn=lambda p: SCRIPT_PRESETS[p]["style"] if p else "Warm Presenter",
                      inputs=[av_presets], outputs=[av_style])

    gr.HTML(FOOTER)


if __name__ == "__main__":
    import atexit
    LAB_USER = os.environ.get("LAB_USER", "sylvester")
    LAB_PASS = os.environ.get("LAB_PASS", "SylvesterAI2026")
    public_url = None
    if _PHASE_B:
        try:
            proc, public_url = tunnel_manager.start("http://127.0.0.1:7860")
            _tunnel_proc[0] = proc
            if public_url:
                telegram_notify.send_message(
                    f"*Sylvester's AI Lab is ONLINE*\n{public_url}\n\nAuth: `{LAB_USER}` / `{LAB_PASS}`")
        except Exception as _t:
            print(f"[phase_b] tunnel start failed, falling back to share=True: {_t}")
            public_url = None
    atexit.register(lambda: tunnel_manager.stop(_tunnel_proc[0]))
    demo.launch(
        share=False,  # exposure via Lightning's stable studio port-forward
        server_name="0.0.0.0",
        server_port=7860,
        show_error=True,
        auth=(LAB_USER, LAB_PASS),
        root_path=(public_url if public_url else None),
    )
