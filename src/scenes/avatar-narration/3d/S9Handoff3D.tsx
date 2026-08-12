// S9 Handoff — 3D: glass browser panel tilted in the void grows toward
// camera; LIVE DEMO badge, chat bubble, cursor click; camera dives in.
import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate } from 'remotion';
import { Scene3D, GlassPanel, Orb, Chip, Caption } from './kit3d';
import { Prop } from '../kit';
import { GOLD, SOFT, CREAM, NEUTRAL, EASE } from '../theme';

export const S9Handoff3D: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // browser grows from far to full (camera dive, matching the 2D grow feel)
  const camZ = interpolate(frame, [10, 380], [8.6, 3.3], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: EASE });
  const cursorX = interpolate(frame, [90, 200], [560, 700], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: EASE });
  const cursorY = interpolate(frame, [90, 200], [330, 400], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: EASE });
  const cursorClick = frame > 200 && frame < 206 ? 0.85 : 1;
  const badgePulse = 1 + 0.08 * (0.5 + 0.5 * Math.sin(frame * 0.1));
  const bob = Math.sin(frame * 0.02) * 0.04;

  return (
    <Scene3D
      poses={[
        { f: 0, pos: [0, 1.1, 9.4], look: [0, 0, 0] },
        { f: 200, pos: [0, 0.55, 5.6], look: [0, -0.05, 0] },
        { f: 459, pos: [-0.2, 0.35, 3.0], look: [0.05, -0.1, 0] },
      ]}
      headline={
        <div style={{ position: 'absolute', top: 60, left: 0, right: 0, textAlign: 'center' }}>
          <div style={{ color: CREAM, fontSize: 62, fontWeight: 800, letterSpacing: '-0.02em' }}>
            {(() => {
              const words = 'watch this'.split(' ');
              return words.map((w, i) => {
                const at = 4 + i * 4;
                const o = interpolate(frame, [at, at + 8], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
                return (
                  <span key={i} style={{ opacity: o, display: 'inline-block', transform: `translateY(${(1 - o) * 10}px)` }}>
                    {w}&nbsp;
                  </span>
                );
              });
            })()}
          </div>
        </div>
      }
      overlay={
        <>
          {/* LIVE DEMO badge */}
          <div style={{ position: 'absolute', top: 132, right: 170, transform: `scale(${badgePulse})` }}>
            <Chip frame={frame} start={14} fps={fps} border={`1px solid ${GOLD}44`} background="rgba(201,162,75,0.10)">
              <div style={{ width: 11, height: 11, borderRadius: '50%', background: GOLD, boxShadow: `0 0 14px ${GOLD}` }} />
              <span style={{ color: GOLD, fontSize: 22, fontWeight: 800, letterSpacing: '0.06em' }}>LIVE DEMO</span>
            </Chip>
          </div>
          {/* chat bubble */}
          <div style={{ position: 'absolute', bottom: 150, right: 300 }}>
            <Chip frame={frame} start={120} fps={fps}>
              <Prop file="02_ICONS/lucide/message-circle.svg" size={24} color="soft" />
              <span style={{ color: CREAM, fontSize: 19 }}>Hi! How can we help? 😊</span>
            </Chip>
          </div>
          {/* cursor */}
          <div style={{ position: 'absolute', left: cursorX, top: cursorY, transform: `scale(${cursorClick})`, filter: 'drop-shadow(0 0 10px rgba(201,162,75,0.8))' }}>
            <Prop file="02_ICONS/lucide/mouse-pointer.svg" size={46} color="white" />
          </div>
        </>
      }
    >
      {/* browser glass panel */}
      <group position={[0, bob, 0]}>
        <GlassPanel width={3.3} height={2.0} depth={0.14} radius={0.09} color={CREAM} opacity={0.9} />
        {/* chrome dots */}
        <Orb position={[-1.42, 0.78, 0.12]} radius={0.055} color="#FF5F57" emissiveIntensity={0.35} />
        <Orb position={[-1.28, 0.78, 0.12]} radius={0.055} color="#FEBC2E" emissiveIntensity={0.35} />
        <Orb position={[-1.14, 0.78, 0.12]} radius={0.055} color="#28C840" emissiveIntensity={0.35} />
        {/* url bar */}
        <mesh position={[0, 0.62, 0.14]}>
          <boxGeometry args={[2.7, 0.22, 0.03]} />
          <meshPhysicalMaterial color="#0A1626" metalness={0.3} roughness={0.45} envMapIntensity={0.6} />
        </mesh>
        {/* fake content blocks */}
        <mesh position={[-0.8, 0.1, 0.14]}>
          <boxGeometry args={[1.6, 0.12, 0.02]} />
          <meshPhysicalMaterial color={SOFT} transparent opacity={0.5} roughness={0.5} metalness={0.1} />
        </mesh>
        <mesh position={[-0.8, -0.14, 0.14]}>
          <boxGeometry args={[1.0, 0.07, 0.02]} />
          <meshPhysicalMaterial color={NEUTRAL} transparent opacity={0.4} roughness={0.5} metalness={0.1} />
        </mesh>
        <mesh position={[0.85, -0.45, 0.14]}>
          <boxGeometry args={[0.85, 0.26, 0.03]} />
          <meshPhysicalMaterial color={GOLD} transparent opacity={0.55} roughness={0.35} metalness={0.25} envMapIntensity={1.1} />
        </mesh>
      </group>
    </Scene3D>
  );
};

export default S9Handoff3D;