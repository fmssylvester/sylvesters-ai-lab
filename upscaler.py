import os
import cv2
import numpy as np
import torch
import urllib.request
from pathlib import Path
from PIL import Image
from spandrel import ModelLoader

BASE_PATH = Path("/teamspace/studios/this_studio")
MODEL_PATH = BASE_PATH / "ComfyUI" / "models" / "upscale" / "4x-UltraSharp.pth"

QUALITY_EDGE = {"720p": 1280, "1080p (1K)": 1920, "1440p (2K)": 2560, "2160p (4K)": 3840}

_model = None


def _download_model():
    # Public 4x ESRGAN weights (spandrel loads by architecture, filename is irrelevant)
    url = "https://github.com/xinntao/Real-ESRGAN/releases/download/v0.1.0/RealESRGAN_x4plus.pth"
    try:
        MODEL_PATH.parent.mkdir(parents=True, exist_ok=True)
        print("Downloading upscaler model (4x-UltraSharp)...")
        urllib.request.urlretrieve(url, str(MODEL_PATH))
        print("Upscaler model ready:", MODEL_PATH)
    except Exception as e:
        print("Upscaler download failed:", e)


def get_model():
    global _model
    if _model is None:
        if not MODEL_PATH.exists():
            _download_model()
        if MODEL_PATH.exists():
            try:
                m = ModelLoader().load_from_file(str(MODEL_PATH))
                m.cuda().eval()
                _model = m
            except Exception as e:
                print("Upscaler model load failed:", e)
    return _model


def target_dims(src_w, src_h, quality):
    le = QUALITY_EDGE[quality]
    if src_w >= src_h:
        w = le
        h = int(round(le * src_h / src_w / 32) * 32)
    else:
        h = le
        w = int(round(le * src_w / src_h / 32) * 32)
    return max(256, w), max(256, h)


def _upscale_frame(rgb, model):
    t = torch.from_numpy(rgb).float().permute(2, 0, 1).unsqueeze(0).cuda() / 255.0
    with torch.no_grad():
        out = model(t)
    return (out.squeeze(0).permute(1, 2, 0).cpu().numpy() * 255).clip(0, 255).astype(np.uint8)


def upscale_video(src, dst, quality, progress=None):
    cap = cv2.VideoCapture(src)
    fps = cap.get(cv2.CAP_PROP_FPS) or 24
    n = int(cap.get(cv2.CAP_PROP_FRAME_COUNT)) or 0
    sw = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
    sh = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
    tw, th = target_dims(sw, sh, quality)
    model = get_model()
    need_model = model is not None and max(tw, th) > max(sw, sh) * 1.05
    vw = cv2.VideoWriter(dst, cv2.VideoWriter_fourcc(*"mp4v"), fps, (tw, th))
    i = 0
    while True:
        ret, frame = cap.read()
        if not ret:
            break
        rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        if need_model:
            rgb = _upscale_frame(rgb, model)
        if (tw, th) != (rgb.shape[1], rgb.shape[0]):
            rgb = cv2.resize(rgb, (tw, th), interpolation=cv2.INTER_LANCZOS4)
        vw.write(cv2.cvtColor(rgb, cv2.COLOR_RGB2BGR))
        i += 1
        if progress:
            progress(min(1.0, (i / n) if n else 1.0))
    cap.release()
    vw.release()
    if not is_valid_video(dst):
        raise RuntimeError("upscaled output is empty or unreadable")
    return dst


def is_valid_video(path, min_frames=1):
    if not path or not os.path.exists(path) or os.path.getsize(path) < 1024:
        return False
    cap = cv2.VideoCapture(path)
    if not cap.isOpened():
        return False
    n = int(cap.get(cv2.CAP_PROP_FRAME_COUNT)) or 0
    ret, _ = cap.read()
    cap.release()
    return bool(ret) and n >= min_frames


def upscale_image(src, dst):
    model = get_model()
    if model is None:
        raise RuntimeError("Upscale model (4x-UltraSharp) not found.")
    if not src or not os.path.exists(src):
        raise RuntimeError("Source image missing.")
    img = Image.open(src).convert("RGB")
    rgb = np.array(img)
    out = _upscale_frame(rgb, model)
    Image.fromarray(out).save(dst)
    return dst
