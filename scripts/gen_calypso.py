#!/usr/bin/env python3
"""Generate a 2-hour Calypso backing track at 93 BPM."""

import numpy as np
import wave
import struct
import sys

SR = 44100
BPM = 93
BEAT = 60.0 / BPM  # seconds per beat
BAR = BEAT * 4       # seconds per bar
DURATION = 2 * 3600  # 2 hours

def env_decay(t, attack=0.002, decay=0.05):
    env = np.ones_like(t)
    mask_a = t < attack
    env[mask_a] = t[mask_a] / attack
    mask_d = t >= attack
    env[mask_d] = np.exp(-(t[mask_d] - attack) / max(decay, 0.001))
    return env

def kick(t):
    freq = 150 * np.exp(-t * 30) + 45
    phase = 2 * np.pi * np.cumsum(freq) / SR
    return np.sin(phase) * env_decay(t, 0.001, 0.04) * 0.7

def snare(t):
    noise = np.random.randn(len(t))
    osc = np.sin(2 * np.pi * 200 * t) * 0.3
    return (noise * 0.5 + osc) * env_decay(t, 0.001, 0.035)

def hihat(t):
    return np.random.randn(len(t)) * env_decay(t, 0.001, 0.012) * 0.2

def bass_note(t, freq):
    phase = 2 * np.pi * freq * t
    return (np.sin(phase) * 0.6 + np.sin(2 * phase) * 0.25 + np.sin(3 * phase) * 0.1) * env_decay(t, 0.003, 0.15)

def pad_note(t, freqs, dur):
    out = np.zeros(int(SR * dur))
    for f in freqs:
        phase = 2 * np.pi * f * np.arange(len(out)) / SR
        note = np.sin(phase) * 0.08
        # Soft attack/release
        att = min(0.05, dur * 0.1)
        rel = min(0.08, dur * 0.15)
        env = np.ones(len(out))
        att_samples = int(att * SR)
        rel_samples = int(rel * SR)
        env[:att_samples] = np.linspace(0, 1, att_samples)
        env[-rel_samples:] = np.linspace(1, 0, rel_samples)
        out += note * env
    return out

# Bass: I-vi-IV-V in C (C2, A1, F1, G1)
BASS_NOTES = [
    (65.41, [1, 0]),     # C2 on beat 1, and of 2
    (55.00, [0, 1]),     # A1 on and of 3, beat 4
    (43.65, [1, 0]),     # F1 on beat 1, and of 2
    (49.00, [0, 1]),     # G1 on and of 3, beat 4
]

# Chords: C major, Am, F major, G major
CHORDS = [
    [261.63, 329.63, 392.00],  # C
    [220.00, 261.63, 329.63],  # Am
    [174.61, 220.00, 261.63],  # F
    [196.00, 246.94, 293.66],  # G
]

# Calypso percussion pattern (per bar, in beats)
# KICK: 1, 2+, 3, 4+  (syncopated)
# SNARE: 2, 4
# HI-HAT: every 8th note
KICK_BEATS = [0, 1.5, 2, 3.5]
SNARE_BEATS = [1, 3]
HH_BEATS = [i * 0.5 for i in range(8)]

print("Generating Calypso loop...")
sys.stdout.flush()

bar_samples = int(BAR * SR)
bar_audio = np.zeros(bar_samples)

# Drums
for beat in KICK_BEATS:
    pos = int(beat * BEAT * SR)
    length = min(int(0.3 * SR), bar_samples - pos)
    if length > 0:
        t = np.arange(length) / SR
        bar_audio[pos:pos+length] += kick(t)

for beat in SNARE_BEATS:
    pos = int(beat * BEAT * SR)
    length = min(int(0.25 * SR), bar_samples - pos)
    if length > 0:
        t = np.arange(length) / SR
        bar_audio[pos:pos+length] += snare(t)

for beat in HH_BEATS:
    pos = int(beat * BEAT * SR)
    length = min(int(0.1 * SR), bar_samples - pos)
    if length > 0:
        t = np.arange(length) / SR
        bar_audio[pos:pos+length] += hihat(t)

# Bass
for i, (freq, onbeats) in enumerate(BASS_NOTES):
    for on in onbeats:
        pos = int(on * BEAT * SR)
        dur = BEAT * 0.9
        length = min(int(dur * SR), bar_samples - pos)
        if length > 0:
            t = np.arange(length) / SR
            bar_audio[pos:pos+length] += bass_note(t, freq)

# Pad chords (one chord per bar, full bar)
for i, chord in enumerate(CHORDS):
    bar_audio += pad_note(np.arange(bar_samples) / SR, chord, BAR)

# Normalize
peak = np.max(np.abs(bar_audio))
if peak > 0:
    bar_audio = bar_audio / peak * 0.85

total_bars = int(DURATION / BAR)
total_samples = bar_samples * total_bars

print(f"Bar: {BAR:.3f}s, {bar_samples} samples")
print(f"Total bars: {total_bars}, Total samples: {total_samples}")
print(f"Expected duration: {total_bars * BAR:.1f}s")
sys.stdout.flush()

# Write WAV in chunks
wav_path = "/data/data/com.termux/files/home/ai-lab-internal/out/calypso_loop_raw.wav"
print(f"Writing {wav_path}...")
sys.stdout.flush()

with wave.open(wav_path, 'w') as wf:
    wf.setnchannels(1)
    wf.setsampwidth(2)
    wf.setframerate(SR)
    
    bar_int = np.clip(bar_audio * 32767, -32767, 32767).astype(np.int16)
    chunk_bars = 50
    for start_bar in range(0, total_bars, chunk_bars):
        end_bar = min(start_bar + chunk_bars, total_bars)
        chunk = np.tile(bar_int, end_bar - start_bar)
        wf.writeframes(chunk.tobytes())
        if start_bar % 500 == 0:
            print(f"  {start_bar}/{total_bars} bars...")
            sys.stdout.flush()

print("Done generating raw WAV.")
print(f"File: {wav_path}")
