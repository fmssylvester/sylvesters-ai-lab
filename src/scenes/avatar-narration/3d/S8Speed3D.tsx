// S8 Speed — 3D: brass chrono ring, sweeping dial compresses as the timer
// falls 5.0s → 2.8s; glowing radial lines; camera pushes in hard.
import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate } from 'remotion';
import { Scene3D, GridFloor, Ring, Orb, Chip, GroundShadow } from './kit3d';
import { Caption } from '../kit';
import { GOLD, SOFT, CREAM, NEUTRAL, EASE } from '../theme';

const LINES = [0, 45, 90, 135, 180, 225, 270, 315];

export const S8Speed3D: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const t = interpolate(frame, [14, 100], [5.0, 2.8], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: EASE });
  const sweep = interpolate(frame, [14, 130], [0, 360], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: EASE });
  const spin = frame * 0.02;
  const linePulse = 0.5 + 0.4 * Math.sin(frame * 0.06);

  return (
    <Scene3D
      poses={[
        { f: 0, pos: [0, 1.3, 9.2], look: [0, 0.45, 0] },
        { f: 88, pos: [0, 1.45, 7.2], look: [0, 0.45, 0] },
        { f: 176, pos: [0, 1.6, 5.0], look: [0, 0.5, 0] },
      ]}
      headline={
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
          <div style={{ fontSize: 184, fontWeight: 800, color: GOLD, lineHeight: 1, fontVariantNumeric: 'tabular-nums', textShadow: '0 0 60px rgba(201,162,75,0.45)' }}>
            {t.toFixed(1)}<span style={{ fontSize: 88 }}>s</span>
          </div>
          <Caption style={{ marginTop: 26, fontSize: 23, display: 'block' }}>webhook in → reply out</Caption>
          <div style={{ position: 'absolute', top: 112, right: 130 }}>
            <Chip frame={frame} start={95} fps={fps} border={`1px solid ${GOLD}44`} background="rgba(14,27,44,0.7)">
              <span style={{ color: GOLD, fontSize: 21, fontWeight: 700, fontFamily: "'JetBrains Mono', monospace" }}>{'{ success: true }'}</span>
            </Chip>
          </div>
        </div>
      }
    >
      <GridFloor y={-1.4} />
      <GroundShadow r={2.1} opacity={0.4} />

      {/* radial speed lines */}
      <group rotation={[0, spin, 0]}>
        {LINES.map((a, i) => (
          <mesh key={i} position={[Math.sin((a * Math.PI) / 180) * 1.6, 0.1, Math.cos((a * Math.PI) / 180) * 1.6]} rotation={[0, (-a * Math.PI) / 180, 0]}>
            <boxGeometry args={[0.05, 0.05, 2.1]} />
            <meshPhysicalMaterial color={SOFT} transparent opacity={0.5 * linePulse} emissive={SOFT} emissiveIntensity={0.5} metalness={0.6} roughness={0.3} />
          </mesh>
        ))}
      </group>

      {/* chrono ring + dial */}
      <group position={[0, 0.15, 0]}>
        <Ring radius={1.55} tube={0.05} color={GOLD} emissiveIntensity={0.3} />
        <Ring radius={1.32} tube={0.02} color={SOFT} emissiveIntensity={0.25} />
        <group rotation={[0, 0, (sweep * Math.PI) / 180]}>
          <mesh position={[0, 1.5, 0]}>
            <boxGeometry args={[0.05, 0.4, 0.05]} />
            <meshPhysicalMaterial color={GOLD} emissive={GOLD} emissiveIntensity={1.0} metalness={0.9} roughness={0.2} />
          </mesh>
        </group>
        <Orb radius={0.16} color={GOLD} emissiveIntensity={0.6} />
      </group>
    </Scene3D>
  );
};

export default S8Speed3D;