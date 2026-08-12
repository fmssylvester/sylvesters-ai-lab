// kit3d — shared 3D system for AvatarNarration90s (premium SaaS look).
// Studio reflections via drei Lightformers baked to PMREM (offline, no network),
// glass panels, grid floor, frame-driven camera rig, headline caption helpers.
import React from 'react';
import * as THREE from 'three';
import { ThreeCanvas } from '@remotion/three';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate } from 'remotion';
import { Environment, Lightformer, RoundedBox, PerspectiveCamera } from '@react-three/drei';
import { VOID, DEEP, GOLD, SOFT, CREAM, NEUTRAL } from '../theme';
import { Words, Caption, FilmGrade } from '../kit';

export const GL_W = 1280;
export const GL_H = 720;
const CAM_FOV = 42;
const ORIGIN: [number, number, number] = [0, 0.5, 0];

// ── Lighting: high-contrast key/fill/rim + baked studio reflections ─────────
export const StudioLights: React.FC<{ tint?: string }> = ({ tint = SOFT }) => (
  <>
    <ambientLight intensity={0.16} color={CREAM} />
    <directionalLight position={[5, 8, 4]} intensity={1.9} color={GOLD} />
    <directionalLight position={[-6, 3, -2]} intensity={0.6} color={tint} />
    <directionalLight position={[0, 3, -6]} intensity={1.2} color={CREAM} />
    <pointLight position={[0, 5, 0]} intensity={0.3} color={CREAM} />
  </>
);

export const StudioEnv: React.FC = () => (
  <Environment resolution={256} frames={1}>
    <Lightformer form="rect" intensity={5.5} color={CREAM} scale={[10, 2.6, 1]} position={[0, 5, -6]} />
    <Lightformer form="rect" intensity={3.2} color={GOLD} scale={[3, 8, 1]} position={[-7, 2, 4]} rotation={[0, Math.PI / 2.6, 0]} />
    <Lightformer form="rect" intensity={2.4} color={SOFT} scale={[3, 7, 1]} position={[7, 1, 3]} rotation={[0, -Math.PI / 2.6, 0]} />
    <Lightformer form="rect" intensity={2.6} color={CREAM} scale={[8, 1.6, 1]} position={[0, -6, 4]} rotation={[Math.PI / 1.2, 0, 0]} />
    <Lightformer form="circle" intensity={1.6} color={CREAM} scale={4} position={[0, 7, 2]} />
  </Environment>
);

// ── Void background + fog for depth ─────────────────────────────────────────
export const VoidAtmosphere: React.FC<{ fogFar?: number }> = ({ fogFar = 22 }) => (
  <>
    <color attach="background" args={[VOID]} />
    <fog attach="fog" args={[VOID, 9, fogFar]} />
  </>
);

// ── Premium ground: steel grid fading into fog ─────────────────────────────
export const GridFloor: React.FC<{ y?: number; color?: string; sub?: string }> = ({
  y = -1.3,
  color = '#8FA8C8',
  sub = '#15233A',
}) => (
  <gridHelper args={[24, 24, color, sub]} position={[0, y, 0]} />
);

// ── Soft ground shadows: radial-gradient sprite (cheap realism, no shadow maps)
const makeShadowCanvas = (): HTMLCanvasElement | null => {
  const doc = (globalThis as { document?: { createElement(tag: string): HTMLCanvasElement; getContext(kind: string): CanvasRenderingContext2D | null } }).document;
  if (!doc) {
    return null;
  }
  const c = doc.createElement('canvas');
  c.width = c.height = 256;
  const ctx = c.getContext('2d');
  const g = ctx!.createRadialGradient(128, 128, 8, 128, 128, 128);
  g.addColorStop(0, 'rgba(2,5,10,0.9)');
  g.addColorStop(0.55, 'rgba(2,5,10,0.45)');
  g.addColorStop(1, 'rgba(2,5,10,0)');
  ctx!.fillStyle = g;
  ctx!.fillRect(0, 0, 256, 256);
  return c;
};

const _shadowCanvas = makeShadowCanvas();

