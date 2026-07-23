import os, sys, subprocess, tempfile, shutil
from pathlib import Path
from typing import Optional

VFI_PATH = None

RIFE_MODEL_TYPES = ["rife4.25", "rife4.24", "rife4.23", "rife4.22", "rife4.21", "rife4.15", "rife4.13", "rife4.11", "rife4.8", "rife4.7", "rife4.6", "rife4.5", "rife4.4", "rife4.3", "rife4.2", "rife4.1", "rife4.0", "rife3.1", "rife3.0", "rife2.0", "rife1.0"]
FAST_MODELS = ["rife4.25", "rife4.22", "rife4.13", "rife4.7", "rife4.1"]
BEST_MODELS = ["rife4.25", "rife4.24"]


def _locate_vfi():
    global VFI_PATH
    if VFI_PATH is not None:
        return

    candidates = [
        "/teamspace/studios/this_studio/ComfyUI/custom_nodes/ComfyUI-Frame-Interpolation",
        os.path.join(os.path.dirname(__file__), "ComfyUI", "custom_nodes", "ComfyUI-Frame-Interpolation"),
    ]
    for p in candidates:
        if os.path.isdir(p) and os.path.isfile(os.path.join(p, "vfi_utils.py")):
            VFI_PATH = p
            sys.path.insert(0, p)
            return


def interpolate_video(video_path: str, multiplier: int = 2,
                      model: str = "rife4.25", batch_size: int = 1,
                      output_path: str = None) -> str:
    _locate_vfi()

    if output_path is None:
        out_dir = os.path.dirname(video_path) or "."
        stem = Path(video_path).stem
        output_path = os.path.join(out_dir, f"{stem}_{multiplier}x.mp4")

    if VFI_PATH is not None:
        return _interpolate_vfi(video_path, multiplier, model, batch_size, output_path)
    else:
        return _interpolate_cv2(video_path, multiplier, output_path)


def _interpolate_vfi(video_path: str, multiplier: int, model: str,
                     batch_size: int, output_path: str) -> str:
    _locate_vfi()
    if VFI_PATH is None:
        raise RuntimeError("ComfyUI-Frame-Interpolation not found")

    import importlib
    vfi_utils = importlib.import_module("vfi_utils")
    model_mod = importlib.import_module(f"vfi_models.rife")

    ckpt = vfi_utils.load_file_from_github_release(model, "flownet.pth")
    arch = model_mod.RIFE_Arch()

    from comfy import model_management
    device = model_management.get_torch_device() if hasattr(model_management, 'get_torch_device') else "cuda" if __import__('torch').cuda.is_available() else "cpu"

    import torch
    arch = arch.to(device)
    sd = torch.load(ckpt, map_location=device, weights_only=True)
    arch.load_state_dict(sd, strict=True)

    import cv2, numpy as np
    cap = cv2.VideoCapture(video_path)
    fps = cap.get(cv2.CAP_PROP_FPS) or 24
    w = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
    h = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
    total = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))

    frames = []
    while True:
        ret, frame = cap.read()
        if not ret:
            break
        frames.append(frame)
    cap.release()

    fourcc = cv2.VideoWriter_fourcc(*"mp4v")
    writer = cv2.VideoWriter(output_path, fourcc, fps * multiplier, (w, h))

    for i in range(len(frames) - 1):
        f0 = frames[i]
        f1 = frames[i + 1]
        f0_t = torch.from_numpy(f0).permute(2, 0, 1).unsqueeze(0).float().to(device) / 255.0
        f1_t = torch.from_numpy(f1).permute(2, 0, 1).unsqueeze(0).float().to(device) / 255.0

        with torch.no_grad():
            interp = vfi_utils.generic_frame_loop(frames, multiplier, arch, vfi_utils._generic_frame_loop, batch_size)
        writer.write(frames[i])
    writer.release()
    return output_path


def _interpolate_cv2(video_path: str, multiplier: int, output_path: str) -> str:
    import cv2
    import numpy as np

    cap = cv2.VideoCapture(video_path)
    fps = cap.get(cv2.CAP_PROP_FPS) or 24
    w = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
    h = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))

    fourcc = cv2.VideoWriter_fourcc(*"mp4v")
    writer = cv2.VideoWriter(output_path, fourcc, fps * multiplier, (w, h))

    ret, prev = cap.read()
    if not ret:
        cap.release()
        raise ValueError("Empty video")

    prev_gray = cv2.cvtColor(prev, cv2.COLOR_BGR2GRAY)
    writer.write(prev)

    while True:
        ret, next_frame = cap.read()
        if not ret:
            break

        next_gray = cv2.cvtColor(next_frame, cv2.COLOR_BGR2GRAY)
        flow = cv2.calcOpticalFlowFarneback(prev_gray, next_gray, None, 0.5, 3, 15, 3, 5, 1.2, 0)

        for i in range(1, multiplier):
            alpha = i / multiplier
            h_flow = flow * alpha
            h, w_grid = flow.shape[:2]
            x, y = np.meshgrid(np.arange(w_grid), np.arange(h))
            map_x = (x + h_flow[..., 0]).astype(np.float32)
            map_y = (y + h_flow[..., 1]).astype(np.float32)
            interp = cv2.remap(prev, map_x, map_y, cv2.INTER_LINEAR)
            writer.write(interp)

        writer.write(next_frame)
        prev, prev_gray = next_frame, next_gray

    cap.release()
    writer.release()
    return output_path


def extract_frames(video_path: str, output_dir: str = None,
                   fps: float = None) -> tuple:
    import cv2
    os.makedirs(output_dir or os.path.join(os.path.dirname(video_path), "frames"), exist_ok=True)

    cap = cv2.VideoCapture(video_path)
    src_fps = cap.get(cv2.CAP_PROP_FPS) or 24
    total = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    step = 1
    if fps is not None:
        step = max(1, round(src_fps / fps))

    frames = []
    i = 0
    while True:
        ret, frame = cap.read()
        if not ret:
            break
        if i % step == 0:
            p = os.path.join(output_dir, f"frame_{len(frames):06d}.png")
            cv2.imwrite(p, frame)
            frames.append(p)
        i += 1
    cap.release()
    return frames, src_fps


def frames_to_video(frame_paths: list, output_path: str, fps: float = 24) -> str:
    import cv2
    if not frame_paths:
        raise ValueError("No frames to assemble")
    first = cv2.imread(frame_paths[0])
    h, w = first.shape[:2]

    fourcc = cv2.VideoWriter_fourcc(*"mp4v")
    writer = cv2.VideoWriter(output_path, fourcc, fps, (w, h))
    for fp in frame_paths:
        img = cv2.imread(fp)
        if img is not None:
            writer.write(img)
    writer.release()
    return output_path


if __name__ == "__main__":
    import sys
    if len(sys.argv) >= 2:
        out = interpolate_video(sys.argv[1], multiplier=int(sys.argv[2]) if len(sys.argv) > 2 else 2)
        print(f"Interpolated: {out}")
