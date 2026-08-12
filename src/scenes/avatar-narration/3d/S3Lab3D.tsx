// S3 The Lab — 3D: brass atom (two intersecting tori + orb) floats over a
// glass slab; "real AI automations / not theory" chips beneath.
import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate } from 'remotion';
import { Scene3D, GlassPanel, Ring, Orb, Headline, WordsRev, Chip } from './kit3d';
import { Prop } from '../kit';
import { GOLD, SOFT, CREAM, NEUTRAL } from '../theme';

export const S3Lab3D: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const spin = frame * 0.02;
  const bob = 0.4 + Math.sin(frame * 0.025) * 0.07;
  const strike = interpolate(frame, [55, 68], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  return (
    <Scene3D
      poses={[
        { f: 0, pos: [-0.9, 1.35, 7.3], look: [0.2, 0.9, 0] },
        { f: 82, pos: [0.6, 1.15, 5.7], look: [-0.1, 0.95, 0] },
        { f: 164, pos: [0.9, 1.05, 7.0], look: [-0.3, 0.9, 0] },
      ]}
      headline={
        <div style={{ position: 'absolute', top: 96, left: 0, right: 0, textAlign: 'center' }}>
          <div style={{ color: CREAM, fontSize: 74, fontWeight: 800, letterSpacing: '0.01em', lineHeight: 1.05 }}>
            SYLVESTER'S <span style={{ color: GOLD }}>AI LAB</span>
          </div>
          <div style={{ display: 'flex', gap: 22, justifyContent: 'center', marginTop: 26 }}>
            <Chip frame={frame} start={28} fps={fps} border={`1px solid ${SOFT}44`} background="rgba(143,168,200,0.10)">
              <Prop file="02_ICONS/lucide/circle-check-big.svg" size={24} color="soft" />
              <span style={{ color: SOFT, fontSize: 22, fontWeight: 700 }}>real AI automations</span>
            </Chip>
            <div style={{ position: 'relative' }}>
              <Chip frame={frame} start={40} fps={fps}>
                <Prop file="02_ICONS/lucide/alert-triangle.svg" size={24} color="brass" />
                <span style={{ color: NEUTRAL, fontSize: 22, fontWeight: 600 }}>not theory</span>
              </Chip>
              <div style={{ position: 'absolute', left: 18, right: 18, top: '50%', height: 3, background: GOLD, transform: `scaleX(${strike})`, transformOrigin: 'left' }} />
            </div>
          </div>
        </div>
      }
    >
      {/* atom */}
      <group position={[0, bob, 0]} rotation={[0, spin, 0]}>
        <Ring radius={1.05} tube={0.045} color={GOLD} emissiveIntensity={0.22} />
        <Ring radius={1.05} tube={0.045} color={SOFT} rotation={[Math.PI / 2.4, 0.35, 0]} />
        <Ring radius={1.05} tube={0.045} color={CREAM} rotation={[0, Math.PI / 2, Math.PI / 2.4]} />
        <Orb radius={0.3} color={GOLD} emissiveIntensity={0.5} />
        <Orb position={[0.85, 0.55, 0.3]} radius={0.1} color={SOFT} />
      </group>
      {/* slab */}
      <GlassPanel width={2.9} height={0.28} depth={0.9} radius={0.07} position={[0, -1.1, 0]} color={CREAM} opacity={0.85} />
    </Scene3D>
  );
};

export default S3Lab3D;