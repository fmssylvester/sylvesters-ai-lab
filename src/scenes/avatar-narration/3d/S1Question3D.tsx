// S1 The Question — 3D: message glass panel + brass clock ring sweeping
// 11PM → 3AM, "instant reply, even at 3 AM" (Playfair overlay).
import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate } from 'remotion';
import { Scene3D, StudioLights, GridFloor, GlassPanel, Ring, Orb, Headline, WordsRev, Chip } from './kit3d';
import { Prop } from '../kit';
import { GOLD, SOFT, CREAM, NEUTRAL, EASE } from '../theme';

const TICKS = Array.from({ length: 12 }, (_, i) => i);

export const S1Question3D: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const flip = interpolate(frame, [150, 175], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: EASE });
  const sweep = interpolate(frame, [150, 175], [-30, 90], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: EASE });
  const ringSpin = frame * 0.012;
  const floatY = 0.9 + Math.sin(frame * 0.02) * 0.06;

  return (
    <Scene3D
      poses={[
        { f: 0, pos: [1.2, 1.15, 7.6] },
        { f: 317, pos: [0.6, 1.25, 5.9] },
      ]}
      headline={
        <>
          <Headline frame={frame} fps={fps}>
            <WordsRev text="instant reply," frame={frame} start={6} fps={fps} />
            <br />
            <WordsRev text="even at 3 AM" frame={frame} start={24} fps={fps} color={GOLD} />
          </Headline>
          {/* message chip + flipping clock chip */}
          <div style={{ position: 'absolute', top: 190, right: 150, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '13px 24px', borderRadius: 22, background: 'rgba(14,27,44,0.7)', border: '1px solid rgba(244,237,224,0.14)' }}>
              <Prop file="02_ICONS/lucide/message-circle.svg" size={22} color="soft" />
              <span style={{ color: CREAM, fontSize: 20, fontWeight: 700 }}>New message</span>
              <span style={{ color: NEUTRAL, fontSize: 17 }}>· landing page · contact form</span>
            </div>
            <Chip frame={frame} start={30} fps={fps} border={`1px solid ${flip > 0.5 ? GOLD : SOFT}55`} background={flip > 0.5 ? 'rgba(201,162,75,0.12)' : 'rgba(14,27,44,0.7)'} style={{ padding: '13px 24px' }}>
              <Prop file="02_ICONS/lucide/clock-3.svg" size={22} color={flip > 0.5 ? 'brass' : 'soft'} />
              <span style={{ color: flip > 0.5 ? GOLD : SOFT, fontSize: 22, fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>
                {flip > 0.5 ? '3:00 AM' : '11:00 PM'}
              </span>
            </Chip>
          </div>
          {/* punchline chip */}
          <div style={{ position: 'absolute', bottom: 70, left: 150 }}>
            <Chip frame={frame} start={185} fps={fps} border={`1px solid ${GOLD}44`} background="rgba(201,162,75,0.10)">
              <Prop file="02_ICONS/lucide/circle-check-big.svg" size={24} color="brass" />
              <span style={{ color: GOLD, fontSize: 23, fontWeight: 700 }}>Replied instantly — built with n8n</span>
            </Chip>
          </div>
        </>
      }
    >
      <GridFloor y={-1.3} />

      {/* message glass panel */}
      <GlassPanel width={2.7} height={1.62} depth={0.16} radius={0.11} position={[0.65, floatY, 0]} trim color={CREAM} />

      {/* clock ring above panel */}
      <group position={[0.65, floatY + 1.35, 0]} rotation={[0, ringSpin, 0]}>
        <Ring radius={0.85} tube={0.05} color={GOLD} emissiveIntensity={0.28} />
        {TICKS.map((i) => {
          const a = (i / 12) * Math.PI * 2;
          return (
            <mesh key={i} position={[Math.sin(a) * 0.85, Math.cos(a) * 0.85, 0]} rotation={[0, 0, -a]}>
              <boxGeometry args={[0.05, i % 3 === 0 ? 0.17 : 0.1, 0.05]} />
              <meshPhysicalMaterial color={i % 3 === 0 ? GOLD : SOFT} metalness={0.8} roughness={0.3} envMapIntensity={1.2} />
            </mesh>
          );
        })}
        {/* sweeping dial 11 → 3 */}
        <group rotation={[0, 0, (sweep * Math.PI) / 180]}>
          <mesh position={[0, 0.85, 0]}>
            <boxGeometry args={[0.045, 0.5, 0.045]} />
            <meshPhysicalMaterial color={GOLD} emissive={GOLD} emissiveIntensity={0.9} metalness={0.9} roughness={0.2} />
          </mesh>
        </group>
        <Orb position={[0, 0, 0.02]} radius={0.09} color={GOLD} emissiveIntensity={0.55} />
      </group>
      <Orb position={[0.65, floatY - 0.02, 0.14]} radius={0.075} color={GOLD} emissiveIntensity={0.4} />
    </Scene3D>
  );
};

export default S1Question3D;