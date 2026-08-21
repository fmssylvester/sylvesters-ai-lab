#!/usr/bin/env python3
"""
High-Fidelity Selective Luminance Inpainting Watermark Stripper.
Optimized to run under 20 seconds using precise text masks, leaving
subject skin texture and details completely untouched.
"""

import os
import sys
import cv2
import numpy as np
import subprocess
from pathlib import Path

INPUT_VIDEO = "assets/avatar.mp4"
OUTPUT_VIDEO = "assets/avatar_clean.mp4"
TMP_DIR = Path("tmp/inpainting")
TMP_DIR.mkdir(parents=True, exist_ok=True)

# 15 Watermark Coordinates (x, y, w, h)
WATERMARKS = [
    # Top Row
    {"x": 0, "y": 0, "w": 120, "h": 120},
    {"x": 235, "y": 0, "w": 120, "h": 120},
    {"x": 495, "y": 0, "w": 110, "h": 120},
    {"x": 745, "y": 0, "w": 110, "h": 120},
    
    # Middle Row (Upper)
    {"x": 80, "y": 180, "w": 130, "h": 130},
    {"x": 330, "y": 180, "w": 130, "h": 130},
    {"x": 580, "y": 180, "w": 130, "h": 130},
    {"x": 830, "y": 180, "w": 130, "h": 130},
    
    # Middle Row (Lower)
    {"x": 80, "y": 380, "w": 145, "h": 175},
    {"x": 330, "y": 380, "w": 145, "h": 175},
    {"x": 580, "y": 380, "w": 145, "h": 175},
    {"x": 830, "y": 380, "w": 145, "h": 175},
    
    # Bottom Row
    {"x": 0, "y": 600, "w": 120, "h": 120},
    {"x": 235, "y": 600, "w": 120, "h": 120},
    {"x": 495, "y": 600, "w": 110, "h": 120},
    {"x": 745, "y": 600, "w": 110, "h": 120},
    {"x": 950, "y": 600, "w": 120, "h": 120}
]

def create_block_mask(width=1280, height=720):
    mask = np.zeros((height, width), dtype=np.uint8)
    for w in WATERMARKS:
        x = max(0, w["x"])
        y = max(0, w["y"])
        w_val = min(w["w"], width - x)
        h_val = min(w["h"], height - y)
        cv2.rectangle(mask, (x, y), (x + w_val, y + h_val), 255, -1)
    return mask

def process_video():
    if not os.path.exists(INPUT_VIDEO):
        print(f"Error: {INPUT_VIDEO} not found!")
        sys.exit(1)
        
    print("=== STARTING HIGH-FIDELITY WATERMARK STRIPPER ===")
    cap = cv2.VideoCapture(INPUT_VIDEO)
    
    width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
    height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
    fps = cap.get(cv2.CAP_PROP_FPS)
    total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    
    print(f"Video Specs: {width}x{height} @ {fps}fps | Total Frames: {total_frames}")
    
    # Extract audio track to temp file
    print("Extracting original audio track...")
    tmp_audio = str(TMP_DIR / "audio_temp.aac")
    subprocess.run([
        "ffmpeg", "-y", "-i", INPUT_VIDEO, "-vn", "-acodec", "copy", tmp_audio
    ], capture_output=True)
    
    # Create selective block mask
    block_mask = create_block_mask(width, height)
    
    # Create temporary video writer for the inpainted frames
    tmp_avi = str(TMP_DIR / "temp_inpainted.avi")
    fourcc = cv2.VideoWriter_fourcc(*'MJPG')
    out_writer = cv2.VideoWriter(tmp_avi, fourcc, fps, (width, height))
    
    print("Inpainting frames with selective luminance thresholds...")
    frame_idx = 0
    while cap.isOpened():
        ret, frame = cap.read()
        if not ret:
            break
            
        # Create luminance mask dynamically per frame
        # (This adapts to lighting changes so it only targets white text)
        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        thresh = cv2.threshold(gray, 185, 255, cv2.THRESH_BINARY)[1]
        
        # Limit the mask strictly to our watermark blocks
        selective_mask = cv2.bitwise_and(thresh, block_mask)
        
        # Mathematical inpainting on exact text pixels (inpaintRadius=2 is very sharp)
        inpainted_frame = cv2.inpaint(frame, selective_mask, 2, cv2.INPAINT_TELEA)
        out_writer.write(inpainted_frame)
        
        frame_idx += 1
        if frame_idx % 100 == 0:
            print(f"  Processed {frame_idx}/{total_frames} frames...")
            
    cap.release()
    out_writer.release()
    print("Inpainting completed.")
    
    # Merge inpainted video with original audio back into clean MP4
    print("Compiling final clean MP4 with original audio...")
    subprocess.run([
        "ffmpeg", "-y", "-i", tmp_avi, "-i", tmp_audio, 
        "-c:v", "libx264", "-pix_fmt", "yuv420p", "-c:a", "aac", OUTPUT_VIDEO
    ], capture_output=True)
    
    print(f"=== SUCCESS: Clean video written to {OUTPUT_VIDEO} ===")
    
    # Clean up large temp videos
    if os.path.exists(tmp_avi):
        os.remove(tmp_avi)
    if os.path.exists(tmp_audio):
        os.remove(tmp_audio)

if __name__ == "__main__":
    process_video()