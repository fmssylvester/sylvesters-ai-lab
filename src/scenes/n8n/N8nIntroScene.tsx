import React from 'react';
import {
  Audio,
  Img,
  staticFile,
  useCurrentFrame,
  interpolate,
  spring,
} from 'remotion';
import { N8N_INTRO_TIMELINE as T } from './n8nTimeline';

/* ============================================================================
   N8N INTRO — 10/10 Premium 3D Motion Graphics per new_brain.md
   Real 3D isometric DAG workflow graph, actual SVG icons, curved data pipes,
   beat-synced SFX, specular glassmorphism, and kinetic 3D typography.
============================================================================ */
const COLORS = {
  bg: '#07090D',
  surface: '#0B0E14',
  cyan: '#00D9FF',
  violet: '#8A2BE2',
  emerald: '#10B981',
  coral: '#EF4444',
  amber: '#F59E0B',
  white: '#FFFFFF',
  muted: '#94A3B8',
};
const FONT = 'Inter, system-ui, sans-serif';
const MONO = 'JetBrains Mono, monospace';

const specular =
  'linear-gradient(135deg, rgba(255,255,255,0.30) 0%, rgba(255,255,255,0.03) 45%, rgba(255,255,255,0.0) 100%)';

/* ---------------------------------------------------------------------------
   Full-bleed 3D background: perspective grid floor, ambient glows, depth cubes
--------------------------------------------------------------------------- */
function DepthBackground({ frame }: { frame: number }) {
  const gridX = interpolate(frame % 300, [0, 300], [0, 42]);
  const gridOpacity = interpolate(Math.sin(frame / 45), [-1, 1], [0.08, 0.16]);

  const cubes = [
    { x: '5%', y: '18%', size: 90, tz: -300, color: COLORS.cyan, delay: 0 },
    { x: '88%', y: '14%', size: 70, tz: -420, color: COLORS.violet, delay: 60 },
    { x: '82%', y: '74%', size: 110, tz: -520, color: COLORS.cyan, delay: 120 },
    { x: '10%', y: '78%', size: 60, tz: -360, color: COLORS.violet, delay: 180 },
    { x: '48%', y: '86%', size: 140, tz: -700, color: COLORS.emerald, delay: 240 },
  ];

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', zIndex: 0, perspective: 1200 }}>
      {/* Navy base */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: `radial-gradient(1300px circle at 50% 42%, ${COLORS.surface} 0%, ${COLORS.bg} 72%)`,
        }}
      />
      {/* Soft ambient glows */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: `radial-gradient(750px circle at 20% 20%, ${COLORS.cyan}22, transparent 65%), radial-gradient(700px circle at 80% 80%, ${COLORS.violet}18, transparent 65%)`,
        }}
      />
      {/* Perspective ground grid */}
      <div
        style={{
          position: 'absolute',
          left: '-30%',
          width: '160%',
          height: '60%',
          bottom: '-18%',
          backgroundImage:
            'linear-gradient(rgba(0,217,255,0.16) 1px, transparent 1px), linear-gradient(90deg, rgba(0,217,255,0.16) 1px, transparent 1px)',
          backgroundSize: '70px 70px',
          transform: `perspective(850px) rotateX(62deg) translateY(${gridX}px)`,
          opacity: gridOpacity,
        }}
      />
      {/* 3D depth cubes */}
      {cubes.map((c, i) => {
        const rot = (frame + c.delay) * 0.6;
        const float = Math.sin((frame + c.delay) / 34) * 12;
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: c.x,
              top: c.y,
              width: c.size,
              height: c.size,
              transform: `translateZ(${c.tz}px) rotateX(${rot}deg) rotateY(${rot * 0.7}deg) translateY(${float}px)`,
              opacity: 0.45,
            }}
          >
            <div style={{ position: 'absolute', inset: 0, border: `1px solid ${c.color}66`, transform: 'rotateY(0deg) translateZ(28px)', background: `${c.color}14` }} />
            <div style={{ position: 'absolute', inset: 0, border: `1px solid ${c.color}55`, transform: 'rotateY(90deg) translateZ(28px)', background: `${c.color}10` }} />
            <div style={{ position: 'absolute', inset: 0, border: `1px solid ${c.color}55`, transform: 'rotateX(90deg) translateZ(28px)', background: `${c.color}10` }} />
          </div>
        );
      })}
    </div>
  );
}

