import React from 'react';
import { AbsoluteFill, useCurrentFrame, interpolate, Sequence } from 'remotion';
import { AI_AGENT_DEMO as T } from './aiAgentTimeline';

const BG = '#07090D';
const CYAN = '#00D9FF';
const GOLD = '#E7B84D';
const TEXT = '#e0e0e0';
const MUTED = '#667';

const nodeData = [
  { icon: '🌐', label: 'Receives from', name: 'Webhook', color: CYAN },
  { icon: '🧠', label: '20-msg memory', name: 'Memory', color: GOLD },
  { icon: '🤖', label: 'Processes with', name: 'AI Agent', color: CYAN },
  { icon: '🧮', label: 'Calculator + Wiki', name: 'Built-in Tools', color: GOLD },
  { icon: '📨', label: 'Sends back', name: 'Webhook Reply', color: CYAN },
];

const chatMsgs = [
  { role: 'user', text: 'What is 342 × 567?' },
  { role: 'ai', text: "Let me calculate that for you. 342 × 567 = **193,914**." },
  { role: 'user', text: 'Who founded Wikipedia and when?' },
  { role: 'ai', text: 'Jimmy Wales and Larry Sanger founded Wikipedia on **January 15, 2001**. It started as a complement to Nupedia.' },
  { role: 'user', text: "What's 15% of 2,450?" },
  { role: 'ai', text: '15% of 2,450 is **367.5**. Calculated: 2,450 × 0.15 = 367.5' },
];

const features = [
  { icon: '🧠', title: '20-Message Memory', desc: 'Remembers full conversation context across messages' },
  { icon: '🧮', title: 'Calculator Tool', desc: 'Solves math, conversions, equations instantly' },
  { icon: '📚', title: 'Wikipedia Tool', desc: 'Researches facts, history, science, and more' },
  { icon: '🔌', title: 'Webhook API', desc: 'Integrates with any frontend via JSON POST/response' },
];

const Section: React.FC<{ children: React.ReactNode; style?: React.CSSProperties }> = ({ children, style }) => (
  <AbsoluteFill style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', ...style }}>
    {children}
  </AbsoluteFill>
);

const FadeIn: React.FC<{ frame: number; start: number; duration?: number; children: React.ReactNode; style?: React.CSSProperties; slide?: number }> = ({ frame, start, duration = 20, children, style, slide = 20 }) => {
  const opacity = interpolate(frame, [start, start + duration], [0, 1], { extrapolateRight: 'clamp', extrapolateLeft: 'clamp' });
  const y = interpolate(frame, [start, start + duration], [slide, 0], { extrapolateRight: 'clamp', extrapolateLeft: 'clamp' });
  return <div style={{ opacity, transform: `translateY(${y}px)`, ...style }}>{children}</div>;
};

const container: React.CSSProperties = { width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '60px 80px' };
const sectionTitle: React.CSSProperties = { fontSize: 52, color: CYAN, fontWeight: 700, textAlign: 'center', marginBottom: 50 };

