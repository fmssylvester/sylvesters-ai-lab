import React from "react";
import { AbsoluteFill, useCurrentFrame, interpolate } from "remotion";
import { Icon } from "./UiKit";

const FONT = "'Switzer', 'Inter', system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif";
const VOID = "#07080F";
const SURFACE = "#10141B";
const CYAN = "#00D9FF";
const GOLD = "#E7B84D";
const MUTED = "#94A3B8";

/* ================================================================== */
/* A. AgentWorkflow — multi-step node graph (core automation scene)  */
/* ================================================================== */
export const AgentWorkflow: React.FC<any> = ({
  title = "How the agent works",
  nodes = [
    { label: "Webhook trigger", icon: "zap" },
    { label: "Read email", icon: "send" },
    { label: "Classify intent", icon: "bolt" },
    { label: "Draft reply", icon: "spark" },
    { label: "Send & log", icon: "check" },
  ],
  outcome = "Fully automated in 8s",
}) => {
  const frame = useCurrentFrame();
  const flow = (frame * 8) % 40;
  const n = nodes.length;
  return (
    <AbsoluteFill style={{ background: `radial-gradient(70% 80% at 50% 30%, rgba(0,217,255,0.10), transparent 60%), ${VOID}`, fontFamily: FONT, alignItems: "center", justifyContent: "center" }}>
      <div style={{ color: "#fff", fontSize: 56, fontWeight: 800, letterSpacing: 1, marginTop: 40 }}>{title}</div>
      <div style={{ position: "relative", flexDirection: "row", alignItems: "center", marginTop: 70, display: "flex", gap: 0, paddingHorizontal: 60 }}>
        {nodes.flatMap((node: any, i: number) => {
          const appear = Math.min(1, Math.max(0, (frame - i * 10) / 14));
          const op = interpolate(appear, [0, 1], [0.15, 1]);
          const nodeEl = (
            <div key={`n${i}`} style={{ width: 230, height: 230, borderRadius: 28, background: SURFACE, border: `1px solid rgba(0,217,255,${0.3 + 0.4 * appear})`, boxShadow: `0 0 ${20 * appear}px rgba(0,217,255,${0.25 * appear})`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, opacity: op, transform: `scale(${0.85 + 0.15 * appear})` }}>
              <div style={{ width: 76, height: 76, borderRadius: "50%", background: "linear-gradient(135deg,#00D9FF,#E7B84D)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Icon name={node.icon} size={40} color="#07080F" />
              </div>
              <span style={{ color: "#fff", fontSize: 24, fontWeight: 600, textAlign: "center", padding: "0 12px" }}>{node.label}</span>
              <span style={{ color: GOLD, fontSize: 18, fontWeight: 700 }}>0{i + 1}</span>
            </div>
          );
          if (i < n - 1) {
            const conn = (
              <svg key={`c${i}`} width={90} height={20} style={{ overflow: "visible" }}>
                <defs>
                  <linearGradient id={`g${i}`} x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor={CYAN} /><stop offset="100%" stopColor={GOLD} />
                  </linearGradient>
                </defs>
                <line x1="0" y1="10" x2="90" y2="10" stroke={`url(#g${i})`} strokeWidth={4} strokeDasharray="10 10" strokeDashoffset={-flow} strokeLinecap="round" />
                <path d="M82 4 L92 10 L82 16" fill="none" stroke={GOLD} strokeWidth={4} strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            );
            return [nodeEl, conn];
          }
          return [nodeEl];
        })}
      </div>
      <div style={{ marginTop: 70, padding: "18px 46px", borderRadius: 40, background: "linear-gradient(90deg,#00D9FF,#E7B84D)", boxShadow: "0 12px 40px rgba(0,217,255,0.3)" }}>
        <span style={{ color: "#07080F", fontSize: 30, fontWeight: 800 }}>{outcome}</span>
      </div>
    </AbsoluteFill>
  );
};

/* ================================================================== */
/* B. ToolGrid — integration logos (automation = connect your tools) */
/* ================================================================== */
const TOOLS = [
  { name: "Zapier", c: "#FF4F00" }, { name: "Make", c: "#6D00CC" }, { name: "n8n", c: "#EA4B0E" },
  { name: "OpenAI", c: "#10A37F" }, { name: "Notion", c: "#FFFFFF" }, { name: "Slack", c: "#E01E5A" },
  { name: "Gmail", c: "#EA4335" }, { name: "Sheets", c: "#34A853" }, { name: "HubSpot", c: "#FF7A59" },
  { name: "Calendly", c: "#006BFF" }, { name: "Stripe", c: "#635BFF" }, { name: "Airtable", c: "#FCB400" },
];
export const ToolGrid: React.FC<any> = ({ title = "Connect every tool you already use" }) => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ background: `radial-gradient(80% 80% at 50% 20%, rgba(231,180,77,0.08), transparent 60%), ${VOID}`, fontFamily: FONT, alignItems: "center", justifyContent: "center" }}>
      <div style={{ color: "#fff", fontSize: 56, fontWeight: 800, marginBottom: 50, textAlign: "center", maxWidth: 1400 }}>{title}</div>
      <div style={{ display: "flex", flexDirection: "row", flexWrap: "wrap", gap: 26, width: 1500, justifyContent: "center" }}>
        {TOOLS.map((t, i) => {
          const appear = Math.min(1, Math.max(0, (frame - i * 5) / 14));
          return (
            <div key={i} style={{ width: 360, height: 110, borderRadius: 22, background: SURFACE, border: "1px solid rgba(255,255,255,0.1)", display: "flex", flexDirection: "row", alignItems: "center", gap: 18, padding: "0 24px", opacity: appear, transform: `translateY(${(1 - appear) * 24}px)` }}>
              <div style={{ width: 56, height: 56, borderRadius: 14, background: t.c, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: `0 0 18px ${t.c}55` }}>
                <span style={{ color: t.name === "Notion" ? "#000" : "#fff", fontSize: 24, fontWeight: 800 }}>{t.name[0]}</span>
              </div>
              <span style={{ color: "#fff", fontSize: 28, fontWeight: 600 }}>{t.name}</span>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

/* ================================================================== */
/* C. BeforeAfter — manual vs automated metrics                       */
/* ================================================================== */
export const BeforeAfter: React.FC<any> = ({
  beforeLabel = "Before · manual",
  afterLabel = "After · automated",
  before = [
    { k: "Time spent", v: "10 hrs / wk", icon: "clock" },
    { k: "Tools stitched", v: "12 apps", icon: "branch" },
    { k: "Human errors", v: "Frequent", icon: "bolt" },
  ],
  after = [
    { k: "Time spent", v: "10 min / wk", icon: "clock" },
    { k: "Tools stitched", v: "1 agent", icon: "branch" },
    { k: "Human errors", v: "Near zero", icon: "check" },
  ],
}) => {
  const frame = useCurrentFrame();
  const t = Math.min(1, frame / 40);
  const Side: React.FC<{ items: any[]; label: string; accent: string }> = ({ items, label, accent }) => (
    <div style={{ flex: 1, borderRadius: 30, background: SURFACE, border: `1px solid ${accent}55`, padding: 44, display: "flex", flexDirection: "column", gap: 26 }}>
      <span style={{ color: accent, fontSize: 30, fontWeight: 800, letterSpacing: 1 }}>{label}</span>
      {items.map((it: any, i: number) => (
        <div key={i} style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: 20, opacity: Math.min(1, Math.max(0, (frame - 14 - i * 10) / 14)) }}>
          <Icon name={it.icon} size={34} color={accent} />
          <div style={{ flex: 1 }}>
            <div style={{ color: MUTED, fontSize: 22 }}>{it.k}</div>
            <div style={{ color: "#fff", fontSize: 38, fontWeight: 800 }}>{it.v}</div>
          </div>
        </div>
      ))}
    </div>
  );
  return (
    <AbsoluteFill style={{ background: VOID, fontFamily: FONT, alignItems: "center", justifyContent: "center", padding: 70 }}>
      <div style={{ display: "flex", flexDirection: "row", gap: 40, width: "100%", alignItems: "stretch" }}>
        <Side items={before} label={beforeLabel} accent="#FF6B6B" sign={-1} />
        <div style={{ width: 120, alignItems: "center", justifyContent: "center", display: "flex" }}>
          <div style={{ width: 90, height: 90, borderRadius: "50%", background: "linear-gradient(135deg,#00D9FF,#E7B84D)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 0 30px rgba(0,217,255,0.4)", transform: `scale(${0.6 + 0.4 * t})` }}>
            <Icon name="bolt" size={44} color="#07080F" />
          </div>
        </div>
        <Side items={after} label={afterLabel} accent={CYAN} sign={1} />
      </div>
    </AbsoluteFill>
  );
};
