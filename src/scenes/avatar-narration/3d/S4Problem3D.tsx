// S4 The Problem — 3D: data pillars — 12 hrs (yours, steel, dims) vs
// 2 min (competitor, brass, brightens); the customer orb drifts away.
import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate } from 'remotion';
import { Scene3D, GridFloor, GlassPanel, Ring, Orb, Headline, WordsRev, Chip, GroundShadow } from './kit3d';
import { Caption } from '../kit';
import { GOLD, SOFT, CREAM, NEUTRAL, EASE } from '../theme';

export const S4Problem3D: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // counters
  const hrs = interpolate(frame, [30, 130], [0, 12], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: EASE });
  const dim = interpolate(frame, [120, 300], [1, 0.42], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const bright = interpolate(frame, [120, 300], [0.85, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const drift = interpolate(frame, [160, 330], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: EASE });

  // pillar heights: ours grows to 12 units, theirs to 2 (0.14/unit)
  const hOurs = (0.16 + (hrs / 12) * 1.28) * dim;
  const hTheirs = (0.16 + 0.21) * bright;

  return (
    <Scene3D
      poses={[
        { f: 0, pos: [0, 1.7, 7.6], look: [0, 0.3, 0] },
        { f: 200, pos: [0.2, 2.0, 6.4], look: [0.2, 0.3, 0] },
        { f: 383, pos: [1.1, 2.3, 5.6], look: [0.6, 0.25, 0] },
      ]}
      headline={
        <>
          <Headline frame={frame} fps={fps}>
            slow reply = <WordsRev text="lost customer" frame={frame} start={10} fps={fps} color={GOLD} />
          </Headline>
          <div style={{ position: 'absolute', top: 214, left: 0, right: 0, display: 'flex', justifyContent: 'center', gap: 340 }}>
            <div style={{ textAlign: 'center', opacity: 0.35 + 0.65 * dim }}>
              <div style={{ fontSize: 84, fontWeight: 800, color: NEUTRAL, fontVariantNumeric: 'tabular-nums', lineHeight: 1 }}>
                {Math.round(hrs)}
                <span style={{ fontSize: 40, fontWeight: 700 }}> hrs</span>
              </div>
            </div>
            <div style={{ textAlign: 'center', opacity: bright }}>
              <div style={{ fontSize: 84, fontWeight: 800, color: GOLD, fontVariantNumeric: 'tabular-nums', lineHeight: 1 }}>
                2<span style={{ fontSize: 40, fontWeight: 700 }}> min</span>
              </div>
            </div>
          </div>
          <div style={{ position: 'absolute', top: 352, left: 0, right: 0, display: 'flex', justifyContent: 'center', gap: 340 }}>
            <div style={{ textAlign: 'center', opacity: 0.35 + 0.65 * dim }}>
              <div style={{ color: CREAM, fontSize: 24, fontWeight: 700 }}>Your business</div>
              <Caption style={{ fontSize: 17, display: 'block' }}>to reply</Caption>
            </div>
            <div style={{ textAlign: 'center', opacity: bright }}>
              <div style={{ color: CREAM, fontSize: 24, fontWeight: 700 }}>Competitor</div>
              <Caption style={{ fontSize: 17, display: 'block' }}>responded faster</Caption>
            </div>
          </div>
        </>
      }
    >
      <GridFloor y={-1.35} />
      <GroundShadow x={-2.4} r={1.0} opacity={0.5} />
      <GroundShadow x={2.4} r={1.15} opacity={0.55} />

      {/* our pillar (12h) */}
      <group position={[-2.4, 0, 0]}>
        <mesh position={[0, -1.35 + hOurs, 0]}>
          <boxGeometry args={[0.75, hOurs * 2, 0.75]} />
          <meshPhysicalMaterial color={NEUTRAL} transparent opacity={0.78 * dim} roughness={0.3} metalness={0.1} clearcoat={0.8} clearcoatRoughness={0.2} envMapIntensity={1.1} />
        </mesh>
        <Orb position={[0, -1.35 + hOurs * 2 + 0.07, 0]} radius={0.12} color={NEUTRAL} emissiveIntensity={0.28} />
      </group>

      {/* competitor pillar (2 min) */}
      <group position={[2.4, 0, 0]}>
        <mesh position={[0, -1.35 + hTheirs, 0]}>
          <boxGeometry args={[0.9, hTheirs * 2, 0.9]} />
          <meshPhysicalMaterial color={SOFT} transparent opacity={0.85 * bright} roughness={0.22} metalness={0.15} clearcoat={1} clearcoatRoughness={0.15} envMapIntensity={1.25} />
        </mesh>
        <Orb position={[0, -1.35 + hTheirs * 2 + 0.08, 0]} radius={0.14} color={GOLD} emissiveIntensity={0.5} />
      </group>

      {/* drifting customer orb */}
      <group position={[drift * 4.8, 1.75 + Math.sin(frame * 0.03) * 0.06, 0.4]}>
        <Orb radius={0.33} color={CREAM} emissiveIntensity={0.35} />
        <Ring radius={0.47} tube={0.02} color={SOFT} emissiveIntensity={0.2} />
      </group>
    </Scene3D>
  );
};

export default S4Problem3D;