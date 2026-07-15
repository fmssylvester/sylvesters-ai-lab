import React from "react";
import { AbsoluteFill, useCurrentFrame, interpolate } from "remotion";

/* ================================================================== */
/*  Shared helpers                                                    */
/* ================================================================== */
const FONT = "'Switzer', 'Inter', system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif";

const Sphere: React.FC<{ size: number; x: number; y: number; color: string; blur?: number }> = ({ size, x, y, color, blur = 0 }) => (
  <div style={{
    position: "absolute", left: x, top: y, width: size, height: size, borderRadius: "50%",
    background: `radial-gradient(circle at 35% 30%, rgba(255,255,255,0.9), ${color} 60%, rgba(0,0,0,0.15))`,
    boxShadow: "0 30px 60px rgba(0,0,0,0.18)", filter: blur ? `blur(${blur}px)` : undefined,
  }} />
);

export const Icon: React.FC<{ name: string; size?: number; color?: string }> = ({ name, size = 28, color = "#fff" }) => {
  const s = size;
  const common = { width: s, height: s, fill: color };
  const stroke = { width: s, height: s, stroke: color, fill: "none", strokeWidth: s * 0.08 };
  switch (name) {
    case "snowflake": return (<svg viewBox="0 0 24 24" {...stroke}><path d="M12 2v20M2 12h20M5 5l14 14M19 5L5 19" /></svg>);
    case "arrowUpRight": return (<svg viewBox="0 0 24 24" {...stroke}><path d="M7 17L17 7M9 7h8v8" /></svg>);
    case "bolt": return (<svg viewBox="0 0 24 24" {...common}><path d="M13 2L4 14h6l-1 8 9-12h-6z" /></svg>);
    case "home": return (<svg viewBox="0 0 24 24" {...stroke}><path d="M4 11l8-7 8 7M6 10v10h12V10" /></svg>);
    case "search": return (<svg viewBox="0 0 24 24" {...stroke}><circle cx="11" cy="11" r="7" /><path d="M21 21l-4-4" /></svg>);
    case "film": return (<svg viewBox="0 0 24 24" {...stroke}><rect x="3" y="4" width="18" height="16" rx="2" /><path d="M8 4v16M16 4v16M3 9h5M3 15h5M16 9h5M16 15h5" /></svg>);
    case "folder": return (<svg viewBox="0 0 24 24" {...stroke}><path d="M3 7a2 2 0 012-2h4l2 2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" /></svg>);
    case "info": return (<svg viewBox="0 0 24 24" {...stroke}><circle cx="12" cy="12" r="9" /><path d="M12 11v5M12 8h.01" /></svg>);
    case "gear": return (<svg viewBox="0 0 24 24" {...stroke}><circle cx="12" cy="12" r="3.2" /><path d="M12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M19 5l-2 2M7 17l-2 2" /></svg>);
    case "logout": return (<svg viewBox="0 0 24 24" {...stroke}><path d="M15 4h3a2 2 0 012 2v12a2 2 0 01-2 2h-3M10 12h10M17 8l4 4-4 4" /></svg>);
    case "mic": return (<svg viewBox="0 0 24 24" {...stroke}><rect x="9" y="3" width="6" height="11" rx="3" /><path d="M5 11a7 7 0 0014 0M12 18v3" /></svg>);
    case "send": return (<svg viewBox="0 0 24 24" {...common}><path d="M3 11l18-8-8 18-2-8z" /></svg>);
    case "plus": return (<svg viewBox="0 0 24 24" {...stroke}><path d="M12 5v14M5 12h14" /></svg>);
    case "link": return (<svg viewBox="0 0 24 24" {...stroke}><path d="M9 15l6-6M10 6l1-1a4 4 0 016 6l-1 1M14 18l-1 1a4 4 0 01-6-6l1-1" /></svg>);
    case "feather": return (<svg viewBox="0 0 24 24" {...stroke}><path d="M20 4C10 6 5 12 4 20M20 4c-2 8-8 13-16 16" /></svg>);
    case "youtube": return (<svg viewBox="0 0 24 24" {...common}><path d="M22 8a3 3 0 00-3-2c-2-.2-8-.2-10 0a3 3 0 00-3 2c-.2 2-.2 6 0 8a3 3 0 003 2c2 .2 8 .2 10 0a3 3 0 003-2c.2-2 .2-6 0-8zM10 9v6l5-3z" /></svg>);
    case "medium": return (<svg viewBox="0 0 24 24" {...common}><circle cx="7" cy="12" r="3" /><path d="M14 8c2 0 3 2 3 4s-1 4-3 4M19 7c2 1 2 9 0 10" fill="none" stroke={color} strokeWidth={s * 0.12} /></svg>);
    case "github": return (<svg viewBox="0 0 24 24" {...common}><path d="M12 2a10 10 0 00-3 19c.5.1.7-.2.7-.5v-2c-3 .6-3.6-1.4-3.6-1.4-.5-1.2-1.1-1.5-1.1-1.5-.9-.6.1-.6.1-.6 1 .1 1.5 1 1.5 1 .9 1.6 2.4 1.1 3 .8.1-.6.3-1.1.6-1.4-2.2-.2-4.6-1.1-4.6-5 0-1.1.4-2 1-2.7-.1-.3-.4-1.3.1-2.7 0 0 .8-.3 2.7 1a9.4 9.4 0 015 0c1.9-1.3 2.7-1 2.7-1 .5 1.4.2 2.4.1 2.7.6.7 1 1.6 1 2.7 0 3.9-2.3 4.8-4.5 5 .4.3.7.9.7 1.9v2.8c0 .3.2.6.7.5A10 10 0 0012 2z" /></svg>);
    case "leetcode": return (<svg viewBox="0 0 24 24" {...common}><path d="M14 4l6 6-6 6M10 20l-6-6 6-6M14 4l-4 16" /></svg>);
    case "doc": return (<svg viewBox="0 0 24 24" {...stroke}><path d="M6 3h8l4 4v14H6zM14 3v4h4" /><path d="M9 13h6M9 17h6" /></svg>);
    case "arrowUp": return (<svg viewBox="0 0 24 24" {...common}><path d="M12 4l-7 8h4v8h6v-8h4z" /></svg>);
    case "voice": return (<svg viewBox="0 0 24 24" {...common}><path d="M12 3a8 8 0 00-8 8 8 8 0 0016 0 8 8 0 00-8-8zm0 4a4 4 0 014 4 4 4 0 01-8 0 4 4 0 014-4z" /></svg>);
    case "zap": return (<svg viewBox="0 0 24 24" {...common}><path d="M13 2L4 14h6l-1 8 9-12h-6z" /></svg>);
    case "check": return (<svg viewBox="0 0 24 24" {...stroke}><path d="M4 12l5 5L20 6" /></svg>);
    case "branch": return (<svg viewBox="0 0 24 24" {...stroke}><circle cx="7" cy="6" r="2.4" /><circle cx="7" cy="18" r="2.4" /><circle cx="17" cy="12" r="2.4" /><path d="M7 8v8M9 6h6a2 2 0 012 2v2M9 18h6a2 2 0 002-2v-2" /></svg>);
    case "clock": return (<svg viewBox="0 0 24 24" {...stroke}><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 3" /></svg>);
    case "spark": return (<svg viewBox="0 0 24 24" {...common}><path d="M12 2l2 7 7 2-7 2-2 7-2-7-7-2 7-2z" /></svg>);
    default: return (<svg viewBox="0 0 24 24" {...stroke}><circle cx="12" cy="12" r="8" /></svg>);
  }
};

const bin = (seed: number, n: number) => Array.from({ length: n }, (_, i) => ((i * 9301 + seed * 49297) % 233280 % 2)).join("");

/* ================================================================== */
/* 1. GlassPoster — neutral beige glassmorphism                       */
/* ================================================================== */
export const GlassPoster: React.FC<any> = ({ heading = "KEEP PUSHING FORWARD!", sub = "A glassmorphism exploration" }) => {
  const frame = useCurrentFrame();
  const shimmer = (frame % 160) / 160;
  return (
    <AbsoluteFill style={{ background: "linear-gradient(135deg,#ECE4D6,#DCD2BD)", fontFamily: FONT, overflow: "hidden" }}>
      <Sphere size={240} x={180} y={120} color="#E8DABC" />
      <Sphere size={170} x={1500} y={60} color="#8392A9" />
      <Sphere size={280} x={1280} y={560} color="#FFFFFF" />
      <Sphere size={150} x={360} y={700} color="#C9B79C" />
      <Sphere size={130} x={760} y={200} color="#8392A9" blur={2} />
      <Sphere size={110} x={980} y={780} color="#E8DABC" blur={2} />
      <div style={{ position: "absolute", top: 56, left: 64, right: 64, display: "flex", flexDirection: "row", justifyContent: "space-between" }}>
        <span style={{ color: "#3A3A3A", fontSize: 26, fontWeight: 600, letterSpacing: 2 }}>FIGMA COMPOSITION</span>
        <span style={{ color: "#3A3A3A", fontSize: 26, fontWeight: 600, letterSpacing: 2 }}>DESIGN 2025</span>
      </div>
      <div style={{ position: "absolute", left: "50%", top: "50%", width: 1080, height: 620, transform: "translate(-50%,-50%)", borderRadius: 28, background: "rgba(255,255,255,0.22)", backdropFilter: "blur(14px)", border: "1px solid rgba(255,255,255,0.55)", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: 0, bottom: 0, width: 220, left: shimmer * 1100 - 220, background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.5), transparent)", transform: "skewX(-18deg)" }} />
        <div style={{ textAlign: "center", padding: 40 }}>
          <div style={{ color: "#fff", fontSize: 74, fontWeight: 800, letterSpacing: 1, textShadow: "0 2px 12px rgba(0,0,0,0.18)" }}>{heading}</div>
        </div>
      </div>
      <div style={{ position: "absolute", bottom: 56, left: 64, right: 64, display: "flex", flexDirection: "row", justifyContent: "space-between" }}>
        <span style={{ color: "#3A3A3A", fontSize: 26, fontWeight: 600, letterSpacing: 2 }}>GLASS EFFECT</span>
        <span style={{ color: "#3A3A3A", fontSize: 26, fontWeight: 600, letterSpacing: 2 }}>BY BORINGTHINGS</span>
      </div>
    </AbsoluteFill>
  );
};

/* ================================================================== */
/* 2. GamifiedBanner — RoomStake neon-green fan                       */
/* ================================================================== */
export const GamifiedBanner: React.FC<any> = ({
  brand = "RoomStake.com",
  heading = "Many play. One wins. None lose.",
  sub = "Every deposit returns, minus a small fee — the thrill stays.",
  cta = "Choose a room",
  big = "60",
}) => {
  const frame = useCurrentFrame();
  const sway = Math.sin(frame / 40) * 2;
  const cards = [-32, -22, -12, 0, 12, 22, 32];
  return (
    <AbsoluteFill style={{ background: "radial-gradient(70% 90% at 50% 30%, #16240a, #060a03)", fontFamily: FONT, alignItems: "center", justifyContent: "center" }}>
      <div style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: 14, marginTop: 40 }}>
        <svg viewBox="0 0 24 24" width={34} height={34} fill="#fff"><path d="M12 3l5 9H7zM12 21l-5-9h10z" /></svg>
        <span style={{ color: "#fff", fontSize: 32, fontWeight: 700 }}>{brand}</span>
      </div>
      <div style={{ color: "#fff", fontSize: 58, fontWeight: 800, marginTop: 28, textAlign: "center", maxWidth: 1400 }}>{heading}</div>
      <div style={{ color: "rgba(196,255,0,0.85)", fontSize: 26, marginTop: 12, textAlign: "center", maxWidth: 1200 }}>{sub}</div>
      <div style={{ position: "relative", width: 900, height: 360, marginTop: 30, display: "flex", alignItems: "center", justifyContent: "center" }}>
        {cards.map((rot, i) => {
          const off = Math.abs(rot);
          const isCenter = rot === 0;
          return (
            <div key={i} style={{ position: "absolute", width: 200, height: 300, borderRadius: 20, display: "flex", alignItems: "center", justifyContent: "center", transform: `rotate(${rot + sway}deg) translateY(${off * 6}px) scale(${isCenter ? 1.08 : 1 - off * 0.03})`, opacity: isCenter ? 1 : 0.82, background: "linear-gradient(180deg,#101c00,#C4FF00)", boxShadow: "0 20px 50px rgba(0,0,0,0.5), inset 0 0 30px rgba(255,255,255,0.25)", border: "1px solid rgba(255,255,255,0.4)" }}>
              {isCenter && <span style={{ color: "#000", fontSize: 64, fontWeight: 800 }}>{big}</span>}
            </div>
          );
        })}
      </div>
      <div style={{ marginTop: 30, padding: "20px 60px", borderRadius: 40, background: "linear-gradient(90deg,#C4FF00,#9BCC00)", boxShadow: "0 12px 40px rgba(196,255,0,0.35)" }}>
        <span style={{ color: "#0a1400", fontSize: 30, fontWeight: 800, letterSpacing: 1 }}>{cta}</span>
      </div>
    </AbsoluteFill>
  );
};