/* ---------------------------------------------------------------------------
   Glass 3D Card Primitive
--------------------------------------------------------------------------- */
function GlassCard3D({
  children,
  appear,
  depth,
  rotate,
  style,
}: {
  children: React.ReactNode;
  appear: number;
  depth?: number;
  rotate?: number;
  style?: React.CSSProperties;
}) {
  const frame = useCurrentFrame();
  const s = spring({ frame: frame - appear, fps: 30, config: { damping: 13, stiffness: 130, mass: 0.9 } });
  const scale = interpolate(s, [0, 1], [0.7, 1], { extrapolateLeft: 'clamp' });
  const opacity = interpolate(s, [0, 1], [0, 1], { extrapolateLeft: 'clamp' });
  const tilt = interpolate(s, [0, 1], [14, 0], { extrapolateLeft: 'clamp' });
  return (
    <div
      style={{
        position: 'relative',
        borderRadius: 24,
        overflow: 'hidden',
        background: 'rgba(255,255,255,0.06)',
        border: '1px solid rgba(0,217,255,0.28)',
        boxShadow: '0 40px 120px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.18)',
        transform: `translateZ(${depth ?? 0}px) scale(${scale}) rotateX(${tilt}deg) rotateY(${rotate ?? 0}deg)`,
        opacity,
        zIndex: 3,
        ...style,
      }}
    >
      <div style={{ position: 'absolute', inset: 0, background: specular, pointerEvents: 'none' }} />
      {children}
    </div>
  );
}

