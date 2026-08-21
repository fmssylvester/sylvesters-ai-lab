#!/usr/bin/env python3
"""Detect highlight moments in transcribed sermon audio."""
import re
import math
from dataclasses import dataclass


# Sermon-specific keywords that indicate high-energy moments
HIGHLIGHT_KEYWORDS = [
    # Praise & worship
    "hallelujah", "hallelujah", "amen", "glory", "praise",
    # Engagement markers
    "say that again", "turn to your neighbor", "come on",
    "open your mouth", "shout", "clap", "lift your hands",
    # Scripture references
    "scripture says", "the bible says", "thus says the lord",
    "word of god", "written", "psalm", "genesis", "exodus",
    # Emotional peaks
    "breakthrough", "miracle", "anointing", "fire",
    "blood of jesus", "name of jesus", "power",
    # Call and response
    "repeat after me", "say lord", "if you believe",
    "can i get", "do i have",
]

# Patterns that indicate emotional emphasis (regex)
EMPHASIS_PATTERNS = [
    r"say\s+(it\s+)?again",
    r"turn\s+to\s+(your\s+)?neighbor",
    r"open\s+your\s+mouth",
    r"shout\s+(hallelujah|amen|glory)",
    r"can\s+i\s+get",
    r"do\s+i\s+have",
    r"if\s+you\s+believe",
    r"come\s+on",
    r"lift\s+your\s+hands",
    r"the\s+bible\s+says",
    r"thus\s+says",
    r"word\s+of\s+god",
]


@dataclass
class HighlightCandidate:
    """A candidate highlight moment."""
    start: float
    end: float
    score: float
    reason: str
    text: str


def score_keywords(text: str) -> float:
    """Score a segment based on keyword presence."""
    text_lower = text.lower()
    score = 0.0
    
    for keyword in HIGHLIGHT_KEYWORDS:
        if keyword in text_lower:
            score += 1.0
    
    for pattern in EMPHASIS_PATTERNS:
        if re.search(pattern, text_lower):
            score += 0.5
    
    return min(score, 5.0)  # Cap at 5


def score_confidence(segments: list, idx: int) -> float:
    """Score based on confidence dip (emphatic speech has lower confidence)."""
    if idx < 1 or idx >= len(segments) - 1:
        return 0.0
    
    current_conf = abs(segments[idx]["confidence"])
    prev_conf = abs(segments[idx - 1]["confidence"])
    next_conf = abs(segments[idx + 1]["confidence"])
    avg_neighbor = (prev_conf + next_conf) / 2
    
    # Lower confidence = more emphatic = higher score
    if avg_neighbor > 0 and current_conf < avg_neighbor * 0.7:
        return 2.0
    return 0.0


def score_energy(segments: list, idx: int) -> float:
    """Score based on energy (short, punchy segments = high energy)."""
    seg = segments[idx]
    duration = seg["end"] - seg["start"]
    
    if duration <= 0:
        return 0.0
    
    words = seg["text"].split()
    words_per_second = len(words) / duration
    
    # Fast speech = high energy
    if words_per_second > 3.0:
        return 1.5
    elif words_per_second > 2.0:
        return 1.0
    return 0.0


def detect_highlights(
    transcription: dict,
    max_clips: int = 10,
    min_score: float = 1.0,
    min_duration: float = 10.0,
    max_duration: float = 60.0,
) -> list[HighlightCandidate]:
    """Detect highlight moments from transcription data.
    
    Args:
        transcription: Output from transcribe()
        max_clips: Maximum number of clips to return
        min_score: Minimum score threshold
        min_duration: Minimum clip duration in seconds
        max_duration: Maximum clip duration in seconds
    
    Returns:
        List of HighlightCandidate sorted by score (highest first)
    """
    segments = transcription["segments"]
    candidates = []
    
    for i, seg in enumerate(segments):
        # Skip segments that are too short
        if seg["end"] - seg["start"] < 1.0:
            continue
        
        # Skip no-speech segments
        if seg.get("no_speech_prob", 0) > 0.5:
            continue
        
        # Calculate composite score
        kw_score = score_keywords(seg["text"])
        conf_score = score_confidence(segments, i)
        energy_score = score_energy(segments, i)
        
        total_score = kw_score + conf_score + energy_score
        
        if total_score >= min_score:
            # Expand the segment into a clip window
            clip_start = max(0, seg["start"] - 2.0)
            clip_end = seg["end"] + 2.0
            
            candidates.append(HighlightCandidate(
                start=clip_start,
                end=clip_end,
                score=total_score,
                reason=f"kw={kw_score:.1f} conf={conf_score:.1f} energy={energy_score:.1f}",
                text=seg["text"],
            ))
    
    # Merge overlapping candidates
    candidates.sort(key=lambda c: c.start)
    merged = []
    for cand in candidates:
        if merged and cand.start <= merged[-1].end + 1.0:
            # Merge with previous
            if cand.score > merged[-1].score:
                merged[-1] = cand
        else:
            merged.append(cand)
    
    # Sort by score and take top N
    merged.sort(key=lambda c: c.score, reverse=True)
    top = merged[:max_clips]
    
    # Sort by time for final output
    top.sort(key=lambda c: c.start)
    
    return top


def expand_to_clip_bounds(
    candidate: HighlightCandidate,
    duration: float,
    min_dur: float = 15.0,
    max_dur: float = 60.0,
) -> tuple[float, float]:
    """Expand a highlight candidate to a proper clip duration."""
    clip_len = candidate.end - candidate.start
    
    if clip_len < min_dur:
        # Expand symmetrically
        deficit = (min_dur - clip_len) / 2
        start = max(0, candidate.start - deficit)
        end = min(duration, candidate.end + deficit)
    elif clip_len > max_dur:
        # Center on the highlight
        center = (candidate.start + candidate.end) / 2
        start = max(0, center - max_dur / 2)
        end = min(duration, start + max_dur)
    else:
        start = candidate.start
        end = candidate.end
    
    return start, end


if __name__ == "__main__":
    # Test with mock data
    test_transcription = {
        "segments": [
            {"start": 0, "end": 5, "text": "Good morning church, welcome to worship service", "confidence": -0.5, "no_speech_prob": 0.1},
            {"start": 5, "end": 10, "text": "Open your Bible to Psalm 23", "confidence": -0.8, "no_speech_prob": 0.05},
            {"start": 10, "end": 15, "text": "The Lord is my shepherd, I shall not want", "confidence": -0.3, "no_speech_prob": 0.02},
            {"start": 15, "end": 20, "text": "Hallelujah! Say that again! The Lord is my shepherd!", "confidence": -1.2, "no_speech_prob": 0.01},
            {"start": 20, "end": 25, "text": "Come on, lift your hands if you believe", "confidence": -1.0, "no_speech_prob": 0.03},
        ]
    }
    
    highlights = detect_highlights(test_transcription)
    print(f"Found {len(highlights)} highlights:")
    for h in highlights:
        print(f"  [{h.start:.1f}-{h.end:.1f}] score={h.score:.1f} | {h.text}")