export const GroundShadow: React.FC<{ x?: number; y?: number; z?: number; r?: number; opacity?: number }> = ({
  x = 0, y = -1.298, z = 0, r = 1.6, opacity = 1,
}) => {
  const tex = React.useMemo(() => {
    if (!_shadowCanvas) {
      return null;
    }
    const t = new THREE.CanvasTexture(_shadowCanvas);
    t.needsUpdate = true;
    return t;
  }, []);
  if (!tex) {
    return null;
  }
  return (
    <mesh position={[x, y, z]} rotation={[-Math.PI / 2, 0, 0]}>
      <circleGeometry args={[r, 48]} />
      <meshBasicMaterial map={tex} transparent depthWrite={false} opacity={opacity} color="#000000" />
    </mesh>
  );
};

// ── Glass panel (rounded, clearcoat studio finish, brass trim option) ───────
export const GlassPanel: React.FC<{
  width?: number;
  height?: number;
  depth?: number;
  radius?: number;
  position?: [number, number, number];
  rotation?: [number, number, number];
  color?: string;
  opacity?: number;
  trim?: boolean;
}> = ({
  width = 2.6,
  height = 1.5,
  depth = 0.16,
  radius = 0.1,
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  color = CREAM,
  opacity = 0.92,
  trim = false,
}) => {
  return (
    <group position={position} rotation={rotation}>
      {trim && (
        <RoundedBox args={[width + 0.05, height + 0.05, depth + 0.045]} radius={radius + 0.015} smoothness={5}>
          <meshPhysicalMaterial
            color={GOLD}
            metalness={1}
            roughness={0.22}
            envMapIntensity={1.4}
          />
        </RoundedBox>
      )}
      <RoundedBox args={[width, height, depth]} radius={radius} smoothness={5}>
        <meshPhysicalMaterial
          color={color}
          transparent={opacity < 1}
          opacity={opacity}
          roughness={0.12}
          metalness={0.05}
          clearcoat={0.9}
          clearcoatRoughness={0.12}
          envMapIntensity={1.9}
        />
      </RoundedBox>
    </group>
  );
};

// ── Floating orb (for spheres with studio gloss) ───────────────────────────
export const Orb: React.FC<{
  position?: [number, number, number];
  radius?: number;
  color?: string;
  emissive?: string;
  emissiveIntensity?: number;
  metalness?: number;
}> = ({ position = [0, 0, 0], radius = 0.3, color = CREAM, emissive, emissiveIntensity = 0.4, metalness = 0.25 }) => (
  <mesh position={position}>
    <sphereGeometry args={[radius, 48, 48]} />
    <meshPhysicalMaterial
      color={color}
      metalness={metalness}
      roughness={0.12}
      clearcoat={0.7}
      clearcoatRoughness={0.12}
      emissive={emissive ?? color}
      emissiveIntensity={emissiveIntensity}
      envMapIntensity={2.0}
    />
  </mesh>
);

// ── Brass / steel ring (toruses for rings, halos, clock faces) ─────────────
export const Ring: React.FC<{
  position?: [number, number, number];
  rotation?: [number, number, number];
  radius?: number;
  tube?: number;
  color?: string;
  emissiveIntensity?: number;
}> = ({ position = [0, 0, 0] as [number, number, number], rotation = [0, 0, 0] as [number, number, number], radius = 1, tube = 0.05, color = GOLD, emissiveIntensity = 0 }) => (
  <mesh position={position} rotation={rotation}>
    <torusGeometry args={[radius, tube, 24, 72]} />
    <meshPhysicalMaterial
      color={color}
      metalness={0.85}
      roughness={0.2}
      envMapIntensity={1.9}
      emissive={emissiveIntensity > 0 ? color : '#000000'}
      emissiveIntensity={emissiveIntensity}
    />
  </mesh>
);

// ── Frame-driven camera: interpolate along pose keyframes ──────────────────
export type CamPose = { f: number; pos: [number, number, number]; look?: [number, number, number] };

