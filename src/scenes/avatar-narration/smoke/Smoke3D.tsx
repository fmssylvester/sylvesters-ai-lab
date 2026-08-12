// Smoke test: prove SwiftShader WebGL + @remotion/three work on the CI runner
// before committing to the full 3D rewrite. 48 frames @ 720p.
import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from 'remotion';
import { ThreeCanvas } from '@remotion/three';

const VOID = '#0E1B2C';

const FloatBox: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <group rotation={[0.4 + frame * 0.008, frame * 0.015, 0]}>
      <mesh position={[0, 0.9, 0]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="#C9A24B" metalness={0.55} roughness={0.35} />
      </mesh>
      <mesh rotation={[Math.PI / 2.2, 0, frame * 0.01]}>
        <torusGeometry args={[1.7, 0.14, 20, 60]} />
        <meshStandardMaterial color="#8FA8C8" metalness={0.85} roughness={0.25} />
      </mesh>
      <mesh position={[1.9, -0.2, 0.6]}>
        <sphereGeometry args={[0.42, 32, 32]} />
        <meshStandardMaterial color="#F4EDE0" metalness={0.9} roughness={0.2} />
      </mesh>
    </group>
  );
};

export const Smoke3D: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const camX = Math.sin((frame / fps) * 0.4) * 3.4;
  return (
    <AbsoluteFill style={{ background: VOID }}>
      <ThreeCanvas
        width={1280}
        height={720}
        camera={{ fov: 45, position: [camX, 1.5, 6.2], near: 0.1, far: 100 }}
        style={{ background: VOID }}
        gl={{ antialias: true, alpha: false, powerPreference: 'high-performance' }}
      >
        <ambientLight intensity={0.45} />
        <directionalLight position={[4, 6, 3]} intensity={1.6} color="#C9A24B" />
        <directionalLight position={[-5, 2, -3]} intensity={0.8} color="#8FA8C8" />
        <pointLight position={[0, 4, 0]} intensity={0.5} color="#F4EDE0" />
        <FloatBox />
        <gridHelper args={[14, 14, '#8FA8C8', '#8FA8C8']} position={[0, -1.2, 0]} />
      </ThreeCanvas>
      <div style={{ position: 'absolute', bottom: 18, left: 24, fontFamily: "'Inter', sans-serif", fontSize: 15, letterSpacing: '0.08em', color: 'rgba(244,237,224,0.5)' }}>
        SWIFTSHADER WEBGL SMOKE · FRAME {frame.toString().padStart(3, '0')}
      </div>
    </AbsoluteFill>
  );
};