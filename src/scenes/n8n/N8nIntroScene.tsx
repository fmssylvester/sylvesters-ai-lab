import React from 'react';
import {
  Audio,
  staticFile,
  useCurrentFrame,
  interpolate,
  spring,
} from 'remotion';
import { N8N_INTRO_TIMELINE as T } from './n8nTimeline';

/* ============================================================================
   N8N INTRO — Premium 3D motion graphics per new_brain.md
   Real perspective depth, glowing node graph with traveling data particles,
   floating glass cards at angles. NOT flat text slides.
============================================================================ */
const COLORS = {
  bg: '#07090D',
  surface: '#0B0E14',
  cyan: '#00D9FF',
  violet: '#8A2BE2',
  coral: '#FF4F58',
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
  const gridOpacity = interpolate(Math.sin(frame / 45), [-1, 1], [0.06, 0.12]);
  // drifting depth cubes
  const cubes = [
    { x: '6%', y: '20%', size: 90, tz: -300, colors: [COLORS.cyan, '#22d3ee'], delay: 0 },
    { x: '88%', y: '16%', size: 70, tz: -420, colors: [COLORS.violet, '#a855f7'], delay: 60 },
    { x: '78%', y: '74%', size: 110, tz: -520, colors: [COLORS.cyan, '#06b6d4'], delay: 120 },
    { x: '14%', y: '72%', size: 60, tz: -360, colors: [COLORS.violet, '#7c3aed'], delay: 180 },
    { x: '46%', y: '84%', size: 140, tz: -700, colors: [COLORS.cyan, '#0ea5e9'], delay: 240 },
  ];
  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', zIndex: 0, perspective: 1200 }}>
      {/* navy base */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: `radial-gradient(1300px circle at 50% 42%, ${COLORS.surface} 0%, ${COLORS.bg} 72%)`,
        }}
      />
      {/* ambient glows — pre-softened gradients, no blur filter (software raster cost) */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: `radial-gradient(700px circle at 22% 20%, ${COLORS.cyan}26, transparent 60%), radial-gradient(640px circle at 80% 78%, ${COLORS.violet}20, transparent 60%)`,
        }}
      />
      {/* perspective ground grid */}
      <div
        style={{
          position: 'absolute',
          left: '-30%',
          width: '160%',
          height: '60%',
          bottom: '-18%',
          backgroundImage:
            'linear-gradient(rgba(0,217,255,0.14) 1px, transparent 1px), linear-gradient(90deg, rgba(0,217,255,0.14) 1px, transparent 1px)',
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
              opacity: 0.5,
            }}
          >
            {/* cube faces */}
            <div style={{ position: 'absolute', inset: 0, border: `1px solid ${c.colors[0]}66`, transform: 'rotateY(0deg) translateZ(28px)', background: `${c.colors[1]}14` }} />
            <div style={{ position: 'absolute', inset: 0, border: `1px solid ${c.colors[0]}55`, transform: 'rotateY(90deg) translateZ(28px)', background: `${c.colors[1]}10` }} />
            <div style={{ position: 'absolute', inset: 0, border: `1px solid ${c.colors[0]}55`, transform: 'rotateX(90deg) translateZ(28px)', background: `${c.colors[1]}10` }} />
          </div>
        );
      })}
    </div>
  );
}

/* ---------------------------------------------------------------------------
   Glass 3D card primitive — angled, specular top-left light, luminous border
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
   Glowing connection line with traveling particle (data flow)
--------------------------------------------------------------------------- */
function FlowEdge({
  appear,
  progress,
  color = COLORS.cyan,
}: {
  appear: number;
  progress: number;
  color?: string;
}) {
  const frame = useCurrentFrame();
  const s = spring({ frame: frame - appear, fps: 30, config: { damping: 16, stiffness: 120 } });
  const travel = (frame / 40) % 1;
  return (
    <div style={{ position: 'relative', width: 300, height: 3, transform: `scaleX(${s || 0.001})`, transformOrigin: 'left center', opacity: s }}>
      <div style={{ height: 3, background: `linear-gradient(90deg, ${color}00, ${color}, ${color})`, boxShadow: `0 0 14px ${color}aa`, borderRadius: 2 }} />
      <div style={{ position: 'absolute', left: `${travel * 100}%`, top: -3, width: 9, height: 9, borderRadius: '50%', background: '#fff', boxShadow: `0 0 16px ${color}, 0 0 30px ${color}`, opacity: s }} />
    </div>
  );
}