/* ---------------------------------------------------------------------------
   BEAT 1 — Holographic 3D Chat Station + 3:00 AM Clock
--------------------------------------------------------------------------- */
function ChatHoloStation({ frame }: { frame: number }) {
  const msgIn = spring({ frame: frame - T.PHASE_1_CHAT.MESSAGE_ENTRY, fps: 30, config: { damping: 14, stiffness: 120 } });
  const clock = spring({ frame: frame - T.PHASE_1_CHAT.CLOCK_SWEEP, fps: 30, config: { damping: 12, stiffness: 100 } });
  const sfxPulse = Math.sin((frame - T.PHASE_1_CHAT.MESSAGE_ENTRY) / 6);

  return (
    <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 3, perspective: 1200 }}>
      {/* Orbiting rings */}
      <div style={{ position: 'absolute', width: 780, height: 760, borderRadius: '50%', border: `1px solid ${COLORS.cyan}26`, transform: `rotateX(70deg) rotateZ(${frame * 0.3}deg)`, zIndex: 2 }} />
      <div style={{ position: 'absolute', width: 580, height: 560, borderRadius: '50%', border: `1px dashed ${COLORS.violet}33`, transform: `rotateX(70deg) rotateZ(${-frame * 0.2}deg)`, zIndex: 2 }} />

      {/* Main glass chat card */}
      <GlassCard3D appear={T.PHASE_1_CHAT.CHAT_CARD_ENTRY} depth={120} rotate={-4} style={{ width: 640, padding: 32 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
          {['#ff5f57', '#febc2e', '#28c840'].map((c) => (
            <div key={c} style={{ width: 12, height: 12, borderRadius: '50%', background: c }} />
          ))}
          <div style={{ flex: 1 }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontFamily: MONO, fontSize: 13, color: COLORS.cyan }}>
            <Img src={staticFile('02_ICONS/lucide/webhook.svg')} style={{ width: 16, height: 16, filter: 'invert(1)' }} />
            <span>webhook → live</span>
          </div>
        </div>

        {/* Incoming message */}
        <div
          style={{
            padding: '18px 22px',
            borderRadius: 18,
            borderTopLeftRadius: 4,
            background: 'rgba(148,163,184,0.14)',
            border: '1px solid rgba(0,217,255,0.3)',
            opacity: msgIn,
            transform: `perspective(800px) rotateX(${interpolate(msgIn, [0, 1], [18, 0], { extrapolateLeft: 'clamp' })}deg) translateZ(${interpolate(msgIn, [0, 1], [0, 40], { extrapolateLeft: 'clamp' })}px)`,
            boxShadow: `0 0 ${20 + sfxPulse * 26}px ${COLORS.cyan}44`,
          }}
        >
          <div style={{ fontFamily: FONT, fontSize: 24, fontWeight: 600, color: COLORS.white, lineHeight: 1.4 }}>
            "Can I cancel my subscription immediately?"
          </div>
          <div style={{ marginTop: 10, fontFamily: MONO, fontSize: 13, color: COLORS.muted }}>
            3:14 AM · Incoming Customer Request
          </div>
        </div>
      </GlassCard3D>

      {/* Neon 3:00 Clock */}
      <GlassCard3D appear={T.PHASE_1_CHAT.CLOCK_SWEEP} depth={260} rotate={6} style={{ position: 'absolute', top: '12%', right: '15%', width: 130, height: 130, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ fontFamily: MONO, fontSize: 28, fontWeight: 800, color: COLORS.cyan, textShadow: `0 0 22px ${COLORS.cyan}` }}>3:00</div>
        <div style={{ position: 'absolute', width: 120, height: 120, borderRadius: '50%', borderTop: `3px solid ${COLORS.cyan}`, transform: `rotate(${clock * 720}deg)`, opacity: clock }} />
      </GlassCard3D>
    </div>
  );
}

/* ---------------------------------------------------------------------------
   BEAT 2 — Real Isometric 3D DAG Flowchart with SVG Icons & Curved Connections
--------------------------------------------------------------------------- */
interface DagNode {
  id: string;
  num: string;
  label: string;
  sub: string;
  icon: string;
  color: string;
  t: number;
  x: number;
  y: number;
  z: number;
}

const DAG_NODES: DagNode[] = [
  { id: 'webhook', num: '01', label: 'Webhook', sub: 'POST Trigger', icon: '02_ICONS/lucide/webhook.svg', color: COLORS.cyan, t: 250, x: 220, y: 500, z: 0 },
  { id: 'format', num: '02', label: 'Format Data', sub: 'JSON Parser', icon: '02_ICONS/lucide/file-json.svg', color: COLORS.violet, t: 280, x: 580, y: 350, z: 40 },
  { id: 'ai', num: '03', label: 'AI Agent', sub: 'GPT-4o System Prompt', icon: '01_LOGOS/AI/openai.svg', color: COLORS.emerald, t: 310, x: 960, y: 500, z: 80 },
  { id: 'if', num: '04', label: 'IF Branch', sub: 'Escalation Check', icon: '01_LOGOS/brand/n8n.svg', color: COLORS.amber, t: 340, x: 1340, y: 500, z: 120 },
  { id: 'gmail', num: '05', label: 'Gmail Alert', sub: 'Urgent Email', icon: '01_LOGOS/brand/gmail.svg', color: COLORS.coral, t: 370, x: 1700, y: 320, z: 160 },
  { id: 'reply', num: '06', label: 'Webhook Reply', sub: '200 OK JSON', icon: '02_ICONS/lucide/file-json.svg', color: COLORS.emerald, t: 390, x: 1700, y: 680, z: 160 },
];

