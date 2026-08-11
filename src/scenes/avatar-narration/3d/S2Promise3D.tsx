// S2 The Promise — 3D: three glass modules rise in a row on a brass rail
// (the build: webhook → brain → gate). Camera tracks right-to-left.
import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate } from 'remotion';
import { Scene3D, GridFloor, GlassPanel, Orb, Headline, WordsRev, Chip } from './kit3d';
import { Caption, Prop } from '../kit';
import { GOLD, SOFT, CREAM, NEUTRAL, EASE } from '../theme';

const MODULES = [
  { x: -2.35, color: SOFT, trim: false },
  { x: 0, color: CREAM, trim: false },
  { x: 2.35, color: CREAM, trim: true },
];

export const S2Promise3D: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <Scene3D
      poses={[
        { f: 0, pos: [-2.1, 1.7, 7.4], look: [0, 0.6, 0] },
        { f: 317, pos: [2.1, 1.7, 7.4], look: [0, 0.6, 0] },
      ]}
      headline={
        <>
          <Headline frame={frame} fps={fps}>
            <WordsRev text="step by step," frame={frame} start={4} fps={fps} />
            {' '}
            <WordsRev text="from scratch" frame={frame} start={22} fps={fps} color={GOLD} />
          </Headline>
          <Caption style={{ position: 'absolute', top: 168, left: 152, fontSize: 20, display: 'block' }}>
            the build — 3 nodes, no code
          </Caption>
          <div style={{ position: 'absolute', bottom: 74, right: 160 }}>
            <Chip frame={frame} start={100} fps={fps}>
              <Prop file="02_ICONS/lucide/user.svg" size={24} color="white" />
              <span style={{ color: CREAM, fontSize: 23, fontWeight: 700 }}>My name is Sylvester</span>
            </Chip>
          </div>
        </>
      }
    >
      <GridFloor y={-1.35} />
      {/* brass rail */}
      <mesh position={[0, -0.94, 0]}>
        <boxGeometry args={[7.4, 0.07, 0.07]} />
        <meshPhysicalMaterial color={GOLD} metalness={1} roughness={0.25} envMapIntensity={1.4} />
      </mesh>

      {MODULES.map((m, i) => {
        const at = 34 + i * 22;
        const s = interpolate(frame, [at, at + 22], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: EASE });
        const y = -1.28 + s * 1.32;
        const o = Math.min(1, s * 1.4);
        return (
          <group key={i} position={[m.x, 0, 0]}>
            <group position={[0, y, 0]} scale={o}>
              <GlassPanel width={1.5} height={1.05} depth={0.13} radius={0.09} color={m.color} trim={m.trim} opacity={0.92} />
              <Orb position={[0, 0, 0.18]} radius={0.09} color={m.trim ? GOLD : SOFT} emissiveIntensity={0.5} />
            </group>
          </group>
        );
      })}
    </Scene3D>
  );
};

export default S2Promise3D;