/* ---------------------------------------------------------------------------
   BEAT 1 — holographic 3D chat station + 3:00 clock + notification pulse
--------------------------------------------------------------------------- */
function ChatHoloStation({ frame }: { frame: number }) {
  const msgIn = spring({ frame: frame - T.PHASE_1_CHAT.MESSAGE_ENTRY, fps: 30, config: { damping: 14, stiffness: 120 } });
  const clock = spring({ frame: frame - T.PHASE_1_CHAT.CLOCK_SWEEP, fps: 30, config: { damping: 12, stiffness: 100 } });
  const sfxPulse = Math.sin((frame - T.PHASE_1_CHAT.MESSAGE_ENTRY) / 6);
  return (
    <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 3, perspective: 1200 }}>
      {/* orbiting holographic rings */}
      <div style={{ position: 'absolute', width: 760, height: 760, borderRadius: '50%', border: `1px solid ${COLORS.cyan}26`, transform: `rotateX(70deg) rotateZ(${frame * 0.3}deg)`, zIndex: 2 }} />
      <div style={{ position: 'absolute', width: 560, height: 560, borderRadius: '50%', border: `1px dashed ${COLORS.violet}33`, transform: `rotateX(70deg) rotateZ(${-frame * 0.2}deg)`, zIndex: 2 }} />

      {/* the chat glass card — angled in 3D */}
      <GlassCard3D appear={T.PHASE_1_CHAT.CHAT_CARD_ENTRY} depth={120} rotate={-4} style={{ width: 620, padding: 30 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 22 }}>
          {['#ff5f57', '#febc2e', '#28c840'].map((c) => (
            <div key={c} style={{ width: 11, height: 11, borderRadius: '50%', background: c }} />
          ))}
          <div style={{ flex: 1 }} />
          <div style={{ fontFamily: MONO, fontSize: 12, color: COLORS.muted, letterSpacing: '0.1em' }}>webhook → live</div>
        </div>
        {/* incoming message */}
        <div
          style={{
            maxWidth: '82%',
            padding: '16px 20px',
            borderRadius: 16,
            borderTopLeftRadius: 4,
            background: 'rgba(148,163,184,0.14)',
            border: '1px solid rgba(0,217,255,0.2)',
            opacity: msgIn,
            transform: `perspective(800px) rotateX(${interpolate(msgIn, [0, 1], [18, 0], { extrapolateLeft: 'clamp' })}deg) translateZ(${interpolate(msgIn, [0, 1], [0, 40], { extrapolateLeft: 'clamp' })}px)`,
            boxShadow: `0 0 ${20 + sfxPulse * 26}px ${COLORS.cyan}44`,
          }}
        >
          <div style={{ fontFamily: FONT, fontSize: 22, color: COLORS.white, lineHeight: 1.4 }}>Can I cancel my subscription?</div>
          <div style={{ marginTop: 8, fontFamily: MONO, fontSize: 13, color: COLORS.muted }}>3:14 AM · message received</div>
        </div>
      </GlassCard3D>

      {/* neon 3:00 clock, floating above card */}
      <GlassCard3D appear={T.PHASE_1_CHAT.CLOCK_SWEEP} depth={260} rotate={4} style={{ position: 'absolute', top: '12%', right: '16%', width: 120, height: 120, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ fontFamily: MONO, fontSize: 26, fontWeight: 800, color: COLORS.cyan, textShadow: `0 0 22px ${COLORS.cyan}` }}>3:00</div>
        <div style={{ position: 'absolute', width: 110, height: 110, borderRadius: '50%', borderTop: `3px solid ${COLORS.cyan}`, transform: `rotate(${clock * 720}deg)`, opacity: clock }} />
      </GlassCard3D>
    </div>
  );
}