const DAG_EDGES = [
  { from: 0, to: 1, color: COLORS.cyan, startT: 280 },
  { from: 1, to: 2, color: COLORS.violet, startT: 310 },
  { from: 2, to: 3, color: COLORS.emerald, startT: 340 },
  { from: 3, to: 4, color: COLORS.coral, startT: 370 }, // TRUE branch (escalation)
  { from: 3, to: 5, color: COLORS.emerald, startT: 390 }, // FALSE branch (direct)
];

function CurvedEdge({ from, to, color, startT, frame }: { from: DagNode; to: DagNode; color: string; startT: number; frame: number }) {
  const s = spring({ frame: frame - startT, fps: 30, config: { damping: 15, stiffness: 120 } });
  const travel = ((frame - startT) / 35) % 1;
  const isVisible = frame >= startT;

  if (!isVisible) return null;

  // Bezier curve calculations
  const x1 = from.x + 110;
  const y1 = from.y;
  const x2 = to.x - 110;
  const y2 = to.y;
  const cx1 = x1 + 120;
  const cy1 = y1;
  const cx2 = x2 - 120;
  const cy2 = y2;

  const pathD = `M ${x1} ${y1} C ${cx1} ${cy1}, ${cx2} ${cy2}, ${x2} ${y2}`;

  // Pulse particle position
  const px = (1 - travel) ** 3 * x1 + 3 * (1 - travel) ** 2 * travel * cx1 + 3 * (1 - travel) * travel ** 2 * cx2 + travel ** 3 * x2;
  const py = (1 - travel) ** 3 * y1 + 3 * (1 - travel) ** 2 * travel * cy1 + 3 * (1 - travel) * travel ** 2 * cy2 + travel ** 3 * y2;

  return (
    <g style={{ opacity: s }}>
      {/* Background connection pipe */}
      <path d={pathD} fill="none" stroke={`${color}44`} strokeWidth="3" strokeDasharray="6 6" />
      {/* Active glowing path */}
      <path d={pathD} fill="none" stroke={color} strokeWidth="3" strokeDasharray="600" strokeDashoffset={interpolate(s, [0, 1], [600, 0])} />
      {/* Traveling laser particle */}
      {frame > startT + 10 && (
        <circle cx={px} cy={py} r="6" fill="#FFFFFF" filter={`drop-shadow(0 0 10px ${color})`} />
      )}
    </g>
  );
}

