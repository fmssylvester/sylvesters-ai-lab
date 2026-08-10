import React from 'react';
import {
  Audio,
  Img,
  staticFile,
  useCurrentFrame,
  interpolate,
  spring,
} from 'remotion';
import { COLORS, FONT, SPRINGS } from './theme';
import { GlassCard, KineticWords, IconChip } from './components';

const TOTAL_FRAMES = 180; // 6 seconds at 30fps

/* ---------------------------------------------------------------------------
   SCENE 1: THE HOOK (0-60 frames)
   Kinetic text and a floating "3AM" glass card.
   --------------------------------------------------------------------------- */
function SceneHook({ frame }: { frame: number }) {
  const s = spring({ frame: frame, fps: 30, config: SPRINGS.pop });
  return (
    <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10 }}>
      <div style={{ position: 'absolute', top: '30%', width: '100%', textAlign: 'center', zIndex: 11 }}>
        <KineticWords
          words={[
            { text: 'Instant', accent: true },
            { text: 'Intelligent', accent: false },
            { text: 'Replies', accent: true },
          ]}
          appear={0}
          stagger={5}
          size={100}
        />
      </div>
      <GlassCard
        appear={20}
        depth={100}
        rotate={-5}
        style={{ width: 400, padding: 40, textAlign: 'center' }}
      >
        <div style={{ fontFamily: FONT.mono, fontSize: 24, color: COLORS.muted, marginBottom: 10 }}>CURRENT STATUS</div>
        <div style={{ fontFamily: FONT.display, fontSize: 80, fontWeight: 900, color: COLORS.white }}>3:00 <span style={{ color: COLORS.accent }}>AM</span></div>
        <div style={{ marginTop: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
          <IconChip src="02_ICONS/lucide/alarm-clock.svg" color={COLORS.accent} />
          <span style={{ fontFamily: FONT.body, color: COLORS.muted }}>Processing request...</span>
        </div>
      </GlassCard>
    </div>
  );
}

/* ---------------------------------------------------------------------------
   SCENE 2: THE DEPTH (60-120 frames)
   Isometric 3D nodes with a data laser flow.
   --------------------------------------------------------------------------- */
function SceneDepth({ frame }: { frame: number }) {
  const start = 60;
  const s = spring({ frame: frame - start, fps: 30, config: SPRINGS.card });
  const travel = ((frame - start) / 30) % 1;

  return (
    <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', perspective: 1200, zIndex: 10 }}>
      <div style={{ transform: 'rotateX(45deg) rotateZ(-45deg)', display: 'flex', gap: 100, alignItems: 'center' }}>
        <GlassCard appear={start} depth={0} rotate={0} style={{ width: 200, padding: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <IconChip src="02_ICONS/lucide/webhook.svg" color={COLORS.cyan} />
            <span style={{ color: COLORS.white, fontWeight: 800 }}>Webhook</span>
          </div>
        </GlassCard>
        
        <div style={{ width: 100, height: 4, background: 'rgba(255,255,255,0.1)', position: 'relative', opacity: s }}>
           <div style={{ 
             position: 'absolute', 
             left: `${travel * 100}%`, 
             width: 12, height: 12, borderRadius: '50%', 
             background: COLORS.cyan, 
             boxShadow: `0 0 20px ${COLORS.cyan}`,
             transform: 'translate(-50%, -4px)' 
           }} />
        </div>

        <GlassCard appear={start + 10} depth={40} rotate={0} style={{ width: 200, padding: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <IconChip src="01_LOGOS/AI/openai.svg" color={COLORS.emerald} />
            <span style={{ color: COLORS.white, fontWeight: 800 }}>AI Agent</span>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------------------
   SCENE 3: THE PUNCH (120-180 frames)
   Logo slam with specular glow.
   --------------------------------------------------------------------------- */
function ScenePunch({ frame }: { frame: number }) {
  const start = 120;
  const s = spring({ frame: frame - start, fps: 30, config: SPRINGS.pop });
  
  return (
    <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10 }}>
      <GlassCard
        appear={start}
        depth={200}
        rotate={0}
        style={{ width: 600, padding: 60, textAlign: 'center' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 24 }}>
          <Img src={staticFile('01_LOGOS/brand/n8n.svg')} style={{ width: 80, height: 80 }} />
          <div style={{ fontFamily: FONT.display, fontSize: 80, fontWeight: 900, color: COLORS.white }}>
            SYLVESTER'S <span style={{ color: COLORS.accent, textShadow: `0 0 40px ${COLORS.accent}aa` }}>AI LAB</span>
          </div>
        </div>
        <div style={{ marginTop: 30, fontFamily: FONT.mono, fontSize: 20, color: COLORS.muted, letterSpacing: '0.3em', opacity: s }}>
          REAL AUTOMATIONS · NOT THEORY
        </div>
      </GlassCard>
    </div>
  );
}

export const StyleTrial: React.FC = () => {
  const frame = useCurrentFrame();

  return (
    <div style={{ width: 1920, height: 1080, position: 'relative', background: COLORS.bg, overflow: 'hidden', fontFamily: FONT.body }}>
      {/* Ambient Background */}
      <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(circle at 50% 50%, ${COLORS.canvas} 0%, ${COLORS.bg} 100%)` }} />
      <div style={{ position: 'absolute', width: '100%', height: '100%', backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.03) 1px, transparent 1px)', backgroundSize: '40px 40px', opacity: 0.5 }} />

      {frame < 60 && <SceneHook frame={frame} />}
      {frame >= 60 && frame < 120 && <SceneDepth frame={frame} />}
      {frame >= 120 && <ScenePunch frame={frame} />}
      
      {/* Cinematic Audio Sync (Simplified for trial) */}
      {frame === 0 && <Audio src={staticFile('audio/sfx/whoosh_heavy.wav')} />}
      {frame === 30 && <Audio src={staticFile('audio/sfx/ping.wav')} />}
      {frame === 60 && <Audio src={staticFile('audio/sfx/whoosh.wav')} />}
      {frame === 120 && <Audio src={staticFile('audio/sfx/impact.wav')} />}
    </div>
  );
};

export default StyleTrial;
