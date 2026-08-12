// S6 The Agent's Promise — 3D: glass bot head floats with a pulsing brass
// halo; trait chips + live counter as DOM.
import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate } from 'remotion';
import { RoundedBox } from '@react-three/drei';
import { Scene3D, GridFloor, GlassPanel, Ring, Orb, Chip } from './kit3d';
import { Caption, Prop } from '../kit';
import { GOLD, SOFT, CREAM, NEUTRAL, EASE } from '../theme';

const TRAITS = [
  { file: '02_ICONS/lucide/moon.svg', label: 'never sleeps', color: 'soft' as const, text: SOFT },
  { file: '02_ICONS/lucide/circle-check-big.svg', label: 'never misses', color: 'soft' as const, text: SOFT },
  { file: '02_ICONS/lucide/user.svg', label: 'escalates to human', color: 'brass' as const, text: GOLD },
];

export const S6Agent3D: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const bob = Math.sin(frame * 0.03) * 0.07;
  const haloPulse = 0.92 + 0.1 * Math.sin(frame * 0.07);
  const received = Math.round(interpolate(frame, [70, 150], [0, 999], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: EASE }));
  const tilt = Math.sin(frame * 0.02) * 0.08;

  return (
    <Scene3D
      poses={[
        { f: 0, pos: [0.7, 1.45, 7.0], look: [-0.25, 0.4, 0] },
        { f: 86, pos: [0, 1.5, 6.1], look: [0, 0.4, 0] },
        { f: 173, pos: [-0.6, 1.55, 5.1], look: [0.22, 0.4, 0] },
      ]}
      headline={
        <div style={{ position: 'absolute', inset: 0 }}>
          {/* trait chips arc */}
          <div style={{ position: 'absolute', bottom: 108, left: 0, right: 0, display: 'flex', justifyContent: 'center', gap: 34 }}>
            {TRAITS.map((t, i) => (
              <Chip key={i} frame={frame} start={32 + i * 16} fps={fps} border={`1px solid ${t.text}40`} background={`rgba(14,27,44,0.55)`} style={{ flexDirection: 'column', gap: 10, padding: '18px 28px' }}>
                <Prop file={t.file} size={30} color={t.color} />
                <span style={{ color: t.text, fontSize: 20, fontWeight: 700 }}>{t.label}</span>
              </Chip>
            ))}
          </div>
          {/* 24/7 + counter */}
          <div style={{ position: 'absolute', top: 92, left: 0, right: 0, display: 'flex', justifyContent: 'center', gap: 26 }}>
            <Chip frame={frame} start={80} fps={fps} border={`1px solid ${SOFT}44`} background="rgba(14,27,44,0.55)">
              <Prop file="02_ICONS/lucide/clock-3.svg" size={24} color="soft" />
              <span style={{ color: SOFT, fontSize: 26, fontWeight: 800 }}>24/7</span>
            </Chip>
            <Chip frame={frame} start={92} fps={fps} background="rgba(14,27,44,0.55)">
              <span style={{ color: NEUTRAL, fontSize: 19 }}>received</span>
              <span style={{ color: CREAM, fontSize: 26, fontWeight: 800, fontVariantNumeric: 'tabular-nums', minWidth: 72, textAlign: 'right' }}>{received}</span>
              <span style={{ color: NEUTRAL, fontSize: 19 }}>· missed</span>
              <span style={{ color: GOLD, fontSize: 26, fontWeight: 800 }}>0</span>
            </Chip>
          </div>
        </div>
      }
    >
      <GridFloor y={-1.3} />
      {/* bot: glass head + brass halo + antenna */}
      <group position={[0, bob + 0.3, 0]} rotation={[tilt, 0, 0]}>
        <group scale={haloPulse}>
          <Ring position={[0, 0.05, 0]} radius={0.85} tube={0.035} color={GOLD} emissiveIntensity={0.35} rotation={[Math.PI / 2.02, 0, 0]} />
        </group>
        <RoundedBox args={[1.1, 1.0, 0.95]} radius={0.18} smoothness={6}>
          <meshPhysicalMaterial color={CREAM} transparent opacity={0.88} roughness={0.2} metalness={0.1} clearcoat={1} clearcoatRoughness={0.12} envMapIntensity={1.3} />
        </RoundedBox>
        <mesh position={[0, 0.78, 0]}>
          <cylinderGeometry args={[0.02, 0.02, 0.42, 12]} />
          <meshPhysicalMaterial color={SOFT} metalness={0.85} roughness={0.25} envMapIntensity={1.3} />
        </mesh>
        <Orb position={[0, 1.02, 0]} radius={0.06} color={GOLD} emissiveIntensity={0.8} />
      </group>
    </Scene3D>
  );
};

export default S6Agent3D;