/* ================================================================== */
/* 3. DataFlowDashboard — Gyanaguru green->purple->blue flow          */
/* ================================================================== */
export const DataFlowDashboard: React.FC<any> = ({
  title = "Gyanaguru 2.0",
  tag = "Beta",
  sources = [
    { label: "YouTube", icon: "youtube" },
    { label: "Medium", icon: "medium" },
    { label: "GitHub", icon: "github" },
    { label: "Leetcode", icon: "leetcode" },
    { label: "PDF, Word, other docs", icon: "doc" },
  ],
}) => {
  const frame = useCurrentFrame();
  const dash = (frame * 6) % 40;
  const fx = 1500, fy = 540;
  return (
    <AbsoluteFill style={{ background: "radial-gradient(80% 100% at 70% 30%, #14122a, #06060f)", fontFamily: FONT }}>
      <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
        <defs>
          <linearGradient id="flow" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#00FF00" />
            <stop offset="50%" stopColor="#6A0DAD" />
            <stop offset="100%" stopColor="#00FFFF" />
          </linearGradient>
        </defs>
        {sources.map((_, i) => {
          const y = 220 + i * 130;
          return (<path key={i} d={`M380 ${y} C 900 ${y}, 1100 ${fy}, ${fx} ${fy}`} fill="none" stroke="url(#flow)" strokeWidth={3} style={{ filter: "drop-shadow(0 0 6px rgba(0,255,255,0.6))" }} />);
        })}
      </svg>
      <div style={{ position: "absolute", left: 120, top: 190, display: "flex", flexDirection: "column", gap: 30 }}>
        {sources.map((s, i) => (
          <div key={i} style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: 18 }}>
            <Icon name={s.icon} size={42} color="#fff" />
            <span style={{ color: "#fff", fontSize: 30, fontWeight: 500 }}>{s.label}</span>
          </div>
        ))}
      </div>
      <div style={{ position: "absolute", left: fx - 260, top: fy - 160, width: 440 }}>
        <div style={{ color: "#fff", fontSize: 74, fontWeight: 800 }}>{title}</div>
        <div style={{ color: "rgba(255,255,255,0.7)", fontSize: 30, marginTop: 6 }}>{tag}</div>
        <div style={{ marginTop: 18, height: 8, width: 380, borderRadius: 4, background: "linear-gradient(90deg,#00FF00,#FFFF00,#00FFFF,#6A0DAD)", boxShadow: "0 0 16px rgba(0,255,255,0.5)" }} />
      </div>
      <div style={{ position: "absolute", left: fx - 10, top: fy - 10, width: 20, height: 20, borderRadius: "50%", background: "#00FFFF", boxShadow: "0 0 24px #00FFFF" }} />
    </AbsoluteFill>
  );
};

