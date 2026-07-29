import React from 'react';
import { AbsoluteFill, useCurrentFrame, interpolate, Sequence } from 'remotion';
import { SMS_BOT_DEMO as T } from './smsBotTimeline';

const BG = '#07090D';
const CYAN = '#00D9FF';
const GOLD = '#E7B84D';
const PURPLE = '#7b2ff7';
const TEXT = '#e0e0e0';
const MUTED = '#667';

const nodeData = [
  { icon: '📞', label: 'Missed call triggers', name: 'Webhook', color: CYAN },
  { icon: '📋', label: 'Extracts caller info', name: 'Format Data', color: PURPLE },
  { icon: '🤖', label: 'Writes SMS with AI', name: 'AI SMS Generator', color: GOLD },
  { icon: '📨', label: 'Delivers via Twilio', name: 'Twilio Send', color: CYAN },
  { icon: '✅', label: 'Confirms delivery', name: 'Respond', color: PURPLE },
];

const smsData = [
  { role: 'in', text: '(Missed call from +234 812 345 6789)', time: '2 min ago' },
  { role: 'out', text: 'Hi there! We missed your call. I\'m the AI assistant for Sylvester\'s Auto Shop. You can reply here to book an appointment or ask a question. How can I help? 🚗' },
  { role: 'in', text: 'I need an oil change tomorrow' },
  { role: 'out', text: 'Sure! We have openings at 10 AM or 2 PM tomorrow. Which works for you?' },
  { role: 'in', text: '2 PM works' },
  { role: 'out', text: 'Perfect! You\'re booked for tomorrow at 2 PM. We\'ll send a reminder in the morning. See you then!' },
];

