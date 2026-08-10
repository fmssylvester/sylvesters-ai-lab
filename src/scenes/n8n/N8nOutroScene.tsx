import React from 'react';
import { Audio, staticFile, useCurrentFrame, spring, interpolate } from 'remotion';
import { N8N_OUTRO_TIMELINE as T } from './n8nTimeline';

const COLORS = {
  bg: '#07090D',
  surface: '#0B0E14',
  cyan: '#00D9FF',
  violet: '#8A2BE2',
  white: '#FFFFFF',
  muted: '#94A3B8',
};
const FONT = 'Inter, system-ui, sans-serif';
const MONO = 'JetBrains Mono, monospace';

const specular =
  'linear-gradient(135deg, rgba(255,255,255,0.30) 0%, rgba(255,255,255,0.03) 45%, rgba(255,255,255,0.0) 100%)';

function DepthBackground({ frame }: { frame: number }) {
  const gridX = interpolate(frame % 300, [0, 300], [0, 42]);
  const gridOpacity = interpolate(Math.sin(frame / 45), [-1, 1], [0.06, 0.12]);
  const cubes = [
    { x: '8%', y: '22%', size: 80, tz: -320, c1: COLORS.cyan, c2: '#22d3ee', d: 0 },
    { x: '86%', y: '30%', size: 100, tz: -480, c1: COLORS.violet, c2: '#a855f7', d: 90 },
    { x: '72%', y: '78%', size: 70, tz: -560, c1: COLORS.cyan, c2: '#06b6d4', d: 160 },
    { x: '16%', y: '72%', size: 120, tz: -640, c1: COLORS.violet, c2: '#7c3aed', d: 30 },
  ];
  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', zIndex: 0, perspective: 1200 }}>
      <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(1300px circle at 50% 42%, ${COLORS.surface} 0%, ${COLORS.bg} 72%)` }} />
      <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(700px circle at 22% 20%, ${COLORS.cyan}26, transparent 60%), radial-gradient(640px circle at 80% 78%, ${COLORS.violet}20, transparent 60%)` }} />
      <div style={{ position: 'absolute', left: '-30%', width: '160%', height: '60%', bottom: '-18%', backgroundImage: 'linear-gradient(rgba(0,217,255,0.14) 1px, transparent 1px), linear-gradient(90deg, rgba(0,217,255,0.14) 1px, transparent 1px)', backgroundSize: '70px 70px', transform: `perspective(850px) rotateX(62deg) translateY(${gridX}px)`, opacity: gridOpacity }} />
      {cubes.map((c, i) => {
        const rot = (frame + c.d) * 0.6;
        const float = Math.sin((frame + c.d) / 34) * 12;
        return (
          <div key={i} style={{ position: 'absolute', left: c.x, top: c.y, width: c.size, height: c.size, transform: `translateZ(${c.tz}px) rotateX(${rot}deg) rotateY(${rot * 0.7}deg) translateY(${float}px)`, opacity: 0.5 }}>
            <div style={{ position: 'absolute', inset: 0, border: `1px solid ${c.c1}66`, transform: `rotateY(0deg) translateZ(${c.size / 3}px)`, background: `${c.c2}14` }} />
            <div style={{ position: 'absolute', inset: 0, border: `1px solid ${c.c1}55`, transform: `rotateY(90deg) translateZ(${c.size / 3}px)`, background: `${c.c2}10` }} />
            <div style={{ position: 'absolute', inset: 0, border: `1px solid ${c.c1}55`, transform: `rotateX(90deg) translateZ(${c.size / 3}px)`, background: `${c.c2}10` }} />
          </div>
        );
      })}
    </div>
  );
}

function FlowEdge({ appear }: { appear: number }) {
  const frame = useCurrentFrame();
  const s = spring({ frame: frame - appear, fps: 30, config: { damping: 16, stiffness: 120 } });
  const travel = (frame / 40) % 1;
  return (
    <div style={{ position: 'relative', width: 260, height: 3, transform: `scaleX(${s || 0.001})`, transformOrigin: 'left center', opacity: s }}>
      <div style={{ height: 3, background: `linear-gradient(90deg, ${COLORS.cyan}00, ${COLORS.cyan}, ${COLORS.cyan})`, boxShadow: `0 0 14px ${COLORS.cyan}aa`, borderRadius: 2 }} />
      <div style={{ position: 'absolute', left: `${travel * 100}%`, top: -3, width: 9, height: 9, borderRadius: '50%', background: '#fff', boxShadow: `0 0 16px ${COLORS.cyan}, 0 0 30px ${COLORS.cyan}`, opacity: s }} />
    </div>
  );
}

const NODES = ['Webhook', 'AI Agent', 'IF Node', 'Gmail', 'JSON Response'];

