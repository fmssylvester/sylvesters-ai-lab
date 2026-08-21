#!/usr/bin/env python3
"""Extract clips and overlay captions using ffmpeg."""
import subprocess
import os
from pathlib import Path


def get_duration(audio_path: str) -> float:
    """Get duration of audio/video file in seconds."""
    result = subprocess.run(
        ["ffprobe", "-v", "error", "-show_entries", "format=duration",
         "-of", "default=noprint_wrappers=1:nokey=1", audio_path],
        capture_output=True, text=True
    )
    return float(result.stdout.strip())


def extract_clip(
    input_path: str,
    output_path: str,
    start: float,
    end: float,
    words: list = None,
    caption_style: str = "default",
    watermark: bool = True,
) -> str:
    """Extract a clip with optional word-level captions.
    
    Args:
        input_path: Source video/audio file
        output_path: Where to save the clip
        start: Start time in seconds
        end: End time in seconds
        words: List of {word, start, end} for caption overlay
        caption_style: "default" (white, bottom) or "bold" (yellow, center)
        watermark: Whether to add watermark
    
    Returns:
        Path to output file
    """
    input_path = str(Path(input_path).resolve())
    output_path = str(Path(output_path).resolve())
    
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    
    duration = end - start
    
    # Build ffmpeg filter for captions
    vf_filters = []
    
    if words:
        # Create ASS subtitle file for word-level captions
        ass_path = output_path.rsplit(".", 1)[0] + ".ass"
        _create_ass_subtitle(words, ass_path, start, end)
        vf_filters.append(f"ass='{ass_path}'")
    
    if watermark:
        # Add subtle watermark at bottom-right
        vf_filters.append(
            "drawtext=text='SermonDUB':fontsize=14:fontcolor=white@0.3:"
            "x=w-tw-10:y=h-th-10"
        )
    
    # Build ffmpeg command
    cmd = [
        "ffmpeg", "-y",
        "-ss", str(start),
        "-i", input_path,
        "-t", str(duration),
    ]
    
    if vf_filters:
        cmd.extend(["-vf", ",".join(vf_filters)])
    
    cmd.extend([
        "-c:v", "libx264", "-preset", "fast", "-crf", "23",
        "-c:a", "aac", "-b:a", "128k",
        output_path,
    ])
    
    result = subprocess.run(cmd, capture_output=True, text=True)
    
    if result.returncode != 0:
        raise RuntimeError(f"ffmpeg failed: {result.stderr[-500:]}")
    
    return output_path


def _create_ass_subtitle(
    words: list,
    output_path: str,
    clip_start: float,
    clip_end: float,
    style: str = "default",
):
    """Create an ASS subtitle file from word-level timestamps."""
    
    # ASS header
    header = """[Script Info]
ScriptType: v4.00+
PlayResX: 1920
PlayResY: 1080
WrapStyle: 0

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: Default,Arial,48,&H00FFFFFF,&H000000FF,&H00000000,&H80000000,1,0,0,0,100,100,0,0,1,2,1,2,10,10,30,1
Style: Highlight,Arial,56,&H0000FFFF,&H000000FF,&H00000000,&H80000000,1,0,0,0,100,100,0,0,1,3,2,2,10,10,30,1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
"""
    
    lines = []
    current_text = []
    current_start = None
    last_end = None
    
    for word_info in words:
        word_start = word_info["start"]
        word_end = word_info["end"]
        word_text = word_info["word"]
        
        # Skip words outside clip bounds
        if word_end < clip_start or word_start > clip_end:
            continue
        
        # Adjust times relative to clip start (clamp to 0)
        rel_start = max(0, word_start - clip_start)
        rel_end = max(0, word_end - clip_start)
        
        # Start new caption group if gap > 0.5s or we have 6+ words
        if last_end is not None and (word_start - last_end > 0.5 or len(current_text) >= 6):
            if current_text:
                _flush_caption(current_text, current_start, max(0, last_end - clip_start), lines)
            current_text = []
            current_start = rel_start
        
        if current_start is None:
            current_start = rel_start
        
        current_text.append(word_text)
        last_end = word_end
    
    # Flush remaining
    if current_text:
        _flush_caption(current_text, current_start, max(0, last_end - clip_start), lines)
    
    with open(output_path, "w") as f:
        f.write(header)
        f.write("\n".join(lines))


def _flush_caption(words: list, start: float, end: float, lines: list):
    """Write one caption event to the ASS events list."""
    text = " ".join(words)
    start_str = _format_ass_time(start)
    end_str = _format_ass_time(end)
    lines.append(f"Dialogue: 0,{start_str},{end_str},Default,,0,0,0,,{text}")


def _format_ass_time(seconds: float) -> str:
    """Format seconds to ASS time format H:MM:SS.CC."""
    seconds = max(0, seconds)  # Clamp negative to 0
    h = int(seconds // 3600)
    m = int((seconds % 3600) // 60)
    s = int(seconds % 60)
    cs = int((seconds % 1) * 100)
    return f"{h}:{m:02d}:{s:02d}.{cs:02d}"


def batch_extract(
    input_path: str,
    output_dir: str,
    clips: list,
    words: list = None,
    watermark: bool = True,
) -> list[str]:
    """Extract multiple clips from a source.
    
    Args:
        input_path: Source video
        output_dir: Directory to save clips
        clips: List of (start, end) tuples
        words: Word-level timestamps for captions
        watermark: Whether to add watermark
    
    Returns:
        List of output file paths
    """
    output_dir = str(Path(output_dir))
    os.makedirs(output_dir, exist_ok=True)
    
    outputs = []
    for i, (start, end) in enumerate(clips):
        out_path = os.path.join(output_dir, f"clip_{i+1:03d}.mp4")
        
        # Filter words to this clip's time range
        clip_words = []
        if words:
            clip_words = [
                w for w in words
                if w["end"] >= start and w["start"] <= end
            ]
        
        extract_clip(
            input_path=input_path,
            output_path=out_path,
            start=start,
            end=end,
            words=clip_words,
            watermark=watermark,
        )
        outputs.append(out_path)
    
    return outputs


if __name__ == "__main__":
    # Test ASS subtitle creation
    test_words = [
        {"word": "Hallelujah", "start": 10.0, "end": 10.8},
        {"word": "church", "start": 10.8, "end": 11.2},
        {"word": "open", "start": 11.5, "end": 11.7},
        {"word": "your", "start": 11.7, "end": 11.9},
        {"word": "Bible", "start": 11.9, "end": 12.3},
        {"word": "to", "start": 12.3, "end": 12.4},
        {"word": "Psalm", "start": 12.5, "end": 12.9},
        {"word": "23", "start": 12.9, "end": 13.3},
    ]
    
    _create_ass_subtitle(test_words, "/tmp/test_sub.ass", 9.0, 15.0)
    print("Created test subtitle file")
    with open("/tmp/test_sub.ass") as f:
        print(f.read())
