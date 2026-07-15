"""
LTX-2.3 Studio — Modal free-GPU tier (genuinely $0, no credit card).

Runs OUR OWN ComfyUI + LTX-2.3 22B GGUF (Q4_K_M) + distilled LoRA + local
text encoders behind a Gradio UI, exposed at a public *.modal.run URL.

Cost: Modal Starter = $0 with $30/mo recurring GPU credit, NO card.
That is ~27 A10G-hours/month — plenty for intermittent generation.

Pipeline:
  download_models()  -> pulls weights ONCE into a persistent Volume (Modal bandwidth,
                        not your phone data).
  serve()            -> launches ComfyUI (8188) + Gradio (7860) in one container,
                        exposes 7860 publicly. Gradio converts the LTX-2.3 UI
                        workflow to API format, patches prompt/seed/size, queues
                        ComfyUI, and streams the resulting MP4 back.

Usage:
  pip install modal && modal setup          # free GitHub/Google OAuth, no card
  modal run app.py::download_models          # one-time, fills the volume
  modal deploy app.py                        # live at <id>.modal.run
"""

import os, time, json, threading, subprocess
import modal

APP_NAME = "ltx23-studio"
VOL_NAME = "ltx23-models"
MODEL_ROOT = "/comfy/models"          # Volume mount (ComfyUI models dir)
COMFY_DIR = "/comfy/ComfyUI"
HF_BASE = "https://huggingface.co"

app = modal.App(APP_NAME)
vol = modal.Volume.from_name(VOL_NAME, create_if_missing=True)

# ---- weight files: (hf_repo, comfy_subdir, filename) -------------------------
# GGUF unet goes in models/unet, LoRA in loras, VAE in vae, encoders in text_encoders.
WEIGHTS = [
    ("unsloth/LTX-2.3-GGUF", "unet",   "ltx-2.3-22b-dev-Q4_K_M.gguf"),
    ("Lightricks/LTX-2.3",   "loras",  "ltx-2.3-22b-distilled-lora-384-1.1.safetensors"),
    ("Lightricks/LTX-2.3",   "vae",    "ltx-2.3-vae.safetensors"),
    ("Lightricks/LTX-2.3",   "text_encoders", "LTX-2.3-llama-3.1-8B-Instruct-encoder-Q4_K_M.gguf"),
    ("Lightricks/LTX-2.3",   "text_encoders", "LTX-2.3-gemma-3-12B-encoder-Q4_K_M.gguf"),
]

CUSTOM_NODES = [
    "https://github.com/Lightricks/ComfyUI-LTXVideo.git",
    "https://github.com/city96/ComfyUI-GGUF.git",
    "https://github.com/ltdrlog/ComfyUI-Manager.git",
    "https://github.com/Fannovel16/comfyui_controlnet_aux.git",
    "https://github.com/Kosinkadink/ComfyUI-VideoHelperSuite.git",
]

base = (
    modal.Image.from_registry(
        "pytorch/pytorch:2.3.1-cuda12.1-cudnn8-devel", add_python="3.11")
    .apt_install("git", "curl", "aria2", "ffmpeg", "libgl1",
                 "libglib2.0-0", "libsm6", "libxext6")
    .pip_install("grpcio", "torchvision", "xformers", "aria2",
                 "gradio==4.*", "requests", "pillow")
)

image = base
for url in CUSTOM_NODES:
    name = url.rsplit("/", 1)[-1].replace(".git", "")
    image = image.run_commands(
        f"git clone --depth 1 {url} {COMFY_DIR}/custom_nodes/{name}")
image = image.run_commands(
    f"git clone --depth 1 https://github.com/comfyanonymous/ComfyUI.git {COMFY_DIR}",
    f"pip install -r {COMFY_DIR}/requirements.txt",
)


