import React from 'react';
import { AbsoluteFill, useCurrentFrame, interpolate, spring } from 'remotion';
import { GlowText } from '../../components/motion/GlowText';

export const AvatarPlaceholder: React.FC<{ label: string }> = ({ label }) => {
  const frame = useCurrentFrame();
  const entrance = spring({ frame, fps: 30, config: { stiffness: 100 } });

  return (
    <AbsoluteFill style={{ backgroundColor: '#0D0D12', overflow: 'hidden' }}>
      {/* Cinematic Background Gradient */}
      <div style={{
        position: 'absolute',
        inset: 0,
        background: 'radial-gradient(circle at 50% 50%, #1A1B2E 0%, #0D0D12 100%)',
      }} />

      {/* The Avatar Placeholder */}
      <div style={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        opacity: entrance,
        transform: `scale(${interpolate(entrance, [0, 1], [1.1, 1])})`
      }}>
        <div style={{
          width: 800,
          height: 1000,
          borderRadius: '40px',
          background: 'rgba(255,255,255,0.05)',
          border: '1px solid rgba(255,255,255,0.1)',
          backdropFilter: 'blur(20px)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          color: 'rgba(255,255,255,0.3)',
          fontSize: '40px',
          fontWeight: 'bold',
          textAlign: 'center',
          padding: '40px'
        }}>
          [ AVATAR FOOTAGE: {label} ]
        </div>
      </div>

      {/* Lower Third Name Card */}
      <div style={{
        position: 'absolute',
        bottom: 150,
        left: 150,
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
        opacity: interpolate(frame, [30, 60], [0, 1]),
        transform: `translateX(${interpolate(frame, [30, 60], [-50, 0])}px)`
      }}>
        <div style={{
          padding: '10px 30px',
          background: 'linear-gradient(90deg, #8B5CF6, transparent)',
          borderLeft: '5px solid white',
          color: 'white',
          fontSize: '48px',
          fontWeight: 'bold',
          fontFamily: 'sans-serif'
        }}>
          Sylvester
        </div>
        <div style={{
          color: 'rgba(255,255,255,0.6)',
          fontSize: '24px',
          paddingLeft: '10px',
          fontFamily: 'sans-serif'
        }}>
          AI Automation Architect
        </div>
      </div>
    </AbsoluteFill>
  );
};
