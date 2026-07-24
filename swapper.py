import os, sys, subprocess, tempfile, json, shutil, urllib.request, zipfile
from pathlib import Path
from typing import Optional

INSIGHTFACE_DIR = None
INSWAPPER_PATH = None
GFPGAN_PATH = None
_DETECTOR = None
_SWAPPER = None
_RESTORER = None

_INSWAPPER_URL = "https://github.com/deepinsight/insightface/releases/download/v0.7/inswapper_128.onnx"
_GFPGAN_URL = "https://github.com/TencentARC/GFPGAN/releases/download/v1.3.0/GFPGANv1.4.pth"
_BUFFALO_L_URL = "https://github.com/deepinsight/insightface/releases/download/v0.7/buffalo_l.zip"

_BASE = Path("/teamspace/studios/this_studio")
if not _BASE.exists():
    _BASE = Path.cwd()

MODEL_PATHS = [
    str(_BASE / "ComfyUI" / "models" / "insightface"),
    os.path.expanduser("~/.insightface/models"),
    str(_BASE / "ComfyUI" / "custom_nodes" / "comfyui-reactor-node"),
]


def _locate_models():
    global INSIGHTFACE_DIR, INSWAPPER_PATH, GFPGAN_PATH
    if INSIGHTFACE_DIR is not None:
        return

    for base in MODEL_PATHS:
        buf = os.path.join(base, "buffalo_l")
        if os.path.isdir(buf):
            INSIGHTFACE_DIR = base
            break
    if not INSIGHTFACE_DIR:
        INSIGHTFACE_DIR = MODEL_PATHS[0]

    insw_candidates = [
        os.path.join(os.path.dirname(INSIGHTFACE_DIR), "inswapper_128.onnx"),
        os.path.join(INSIGHTFACE_DIR, "inswapper_128.onnx"),
        os.path.join(INSIGHTFACE_DIR, "..", "inswapper_128.onnx"),
        str(_BASE / "ComfyUI" / "models" / "insightface" / "inswapper_128.onnx"),
    ]
    for p in insw_candidates:
        p = os.path.abspath(p)
        if os.path.isfile(p):
            INSWAPPER_PATH = p
            break

    gfp_candidates = [
        str(_BASE / "ComfyUI" / "models" / "facerestore" / "GFPGANv1.4.pth"),
        str(_BASE / "ComfyUI" / "custom_nodes" / "comfyui-reactor-node" / "GFPGANv1.4.pth"),
    ]
    for p in gfp_candidates:
        if os.path.isfile(p):
            GFPGAN_PATH = p
            break


def _download_buffalo_l():
    global INSIGHTFACE_DIR
    _locate_models()
    if INSIGHTFACE_DIR and os.path.isdir(os.path.join(INSIGHTFACE_DIR, "buffalo_l")):
        return
    dest_dir = INSIGHTFACE_DIR or MODEL_PATHS[0]
    os.makedirs(dest_dir, exist_ok=True)
    zip_path = os.path.join(dest_dir, "buffalo_l.zip")
    print(f"Downloading buffalo_l models to {dest_dir}...")
    try:
        urllib.request.urlretrieve(_BUFFALO_L_URL, zip_path)
        with zipfile.ZipFile(zip_path, "r") as zf:
            zf.extractall(dest_dir)
        os.remove(zip_path)
        INSIGHTFACE_DIR = dest_dir
        print("buffalo_l models ready")
    except Exception as e:
        print(f"buffalo_l download failed: {e}")


def _download_inswapper(force: bool = False) -> str:
    global INSWAPPER_PATH
    _locate_models()
    if INSWAPPER_PATH and not force:
        return INSWAPPER_PATH
    base_dir = os.path.dirname(INSIGHTFACE_DIR) if INSIGHTFACE_DIR else MODEL_PATHS[0]
    dest = os.path.join(base_dir, "inswapper_128.onnx")
    os.makedirs(os.path.dirname(dest), exist_ok=True)
    print(f"Downloading inswapper_128.onnx to {dest}...")
    urllib.request.urlretrieve(_INSWAPPER_URL, dest)
    INSWAPPER_PATH = dest
    return dest


