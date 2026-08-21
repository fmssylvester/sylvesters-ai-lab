import React from 'react';
import {
  AbsoluteFill,
  Sequence,
  Audio,
  staticFile,
  useCurrentFrame,
  interpolate,
  spring
} from 'remotion';
import { ParticleField } from '../../components/motion/ParticleField';
import { GlassCard } from '../../components/motion/GlassCard';
import { GlowText } from '../../components/motion/GlowText';

const FPS = 30;
const TRANSITION_FRAME = 83; // "instant"
const TOTAL_FRAMES = 137;

const Sfx: React.FC<{from: number; file: string; volume: number}> = ({from, file, volume}) => (
  <Sequence from={from} durationInFrames={40} layout="none">
    <Audio src={staticFile(`sfx/${file}`)} volume={volume} />
  </Sequence>
);

export const Seg1Creative: React.FC = () => {
  const frame = useCurrentFrame();

  // Transition progress (0 to 1)
  const transition = spring({
    frame: frame - TRANSITION_FRAME,
    fps: FPS,
    config: { stiffness: 100, damping: 10 },
  });

  // Background color shift: Noise (Dark) -> Resolution (Deep Purple/Ash)
  const bgColor = interpolate(transition, [0, 1], ['#0A0A0F', '#1A1B2E']);

  return (
    <AbsoluteFill style={{ backgroundColor: bgColor, overflow: 'hidden' }}>
      {/* The VO Spine */}
      <Audio src={staticFile('kiki.mp3')} />

      {/* SFX Cues */}
      <Sfx from={6} file="pop.wav" volume={0.1} />
      <Sfx from={18} file="pop.wav" volume={0.1} />
      <Sfx from={30} file="pop.wav" volume={0.1} />
      <Sfx from={42} file="pop.wav" volume={0.1} />
      <Sfx from={89} file="whoosh.wav" volume={0.3} />

      {/* THE NOISE: Data shards floating chaotically */}
      <div style={{
        position: 'absolute',
        inset: 0,
        opacity: 1 - transition,
        filter: `blur(${interpolate(transition, [0, 1], [0, 20])}px)`,
        transform: `scale(${interpolate(transition, [0, 1], [1, 1.2])})`
      }}>
        <ParticleField
          count={100}
          color="#4A4A6A"
          speed={0.5}
          size={2}
          shape="rectangle"
        />
      </div>

      {/* THE SIGNAL: The resolution emerging from the center */}
      <div style={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        opacity: transition,
        transform: `scale(${interpolate(transition, [0, 1], [0.8, 1])})`,
      }}>
        <div style={{ position: 'relative', width: 800, height: 400 }}>
          {/* Central Glow Pulse */}
          <div style={{
            position: 'absolute',
            inset: -100,
            background: 'radial-gradient(circle, rgba(139,92,246,0.3) 0%, transparent 70%)',
            filter: 'blur(40px)',
            opacity: transition,
          }} />

          <GlassCard
            title="Intelligent Reply"
            content="Your customer message has been processed and answered instantly."
            accent="#8B5CF6"
          />

          <div style={{
            position: 'absolute',
            bottom: -60,
            left: '50%',
            transform: 'translateX(-50%)',
            width: '100%',
            textAlign: 'center'
          }}>
            <GlowText
              text="Processed in 0.4s"
              fontSize={32}
              keywordColor="#8B5CF6"
            />
          </div>
        </div>
      </div>

      {/* Global Cinematic Vignette */}
      <div style={{
        position: 'absolute',
        inset: 0,
        boxShadow: 'inset 0 0 200px rgba(0,0,0,0.8)',
        pointerEvents: 'none'
      }} />
    </AbsoluteFill>
  );
};
