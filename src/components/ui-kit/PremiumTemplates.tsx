import React from "react";
import { AbsoluteFill, useCurrentFrame, interpolate, spring } from "remotion";
import { Icon } from "./UiKit";

const FONT = "'Switzer', 'Inter', system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif";
const VOID = "#07080F";
const SURFACE = "#10141B";
const CYAN = "#00D9FF";
const GOLD = "#E7B84D";
const MUTED = "#94A3B8";
const RED = "#FF6B6B";

function Ring({ size, color, children }: { size: number; color: string; children: React.ReactNode }) {
  return (
    <div style={{ width: size, height: size, borderRadius: "50%", background: `linear-gradient(135deg, ${CYAN}, ${GOLD})`, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: `0 0 ${size * 0.4}px rgba(0,217,255,0.35)` }}>
      <div style={{ width: size - 10, height: size - 10, borderRadius: "50%", background: VOID, display: "flex", alignItems: "center", justifyContent: "center" }}>{children}</div>
    </div>
  );
}

/* ================================================================== */
/* P1. ProblemSolution — chaos tangle -> single clean flow (metaphor) */
/*     HERO = the visual transformation. Text = tiny corner captions. */
/* ================================================================== */
export const ProblemSolution: React.FC<any> = ({
  beforeLabel = "BEFORE",
  afterLabel = "AFTER",
  captionL = "Manual busywork",
  captionR = "One agent, on autopilot",
}) => {
  const frame = useCurrentFrame();
  const lit = Math.min(1, frame / 50);
  const flick = (Math.sin(frame / 5) + 1) / 2;
  const chaos = [
    { x: 200, y: 300 }, { x: 410, y: 230 }, { x: 320, y: 500 }, { x: 540, y: 430 },
    { x: 230, y: 700 }, { x: 520, y: 760 }, { x: 640, y: 560 }, { x: 360, y: 860 },
  ];
  const links = [[0, 1], [1, 2], [2, 3], [3, 5], [0, 6], [4, 6], [5, 7], [3, 7], [1, 4], [6, 7]];
  const packet = interpolate(frame, [0, 90], [3, 90], { extrapolateRight: "clamp" });
  return (
    <AbsoluteFill style={{ background: VOID, fontFamily: FONT, flexDirection: "row", overflow: "hidden" }}>
      {/* LEFT — chaos */}
      <div style={{ flex: 1, position: "relative", borderRight: "1px solid rgba(255,255,255,0.08)" }}>
        <svg width="100%" height="100%" style={{ position: "absolute", inset: 0 }}>
          {links.map((l, i) => {
            const a = chaos[l[0]], b = chaos[l[1]];
            return <line key={i} x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke={`rgba(255,107,107,${0.22 + 0.2 * flick})`} strokeWidth={2} />;
          })}
          {chaos.map((n, i) => {
            const jx = Math.sin((frame + i * 13) / 9) * 7;
            const jy = Math.cos((frame + i * 7) / 9) * 7;
            return <circle key={i} cx={n.x + jx} cy={n.y + jy} r={15} fill="#FF6B6B" opacity={0.45 + 0.35 * flick} />;
          })}
        </svg>
        <span style={{ position: "absolute", top: 56, left: 64, color: RED, fontSize: 24, fontWeight: 800, letterSpacing: 3 }}>{beforeLabel}</span>
        <span style={{ position: "absolute", bottom: 64, left: 64, color: "rgba(255,255,255,0.55)", fontSize: 22 }}>{captionL}</span>
      </div>
      {/* CENTER bolt */}
      <div style={{ position: "absolute", left: "50%", top: "50%", width: 104, height: 104, transform: `translate(-50%,-50%) scale(${0.7 + 0.3 * lit})`, borderRadius: "50%", background: "linear-gradient(135deg,#00D9FF,#E7B84D)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: `0 0 50px rgba(0,217,255,${0.4 * lit})`, zIndex: 2 }}>
        <Icon name="bolt" size={48} color="#07080F" />
      </div>
      {/* RIGHT — order */}
      <div style={{ flex: 1, position: "relative", background: `radial-gradient(90% 100% at 85% 50%, rgba(0,217,255,${0.16 * lit}), transparent 60%)`, opacity: lit }}>
        <svg width="100%" height="100%" style={{ position: "absolute", inset: 0 }}>
          <defs>
            <linearGradient id="psflow" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor={CYAN} /><stop offset="100%" stopColor={GOLD} />
            </linearGradient>
          </defs>
          <line x1={40} y1={540} x2={900} y2={540} stroke="url(#psflow)" strokeWidth={6} strokeLinecap="round" />
        </svg>
        <div style={{ position: "absolute", top: 540, left: `${packet}%`, width: 26, height: 26, transform: "translate(-50%,-50%)", borderRadius: "50%", background: "#fff", boxShadow: "0 0 24px rgba(0,217,255,0.9)" }} />
        <div style={{ position: "absolute", top: 540, left: "90%", width: 70, height: 70, transform: "translate(-50%,-50%)", borderRadius: "50%", background: "linear-gradient(135deg,#00D9FF,#E7B84D)", boxShadow: "0 0 40px rgba(231,180,77,0.6)" }} />
        <span style={{ position: "absolute", top: 56, right: 64, color: CYAN, fontSize: 24, fontWeight: 800, letterSpacing: 3 }}>{afterLabel}</span>
        <span style={{ position: "absolute", bottom: 64, right: 64, color: "rgba(255,255,255,0.7)", fontSize: 22 }}>{captionR}</span>
      </div>
    </AbsoluteFill>
  );
};

/* ================================================================== */
/* P2. StepTimeline — 4 orbs on a line that draws itself; a light     */
/*     pulse travels the path. HERO = the traveling light. Steps are  */
/*     tiny captions under each orb.                                  */
/* ================================================================== */
export const StepTimeline: React.FC<any> = ({
  title = "How it works",
  steps = ["Connect a tool", "Describe the goal", "Agent runs it", "You get results"],
}) => {
  const frame = useCurrentFrame();
  const n = steps.length;
  const span = 1440;
  const x0 = (1920 - span) / 2;
  const gap = span / (n - 1);
  const draw = Math.min(1, frame / 60);
  const head = x0 + span * Math.min(1, frame / 90);
  return (
    <AbsoluteFill style={{ background: VOID, fontFamily: FONT, alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
      <span style={{ position: "absolute", top: 130, color: "rgba(255,255,255,0.6)", fontSize: 24, letterSpacing: 3, fontWeight: 600 }}>{title.toUpperCase()}</span>
      <div style={{ position: "relative", width: 1920, height: 300, marginTop: 40 }}>
        <div style={{ position: "absolute", left: x0, top: 150, width: span, height: 3, background: "rgba(255,255,255,0.12)" }} />
        <div style={{ position: "absolute", left: x0, top: 150, height: 3, background: `linear-gradient(90deg, ${CYAN}, ${GOLD})`, width: `${span * draw}px`, boxShadow: "0 0 16px rgba(0,217,255,0.6)" }} />
        <div style={{ position: "absolute", top: 150, left: head, width: 22, height: 22, transform: "translate(-50%,-50%)", borderRadius: "50%", background: "#fff", boxShadow: "0 0 26px rgba(0,217,255,0.95)" }} />
        {steps.map((s, i) => {
          const x = x0 + gap * i;
          const on = Math.min(1, Math.max(0, (frame - 14 - i * 18) / 16));
          return (
            <div key={i} style={{ position: "absolute", left: x, top: 150, transform: "translate(-50%,-50%)" }}>
              <div style={{ width: 64, height: 64, borderRadius: "50%", border: `2px solid ${on ? GOLD : "rgba(255,255,255,0.25)"}`, background: on ? "radial-gradient(circle at 35% 30%, rgba(0,217,255,0.4), rgba(231,180,77,0.25))" : "transparent", transform: `scale(${0.7 + 0.3 * on})`, boxShadow: on ? `0 0 ${26 * on}px rgba(0,217,255,${0.6 * on})` : "none" }} />
              <span style={{ position: "absolute", top: 86, left: "50%", transform: "translateX(-50%)", width: 300, textAlign: "center", color: on ? "#fff" : "rgba(255,255,255,0.4)", fontSize: 22, fontWeight: 500 }}>{s}</span>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

/* ================================================================== */
/* P3. AgentActivityStream — a glowing pipeline with packets flowing  */
/*     through station nodes that ignite as the agent works. HERO =   */
/*     the live flow + agent core. The step text is a small caption.  */
/* ================================================================== */
export const AgentActivityStream: React.FC<any> = ({
  goal = "Triage the support inbox",
  steps = ["Read", "Classify", "Draft", "Check", "Send"],
}) => {
  const frame = useCurrentFrame();
  const n = steps.length;
  const span = 1440;
  const x0 = (1920 - span) / 2;
  const gap = span / (n - 1);
  const head = x0 + span * Math.min(1, frame / 120);
  const active = Math.max(0, Math.min(n - 1, Math.floor((head - x0) / gap + 0.0001)));
  const pulse = (Math.sin(frame / 6) + 1) / 2;
  return (
    <AbsoluteFill style={{ background: `radial-gradient(70% 90% at 50% 50%, rgba(0,217,255,0.10), transparent 65%), ${VOID}`, fontFamily: FONT, alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
      {/* pipeline */}
      <div style={{ position: "absolute", top: 540, left: x0, width: span, height: 6, background: "rgba(255,255,255,0.10)", borderRadius: 3 }} />
      <div style={{ position: "absolute", top: 540, left: x0, width: head - x0, height: 6, background: `linear-gradient(90deg, ${CYAN}, ${GOLD})`, borderRadius: 3, boxShadow: "0 0 20px rgba(0,217,255,0.6)" }} />
      <div style={{ position: "absolute", top: 540, left: head, width: 28, height: 28, transform: "translate(-50%,-50%)", borderRadius: "50%", background: "#fff", boxShadow: "0 0 30px rgba(0,217,255,1)" }} />
      {/* agent core */}
      <div style={{ position: "absolute", top: 540, left: x0 - 80, transform: "translate(-50%,-50%)" }}>
        <div style={{ width: 96, height: 96, borderRadius: "50%", background: "linear-gradient(135deg,#00D9FF,#E7B84D)", boxShadow: `0 0 ${40 + 30 * pulse}px rgba(0,217,255,0.7)`, opacity: 0.6 + 0.4 * pulse }} />
      </div>
      {/* stations */}
      {steps.map((s, i) => {
        const x = x0 + gap * i;
        const reach = head >= x;
        const isActive = i === active;
        return (
          <div key={i} style={{ position: "absolute", top: 540, left: x, transform: "translate(-50%,-50%)" }}>
            <div style={{ width: 70, height: 70, borderRadius: "50%", border: `3px solid ${reach ? GOLD : "rgba(255,255,255,0.2)"}`, background: reach ? "radial-gradient(circle at 35% 30%, rgba(0,217,255,0.5), rgba(231,180,77,0.3))" : "transparent", transform: `scale(${isActive ? 1.1 + 0.06 * pulse : reach ? 1 : 0.8})`, boxShadow: reach ? `0 0 ${isActive ? 36 : 18}px rgba(0,217,255,0.6)` : "none" }} />
            <span style={{ position: "absolute", top: 92, left: "50%", transform: "translateX(-50%)", width: 220, textAlign: "center", color: reach ? "#fff" : "rgba(255,255,255,0.4)", fontSize: 22, fontWeight: 600, letterSpacing: 1 }}>{s}</span>
          </div>
        );
      })}
      {/* tiny goal caption (corner, subordinate) */}
      <span style={{ position: "absolute", top: 90, left: 80, color: MUTED, fontSize: 22, letterSpacing: 2 }}>GOAL</span>
      <span style={{ position: "absolute", top: 124, left: 80, color: "#fff", fontSize: 30, fontWeight: 700, maxWidth: 760 }}>{goal}</span>
    </AbsoluteFill>
  );
};

/* ================================================================== */
/* P4. CtaEndCard — premium subscribe / next step                    */
/* ================================================================== */
export const CtaEndCard: React.FC<any> = ({
  wordmark = "Sylvester",
  handle = "@sylvester.ai",
  cta = "Subscribe",
  sub = "New AI automations every week",
}) => {
  const frame = useCurrentFrame();
  const pop = spring({ frame: Math.min(frame, 20), fps: 30, config: { damping: 12 } });
  const dots = Array.from({ length: 26 }, (_, i) => ({ x: (i * 137) % 1920, y: (i * 311) % 1080, s: 2 + (i % 3) }));
  return (
    <AbsoluteFill style={{ background: `radial-gradient(60% 70% at 50% 40%, rgba(0,217,255,0.12), transparent 60%), ${VOID}`, fontFamily: FONT, alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
      {dots.map((d, i) => <div key={i} style={{ position: "absolute", left: d.x, top: d.y, width: d.s, height: d.s, borderRadius: "50%", background: i % 2 ? CYAN : GOLD, opacity: 0.25 }} />)}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", transform: `scale(${pop})`, opacity: pop }}>
        <Ring size={140} color={CYAN}><Icon name="bolt" size={64} color="#fff" /></Ring>
        <div style={{ marginTop: 28, color: "#fff", fontSize: 72, fontWeight: 800, letterSpacing: 1 }}>{wordmark}</div>
        <div style={{ marginTop: 8, color: MUTED, fontSize: 28 }}>{handle}</div>
        <div style={{ marginTop: 36, padding: "20px 56px", borderRadius: 40, background: "linear-gradient(90deg,#00D9FF,#E7B84D)", boxShadow: "0 14px 44px rgba(0,217,255,0.35)" }}>
          <span style={{ color: "#07080F", fontSize: 32, fontWeight: 800 }}>{cta}</span>
        </div>
        <div style={{ marginTop: 22, color: MUTED, fontSize: 26 }}>{sub}</div>
      </div>
    </AbsoluteFill>
  );
};

/* ================================================================== */
/* P5. LogoReveal — premium channel sting                            */
/* ================================================================== */
export const LogoReveal: React.FC<any> = ({
  wordmark = "Sylvester",
  tagline = "AI automations, built for you",
}) => {
  const frame = useCurrentFrame();
  const ring = spring({ frame: Math.min(frame, 18), fps: 30, config: { damping: 14 } });
  const bolt = spring({ frame: Math.max(0, Math.min(frame - 8, 18)), fps: 30, config: { damping: 10 } });
  const text = Math.min(1, Math.max(0, (frame - 16) / 18));
  const sweep = (frame % 120) / 120;
  return (
    <AbsoluteFill style={{ background: VOID, fontFamily: FONT, alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
      <div style={{ position: "absolute", width: 700, height: 700, borderRadius: "50%", background: "radial-gradient(circle, rgba(0,217,255,0.18), transparent 65%)", filter: "blur(20px)" }} />
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
        <div style={{ transform: `scale(${ring}) rotate(${(1 - ring) * -40}deg)`, opacity: ring }}>
          <Ring size={180} color={CYAN}><div style={{ transform: `scale(${bolt})`, opacity: bolt }}><Icon name="bolt" size={84} color="#fff" /></div></Ring>
        </div>
        <div style={{ position: "relative", marginTop: 36, height: 90, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ color: "#fff", fontSize: 84, fontWeight: 800, letterSpacing: 2, opacity: text, transform: `translateY(${(1 - text) * 20}px)` }}>{wordmark}</div>
          <div style={{ position: "absolute", top: 0, bottom: 0, width: 240, left: sweep * 900 - 240, background: "linear-gradient(90deg, transparent, rgba(231,180,77,0.5), transparent)", transform: "skewX(-18deg)" }} />
        </div>
        <div style={{ marginTop: 14, color: "#C7D2DE", fontSize: 32, opacity: text }}>{tagline}</div>
      </div>
    </AbsoluteFill>
  );
};