/* ================================================================== */
/* 4. PromptInputBar — pink/yellow neon prompt bar                    */
/* ================================================================== */
export const PromptInputBar: React.FC<any> = ({
  query = "Provide complex widgets to improve d",
  typed = "Provide complex widgets to improve d",
}) => {
  const frame = useCurrentFrame();
  const n = Math.min(typed.length, Math.floor(frame / 2));
  return (
    <AbsoluteFill style={{ background: "#08080d", fontFamily: FONT, alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
      <div style={{ position: "absolute", left: 120, top: 120, color: "rgba(255,138,61,0.32)", fontSize: 22, fontFamily: "monospace", maxWidth: 520, lineHeight: 1.6 }}>{bin(1, 240)}</div>
      <div style={{ position: "absolute", right: 120, bottom: 120, color: "rgba(83,140,255,0.30)", fontSize: 22, fontFamily: "monospace", maxWidth: 520, textAlign: "right", lineHeight: 1.6 }}>{bin(7, 240)}</div>
      <div style={{ position: "absolute", left: -120, top: "40%", width: 700, height: 500, borderRadius: "50%", background: "radial-gradient(circle, rgba(255,138,61,0.35), transparent 65%)", filter: "blur(50px)" }} />
      <div style={{ position: "absolute", right: -120, top: "40%", width: 700, height: 500, borderRadius: "50%", background: "radial-gradient(circle, rgba(83,140,255,0.35), transparent 65%)", filter: "blur(50px)" }} />
      <div style={{ width: 1500, height: 96, borderRadius: 48, padding: 2, background: "linear-gradient(135deg,#E95479,#F4C430)", boxShadow: "0 0 30px rgba(233,84,121,0.45)" }}>
        <div style={{ width: "100%", height: "100%", borderRadius: 46, background: "rgba(0,0,0,0.6)", display: "flex", flexDirection: "row", alignItems: "center", paddingHorizontal: 26, gap: 18 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "12px 26px", borderRadius: 30, background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)" }}>
            <span style={{ color: "#fff", fontSize: 26, fontWeight: 600 }}>Prompts</span>
          </div>
          <span style={{ color: "#fff", fontSize: 28, flex: 1 }}>{typed.slice(0, n)}<span style={{ color: "#E95479" }}>|</span></span>
          <div style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: 12, padding: "8px 18px", borderRadius: 30, background: "rgba(255,255,255,0.08)" }}>
            <Icon name="mic" size={26} color="#fff" />
            <span style={{ color: "#fff", fontSize: 24 }}>Mic</span>
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

/* ================================================================== */
/* 5. VoiceBanner — Discord-style ask bar (pink/blue)                 */
/* ================================================================== */
export const VoiceBanner: React.FC<any> = ({
  placeholder = "Ask anything...",
  left = "Normal",
  right = "DeepThink",
}) => {
  const frame = useCurrentFrame();
  const glow = (Math.sin(frame / 12) + 1) / 2;
  return (
    <AbsoluteFill style={{ background: "#07070c", fontFamily: FONT, alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
      <div style={{ position: "absolute", left: -120, top: "30%", width: 700, height: 500, borderRadius: "50%", background: "radial-gradient(circle, rgba(238,82,255,0.32), transparent 65%)", filter: "blur(55px)" }} />
      <div style={{ position: "absolute", right: -120, top: "30%", width: 700, height: 500, borderRadius: "50%", background: "radial-gradient(circle, rgba(83,140,255,0.32), transparent 65%)", filter: "blur(55px)" }} />
      <div style={{ position: "absolute", left: 100, top: 90, color: "rgba(238,82,255,0.3)", fontSize: 22, fontFamily: "monospace", maxWidth: 480, lineHeight: 1.6 }}>{bin(3, 220)}</div>
      <div style={{ position: "absolute", right: 100, bottom: 90, color: "rgba(83,140,255,0.3)", fontSize: 22, fontFamily: "monospace", maxWidth: 480, textAlign: "right", lineHeight: 1.6 }}>{bin(9, 220)}</div>
      <div style={{ width: 1500, height: 92, borderRadius: 46, padding: 2, background: "linear-gradient(90deg,#EE52FF,#538CFF)", boxShadow: `0 0 ${24 + 14 * glow}px rgba(238,82,255,0.4)` }}>
        <div style={{ width: "100%", height: "100%", borderRadius: 44, background: "rgba(10,10,16,0.92)", display: "flex", flexDirection: "row", alignItems: "center", paddingHorizontal: 22, gap: 16 }}>
          <div style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: 10, padding: "10px 18px", borderRadius: 24, background: "rgba(255,255,255,0.08)" }}>
            <Icon name="feather" size={22} color="#fff" /><span style={{ color: "#fff", fontSize: 24 }}>{left}</span>
          </div>
          <div style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: 10, padding: "10px 18px", borderRadius: 24, background: "rgba(255,255,255,0.14)", border: "1px solid rgba(255,255,255,0.25)" }}>
            <Icon name="bolt" size={22} color="#fff" /><span style={{ color: "#fff", fontSize: 24 }}>{right}</span>
          </div>
          <span style={{ color: "rgba(255,255,255,0.5)", fontSize: 28, flex: 1 }}>{placeholder}</span>
          <div style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: 10, padding: "0 22px", height: 64, borderRadius: 32, background: "rgba(255,255,255,0.16)" }}>
            <Icon name="voice" size={28} color="#fff" />
            <span style={{ color: "#fff", fontSize: 24 }}>Voice</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 64, height: 64, borderRadius: "50%", background: "linear-gradient(135deg,#EE52FF,#538CFF)" }}>
            <Icon name="arrowUp" size={30} color="#fff" />
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

