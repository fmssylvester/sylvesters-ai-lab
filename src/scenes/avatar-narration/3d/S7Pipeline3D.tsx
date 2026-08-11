// S7 Pipeline — 3D: five glass stage panels along a brass rail; a glowing
// packet travels the line; camera follows.
import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate } from 'remotion';
import { Scene3D, GridFloor, GlassPanel, Orb, Headline, WordsRev, Caption, Chip } from './kit3d';
import { GOLD, SOFT, CREAM, NEUTRAL, EASE } from '../theme';

const STAGES = [
  { x: -4.55, color: SOFT, trim: false },
  { x: -2.28, color: SOFT, trim: false },
  { x: 0, color: CREAM, trim: true },
  { x: 2.28, color: NEUTRAL, trim: false },
  { x: 4.55, color: CREAM, trim: true },
];

export const S7Pipeline3D: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const packet = interpolate(frame, [60, 280], [-4.55, 4.55], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: EASE });
  const rise = interpolate(frame, [28, 62], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: EASE });
  void rise;

  return (
    <Scene3D
      poses={[
        { f: 0, pos: [-1.4, 1.85, 8.6], look: [0, 0.4, 0] },
        { f: 216, pos: [0, 1.9, 8.0], look: [0, 0.4, 0] },
        { f: 433, pos: [1.8, 1.95, 7.4], look: [0, 0.4, 0] },
      ]}
      headline={
        <>
          <Headline frame={frame} fps={fps}>
            the build: <WordsRev text="4 stages" frame={frame} start={8} fps={fps} color={GOLD} />
          </Headline>
          <Caption style={{ position: 'absolute', top: 166, left: 152, fontSize: 20, display: 'block' }}>
            one connection walks the whole line
          </Caption>
          {/* stage labels */}
          <div style={{ position: 'absolute', bottom: 96, left: 0, right: 0, display: 'flex', justifyContent: 'center', gap: 0 }}>
            {['Webhook', 'AI Agent', 'Escalate?', 'Email', 'Reply'].map((label, i) => (
              <Chip key={i} frame={frame} start={32 + i * 20} fps={fps} background="transparent" border="none" style={{ width: 190, justifyContent: 'center', padding: '4px 0', flexDirection: 'column', gap: 4 }}>
                <span style={{ color: i === 2 || i === 4 ? GOLD : CREAM, fontSize: 20, fontWeight: 700 }}>{label}</span>
                <span style={{ color: NEUTRAL, fontSize: 16 }}>{['receives', 'processes', 'detects', 'alerts', 'clean JSON'][i]}</span>
              </Chip>
            ))}
          </div>
        </>
      }
    >
      <GridFloor y={-1.4} />

      {/* brass rail */}
      <mesh position={[0, -0.9, 0]}>
        <boxGeometry args={[11.3, 0.06, 0.06]} />
        <meshPhysicalMaterial color={GOLD} metalness={1} roughness={0.25} envMapIntensity={1.4} />
      </mesh>

      {/* stage panels */}
      {STAGES.map((st, i) => {
        const at = 30 + i * 20;
        const s = interpolate(frame, [at, at + 20], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: EASE });
        return (
          <group key={i} position={[st.x, -1.42 + s * 1.4, 0]} scale={Math.min(1, s * 1.3)}>
            <GlassPanel width={1.85} height={1.08} depth={0.12} radius={0.08} color={st.color} trim={st.trim} opacity={0.9} />
          </group>
        );
      })}

      {/* traveling packet */}
      <group position={[packet, 0.15, 0]}>
        <Orb radius={0.17} color={GOLD} emissiveIntensity={1.1} />
        <Orb radius={0.09} color={CREAM} emissiveIntensity={0.6} />
      </group>
    </Scene3D>
  );
};

export default S7Pipeline3D;