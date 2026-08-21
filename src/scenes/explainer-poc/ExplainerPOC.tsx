import React from 'react';
import {
  AbsoluteFill,
  Audio,
  staticFile,
  useCurrentFrame,
  interpolate,
  Easing,
} from 'remotion';
import { CAPTIONS, CapSeg, CapWord } from './captions';

// ── Proof-of-concept transcript → motion-graphics scene ──
// Clean, minimalist, high-contrast: pure black bg, white type.
// Filler words are dimmed; keywords resolve to full bright white with a
// subtle scale pop. Each word reveals on the exact frame it is spoken
// (from whisper.cpp token timestamps). Audio drives the truth.

const EASE = Easing.bezier(0.16, 1, 0.3, 1);

const Word: React.FC<{ word: CapWord; local: number }> = ({ word, local }) => {
  const start = word.sf;
  const opacity = interpolate(local, [start, start + 7], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: EASE,
  });
  const y = interpolate(local, [start, start + 7], [18, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: EASE,
  });
  const pop = interpolate(local, [start, start + 10], [0.86, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: EASE,
  });

  return (
    <span
      style={{
        display: 'inline-block',
        opacity,
        transform: `translateY(${y}px) scale(${word.key ? pop : 1})`,
        transformOrigin: 'center bottom',
        color: word.key ? '#FFFFFF' : 'rgba(255,255,255,0.34)',
        fontWeight: word.key ? 800 : 600,
        letterSpacing: '-0.01em',
      }}
    >
      {word.t}
    </span>
  );
};

const Segment: React.FC<{ seg: CapSeg; frame: number }> = ({ seg, frame }) => {
  const local = frame - seg.fromFrame;
  const dur = seg.toFrame - seg.fromFrame;

  // Segment-level envelope: quick fade-in, hold, quick fade-out so the
  // hard cut between segments reads as a clean beat rather than a jump.
  const envelope = interpolate(
    local,
    [0, 6, dur - 8, dur],
    [0, 1, 1, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: EASE },
  );

  return (
    <AbsoluteFill
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        opacity: envelope,
      }}
    >
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'center',
          alignItems: 'baseline',
          gap: '18px 22px',
          maxWidth: 1440,
          padding: '0 120px',
          textAlign: 'center',
          fontFamily: "'Switzer', system-ui, -apple-system, 'Segoe UI', sans-serif",
          fontSize: 84,
          lineHeight: 1.12,
        }}
      >
        {seg.words.map((word, i) => (
          <Word key={i} word={word} local={local} />
        ))}
      </div>
    </AbsoluteFill>
  );
};

export const ExplainerPOC: React.FC = () => {
  const frame = useCurrentFrame();

  const active = CAPTIONS.find(
    (s) => frame >= s.fromFrame && frame < s.toFrame,
  );

  return (
    <AbsoluteFill style={{ backgroundColor: '#000000' }}>
      <Audio src={staticFile('kiki.mp3')} />
      {active ? <Segment seg={active} frame={frame} /> : null}
    </AbsoluteFill>
  );
};

export default ExplainerPOC;