/* ---------------------------------------------------------------------------
   BEAT 2 — glowing n8n flowchart with traveling data particles (3D staged)
--------------------------------------------------------------------------- */
const NODES = [
  { id: 'Webhook', t: T.PHASE_2_WORKFLOW.WEBHOOK_NODE, dz: 0 },
  { id: 'Format Data', t: T.PHASE_2_WORKFLOW.AI_AGENT_NODE, dz: 60 },
  { id: 'AI Agent', t: T.PHASE_2_WORKFLOW.IF_NODE, dz: 120 },
  { id: 'IF Node', t: T.PHASE_2_WORKFLOW.GMAIL_NODE, dz: 180 },
  { id: 'Gmail', t: T.PHASE_2_WORKFLOW.RESPONSE_NODE, dz: 240 },
];

function FlowNode({ label, idx, start, depth }: { label: string; idx: number; start: number; depth: number }) {
  const frame = useCurrentFrame();
  const s = spring({ frame: frame - start, fps: 30, config: { damping: 13, stiffness: 130, mass: 0.9 } });
  const active = frame >= start + 20;
  const glow = (Math.sin(frame / 18 + idx) + 1) / 2;
  return (
    <div style={{ position: 'relative', display: 'flex', alignItems: 'center', transform: `translateZ(${depth}px)`, opacity: s }}>
      <div
        style={{
          minWidth: 210,
          padding: '16px 20px',
          borderRadius: 16,
          background: 'rgba(255,255,255,0.07)',
          border: `1px solid ${active ? `${COLORS.cyan}88` : 'rgba(255,255,255,0.1)'}`,
          boxShadow: `0 18px 50px rgba(0,0,0,0.5), 0 0 ${active ? 24 + glow * 26 : 0}px ${COLORS.cyan}${active ? '66' : '00'}`,
          transform: `rotateX(${interpolate(s, [0, 1], [14, 0], { extrapolateLeft: 'clamp' })}deg)`,
          display: 'flex',
          alignItems: 'center',
          gap: 12,
        }}
      >
        <div style={{ fontFamily: MONO, fontSize: 13, color: COLORS.cyan, opacity: 0.8 }}>{String(idx + 1).padStart(2, '0')}</div>
        <div style={{ fontFamily: FONT, fontSize: 20, fontWeight: 800, color: COLORS.white, whiteSpace: 'nowrap' }}>{label}</div>
      </div>
      {idx < NODES.length - 1 && <FlowEdge appear={start} progress={0} />}
    </div>
  );
}

function Flowwork({ frame }: { frame: number }) {
  const containerOpacity = interpolate(Math.max(0, frame - T.PHASE_2_WORKFLOW.START), [0, 20], [0, 1], { extrapolateLeft: 'clamp' });
  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        flexDirection: 'column',
        gap: 18,
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 3,
        opacity: containerOpacity,
        perspective: 1200,
      }}
    >
      {NODES.map((n, i) => (
        <FlowNode key={n.id} label={n.id} idx={i} start={n.t} depth={n.dz} />
      ))}
    </div>
  );
}