export const CamRig: React.FC<{ poses: CamPose[]; defaultLook?: [number, number, number] }> = ({
  poses,
  defaultLook = ORIGIN,
}) => {
  const frame = useCurrentFrame();
  const sorted = [...poses].sort((a, b) => a.f - b.f);
  const pos = [
    interpolate(frame, sorted.map((p) => p.f), sorted.map((p) => p.pos[0]), { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }),
    interpolate(frame, sorted.map((p) => p.f), sorted.map((p) => p.pos[1]), { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }),
    interpolate(frame, sorted.map((p) => p.f), sorted.map((p) => p.pos[2]), { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }),
  ] as [number, number, number];
  const look = [
    interpolate(frame, sorted.map((p) => p.f), sorted.map((p) => (p.look ?? defaultLook)[0]), { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }),
    interpolate(frame, sorted.map((p) => p.f), sorted.map((p) => (p.look ?? defaultLook)[1]), { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }),
    interpolate(frame, sorted.map((p) => p.f), sorted.map((p) => (p.look ?? defaultLook)[2]), { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }),
  ] as [number, number, number];
  return <CameraPose position={pos} look={look} />;
};

const CameraPose: React.FC<{ position: [number, number, number]; look: [number, number, number] }> = ({ position, look }) => {
  const camera = React.useRef<import('three').PerspectiveCamera>(null);
  React.useEffect(() => {
    camera.current?.lookAt(...look);
  }, [position, look]);
  return <PerspectiveCamera makeDefault ref={camera} fov={CAM_FOV} position={position} />;
};

// ── Scene3D wrapper: canvas + atmosphere + grain + optional headline overlay ─
export const Scene3D: React.FC<{
  children: React.ReactNode;
  poses: CamPose[];
  headline?: React.ReactNode;
  overlay?: React.ReactNode;
}> = ({ children, poses, headline, overlay }) => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ background: VOID }}>
      <ThreeCanvas
        width={GL_W}
        height={GL_H}
        camera={{ fov: CAM_FOV, position: poses[0].pos, near: 0.1, far: 120 }}
        gl={{ antialias: true, alpha: false, powerPreference: 'high-performance' }}
        style={{ position: 'absolute', inset: 0 }}
      >
        <VoidAtmosphere />
        <StudioLights />
        <StudioEnv />
        <CamRig poses={poses} />
        {children}
      </ThreeCanvas>
      <div
        style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          background: 'radial-gradient(120% 95% at 50% 42%, transparent 55%, rgba(6,9,15,0.55) 100%)',
        }}
      />
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
        {headline}
        {overlay}
      </div>
      <FilmGrade frame={frame} />
    </AbsoluteFill>
  );
};

// ── DOM headline helpers (Playfair over 3D) ────────────────────────────────
export const Headline: React.FC<{
  frame: number;
  fps: number;
  children: React.ReactNode;
  style?: React.CSSProperties;
}> = ({ frame, fps, children, style }) => (
  <div style={{ position: 'absolute', top: 78, left: 150, ...style }}>
    <div style={{ color: CREAM, fontSize: 66, fontWeight: 800, letterSpacing: '-0.01em', lineHeight: 1.12, textShadow: '0 4px 40px rgba(6,9,15,0.8), 0 2px 14px rgba(6,9,15,0.6)' }}>
      {children}
    </div>
  </div>
);

export const WordsRev: React.FC<{
  text: string;
  frame: number;
  start: number;
  fps: number;
  color?: string;
}> = ({ text, frame, start, fps, color }) => (
  <Words text={text} frame={frame} start={start} fps={fps} gap={3} style={color ? { color } : undefined} />
);

export const Chip: React.FC<{
  frame: number;
  start: number;
  fps: number;
  children: React.ReactNode;
  color?: string;
  border?: string;
  background?: string;
  style?: React.CSSProperties;
}> = ({ frame, start, fps, children, color, border, background, style }) => {
  const inq = interpolate(frame, [start, start + 10], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  return (
    <div
      style={{
        opacity: inq,
        transform: `translateY(${(1 - inq) * 14}px)`,
        display: 'inline-flex',
        alignItems: 'center',
        gap: 12,
        padding: '13px 26px',
        borderRadius: 26,
        background: background ?? 'rgba(244,237,224,0.06)',
        border: border ?? '1px solid rgba(244,237,224,0.16)',
        ...style,
      }}
    >
      {children}
    </div>
  );
};

export { Caption, NEUTRAL, DEEP, GOLD, SOFT, CREAM };