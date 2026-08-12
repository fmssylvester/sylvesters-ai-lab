// S5 The Solution — 3D: gray coin stack sinks away; brass-rimmed glass
// automation panel rises in with a glowing zap ring.
import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate } from 'remotion';
import { Scene3D, GridFloor, GlassPanel, Ring, Orb, Headline, WordsRev, Chip } from './kit3d';
import { Caption } from '../kit';
import { GOLD, SOFT, CREAM, NEUTRAL, EASE } from '../theme';

const COINS = [0, 1, 2];

export const S5Solution3D: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const staffDim = interpolate(frame, [40, 90], [1, 0.25], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const staffDrop = interpolate(frame, [40, 110], [0, -1.4], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: EASE });
  const rise = interpolate(frame, [64, 108], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: EASE });
  const y = -1.35 + rise * 2.05;
  const ringPulse = 0.9 + 0.12 * Math.sin(frame * 0.08);

  return (
    <Scene3D
      poses={[
        { f: 0, pos: [0.6, 1.5, 7.3], look: [-0.3, 0.5, 0] },
        { f: 86, pos: [0, 1.6, 6.4], look: [0, 0.55, 0] },
        { f: 172, pos: [-0.5, 1.7, 5.2], look: [0.25, 0.6, 0] },
      ]}
      headline={
        <>
          <Headline frame={frame} fps={fps} style={{ left: 0, right: 0, textAlign: 'center', top: 84 }}>
            the solution is <WordsRev text="automation" frame={frame} start={16} fps={fps} color={GOLD} />
          </Headline>
          <div style={{ position: 'absolute', bottom: 86, left: 0, right: 0, textAlign: 'center' }}>
            <Chip frame={frame} start={110} fps={fps}>
              <span style={{ color: CREAM, fontSize: 22, fontWeight: 700 }}>one workflow, every reply</span>
            </Chip>
          </div>
        </>
      }
    >
      <GridFloor y={-1.35} />

      {/* coin stack (staff route) — sinks + fades */}
      <group position={[-2.4, staffDrop, 0]} scale={interpolate(frame, [40, 110], [1, 0.85], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })}>
        {COINS.map((i) => (
          <mesh key={i} position={[0, -1.3 + i * 0.17, 0]}>
            <cylinderGeometry args={[0.34, 0.34, 0.12, 40]} />
            <meshPhysicalMaterial color={NEUTRAL} transparent opacity={0.75 * staffDim} roughness={0.35} metalness={0.4} envMapIntensity={1.1} />
          </mesh>
        ))}
      </group>

      {/* automation panel with zap ring */}
      <group position={[1.5, y, 0]} scale={rise}>
        <GlassPanel width={2.35} height={1.32} depth={0.15} radius={0.11} color={CREAM} trim />
        <group scale={ringPulse}>
          <Ring position={[0, 0.05, 0.42]} radius={0.62} tube={0.045} color={GOLD} emissiveIntensity={0.5} rotation={[Math.PI / 2, 0, 0]} />
        </group>
        <Orb position={[0, 0.05, 0.92]} radius={0.13} color={GOLD} emissiveIntensity={0.7} />
      </group>
    </Scene3D>
  );
};

export default S5Solution3D;