def _download_gfpgan(force: bool = False) -> Optional[str]:
    global GFPGAN_PATH
    _locate_models()
    if GFPGAN_PATH and not force:
        return GFPGAN_PATH
    dest = str(_BASE / "ComfyUI" / "models" / "facerestore_models" / "GFPGANv1.4.pth")
    os.makedirs(os.path.dirname(dest), exist_ok=True)
    print(f"Downloading GFPGANv1.4.pth to {dest}...")
    try:
        urllib.request.urlretrieve(_GFPGAN_URL, dest)
        GFPGAN_PATH = dest
        return dest
    except Exception as e:
        print(f"GFPGAN download failed: {e}")
        return None


def _get_detector():
    global _DETECTOR
    if _DETECTOR is not None:
        return _DETECTOR
    _locate_models()
    _download_buffalo_l()
    import insightface
    from insightface.app import FaceAnalysis
    root = os.path.dirname(INSIGHTFACE_DIR) if INSIGHTFACE_DIR else str(_BASE)
    providers = _get_providers()
    print(f"Initializing FaceAnalysis (root={root}, providers={providers})...")
    app = FaceAnalysis(name="buffalo_l", root=root, providers=providers)
    app.prepare(ctx_id=0, det_size=(640, 640))
    _DETECTOR = app
    return _DETECTOR


def _get_swapper():
    global _SWAPPER
    if _SWAPPER is not None:
        return _SWAPPER
    _locate_models()
    if not INSWAPPER_PATH:
        _download_inswapper()
    import onnxruntime
    sess = onnxruntime.InferenceSession(INSWAPPER_PATH, providers=_get_providers())
    _SWAPPER = sess
    return _SWAPPER


def _get_providers():
    try:
        import torch
        if torch.cuda.is_available():
            return ["CUDAExecutionProvider", "CPUExecutionProvider"]
    except Exception:
        pass
    return ["CPUExecutionProvider"]


def _get_gfpgan():
    global _RESTORER
    if _RESTORER is not None:
        return _RESTORER
    _locate_models()
    if not GFPGAN_PATH:
        gfp = _download_gfpgan()
        if not gfp:
            return None
    try:
        from gfpgan import GFPGANer
        _RESTORER = GFPGANer(model_path=GFPGAN_PATH, upscale=1, arch="clean", channel_multiplier=2, bg_upsampler=None)
        return _RESTORER
    except Exception:
        return None


def extract_faces(image_path: str, det_thresh: float = 0.5) -> list:
    import cv2
    app = _get_detector()
    img = cv2.imread(image_path)
    if img is None:
        raise ValueError(f"Could not read image: {image_path}")
    img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
    faces = app.get(img)
    return [{
        "idx": i,
        "bbox": f.bbox.tolist(),
        "score": float(f.det_score),
        "embedding": f.normed_embedding.tolist(),
        "gender": "male" if f.gender == 1 else "female",
        "age": int(f.age),
    } for i, f in enumerate(faces)]