function RecapNodes({ frame }: { frame: number }) {
  const begin = T.RECAP.NODES_RECAP;
  return (
    <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', gap: 16, alignItems: 'center', justifyContent: 'center', zIndex: 3, perspective: 1200 }}>
      <div style={{ maxWidth: 1400, textAlign: 'center', fontFamily: FONT, fontWeight: 900, fontSize: 52, color: COLORS.white, marginBottom: 24, display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 10 }}>
        {'THE 5-NODE FLOW, END TO END'.split(' ').map((w, i) => {
          const s = spring({ frame: frame - (begin + i * 4), fps: 30, config: { damping: 14, stiffness: 120 } });
          return (
            <span key={i} style={{ opacity: interpolate(s, [0, 1], [0, 1], { extrapolateLeft: 'clamp' }), transform: `translateZ(${interpolate(s, [0, 1], [-60, 0], { extrapolateLeft: 'clamp' })}px)`, display: 'inline-block' }}>
              <span style={{ color: i >= 4 ? COLORS.cyan : COLORS.white, textShadow: i >= 4 ? `0 0 30px ${COLORS.cyan}77` : 'none' }}>{w}</span>
            </span>
          );
        })}
      </div>
      <div style={{ maxWidth: 1500 }}>
        {NODES.map((n, i) => {
          const s = spring({ frame: frame - (begin + 30 + i * 12), fps: 30, config: { damping: 13, stiffness: 130 } });
          return (
            <div key={n} style={{ display: 'flex', alignItems: 'center', transform: `translateZ(${i * 40}px)`, opacity: s }}>
              <div style={{ minWidth: 230, padding: '14px 22px', borderRadius: 16, background: 'rgba(255,255,255,0.07)', border: `1px solid ${COLORS.cyan}66`, boxShadow: `0 0 22px ${COLORS.cyan}44`, transform: `rotateX(${interpolate(s, [0, 1], [14, 0], { extrapolateLeft: 'clamp' })}deg)` }}>
                <span style={{ fontFamily: MONO, fontSize: 13, color: COLORS.cyan, marginRight: 12 }}>{String(i + 1).padStart(2, '0')}</span>
                <span style={{ fontFamily: FONT, fontSize: 21, fontWeight: 800, color: COLORS.white }}>{n}</span>
              </div>
              {i < NODES.length - 1 && <FlowEdge appear={begin + 30 + i * 12} />}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function EndCard({ frame }: { frame: number }) {
  const opaque = spring({ frame: frame - T.END_CARD.START, fps: 30, config: { damping: 14, stiffness: 120 } });
  const pulse = (Math.sin((frame + T.END_CARD.BUTTON_PULSE) / 20) + 1) / 2;
  const glass = (style: React.CSSProperties): React.CSSProperties => ({
    borderRadius: 24,
    padding: '42px 36px',
    background: 'rgba(255,255,255,0.06)',
    border: '1px solid rgba(0,217,255,0.28)',
    boxShadow: '0 40px 120px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.18)',
    textAlign: 'center',
    ...style,
  });
  return (
    <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 90, zIndex: 4, opacity: opaque, transform: `scale(${interpolate(opaque, [0, 1], [0.85, 1], { extrapolateLeft: 'clamp' })})`, perspective: 1400 }}>
      <div style={glass({ width: 470, transform: 'translateZ(120px) rotateY(-3deg)' })}>
        <div style={{ position: 'absolute', inset: 0, background: specular, borderRadius: 24, pointerEvents: 'none' }} />
        <div style={{ position: 'relative', fontFamily: FONT, fontWeight: 900, fontSize: 42, color: COLORS.white }}>
          SYLVESTER'S <span style={{ color: COLORS.cyan, textShadow: `0 0 40px ${COLORS.cyan}77` }}>AI LAB</span>
        </div>
        <div style={{ position: 'relative', marginTop: 14, fontFamily: MONO, fontSize: 15, letterSpacing: '0.3em', color: COLORS.muted }}>NEW TUTORIALS EVERY WEEK</div>
        <div style={{ position: 'relative', margin: '32px auto 0', padding: '18px 46px', borderRadius: 14, background: COLORS.cyan, color: COLORS.bg, fontFamily: FONT, fontWeight: 900, fontSize: 26, display: 'inline-block', boxShadow: `0 0 ${30 + pulse * 44}px ${COLORS.cyan}aa`, transform: `scale(${1 + pulse * 0.04})` }}>SUBSCRIBE</div>
      </div>
      <div style={glass({ width: 470, transform: 'translateZ(-40px) rotateY(3deg)', borderColor: 'rgba(138,43,226,0.32)', boxShadow: '0 40px 120px rgba(0,0,0,0.55), 0 0 40px rgba(138,43,226,0.25), inset 0 1px 0 rgba(255,255,255,0.15)' })}>
        <div style={{ position: 'absolute', inset: 0, background: specular, borderRadius: 24, pointerEvents: 'none' }} />
        <div style={{ position: 'relative', fontFamily: FONT, fontWeight: 800, fontSize: 30, color: COLORS.white }}>Skip the Build</div>
        <div style={{ position: 'relative', marginTop: 10, fontFamily: MONO, fontSize: 14, color: COLORS.muted }}>READY-MADE N8N TEMPLATE</div>
        <div style={{ position: 'relative', margin: '32px auto 0', padding: '18px 42px', borderRadius: 14, border: `2px solid ${COLORS.violet}`, color: COLORS.white, fontFamily: FONT, fontWeight: 800, fontSize: 22, display: 'inline-block', boxShadow: `0 0 28px ${COLORS.violet}88` }}>IMPORT TEMPLATE</div>
        <div style={{ position: 'relative', marginTop: 24, fontFamily: MONO, fontSize: 13, color: COLORS.muted }}>LINK IN DESCRIPTION</div>
      </div>
    </div>
  );
}

export const N8nOutroScene: React.FC = () => {
  const frame = useCurrentFrame();
  const inRecap = frame < T.END_CARD.START;
  return (
    <div style={{ width: 1920, height: 1080, position: 'relative', background: COLORS.bg, overflow: 'hidden', fontFamily: FONT }}>
      <DepthBackground frame={frame} />
      {inRecap ? <RecapNodes frame={frame} /> : <EndCard frame={frame} />}
      <Audio src={staticFile('audio/voiceover.mp3')} />
    </div>
  );
};

export default N8nOutroScene;