@app.function(volumes={MODEL_ROOT: vol}, timeout=1800)
def download_models():
    """One-time: pull weights into the persistent volume (Modal bandwidth)."""
    os.makedirs(MODEL_ROOT, exist_ok=True)
    for repo, sub, fname in WEIGHTS:
        dst = os.path.join(MODEL_ROOT, sub)
        os.makedirs(dst, exist_ok=True)
        out = os.path.join(dst, fname)
        if os.path.exists(out) and os.path.getsize(out) > 0:
            print("skip", out); continue
        url = f"{HF_BASE}/{repo}/resolve/main/{fname}"
        print("download", url)
        subprocess.run(["aria2c", "-x", "8", "-s", "8", "-k", "1M",
                        "--continue", "-d", dst, "-o", fname, url], check=True)
    print("done: weights in volume", VOL_NAME)


# ---- UI -> API workflow conversion (ComfyUI UI format -> /prompt API format) --
def ui_to_api(ui):
    links = {l[0]: l for l in ui.get("links", [])}
    api, prim = {}, {}
    for n in ui["nodes"]:
        prim[str(n["id"])] = (n.get("widgets_values") or [None])[0] \
            if n["type"].startswith("Primitive") else None
    for n in ui["nodes"]:
        nid = str(n["id"])
        if n["type"].startswith("Primitive"):
            continue  # inlined at the link target
        api[nid] = {"class_type": n["type"], "inputs": {}}
        wi, wv = 0, n.get("widgets_values", [])
        for inp in n.get("inputs", []):
            name = inp["name"]
            if inp.get("link") is not None:
                L = links[inp["link"]]
                oid = str(L[1])
                if oid in prim and prim[oid] is not None:
                    api[nid]["inputs"][name] = prim[oid]      # inline constant
                else:
                    api[nid]["inputs"][name] = [oid, L[2]]
            else:
                if "widget" in inp:
                    api[nid]["inputs"][name] = wv[wi] if wi < len(wv) else None
                    wi += 1
                else:
                    api[nid]["inputs"][name] = None
    return api


# Defaults from the downloaded LTX-2.3 example workflow (used to locate prompt slots)
EX_POS = "A traditional Japanese tea ceremony"
EX_NEG = "pc game, console game, video game, cartoon, childish, ugly"


def patch_workflow(api, prompt, negative, seed, duration, steps):
    """Point loaders at our GGUF/LoRA/VAE/encoders and inject prompt/seed/size."""
    GGUF = "ltx-2.3-22b-dev-Q4_K_M.gguf"
    LORA = "ltx-2.3-22b-distilled-lora-384-1.1.safetensors"
    VAE = "ltx-2.3-vae.safetensors"
    ENC = "LTX-2.3-gemma-3-12B-encoder-Q4_K_M.gguf"
    for nid, node in api.items():
        ct = node["class_type"]
        inp = node["inputs"]
        if ct == "CheckpointLoaderSimple":
            node["class_type"] = "UnetLoaderGGUF"
            node["inputs"] = {"unet_name": GGUF}          # MODEL at slot 0
        elif ct == "LoraLoaderModelOnly":
            inp["lora_name"] = LORA
        elif ct == "LTXVAudioVAELoader":
            inp["vae_name"] = VAE
        elif ct == "LTXAVTextEncoderLoader":
            if "text_encoder_name" in inp:
                inp["text_encoder_name"] = ENC
            elif inp:
                first = next(iter(inp))
                inp[first] = ENC
        elif ct == "PrimitiveString":
            inp["value"] = ""                              # local text-encode mode
        elif ct == "RandomNoise":
            if "noise_seed" in inp:
                inp["noise_seed"] = seed
            elif inp:
                inp[next(iter(inp))] = seed
        elif ct in ("CLIPTextEncode", "GemmaAPITextEncode"):
            for k, v in list(inp.items()):
                if isinstance(v, str):
                    if v.startswith(EX_POS):
                        inp[k] = prompt
                    elif v.startswith(EX_NEG):
                        inp[k] = negative
    # resolution / length: EmptyLTXVLatentVideo widgets = [w, h, length, batch]
    for node in api.values():
        if node["class_type"] == "EmptyLTXVLatentVideo":
            wv = node["inputs"]
            # inputs order after conversion: width, height, length, ...
            keys = [k for k in wv if isinstance(wv[k], (int, float))]
            if len(keys) >= 3:
                fps = 24
                frames = max(1, int(round(duration * fps / 8) * 8) + 1)
                wv[keys[0]], wv[keys[1]], wv[keys[2]] = (960, 544, frames)
    return api