function DagNodeCard({ node, frame }: { node: DagNode; frame: number }) {
  const s = spring({ frame: frame - node.t, fps: 30, config: { damping: 13, stiffness: 130, mass: 0.9 } });
  const active = frame >= node.t + 15;
  const pulse = Math.sin((frame - node.t) / 10);

  return (
    <div
      style={{
        position: 'absolute',
        left: node.x - 110,
        top: node.y - 45,
        width: 220,
        padding: '14px 18px',
        borderRadius: 18,
        background: 'rgba(15,23,42,0.85)',
        border: `1.5px solid ${active ? node.color : 'rgba(255,255,255,0.15)'}`,
        boxShadow: active ? `0 0 ${20 + pulse * 15}px ${node.color}66, 0 20px 40px rgba(0,0,0,0.6)` : '0 10px 30px rgba(0,0,0,0.4)',
        transform: `translateZ(${node.z}px) scale(${s}) rotateX(${interpolate(s, [0, 1], [18, 0], { extrapolateLeft: 'clamp' })}deg)`,
        opacity: s,
        zIndex: 4,
        display: 'flex',
        alignItems: 'center',
        gap: 12,
      }}
    >
      {/* Icon badge */}
      <div
        style={{
          width: 42,
          height: 42,
          borderRadius: 12,
          background: `${node.color}22`,
          border: `1px solid ${node.color}55`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Img src={staticFile(node.icon)} style={{ width: 22, height: 22, filter: node.icon.includes('lucide') ? 'invert(1)' : 'none' }} />
      </div>

      {/* Node details */}
      <div style={{ flex: 1, overflow: 'hidden' }}>
        <div style={{ fontFamily: MONO, fontSize: 10, color: node.color, fontWeight: 700 }}>{node.num}</div>
        <div style={{ fontFamily: FONT, fontSize: 16, fontWeight: 800, color: COLORS.white, whiteSpace: 'nowrap' }}>{node.label}</div>
        <div style={{ fontFamily: MONO, fontSize: 10, color: COLORS.muted, whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>{node.sub}</div>
      </div>
    </div>
  );
}

function WorkflowDAG({ frame }: { frame: number }) {
  const containerOpacity = interpolate(Math.max(0, frame - T.PHASE_2_WORKFLOW.START), [0, 15], [0, 1], { extrapolateLeft: 'clamp' });

  return (
    <div style={{ position: 'absolute', inset: 0, opacity: containerOpacity, zIndex: 3, perspective: 1200 }}>
      {/* SVG Canvas for connecting pipes */}
      <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', overflow: 'visible' }}>
        {DAG_EDGES.map((e, idx) => (
          <CurvedEdge key={idx} from={DAG_NODES[e.from]} to={DAG_NODES[e.to]} color={e.color} startT={e.startT} frame={frame} />
        ))}
      </svg>

      {/* Nodes */}
      {DAG_NODES.map((n) => (
        <DagNodeCard key={n.id} node={n} frame={frame} />
      ))}
    </div>
  );
}

/* ---------------------------------------------------------------------------
   BEAT 3 — Kinetic 3D Word Push-In
--------------------------------------------------------------------------- */
function Kinetic3D({ text, start, frame }: { text: string; start: number; frame: number }) {
  const words = text.split(' ');
  return (
    <div
      style={{
        maxWidth: 1300,
        textAlign: 'center',
        zIndex: 4,
        fontFamily: FONT,
        fontWeight: 900,
        fontSize: 58,
        lineHeight: 1.35,
        color: COLORS.white,
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'center',
        gap: 14,
        perspective: 1000,
      }}
    >
      {words.map((w, i) => {
        const s = spring({ frame: frame - (start + i * 5), fps: 30, config: { damping: 14, stiffness: 120 } });
        const cleanWord = w.toLowerCase().replace(/[^a-z]/g, '');
        const isKey = ['scratch', 'node', 'config', 'mistake', 'built'].includes(cleanWord);
        return (
          <span
            key={i}
            style={{
              opacity: interpolate(s, [0, 1], [0, 1], { extrapolateLeft: 'clamp' }),
              transform: `perspective(1000px) translateZ(${interpolate(s, [0, 1], [-80, 0], { extrapolateLeft: 'clamp' })}px) rotateX(${interpolate(s, [0, 1], [20, 0], { extrapolateLeft: 'clamp' })}deg)`,
              color: isKey ? COLORS.cyan : COLORS.white,
              textShadow: isKey ? `0 0 34px ${COLORS.cyan}AA` : 'none',
              display: 'inline-block',
            }}
          >
            {w}
          </span>
        );
      })}
    </div>
  );
}

/* ---------------------------------------------------------------------------
   BEAT 4 — Holographic Logo Endcard
--------------------------------------------------------------------------- */
function LogoCard3D({ frame }: { frame: number }) {
  const s = spring({ frame: frame - T.PHASE_4_LOGO.LOGO_ENTER, fps: 30, config: { damping: 13, stiffness: 120 } });
  const sub = spring({ frame: frame - T.PHASE_4_LOGO.SUBTITLE_ENTER, fps: 30, config: { damping: 14, stiffness: 110 } });

  return (
    <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', zIndex: 4, perspective: 1400 }}>
      <GlassCard3D appear={T.PHASE_4_LOGO.LOGO_ENTER} depth={300} style={{ padding: '54px 84px', textAlign: 'center', maxWidth: 1200 }}>
        <div style={{ position: 'absolute', inset: -2, borderRadius: 24, border: `1px solid ${COLORS.cyan}55`, opacity: s }} />
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 20, marginBottom: 12 }}>
          <Img src={staticFile('01_LOGOS/brand/n8n.svg')} style={{ width: 64, height: 64 }} />
          <div style={{ fontFamily: FONT, fontWeight: 900, fontSize: 84, color: COLORS.white, letterSpacing: '0.02em' }}>
            SYLVESTER'S <span style={{ color: COLORS.cyan, textShadow: `0 0 60px ${COLORS.cyan}88` }}>AI LAB</span>
          </div>
        </div>
        <div style={{ marginTop: 20, fontFamily: MONO, fontSize: 22, letterSpacing: '0.42em', color: COLORS.muted, opacity: sub, transform: `translateZ(${sub * 120}px)` }}>
          REAL AUTOMATIONS · NOT THEORY
        </div>
      </GlassCard3D>
    </div>
  );
}

/* ---------------------------------------------------------------------------
   Scene Orchestrator
--------------------------------------------------------------------------- */
function SceneContent({ frame }: { frame: number }) {
  const inChat = frame >= T.PHASE_1_CHAT.START && frame < T.PHASE_1_CHAT.END;
  const inFloat = frame >= T.PHASE_2_WORKFLOW.START && frame < T.PHASE_2_WORKFLOW.END;
  const inKinetic = frame >= T.PHASE_3_KINETIC.START && frame < T.PHASE_3_KINETIC.END;
  const inLogo = frame >= T.PHASE_4_LOGO.START;

  return (
    <>
      {inChat && <ChatHoloStation frame={frame} />}
      {inFloat && <WorkflowDAG frame={frame} />}
      {inKinetic && (
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 4 }}>
          <Kinetic3D text="built it from scratch — every node, every config, every mistake" start={T.PHASE_3_KINETIC.TEXT_1_ENTER} frame={frame} />
        </div>
      )}
      {inLogo && <LogoCard3D frame={frame} />}
    </>
  );
}

