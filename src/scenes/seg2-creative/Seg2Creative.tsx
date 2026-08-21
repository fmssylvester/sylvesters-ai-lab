import React from 'react';
import {
  AbsoluteFill,
  useCurrentFrame,
  interpolate,
  spring,
  Audio,
  staticFile
} from 'remotion';
import { GlassCard } from '../../components/motion/GlassCard';
import { GlowText } from '../../components/motion/GlowText';

const FPS = 30;
const START_FRAME = 137;
const DURATION = 180;

const Sfx: React.FC<{from: number; file: string; volume: number}> = ({from, file, volume}) => (
  <Sequence from={from} durationInFrames={40} layout="none">
    <Audio src={staticFile(`sfx/${file}`)} volume={volume} />
  </Sequence>
);

export const Seg2Creative: React.FC = () => {
  const frame = useCurrentFrame();
  const localFrame = frame - START_FRAME;

  // Clock animation: hands spinning
  const hourHandRot = interpolate(localFrame, [0, DURATION], [90, 90 + 360 * 2]);
  const minHandRot = interpolate(localFrame, [0, DURATION], [0, 360 * 5]);

  // Pulse animations: messages flowing through n8n
  const pulses = [0, 40, 80, 120];

  return (
    <AbsoluteFill style={{ backgroundColor: '#05050A', overflow: 'hidden' }}>
      <Audio src={staticFile('kiki.mp3')} />

      {/* SFX for the "hits" */}
      <Sfx from={150} file="click.wav" volume={0.2} />
      <Sfx from={200} file="ding.wav" volume={0.2} />
      <Sfx from={250} file="ding.wav" volume={0.2} />

      {/* The Clock - "3 AM" */}
      <div style={{
        position: 'absolute',
        top: '10%',
        left: '10%',
        width: 300,
        height: 300,
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)',
        border: '2px solid rgba(255,255,255,0.2)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        boxShadow: '0 0 50px rgba(0,0,0,0.5)',
      }}>
        <div style={{
          position: 'absolute',
          width: 4,
          height: 80,
          background: 'white',
          transformOrigin: 'bottom center',
          transform: `translateY(-40px) rotate(${hourHandRot}deg)`,
          borderRadius: 2
        }} />
        <div style={{
          position: 'absolute',
          width: 2,
          height: 120,
          background: 'rgba(255,255,255,0.5)',
          transformOrigin: 'bottom center',
          transform: `translateY(-60px) rotate(${minHandRot}deg)`,
          borderRadius: 1
        }} />
        <div style={{ color: 'white', fontSize: 40, fontWeight: 'bold', opacity: 0.5 }}>3:00</div>
      </div>

      {/* The n8n Core - The Attractor */}
      <div style={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
      }}>
        <div style={{
          width: 200,
          height: 200,
          borderRadius: '50%',
          background: 'radial-gradient(circle, #8B5CF6 0%, transparent 70%)',
          filter: 'blur(20px)',
          opacity: 0.6,
          animation: 'pulse 2s infinite ease-in-out'
        }} />
        <div style={{
          position: 'absolute',
          width: 120,
          height: 120,
          borderRadius: '24px',
          background: 'rgba(255,255,255,0.1)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255,255,255,0.3)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          boxShadow: '0 0 30px rgba(139,92,246,0.5)'
        }}>
          <span style={{ color: 'white', fontWeight: 'bold', fontSize: 32 }}>n8n</span>
        </div>
      </div>

      {/* Flowing Pulses */}
      {pulses.map((start, i) => {
        const pFrame = (localFrame - start + DURATION) % DURATION;
        const progress = pFrame / DURATION;
        return (
          <div key={i} style={{
            position: 'absolute',
            width: 20,
            height: 20,
            borderRadius: '50%',
            background: '#B7B4C2',
            boxShadow: '0 0 15px #fff',
            left: `${interpolate(progress, [0, 1], [0, 1920])}px`,
            top: '50%',
            transform: 'translateY(-50%)',
            opacity: interpolate(progress, [0, 0.1, 0.9, 1], [0, 1, 1, 0]),
            transition: 'all 0.1s linear'
          }} />
        );
      })}

      <div style={{
        position: 'absolute',
        bottom: 100,
        width: '100%',
        textAlign: 'center'
      }}>
        <GlowText
          text="Built with n8n"
          fontSize={48}
          keywordColor="#8B5CF6"
        />
      </div>
    </AbsoluteFill>
  );
};