/* ---------------------------------------------------------------------------
   BEAT 3 — kinetic word reveal (3D depth push-in), not a text wall
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
        const s = spring({ frame: frame - (start + i * 6), fps: 30, config: { damping: 14, stiffness: 120 } });
        const isKey = ['scratch', 'node', 'build'].includes(w.toLowerCase().replace(/[^a-z]/g, ''));
        return (
          <span
            key={i}
            style={{
              opacity: interpolate(s, [0, 1], [0, 1], { extrapolateLeft: 'clamp' }),
              transform: `perspective(1000px) translateZ(${interpolate(s, [0, 1], [-80, 0], { extrapolateLeft: 'clamp' })}px) rotateX(${interpolate(s, [0, 1], [20, 0], { extrapolateLeft: 'clamp' })}deg)`,
              color: isKey ? COLORS.cyan : COLORS.white,
              textShadow: isKey ? `0 0 34px ${COLORS.cyan}88` : 'none',
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
   BEAT 4 — holographic logo endcard (floating glass plates, depth)
--------------------------------------------------------------------------- */
function LogoCard3D({ frame }: { frame: number }) {
  const s = spring({ frame: frame - T.PHASE_4_LOGO.LOGO_ENTER, fps: 30, config: { damping: 13, stiffness: 120 } });
  const sub = spring({ frame: frame - T.PHASE_4_LOGO.SUBTITLE_ENTER, fps: 30, config: { damping: 14, stiffness: 110 } });
  const orbit = frame * 0.35;
  return (
    <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', zIndex: 4, perspective: 1400 }}>
      <GlassCard3D appear={T.PHASE_4_LOGO.LOGO_ENTER} depth={300} style={{ padding: '54px 84px', textAlign: 'center', maxWidth: 1200 }}>
        <div style={{ position: 'absolute', inset: -2, borderRadius: 24, border: `1px solid ${COLORS.cyan}55`, opacity: s }} />
        <div style={{ fontFamily: FONT, fontWeight: 900, fontSize: 92, color: COLORS.white, letterSpacing: '0.02em' }}>
          SYLVESTER'S <span style={{ color: COLORS.cyan, textShadow: `0 0 60px ${COLORS.cyan}88` }}>AI LAB</span>
        </div>
        <div style={{ marginTop: 24, fontFamily: MONO, fontSize: 22, letterSpacing: '0.42em', color: COLORS.muted, opacity: sub, transform: `translateZ(${sub * 120}px)` }}>
          REAL AUTOMATIONS · NOT THEORY
        </div>
      </GlassCard3D>
    </div>
  );
}

/* ---------------------------------------------------------------------------
   Scene orchestrator
--------------------------------------------------------------------------- */
function SceneContent({ frame }: { frame: number }) {
  const inChat = frame >= T.PHASE_1_CHAT.START && frame < T.PHASE_1_CHAT.END;
  const inFloat = frame >= T.PHASE_2_WORKFLOW.START && frame < T.PHASE_2_WORKFLOW.END;
  const inKinetic = frame >= T.PHASE_3_KINETIC.START && frame < T.PHASE_3_KINETIC.END;
  const inLogo = frame >= T.PHASE_4_LOGO.START;
  return (
    <>
      {inChat && <ChatHoloStation frame={frame} />}
      {inFloat && <Flowwork frame={frame} />}
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
  const sfxMessage = frame >= T.PHASE_1_CHAT.MESSAGE_ENTRY && frame <= T.PHASE_1_CHAT.MESSAGE_ENTRY + 30;
  const atWorkflow = frame >= T.PHASE_2_WORKFLOW.START && frame <= T.PHASE_2_WORKFLOW.START + 30;
  const atKinetic = frame >= T.PHASE_3_KINETIC.START && frame <= T.PHASE_3_KINETIC.START + 30;
  return (
    <div style={{ width: 1920, height: 1080, position: 'relative', background: COLORS.bg, overflow: 'hidden', fontFamily: FONT }}>
      <DepthBackground frame={frame} />
      <SceneContent frame={frame} />
      <Audio src={staticFile('audio/voiceover.wav')} />
      {sfxMessage && <Audio src={staticFile('audio/notification.wav')} startFrom={0} />}
      {atWorkflow && <Audio src={staticFile('audio/whoosh.wav')} startFrom={0} />}
      {atKinetic && <Audio src={staticFile('audio/whoosh.wav')} startFrom={1200} />}
    </div>
  );
};

export default N8nIntroScene;