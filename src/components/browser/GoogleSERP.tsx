import { useCurrentFrame, interpolate } from "remotion";

const GOOGLE_BLUE = "#1a0dab";
const GOOGLE_GREEN = "#006621";
const GOOGLE_GRAY = "#545454";
const GOOGLE_MUTED = "#70757a";
const GOOGLE_TAB = "#5f6368";
const GOOGLE_ACTIVE = "#1a73e8";
const BORDER = "#ebebeb";

interface SearchResult {
  url: string;
  title: string;
  snippet: string;
  accent: string;
}

const RESULTS: SearchResult[] = [
  {
    url: "youtube.com › @sylvestersailab",
    title: "Sylvester's AI Lab - YouTube",
    snippet:
      "Watch the latest videos on AI, creative motion design, and cinematic experiences. Tutorials, breakdowns, and behind-the-scenes straight from the lab.",
    accent: "#FF0000",
  },
  {
    url: "sylvesters-ai-lab.dev",
    title: "Sylvester's AI Lab — Official Site",
    snippet:
      "Artificial Intelligence · Creative Motion · Cinematic Experiences. Explore the lab's projects, open tools, and experiments.",
    accent: "#00D9FF",
  },
  {
    url: "github.com › sylvesters-ai-lab",
    title: "Sylvester's AI Lab · GitHub",
    snippet:
      "Build, orchestrate, and ship intelligent pipelines. Open-source motion graphics and AI workflow tooling for creators.",
    accent: "#8B5CF6",
  },
  {
    url: "discord.gg › sylvesters-ai-lab",
    title: "Join Sylvester's AI Lab Community",
    snippet:
      "Connect with creators building the future of AI-driven motion design. Share work, get feedback, and collaborate.",
    accent: "#64748B",
  },
  {
    url: "sylvesters-ai-lab.dev › blog",
    title: "Sylvester's AI Lab — Blog & Latest",
    snippet:
      "Deep dives into rendering engines, lighting, and frame-perfect animation techniques from the studio.",
    accent: "#E7B84D",
  },
];

export function GoogleLogo({ size = 30 }: { size?: number }) {
  return (
    <span
      style={{
        fontFamily: "arial, sans-serif",
        fontWeight: 500,
        fontSize: size,
        letterSpacing: `-${Math.max(1, size * 0.05)}px`,
        userSelect: "none",
      }}
    >
      <span style={{ color: "#4285F4" }}>G</span>
      <span style={{ color: "#EA4335" }}>o</span>
      <span style={{ color: "#FBBC05" }}>o</span>
      <span style={{ color: "#4285F4" }}>g</span>
      <span style={{ color: "#34A853" }}>l</span>
      <span style={{ color: "#EA4335" }}>e</span>
    </span>
  );
}

export function Magnifier({ size = 18, color = "#9aa0a6" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <circle cx="11" cy="11" r="7" stroke={color} strokeWidth="2" />
      <line x1="16.5" y1="16.5" x2="21" y2="21" stroke={color} strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function ResultRow({
  result,
  frame,
  startFrame,
}: {
  result: SearchResult;
  frame: number;
  startFrame: number;
}) {
  const progress = interpolate(frame, [startFrame, startFrame + 14], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return (
    <div
      style={{
        marginBottom: 30,
        opacity: progress,
        transform: `translateY(${(1 - progress) * 14}px)`,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <div
          style={{
            width: 26,
            height: 26,
            borderRadius: 50,
            background: result.accent,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#fff",
            fontSize: 12,
            fontWeight: 700,
            flexShrink: 0,
          }}
        >
          {result.title.charAt(0)}
        </div>
        <span style={{ color: GOOGLE_GREEN, fontSize: 13 }}>{result.url}</span>
      </div>
      <div
        style={{
          color: GOOGLE_BLUE,
          fontSize: 20,
          marginTop: 4,
          lineHeight: 1.3,
          fontFamily: "arial, sans-serif",
          cursor: "pointer",
        }}
      >
        {result.title}
      </div>
      <div
        style={{
          color: GOOGLE_GRAY,
          fontSize: 14,
          lineHeight: 1.58,
          marginTop: 4,
          maxWidth: 600,
        }}
      >
        {result.snippet}
      </div>
    </div>
  );
}

export default function GoogleSERP({
  query,
  frame,
  startFrame,
  resultStartFrames,
}: {
  query: string;
  frame: number;
  startFrame: number;
  resultStartFrames: number[];
}) {
  const appear = interpolate(frame, [startFrame, startFrame + 12], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        background: "#fff",
        color: "#202124",
        fontFamily: "arial, sans-serif",
        overflow: "hidden",
        opacity: appear,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 28,
          padding: "16px 24px",
          borderBottom: `1px solid ${BORDER}`,
        }}
      >
        <GoogleLogo />
        <div
          style={{
            flex: 1,
            maxWidth: 560,
            height: 44,
            borderRadius: 24,
            border: "1px solid #dfe1e5",
            boxShadow: "0 1px 6px rgba(32,33,36,0.18)",
            display: "flex",
            alignItems: "center",
            padding: "0 16px",
            gap: 12,
          }}
        >
          <span style={{ flex: 1, fontSize: 16, color: "#202124" }}>{query}</span>
          <Magnifier size={20} color="#4285F4" />
        </div>
        <div
          style={{
            padding: "9px 18px",
            borderRadius: 6,
            background: GOOGLE_ACTIVE,
            color: "#fff",
            fontSize: 14,
            fontWeight: 500,
          }}
        >
          Sign in
        </div>
      </div>

      <div
        style={{
          display: "flex",
          gap: 22,
          padding: "0 24px",
          marginLeft: 122,
          borderBottom: `1px solid ${BORDER}`,
          fontSize: 14,
          color: GOOGLE_TAB,
        }}
      >
        {[
          { label: "All", active: true },
          { label: "Images", active: false },
          { label: "Videos", active: false },
          { label: "News", active: false },
          { label: "Maps", active: false },
          { label: "More", active: false },
        ].map((tab) => (
          <span
            key={tab.label}
            style={{
              padding: "14px 0",
              color: tab.active ? GOOGLE_ACTIVE : GOOGLE_TAB,
              borderBottom: tab.active ? `3px solid ${GOOGLE_ACTIVE}` : "3px solid transparent",
              fontWeight: tab.active ? 500 : 400,
            }}
          >
            {tab.label}
          </span>
        ))}
      </div>

      <div style={{ padding: "22px 24px 24px 150px" }}>
        <div
          style={{
            color: GOOGLE_MUTED,
            fontSize: 13,
            marginBottom: 22,
          }}
        >
          About 1,240,000 results (0.42 seconds)
        </div>
        {RESULTS.map((result, i) => (
          <ResultRow
            key={result.title}
            result={result}
            frame={frame}
            startFrame={resultStartFrames[i] ?? startFrame + i * 16}
          />
        ))}
      </div>
    </div>
  );
}
