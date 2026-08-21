import React from 'react';
import {
  AbsoluteFill,
  useCurrentFrame,
  interpolate,
  Audio,
  staticFile
} from 'remotion';

const FPS = 30;
const START_FRAME = 854;
const DURATION = 149;

export const Seg6Creative: React.FC = () => {
  const frame = useCurrentFrame();
  const localFrame = frame - START_FRAME;

  // Typing dots animation
  const dot1 = Math.sin(localFrame * 0.2) * 10;
  const dot2 = Math.sin(localFrame * 0.2 + 2) * 10;
  const dot3 = Math.sin(localFrame * 0.2 + 4) * 10;

  return (
    <AbsoluteFill style={{ backgroundColor: '#0D0D12', overflow: 'hidden' }}>
      <Audio src={staticFile('kiki.mp3')} />

      {/* The Void background */}
      <div style={{
        position: 'absolute',
        inset: 0,
        background: 'radial-gradient(circle, #1A1B2E 0%, #0D0D12 100%)',
        opacity: 0.5
      }} />

      <div style={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
      }}>
        <div style={{
          width: 600,
          height: 200,
          borderRadius: '100px',
          background: 'linear-gradient(180deg, #FCFCFF 0%, #EDECF3 100%)',
          boxShadow: '0 20px 40px rgba(0,0,0,0.4), inset 0 5px 10px rgba(255,255,255,0.8), inset 0 -5px 10px rgba(0,0,0,0.1)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '0 60px'
        }}>
          <div style={{
            display: 'flex',
            gap: 10,
            alignItems: 'center'
          }}>
            <div style={{ width: 15, height: 15, borderRadius: '50%', background: '#8E8A9E', transform: `translateY(${dot1}px)` }} />
            <div style={{ width: 15, height: 15, borderRadius: '50%', background: '#8E8A9E', transform: `translateY(${dot2}px)` }} />
            <div style={{ width: 15, height: 15, borderRadius: '50%', background: '#8E8A9E', transform: `translateY(${dot3}px)` }} />
          </div>
        </div>
      </div>

      <div style={{
        position: 'absolute',
        bottom: 100,
        width: '100%',
        textAlign: 'center',
        color: 'rgba(255,255,255,0.3)',
        fontSize: 32,
        fontFamily: 'sans-serif'
      }}>
        Waiting for response...
      </div>
    </AbsoluteFill>
  );
};