def swap_face(source_img: str, target_img: str, source_idx: int = 0,
              target_idx: int = 0, restore: bool = True) -> str:
    import cv2
    import numpy as np
    _locate_models()

    app = _get_detector()
    swapper = _get_swapper()

    img_src = cv2.imread(source_img)
    if img_src is None:
        raise ValueError(f"Could not read source image: {source_img}")
    img_src = cv2.cvtColor(img_src, cv2.COLOR_BGR2RGB)
    img_tgt = cv2.imread(target_img)
    if img_tgt is None:
        raise ValueError(f"Could not read target image: {target_img}")
    img_tgt = cv2.cvtColor(img_tgt, cv2.COLOR_BGR2RGB)

    src_faces = app.get(img_src)
    tgt_faces = app.get(img_tgt)

    if len(src_faces) <= source_idx:
        raise ValueError(f"Source has {len(src_faces)} faces, requested index {source_idx}")
    if len(tgt_faces) <= target_idx:
        raise ValueError(f"Target has {len(tgt_faces)} faces, requested index {target_idx}")

    src_face = src_faces[source_idx]
    tgt_face = tgt_faces[target_idx]

    blob = swapper.run(None, {"target": img_tgt[np.newaxis, ...].astype(np.float32)})

    result = img_tgt.copy()
    for i, face in enumerate(tgt_faces):
        if i == target_idx:
            result = swapper.run(["output"], {
                "source": src_face.normed_embedding[np.newaxis, ...].astype(np.float32),
                "target": img_tgt[np.newaxis, ...].astype(np.float32),
                "target_face": np.array([face.bbox]).astype(np.float32),
            })[0]
            break

    result = np.clip(result[0] if result.ndim == 4 else result, 0, 255).astype(np.uint8)

    if restore and GFPGAN_PATH:
        restorer = _get_gfpgan()
        if restorer:
            _, _, result = restorer.enhance(result, has_aligned=False, only_center_face=False, paste_back=True)

    out_path = os.path.join(
        os.path.dirname(target_img) or ".",
        f"swap_{Path(target_img).stem}_{Path(source_img).stem}.png"
    )
    cv2.imwrite(out_path, cv2.cvtColor(result, cv2.COLOR_RGB2BGR))
    return out_path


def swap_video(source_img: str, video_path: str, source_idx: int = 0,
               target_idx: int = 0, restore: bool = True, every_n: int = 1,
               output_path: str = None) -> str:
    import cv2
    import numpy as np
    app = _get_detector()
    swapper = _get_swapper()

    cap = cv2.VideoCapture(video_path)
    fps = cap.get(cv2.CAP_PROP_FPS) or 24
    w = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
    h = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
    total = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))

    src_img = cv2.imread(source_img)
    if src_img is None:
        raise ValueError(f"Could not read source image: {source_img}")
    src_img_rgb = cv2.cvtColor(src_img, cv2.COLOR_BGR2RGB)
    src_faces = app.get(src_img_rgb)
    if len(src_faces) <= source_idx:
        raise ValueError(f"Source has {len(src_faces)} faces")
    src_face = src_faces[source_idx]

    if output_path is None:
        out_dir = os.path.dirname(video_path) or "."
        stem = Path(video_path).stem
        output_path = os.path.join(out_dir, f"{stem}_faceswapped.mp4")

    fourcc = cv2.VideoWriter_fourcc(*"mp4v")
    writer = cv2.VideoWriter(output_path, fourcc, fps, (w, h))

    frame_idx = 0
    while True:
        ret, frame = cap.read()
        if not ret:
            break
        if frame_idx % every_n == 0:
            frame_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            tgt_faces = app.get(frame_rgb)
            if len(tgt_faces) > target_idx:
                tgt_face = tgt_faces[target_idx]
                swapped = swapper.run(["output"], {
                    "source": src_face.normed_embedding[np.newaxis, ...].astype(np.float32),
                    "target": frame_rgb[np.newaxis, ...].astype(np.float32),
                    "target_face": np.array([tgt_face.bbox]).astype(np.float32),
                })[0]
                swapped = np.clip(swapped, 0, 255).astype(np.uint8)
                if restore and GFPGAN_PATH:
                    restorer = _get_gfpgan()
                    if restorer:
                        _, _, swapped = restorer.enhance(swapped, has_aligned=False, only_center_face=False, paste_back=True)
                writer.write(cv2.cvtColor(swapped, cv2.COLOR_RGB2BGR))
            else:
                writer.write(frame)
        else:
            writer.write(frame)
        frame_idx += 1
        if frame_idx % 30 == 0:
            pass

    cap.release()
    writer.release()
    return output_path


if __name__ == "__main__":
    import sys
    _download_inswapper()
    print("inswapper downloaded/confirmed")
    if len(sys.argv) >= 3:
        out = swap_face(sys.argv[1], sys.argv[2])
        print(f"Swapped: {out}")