export const AiAgentDemo: React.FC = () => {
  const frame = useCurrentFrame();

  const fadeOut = (start: number, end: number) =>
    interpolate(frame, [start - 15, start, end, end + 15], [0, 1, 1, 0], { extrapolateRight: 'clamp', extrapolateLeft: 'clamp' });

  return (
    <AbsoluteFill style={{ background: BG, fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', color: TEXT }}>

      {/* INTRO */}
      <Sequence from={T.INTRO.START} durationInFrames={T.INTRO.END - T.INTRO.START + 30}>
        <Section>
          <FadeIn frame={frame} start={0} slide={30}>
            <div style={{ fontSize: 72, fontWeight: 800, textAlign: 'center', lineHeight: 1.2 }}>
              <span style={{ background: `linear-gradient(135deg, ${CYAN}, ${GOLD})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                AI Agent with<br />Memory &amp; Tools
              </span>
            </div>
          </FadeIn>
          <FadeIn frame={frame} start={20} slide={20}>
            <div style={{ fontSize: 28, color: MUTED, marginTop: 24, textAlign: 'center', maxWidth: 700 }}>
              Conversational AI that remembers, calculates & researches
            </div>
          </FadeIn>
          <FadeIn frame={frame} start={40} slide={10}>
            <div style={{ marginTop: 40, display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
              {['Memory', 'Calculator', 'Wikipedia', 'API'].map((tag, i) => (
                <div key={i} style={{ padding: '12px 28px', borderRadius: 28, background: `${CYAN}15`, border: `1px solid ${CYAN}33`, color: CYAN, fontSize: 18, fontWeight: 600 }}>{tag}</div>
              ))}
            </div>
          </FadeIn>
        </Section>
      </Sequence>

      {/* WORKFLOW */}
      <Sequence from={T.WORKFLOW_SHOW.START} durationInFrames={T.WORKFLOW_SHOW.END - T.WORKFLOW_SHOW.START + 30}>
        <Section>
          <div style={{ opacity: fadeOut(T.WORKFLOW_SHOW.START, T.WORKFLOW_SHOW.END), ...container }}>
            <div style={sectionTitle}>The Workflow</div>
            <div style={{ display: 'flex', gap: 16, alignItems: 'center', justifyContent: 'center', flexWrap: 'wrap' }}>
              {nodeData.map((n, i) => {
                const nStart = T.WORKFLOW_SHOW.START + T.WORKFLOW_SHOW.NODE_APPEAR * i;
                const o = interpolate(frame, [nStart, nStart + 15], [0, 1], { extrapolateRight: 'clamp', extrapolateLeft: 'clamp' });
                const y = interpolate(frame, [nStart, nStart + 15], [40, 0], { extrapolateRight: 'clamp', extrapolateLeft: 'clamp' });
                return (
                  <React.Fragment key={i}>
                    {i > 0 && <div style={{ color: '#3a3a5a', fontSize: 32, opacity: o }}>→</div>}
                    <div style={{ opacity: o, transform: `translateY(${y}px)`, background: '#14141f', border: `1px solid ${n.color}44`, borderRadius: 16, padding: '24px 32px', textAlign: 'center', minWidth: 200 }}>
                      <div style={{ fontSize: 40, marginBottom: 6 }}>{n.icon}</div>
                      <div style={{ fontSize: 16, color: MUTED, marginBottom: 4 }}>{n.label}</div>
                      <div style={{ fontSize: 24, color: n.color, fontWeight: 700 }}>{n.name}</div>
                    </div>
                  </React.Fragment>
                );
              })}
            </div>
            <div style={{ fontSize: 16, color: MUTED, textAlign: 'center', marginTop: 30 }}>
              5 connected nodes · 2 built-in tools · 20-msg memory
            </div>
          </div>
        </Section>
      </Sequence>

      {/* CHAT DEMO */}
      <Sequence from={T.CHAT_DEMO.START} durationInFrames={T.CHAT_DEMO.END - T.CHAT_DEMO.START + 45}>
        <Section>
          <div style={{ width: 900, maxWidth: '90%', opacity: fadeOut(T.CHAT_DEMO.START, T.CHAT_DEMO.END) }}>
            <div style={sectionTitle}>Live Conversation</div>
            <div style={{ background: '#0d0f17', border: `1px solid #1a1a2e`, borderRadius: 16, overflow: 'hidden' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '18px 24px', borderBottom: '1px solid #1a1a2e' }}>
                <div style={{ width: 40, height: 40, borderRadius: '50%', background: `linear-gradient(135deg, ${CYAN}, ${GOLD})`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, fontWeight: 700 }}>AI</div>
                <div style={{ fontSize: 20 }}><strong>Agent</strong> <span style={{ color: CYAN, fontSize: 15 }}>● Online</span> <span style={{ color: MUTED, fontSize: 15 }}>— Memory + Tools</span></div>
              </div>
              <div style={{ padding: 24, minHeight: 360 }}>
                {chatMsgs.map((msg, i) => {
                  const msgStart = i * T.CHAT_DEMO.MSG_INTERVAL;
                  const o = interpolate(frame, [msgStart, msgStart + 15], [0, 1], { extrapolateRight: 'clamp', extrapolateLeft: 'clamp' });
                  const y = interpolate(frame, [msgStart, msgStart + 10], [30, 0], { extrapolateRight: 'clamp', extrapolateLeft: 'clamp' });
                  const isUser = msg.role === 'user';
                  return (
                    <div key={i} style={{
                      opacity: o, transform: `translateY(${y}px)`,
                      maxWidth: '80%', margin: '12px 0', padding: '16px 22px',
                      borderRadius: 16, fontSize: 24, lineHeight: 1.5,
                      background: isUser ? '#1a1a2e' : `${CYAN}0d`,
                      border: isUser ? 'none' : `1px solid ${CYAN}22`,
                      marginLeft: isUser ? 0 : 'auto',
                      borderBottomLeftRadius: isUser ? 4 : 16,
                      borderBottomRightRadius: isUser ? 16 : 4,
                    }}>
                      {!isUser && <div style={{ color: CYAN, fontSize: 18, fontWeight: 600, marginBottom: 4 }}>Agent</div>}
                      {msg.text.split(/(\*\*[^*]+\*\*)/).map((part, pi) =>
                        part.startsWith('**') && part.endsWith('**')
                          ? <span key={pi} style={{ color: GOLD, fontWeight: 700 }}>{part.slice(2, -2)}</span>
                          : part
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </Section>
      </Sequence>

      {/* FEATURES */}
      <Sequence from={T.FEATURES.START} durationInFrames={T.FEATURES.END - T.FEATURES.START + 30}>
        <Section>
          <div style={{ opacity: fadeOut(T.FEATURES.START, T.FEATURES.END), ...container }}>
            <div style={sectionTitle}>What You Get</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, maxWidth: 900 }}>
              {features.map((f, i) => {
                const fStart = i * T.FEATURES.FEATURE_INTERVAL;
                const o = interpolate(frame, [fStart, fStart + 15], [0, 1], { extrapolateRight: 'clamp', extrapolateLeft: 'clamp' });
                const y = interpolate(frame, [fStart, fStart + 12], [30, 0], { extrapolateRight: 'clamp', extrapolateLeft: 'clamp' });
                return (
                  <div key={i} style={{ opacity: o, transform: `translateY(${y}px)`, background: '#0d0f17', border: '1px solid #1a1a2e', borderRadius: 16, padding: 28 }}>
                    <div style={{ fontSize: 40, marginBottom: 12 }}>{f.icon}</div>
                    <div style={{ color: CYAN, fontWeight: 700, fontSize: 26, marginBottom: 8 }}>{f.title}</div>
                    <div style={{ color: MUTED, fontSize: 20 }}>{f.desc}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </Section>
      </Sequence>

      {/* CTA */}
      <Sequence from={T.CTA.START} durationInFrames={T.CTA.END - T.CTA.START}>
        <Section>
          <FadeIn frame={frame} start={0} slide={30}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 60, fontWeight: 800, marginBottom: 20 }}>
                Ready to build?
              </div>
              <div style={{ fontSize: 26, color: MUTED, marginBottom: 10 }}>
                Import into n8n in 5 minutes · No coding required
              </div>
              <div style={{ fontSize: 34, color: GOLD, fontWeight: 700, marginBottom: 30 }}>
                $49 — One-time payment
              </div>
              <div style={{ display: 'flex', gap: 16, justifyContent: 'center' }}>
                <div style={{ padding: '18px 44px', background: CYAN, color: BG, borderRadius: 12, fontWeight: 700, fontSize: 24 }}>
                  Buy on Gumroad →
                </div>
              </div>
              <div style={{ marginTop: 18, color: MUTED, fontSize: 18 }}>
                Calculator + Wikipedia · 20-msg memory · Webhook API
              </div>
            </div>
          </FadeIn>
        </Section>
      </Sequence>

    </AbsoluteFill>
  );
};

export default AiAgentDemo;