def _start_comfy():
    subprocess.Popen(
        ["python", f"{COMFY_DIR}/main.py", "--listen", "0.0.0.0",
         "--port", "8188", "--cuda-device", "0", "--disable-metadata"],
        stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)


def _wait_comfy(timeout=600):
    import requests
    t0 = time.time()
    while time.time() - t0 < timeout:
        try:
            if requests.get("http://127.0.0.1:8188/system_stats", timeout=5).ok:
                return True
        except Exception:
            time.sleep(3)
    raise RuntimeError("ComfyUI did not start in time")


def _build_gradio():
    import gradio as gr
    import requests

    WF = os.path.join(os.path.dirname(__file__), "workflows", "ltx_workflow.json")

    def generate(prompt, negative, seed, duration, steps):
        negative = negative or ""
        seed = int(seed) if seed else 0
        with open(WF) as f:
            ui = json.load(f)
        api = ui_to_api(ui)
        api = patch_workflow(api, prompt, negative, seed, duration, steps)
        r = requests.post("http://127.0.0.1:8188/prompt",
                          json={"prompt": api, "client_id": "modal-ltx"})
        r.raise_for_status()
        pid = r.json()["prompt_id"]
        out_path = None
        for _ in range(900):
            h = requests.get(f"http://127.0.0.1:8188/history/{pid}").json()
            if pid in h:
                for out in h[pid].get("outputs", {}).values():
                    for v in out.get("videos", []):
                        sub = v.get("subfolder", "")
                        fn = v["filename"]
                        p = os.path.join(COMFY_DIR, "output", sub, fn) if sub \
                            else os.path.join(COMFY_DIR, "output", fn)
                        if os.path.exists(p):
                            out_path = p
                break
            time.sleep(3)
        if not out_path:
            raise RuntimeError("no video produced (check ComfyUI logs)")
        return out_path

    with gr.Blocks(title="LTX-2.3 Studio") as ui:
        gr.Markdown("# LTX-2.3 Studio — your own 22B GGUF (free Modal GPU)")
        with gr.Row():
            prompt = gr.Textbox(label="Prompt", lines=3,
                                value="A cinematic drone shot gliding over a neon city at dusk")
            neg = gr.Textbox(label="Negative", lines=3,
                             value="blurry, distorted, watermark, extra limbs")
        with gr.Row():
            seed = gr.Number(label="Seed", value=0)
            dur = gr.Slider(2, 10, value=5, step=1, label="Duration (s)")
            steps = gr.Slider(10, 60, value=30, step=1, label="Steps")
        btn = gr.Button("Generate")
        out = gr.Video(label="Output")
        btn.click(fn=generate,
                  inputs=[prompt, neg, seed, dur, steps], outputs=out)
    return ui


@app.function(image=image, gpu="A10G", volumes={MODEL_ROOT: vol},
              timeout=1800, scaledown_window=300, concurrency_limit=1)
@modal.web_server(7860, startup_timeout=600)
def serve():
    _start_comfy()
    _wait_comfy()
    ui = _build_gradio()
    threading.Thread(
        target=ui.launch,
        kwargs=dict(server_name="0.0.0.0", server_port=7860, share=False,
                    prevent_pooled_spaces=True),
        daemon=True).start()
    while True:
        time.sleep(60)