export const N8nIntroScene: React.FC = () => {
  const frame = useCurrentFrame();

  // Audio SFX Triggers
  const sfxMessage = frame === T.PHASE_1_CHAT.MESSAGE_ENTRY;
  const sfxNode1 = frame === 250;
  const sfxNode2 = frame === 280;
  const sfxNode3 = frame === 310;
  const sfxNode4 = frame === 340;
  const sfxNode5 = frame === 370;
  const sfxWorkflow = frame === T.PHASE_2_WORKFLOW.START;
  const sfxKinetic = frame === T.PHASE_3_KINETIC.START;
  const sfxLogo = frame === T.PHASE_4_LOGO.LOGO_ENTER;

  return (
    <div style={{ width: 1920, height: 1080, position: 'relative', background: COLORS.bg, overflow: 'hidden', fontFamily: FONT }}>
      <DepthBackground frame={frame} />
      <SceneContent frame={frame} />

      {/* Voiceover Track */}
      <Audio src={staticFile('audio/voiceover.wav')} />

      {/* Beat-Synced SFX Tracks */}
      {(sfxMessage || sfxNode1 || sfxNode2 || sfxNode4 || sfxNode5) && (
        <Audio src={staticFile('audio/sfx/ping.wav')} volume={0.8} />
      )}
      {sfxNode3 && <Audio src={staticFile('audio/sfx/whoosh.wav')} volume={0.7} />}
      {sfxWorkflow && <Audio src={staticFile('audio/sfx/whoosh_heavy.wav')} volume={0.9} />}
      {sfxKinetic && <Audio src={staticFile('audio/sfx/whoosh.wav')} volume={0.8} />}
      {sfxLogo && <Audio src={staticFile('audio/sfx/impact.wav')} volume={1.0} />}
    </div>
  );
};

export default N8nIntroScene;