const features = [
  { icon: '📈', title: 'Capture More Leads', desc: '70% of missed calls never call back. SMS within 60 seconds changes that.' },
  { icon: '🤖', title: 'AI-Powered Replies', desc: 'Each SMS is uniquely written for the caller and your business by GPT-4o-mini.' },
  { icon: '⚡', title: 'Instant Response', desc: 'From missed call to SMS in under 5 seconds. No delay, no lost opportunities.' },
  { icon: '📱', title: 'Any Phone System', desc: 'Works with Twilio, RingCentral, VoIP, Google Voice — anything with webhooks.' },
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

export const SmsBotDemo: React.FC = () => {
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
              <span style={{ background: `linear-gradient(135deg, ${CYAN}, ${PURPLE})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                Missed Call SMS Text-Back
              </span>
            </div>
          </FadeIn>
          <FadeIn frame={frame} start={20} slide={20}>
            <div style={{ fontSize: 28, color: MUTED, marginTop: 24, textAlign: 'center', maxWidth: 650 }}>
              Never lose a lead because you missed their call
            </div>
          </FadeIn>
          <FadeIn frame={frame} start={40} slide={10}>
            <div style={{ marginTop: 44, display: 'flex', gap: 14, justifyContent: 'center' }}>
              {['Webhook', 'AI SMS', 'Twilio', 'Auto-Reply'].map((tag, i) => (
                <div key={i} style={{ padding: '10px 24px', borderRadius: 24, background: `${CYAN}15`, border: `1px solid ${CYAN}33`, color: CYAN, fontSize: 18, fontWeight: 600 }}>{tag}</div>
              ))}
            </div>
          </FadeIn>
        </Section>
      </Sequence>

      {/* WORKFLOW SCENE */}
      <Sequence from={T.WORKFLOW_SHOW.START} durationInFrames={T.WORKFLOW_SHOW.END - T.WORKFLOW_SHOW.START + 30}>
        <Section>
          <div style={{ opacity: fadeOut(T.WORKFLOW_SHOW.START, T.WORKFLOW_SHOW.END), ...container }}>
            <div style={sectionTitle}>The Automation</div>
            <div style={{ display: 'flex', gap: 16, alignItems: 'center', justifyContent: 'center', flexWrap: 'wrap' }}>
              {nodeData.map((n, i) => {
                const nStart = T.WORKFLOW_SHOW.START + T.WORKFLOW_SHOW.NODE_APPEAR * i;
                const o = interpolate(frame, [nStart, nStart + 15], [0, 1], { extrapolateRight: 'clamp', extrapolateLeft: 'clamp' });
                const y = interpolate(frame, [nStart, nStart + 15], [40, 0], { extrapolateRight: 'clamp', extrapolateLeft: 'clamp' });
                return (
                  <React.Fragment key={i}>
                    {i > 0 && <div style={{ color: '#3a3a5a', fontSize: 30, opacity: o }}>→</div>}
                    <div style={{ opacity: o, transform: `translateY(${y}px)`, background: '#14141f', border: `1px solid ${n.color}44`, borderRadius: 14, padding: '22px 30px', textAlign: 'center', minWidth: 190 }}>
                      <div style={{ fontSize: 36, marginBottom: 6 }}>{n.icon}</div>
                      <div style={{ fontSize: 16, color: MUTED, marginBottom: 4 }}>{n.label}</div>
                      <div style={{ fontSize: 22, color: n.color, fontWeight: 700 }}>{n.name}</div>
                    </div>
                  </React.Fragment>
                );
              })}
            </div>
            <div style={{ marginTop: 30, textAlign: 'center', color: MUTED, fontSize: 16 }}>
              5 connected nodes · Import in 1 click
            </div>
          </div>
        </Section>
      </Sequence>

      {/* PHONE DEMO */}
      <Sequence from={T.PHONE_DEMO.START} durationInFrames={T.PHONE_DEMO.END - T.PHONE_DEMO.START + 45}>
        <Section>
          <div style={{ opacity: fadeOut(T.PHONE_DEMO.START, T.PHONE_DEMO.END), display: 'flex', gap: 60, alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={sectionTitle}>In Action</div>
              {/* Phone frame */}
              <div style={{ width: 320, background: '#000', borderRadius: 36, padding: '14px 10px', border: '2px solid #333' }}>
                <div style={{ textAlign: 'center', paddingBottom: 10, color: '#555', fontSize: 14 }}>📱 Missed Call</div>
                <div style={{ minHeight: 420, padding: '0 4px' }}>
                  {smsData.map((sms, i) => {
                    const sStart = i * T.PHONE_DEMO.SMS_INTERVAL;
                    const o = interpolate(frame, [sStart, sStart + 15], [0, 1], { extrapolateRight: 'clamp', extrapolateLeft: 'clamp' });
                    const isIn = sms.role === 'in';
                    return (
                      <div key={i} style={{
                        opacity: o,
                        maxWidth: '88%', margin: '8px 0', padding: '12px 16px',
                        borderRadius: 16, fontSize: 16, lineHeight: 1.4,
                        background: isIn ? '#2a2a3a' : `linear-gradient(135deg, ${CYAN}33, ${PURPLE}33)`,
                        border: isIn ? 'none' : `1px solid ${CYAN}44`,
                        marginLeft: isIn ? 0 : 'auto',
                        borderBottomLeftRadius: isIn ? 4 : 16,
                        borderBottomRightRadius: isIn ? 16 : 4,
                      }}>
                        {sms.text}
                        {sms.time && <div style={{ fontSize: 12, color: '#666', marginTop: 4 }}>{sms.time}</div>}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
            <div style={{ maxWidth: 380 }}>
              <div style={{ fontSize: 32, color: CYAN, fontWeight: 700, marginBottom: 16 }}>How it works</div>
              <div style={{ color: MUTED, fontSize: 20, lineHeight: 1.6 }}>
                1. Customer calls and misses you<br />
                2. Your phone system triggers the webhook<br />
                3. AI writes a personalized SMS reply<br />
                4. Twilio sends it within seconds<br />
                5. Customer texts back to book or ask
              </div>
            </div>
          </div>
        </Section>
      </Sequence>

      {/* FEATURES */}
      <Sequence from={T.FEATURES.START} durationInFrames={T.FEATURES.END - T.FEATURES.START + 30}>
        <Section>
          <div style={{ opacity: fadeOut(T.FEATURES.START, T.FEATURES.END), ...container }}>
            <div style={sectionTitle}>Why Buy This</div>
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
              <div style={{ fontSize: 60, fontWeight: 800, marginBottom: 16 }}>
                Never miss another lead
              </div>
              <div style={{ fontSize: 26, color: MUTED, marginBottom: 10 }}>
                Import into n8n in 5 minutes · Twilio + OpenAI required
              </div>
              <div style={{ fontSize: 34, color: GOLD, fontWeight: 700, marginBottom: 28 }}>
                $29 — One-time payment
              </div>
              <div style={{ display: 'flex', gap: 16, justifyContent: 'center' }}>
                <div style={{ padding: '18px 44px', background: CYAN, color: BG, borderRadius: 12, fontWeight: 700, fontSize: 24 }}>
                  Buy on Gumroad →
                </div>
              </div>
              <div style={{ marginTop: 20, color: MUTED, fontSize: 16 }}>
                n8n.markets approved · AI-powered · Works with any phone system
              </div>
            </div>
          </FadeIn>
        </Section>
      </Sequence>

    </AbsoluteFill>
  );
};

export default SmsBotDemo;
