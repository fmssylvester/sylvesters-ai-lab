import React from 'react';
import {
  AbsoluteFill,
  useCurrentFrame,
  interpolate,
  spring,
  Audio,
  staticFile
} from 'remotion';
import { GlowText } from '../../components/motion/GlowText';

const FPS = 30;
const START_FRAME = 662;
const DURATION = 192;

const Sfx: React.FC<{from: number; file: string; volume: number}> = ({from, file, volume}) => (
  <Sequence from={from} durationInFrames={40} layout="none">
    <Audio src={staticFile(`sfx/${file}`)} volume={volume} />
  </Sequence>
);

export const Seg5Creative: React.FC = () => {
  const frame = useCurrentFrame();
  const localFrame = frame - START_FRAME;

  const entrance = spring({
    frame: localFrame,
    fps: FPS,
    config: { stiffness: 100, damping: 12 },
  });

  // Zoom out from a tiny point to full size
  const scale = interpolate(localFrame, [0, 30], [0.001, 1], { extrapolateRight: 'clamp' });
  const opacity = interpolate(localFrame, [0, 20], [0, 1], { extrapolateRight: 'clamp' });

  return (
    <AbsoluteFill style={{ backgroundColor: '#0D0D12', overflow: 'hidden' }}>
      <Audio src={staticFile('kiki.mp3')} />

      <Sfx from={680} file="riser.wav" volume={0.2} />
      <Sfx from={720} file="ding.wav" volume={0.3} />

      <div style={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        transform: `scale(${scale})`,
        opacity: opacity
      }}>
        <div style={{
          position: 'relative',
          width: 1200,
          height: 600,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          gap: 40,
          textAlign: 'center'
        }}>
          {/* The Central Core */}
          <div style={{
            width: 100,
            height: 100,
            borderRadius: '50%',
            background: '#8B5CF6',
            boxShadow: '0 0 100px #8B5CF6',
            marginBottom: 40
          }} />

          <GlowText
            text="Sylvester's AI Lab"
            fontSize={120}
            keywordColor="#8B5CF6"
          />

          <div style={{
            color: 'rgba(255,255,255,0.6)',
            fontSize: 42,
            fontFamily: 'sans-serif',
            letterSpacing: 4,
            textTransform: 'uppercase'
          }}>
            Real AI Automations, Not Theory
          </div>
        </div>
      </div>

      {/* Vignette */}
      <div style={{
        position: 'absolute',
        inset: 0,
        boxShadow: 'inset 0 0 300px rgba(0,0,0,0.9)',
        pointerEvents: 'none'
      }} />
    </AbsoluteFill>
  );
};