/* ================================================================== */
/* 6. OtpSheet — black OTP bottom sheet                               */
/* ================================================================== */
export const OtpSheet: React.FC<any> = ({
  title = "Let's verify your number",
  filled = ["1", "2"],
  resend = "Resend",
}) => {
  const frame = useCurrentFrame();
  const lit = Math.min(3, Math.floor(frame / 18));
  const digits = ["1", "2", "", ""];
  return (
    <AbsoluteFill style={{ background: "#1A1A1A", fontFamily: FONT, alignItems: "center", justifyContent: "flex-end" }}>
      <div style={{ width: 1000, marginBottom: 80, borderRadius: 28, background: "#1A1A1A", padding: "50px 50px 30px", display: "flex", flexDirection: "column", alignItems: "center", boxShadow: "0 -10px 60px rgba(0,0,0,0.6)", border: "1px solid rgba(255,255,255,0.08)" }}>
        <div style={{ width: 44, height: 5, borderRadius: 3, background: "#444", marginBottom: 26 }} />
        <div style={{ color: "#fff", fontSize: 42, fontWeight: 700, textAlign: "center" }}>{title}</div>
        <div style={{ display: "flex", flexDirection: "row", gap: 20, marginTop: 40 }}>
          {[0, 1, 2, 3].map((i) => {
            const active = i === lit;
            return (
              <div key={i} style={{ width: 92, height: 92, borderRadius: 12, background: "#000", border: `2px solid ${active ? "#FF4500" : "#A0A0A0"}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <span style={{ color: "#fff", fontSize: 40, fontWeight: 700 }}>{digits[i]}</span>
              </div>
            );
          })}
        </div>
        <div style={{ display: "flex", flexDirection: "row", marginTop: 36, fontSize: 26, color: "#A0A0A0" }}>
          <span>Didn't receive the code? </span>
          <span style={{ color: "#0066FF", fontWeight: 600 }}>{resend}</span>
        </div>
        <div style={{ width: 110, height: 5, borderRadius: 3, background: "#444", marginTop: 30 }} />
      </div>
    </AbsoluteFill>
  );
};

/* ================================================================== */
/* 7. SwipeCard — Trojena destination card (dark)                     */
/* ================================================================== */
export const SwipeCard: React.FC<any> = ({
  title = "TROJENA MOUNTAIN",
  badge = "$ High ROI",
  desc = "Trojena will be an iconic, world-class destination, blending natural and developed landscapes.",
}) => {
  const frame = useCurrentFrame();
  const loop = 270;
  const local = frame % loop;
  const swipe = interpolate(local, [0, 60, 270], [0, 0, 40], { extrapolateRight: "clamp" });
  return (
    <AbsoluteFill style={{ background: "radial-gradient(70% 70% at 50% 30%, #14202e, #080a0f)", fontFamily: FONT, alignItems: "center", justifyContent: "center" }}>
      <div style={{ width: 600, height: 940, borderRadius: 40, overflow: "hidden", background: "linear-gradient(180deg,#2b2b2b,#1a1a1a)", boxShadow: "0 40px 100px rgba(0,0,0,0.6)", border: "1px solid rgba(255,255,255,0.1)", transform: `translateX(${swipe}px)` }}>
        <div style={{ position: "absolute", top: 36, left: 36 }}><Icon name="snowflake" size={36} color="#fff" /></div>
        <div style={{ position: "absolute", top: 30, right: 30, width: 78, height: 78, borderRadius: "50%", background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center" }}><Icon name="arrowUpRight" size={36} color="#fff" /></div>
        <div style={{ position: "absolute", top: 96, left: 36, right: 36, color: "#EAF2FF", fontSize: 40, fontWeight: 800, letterSpacing: 1 }}>{title}</div>
        <div style={{ position: "absolute", top: 200, left: 0, right: 0, height: 460, overflow: "hidden" }}>
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg,#bcd6ef 0%, #8fb3d6 45%, #d7e6f2 46%, #6f93b8 100%)" }} />
          <div style={{ position: "absolute", bottom: 0, left: -30, width: "55%", height: 250, background: "linear-gradient(180deg,#ffffff,#cfe0ef)", clipPath: "polygon(0 100%, 35% 25%, 70% 75%, 100% 30%, 100% 100%)" }} />
          <div style={{ position: "absolute", bottom: 0, right: -30, width: "60%", height: 300, background: "linear-gradient(180deg,#f4f8fc,#aec8e0)", clipPath: "polygon(0 55%, 40% 10%, 75% 65%, 100% 25%, 100% 100%, 0 100%)" }} />
          <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 150, background: "linear-gradient(180deg, rgba(120,150,180,0.2), rgba(70,100,130,0.55))" }} />
        </div>
        <div style={{ position: "absolute", top: 660, left: 36, background: "rgba(231,180,77,0.18)", border: "1px solid rgba(231,180,77,0.6)", padding: "10px 22px", borderRadius: 14 }}>
          <span style={{ color: "#E7B84D", fontSize: 28, fontWeight: 700 }}>{badge}</span>
        </div>
        <div style={{ position: "absolute", left: 36, right: 36, bottom: 40, color: "rgba(255,255,255,0.8)", fontSize: 26, lineHeight: 1.5 }}>{desc}</div>
      </div>
    </AbsoluteFill>
  );
};

/* ================================================================== */
/* 8. FrostedPoster — warm frosted-glass cards                        */
/* ================================================================== */
export const FrostedPoster: React.FC<any> = ({
  topTitle = "Frosted", topSub = "Concept",
  blTitle = "Clear", blSub = "iOS",
  brTitle = "Blur", brSub = "One UI",
}) => {
  const frame = useCurrentFrame();
  const sweep = (frame % 140) / 140;
  return (
    <AbsoluteFill style={{ fontFamily: FONT, overflow: "hidden" }}>
      <AbsoluteFill style={{ filter: "blur(70px)", opacity: 0.95 }}>
        <div style={{ position: "absolute", left: -80, top: -60, width: 800, height: 800, borderRadius: "50%", background: "#F3A865" }} />
        <div style={{ position: "absolute", right: -60, top: 180, width: 700, height: 700, borderRadius: "50%", background: "#E36C9B" }} />
        <div style={{ position: "absolute", left: 120, bottom: -100, width: 800, height: 800, borderRadius: "50%", background: "#6FB7C9" }} />
        <div style={{ position: "absolute", right: 80, bottom: 40, width: 600, height: 600, borderRadius: "50%", background: "#F4C95D" }} />
      </AbsoluteFill>
      <div style={{ position: "absolute", inset: 0, background: "rgba(255,255,255,0.12)" }} />
      <AbsoluteFill style={{ padding: 90, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
        <div style={{ width: "100%", height: 360, borderRadius: 40, background: "rgba(255,255,255,0.22)", backdropFilter: "blur(26px)", border: "1px solid rgba(255,255,255,0.5)", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
          <div style={{ color: "#fff", fontSize: 92, fontWeight: 800 }}>{topTitle}</div>
          <div style={{ color: "rgba(255,255,255,0.85)", fontSize: 34, fontWeight: 400, marginTop: 8 }}>{topSub}</div>
          <div style={{ position: "absolute", top: 0, bottom: 0, width: 220, left: sweep * 1700 - 220, background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.45), transparent)", transform: "skewX(-18deg)" }} />
        </div>
        <div style={{ display: "flex", flexDirection: "row", justifyContent: "space-between", gap: 50 }}>
          <div style={{ flex: 1, height: 300, borderRadius: 38, background: "rgba(255,255,255,0.16)", backdropFilter: "blur(10px)", border: "1px solid rgba(255,255,255,0.4)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div style={{ color: "#fff", fontSize: 70, fontWeight: 800 }}>{blTitle}</div>
            <div style={{ color: "rgba(255,255,255,0.85)", fontSize: 30, fontWeight: 400, marginTop: 6 }}>{blSub}</div>
          </div>
          <div style={{ flex: 1, height: 300, borderRadius: 38, background: "rgba(255,255,255,0.12)", backdropFilter: "blur(20px)", border: "1px solid rgba(255,255,255,0.35)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div style={{ color: "#fff", fontSize: 70, fontWeight: 800 }}>{brTitle}</div>
            <div style={{ color: "rgba(255,255,255,0.85)", fontSize: 30, fontWeight: 400, marginTop: 6 }}>{brSub}</div>
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/* ================================================================== */
/* 9. AppNavMenu — YouTube-style menu over pink flower                */
/* ================================================================== */
export const AppNavMenu: React.FC<any> = ({
  appName = "YouTube",
  menu = [
    { label: "Home", icon: "home" },
    { label: "Explore", icon: "search" },
    { label: "Short", icon: "film" },
    { label: "Subscription", icon: "folder" },
    { label: "Information", icon: "info" },
    { label: "Settings", icon: "gear" },
    { label: "Log out", icon: "logout" },
  ],
}) => {
  const frame = useCurrentFrame();
  const active = Math.floor(frame / 45) % menu.length;
  return (
    <AbsoluteFill style={{ background: "#000", fontFamily: FONT, alignItems: "center", justifyContent: "center" }}>
      <div style={{ position: "absolute", width: 900, height: 900, borderRadius: "50%", background: "radial-gradient(circle at 50% 45%, #ff7eb3 0%, #ff4f9a 30%, #c2185b 55%, #6a0033 75%, transparent 80%)", filter: "blur(8px)" }} />
      <div style={{ position: "absolute", width: 700, height: 700, borderRadius: "50%", background: "radial-gradient(circle, rgba(255,255,255,0.25), transparent 60%)", top: "12%", mixBlendMode: "screen" }} />
      <div style={{ position: "absolute", right: 220, top: 90, width: 560, borderRadius: 36, background: "rgba(20,20,20,0.82)", backdropFilter: "blur(12px)", border: "1px solid rgba(255,255,255,0.12)", padding: 44 }}>
        <div style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: 16, marginBottom: 30 }}>
          <svg viewBox="0 0 24 24" width={44} height={44} fill="#FF0033"><path d="M22 8a3 3 0 00-3-2c-2-.2-8-.2-10 0a3 3 0 00-3 2 12 12 0 000 8 3 3 0 003 2c2 .2 8 .2 10 0a3 3 0 003-2 12 12 0 000-8zM10 9v6l5-3z" /></svg>
          <span style={{ color: "#fff", fontSize: 44, fontWeight: 800 }}>{appName}</span>
        </div>
        {menu.map((m, i) => (
          <div key={i} style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: 22, paddingVertical: 20, opacity: i === active ? 1 : 0.7 }}>
            <Icon name={m.icon} size={36} color={i === active ? "#FF4F9A" : "#fff"} />
            <span style={{ color: "#fff", fontSize: 36 }}>{m.label}</span>
            {i === active && <div style={{ marginLeft: "auto", width: 14, height: 14, borderRadius: "50%", background: "#FF4F9A" }} />}
          </div>
        ))}
      </div>
    </AbsoluteFill>
  );
};
