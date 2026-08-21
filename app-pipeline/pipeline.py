#!/usr/bin/env python3
"""
SermonDUB Pipeline — Main orchestrator.
Transcribe → Detect Highlights → Extract Clips → (Optional) Dub → Share
"""
import os
import sys
import json
import time
import subprocess
from pathlib import Path
from dataclasses import dataclass, asdict

from transcribe import transcribe
from highlight import detect_highlights, expand_to_clip_bounds
from clip import extract_clip, get_duration


@dataclass
class PipelineConfig:
    """Pipeline configuration."""
    input_path: str
    output_dir: str
    language: str = "en"
    max_clips: int = 10
    min_clip_duration: float = 15.0
    max_clip_duration: float = 60.0
    watermark: bool = True
    dub_language: str = None  # Target language for dubbing (None = no dub)


@dataclass
class PipelineResult:
    """Result of running the pipeline."""
    success: bool
    clips: list
    highlights: list
    transcription: dict
    duration: float
    processing_time: float
    error: str = None


def run_pipeline(config: PipelineConfig, progress_callback=None) -> PipelineResult:
    """Run the full sermon clipping pipeline.
    
    Args:
        config: Pipeline configuration
        progress_callback: Optional callback(stage, progress) where progress is 0-1
    
    Returns:
        PipelineResult with all outputs
    """
    start_time = time.time()
    
    def report(stage, progress):
        if progress_callback:
            progress_callback(stage, progress)
        print(f"[{stage}] {progress*100:.0f}%")
    
    try:
        # Stage 1: Validate input
        report("validate", 0.0)
        if not os.path.exists(config.input_path):
            raise FileNotFoundError(f"Input not found: {config.input_path}")
        
        os.makedirs(config.output_dir, exist_ok=True)
        report("validate", 1.0)
        
        # Stage 1.5: Extract audio if input is video
        report("extract_audio", 0.0)
        audio_path = config.input_path
        ext = Path(config.input_path).suffix.lower()
        if ext in (".mp4", ".mkv", ".avi", ".mov", ".webm"):
            audio_path = os.path.join(config.output_dir, "_temp_audio.wav")
            subprocess.run([
                "ffmpeg", "-y", "-i", config.input_path,
                "-ar", "16000", "-ac", "1", audio_path,
            ], capture_output=True, check=True)
        report("extract_audio", 1.0)
        
        # Stage 2: Transcribe
        report("transcribe", 0.0)
        transcription = transcribe(audio_path, language=config.language)
        report("transcribe", 1.0)
        
        print(f"  Duration: {transcription['duration']:.1f}s")
        print(f"  Segments: {len(transcription['segments'])}")
        print(f"  Words: {len(transcription['words'])}")
        
        # Stage 3: Detect highlights
        report("detect", 0.0)
        highlights = detect_highlights(
            transcription,
            max_clips=config.max_clips,
            min_duration=config.min_clip_duration,
            max_duration=config.max_clip_duration,
        )
        report("detect", 1.0)
        
        print(f"  Highlights found: {len(highlights)}")
        
        # Stage 4: Extract clips
        report("clip", 0.0)
        clips = []
        for i, highlight in enumerate(highlights):
            start, end = expand_to_clip_bounds(
                highlight,
                transcription["duration"],
                min_dur=config.min_clip_duration,
                max_dur=config.max_clip_duration,
            )
            
            clip_path = os.path.join(config.output_dir, f"clip_{i+1:03d}.mp4")
            
            # Filter words to this clip's range
            clip_words = [
                w for w in transcription["words"]
                if w["end"] >= start and w["start"] <= end
            ]
            
            extract_clip(
                input_path=config.input_path,
                output_path=clip_path,
                start=start,
                end=end,
                words=clip_words,
                watermark=config.watermark,
            )
            
            clips.append({
                "path": clip_path,
                "start": start,
                "end": end,
                "duration": end - start,
                "score": highlight.score,
                "reason": highlight.reason,
                "text": highlight.text,
            })
            
            report("clip", (i + 1) / len(highlights))
        
        # Stage 5: Save metadata
        metadata = {
            "source": config.input_path,
            "language": config.language,
            "duration": transcription["duration"],
            "clips": clips,
            "transcription_segments": len(transcription["segments"]),
            "total_words": len(transcription["words"]),
            "processing_time": time.time() - start_time,
        }
        
        metadata_path = os.path.join(config.output_dir, "metadata.json")
        with open(metadata_path, "w") as f:
            json.dump(metadata, f, indent=2)
        
        report("done", 1.0)
        
        elapsed = time.time() - start_time
        print(f"\nPipeline complete in {elapsed:.1f}s")
        print(f"Clips saved to: {config.output_dir}")
        
        return PipelineResult(
            success=True,
            clips=clips,
            highlights=[asdict(h) for h in highlights],
            transcription=transcription,
            duration=transcription["duration"],
            processing_time=elapsed,
        )
    
    except Exception as e:
        elapsed = time.time() - start_time
        return PipelineResult(
            success=False,
            clips=[],
            highlights=[],
            transcription={},
            duration=0,
            processing_time=elapsed,
            error=str(e),
        )


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python3 pipeline.py <input_video> [output_dir]")
        sys.exit(1)
    
    input_path = sys.argv[1]
    output_dir = sys.argv[2] if len(sys.argv) > 2 else "./output"
    
    config = PipelineConfig(
        input_path=input_path,
        output_dir=output_dir,
        max_clips=5,
    )
    
    result = run_pipeline(config)
    
    if result.success:
        print(f"\n=== RESULTS ===")
        print(f"Duration: {result.duration:.1f}s")
        print(f"Clips: {len(result.clips)}")
        for i, clip in enumerate(result.clips):
            print(f"  {i+1}. [{clip['start']:.1f}-{clip['end']:.1f}] score={clip['score']:.1f}")
            print(f"     {clip['text'][:80]}...")
            print(f"     → {clip['path']}")
    else:
        print(f"\nPipeline failed: {result.error}")
        sys.exit(1)
