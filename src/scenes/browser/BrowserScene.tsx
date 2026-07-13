import { useCurrentFrame, interpolate, spring, useVideoConfig, staticFile, Img } from "remotion";
import { useMemo } from "react";
import { BROWSER_SCENE } from "./browserTimeline";
import GoogleSERP from "../../components/browser/GoogleSERP";
import GoogleHomepage from "../../components/browser/GoogleHomepage";

const CHANNEL_QUERY = "Sylvester's AI Lab";
const CYAN = "#00D9FF";
const GOLD = "#E7B84D";
const BG_DARK = "#07090D";
const SURFACE = "#10141B";
const TEXT = "#F5F7FA";
const MUTED = "#9CA3AF";

function TrafficLights() {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        marginRight: 16,
        flexShrink: 0,
      }}
    >
      {["#ff5f57", "#febc2e", "#28c840"].map((c) => (
        <div
          key={c}
          style={{
            width: 12,
            height: 12,
            borderRadius: "50%",
            background: c,
            flexShrink: 0,
          }}
        />
      ))}
    </div>
  );
}

function NavButton({ label }: { label: string }) {
  return (
    <div
      style={{
        width: 28,
        height: 28,
        borderRadius: 6,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "rgba(255,255,255,0.4)",
        fontSize: 14,
        fontWeight: 600,
        flexShrink: 0,
      }}
    >
      {label}
    </div>
  );
}

function BrowserTabBar({ showTab }: { showTab: boolean }) {
  return (
    <div
      style={{
        height: 44,
        display: "flex",
        alignItems: "center",
        padding: "0 8px",
        background: "#0B1119",
        flexShrink: 0,
        borderBottom: "1px solid rgba(255,255,255,0.04)",
      }}
    >
      {showTab ? (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            height: 34,
            padding: "0 14px",
            borderRadius: 8,
            background: "#0F172A",
            border: "1px solid rgba(255,255,255,0.08)",
            borderBottom: `2px solid ${CYAN}`,
            fontSize: 12,
            color: TEXT,
            fontWeight: 500,
            gap: 8,
          }}
        >
          <div
            style={{
              width: 14,
              height: 14,
              flexShrink: 0,
            }}
          >
            <Img src={staticFile("browser/chrome-logo.svg")} style={{ width: 14, height: 14 }} />
          </div>
          Sylvester's AI Lab
          <div
            style={{
              marginLeft: 8,
              width: 14,
              height: 14,
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "rgba(255,255,255,0.2)",
              fontSize: 12,
            }}
          >
            ✕
          </div>
        </div>
      ) : (
        <div style={{ height: 34 }} />
      )}
    </div>
  );
}

function Omnibox({
  typed,
  showCursor,
  frame,
}: {
  typed: string;
  showCursor: boolean;
  frame: number;
}) {
  const cursorVisible = frame % 12 < 6;
  const isDone = typed.length >= CHANNEL_QUERY.length;

  return (
    <div
      style={{
        height: 50,
        display: "flex",
        alignItems: "center",
        padding: "0 12px",
        gap: 4,
        background: SURFACE,
        flexShrink: 0,
        borderBottom: "1px solid rgba(255,255,255,0.04)",
      }}
    >
      <NavButton label="←" />
      <NavButton label="→" />
      <NavButton label="↻" />

      <div
        style={{
          flex: 1,
          height: 34,
          borderRadius: 20,
          background: "rgba(255,255,255,0.05)",
          border: `1px solid ${isDone ? "rgba(0,217,255,0.2)" : "transparent"}`,
          display: "flex",
          alignItems: "center",
          padding: "0 16px",
          gap: 8,
          margin: "0 4px",
        }}
      >
        {isDone || typed.length > 0 ? (
          <svg width={14} height={14} viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0, opacity: 0.5 }}>
            <circle cx="11" cy="11" r="7" stroke="#9CA3AF" strokeWidth="2" />
            <line x1="16.5" y1="16.5" x2="21" y2="21" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" />
          </svg>
        ) : null}
        <span
          style={{
            fontSize: 13,
            color: typed ? TEXT : "rgba(255,255,255,0.25)",
            fontWeight: typed ? 400 : 400,
            letterSpacing: "0.01em",
            fontFamily: "system-ui, sans-serif",
          }}
        >
          {typed || "Search or enter URL"}
        </span>
        {showCursor && !isDone && (
          <span
            style={{
              width: 7,
              height: 15,
              background: CYAN,
              display: "inline-block",
              opacity: cursorVisible ? 1 : 0,
              flexShrink: 0,
            }}
          />
        )}
      </div>

      <div
        style={{
          width: 28,
          height: 28,
          borderRadius: 6,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "rgba(255,255,255,0.3)",
          fontSize: 16,
        }}
      >
        ★
      </div>
      <div
        style={{
          width: 28,
          height: 28,
          borderRadius: 6,
          background: "linear-gradient(135deg, #8B5CF6, #6366F1)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#fff",
          fontSize: 12,
          fontWeight: 600,
        }}
      >
        S
      </div>
      <NavButton label="⋮" />
    </div>
  );
}

function BookmarksBar({ frame }: { frame: number }) {
  const progress = Math.min(
    1,
    Math.max(0, (frame - BROWSER_SCENE.STAGE3_SEARCH.START) / 20)
  );
  const items = [
    { label: "Dashboard", color: CYAN },
    { label: "Projects", color: GOLD },
    { label: "Tutorials", color: "#3B82F6" },
    { label: "Community", color: "#8B5CF6" },
    { label: "Settings", color: "#64748B" },
  ];
  const visibleCount = Math.max(1, Math.floor(items.length * progress));

  return (
    <div
      style={{
        height: 30,
        display: "flex",
        alignItems: "center",
        gap: 2,
        padding: "0 16px",
        background: "rgba(255,255,255,0.02)",
        borderBottom: "1px solid rgba(255,255,255,0.04)",
        flexShrink: 0,
        overflow: "hidden",
      }}
    >
      {items.slice(0, visibleCount).map((item) => (
        <div
          key={item.label}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 5,
            padding: "2px 8px",
            borderRadius: 4,
            fontSize: 11,
            color: MUTED,
            whiteSpace: "nowrap",
          }}
        >
          <div
            style={{
              width: 6,
              height: 6,
              borderRadius: 2,
              background: item.color,
            }}
          />
          {item.label}
        </div>
      ))}
    </div>
  );
}

export default function BrowserScene() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const typedChars = useMemo(() => {
    if (frame < BROWSER_SCENE.STAGE2_HOME.TYPING_START) return 0;
    const typingFrames = frame - BROWSER_SCENE.STAGE2_HOME.TYPING_START;
    return Math.min(
      Math.floor(typingFrames / BROWSER_SCENE.CHARS_PER_FRAME),
      CHANNEL_QUERY.length
    );
  }, [frame]);

  const typed = CHANNEL_QUERY.slice(0, typedChars);
  const showCursor = frame >= BROWSER_SCENE.STAGE2_HOME.TYPING_START;

  const browserAppear = useMemo(
    () =>
      interpolate(
        frame,
        [0, BROWSER_SCENE.STAGE1_APPEAR.END],
        [0, 1],
        { extrapolateRight: "clamp" }
      ),
    [frame]
  );

  const browserScale = spring({
    frame,
    fps,
    config: { damping: 16, stiffness: 100 },
  });

  const showTab = frame >= BROWSER_SCENE.STAGE2_HOME.TAB_APPEAR;
  const isHome =
    frame >= BROWSER_SCENE.STAGE2_HOME.START &&
    frame < BROWSER_SCENE.STAGE3_SEARCH.START;
  const isLoading =
    frame >= BROWSER_SCENE.STAGE3_SEARCH.START &&
    frame < BROWSER_SCENE.STAGE4_SERP.START;
  const showContent = frame >= BROWSER_SCENE.STAGE4_SERP.START;

  const loadingProgress = useMemo(() => {
    if (frame < BROWSER_SCENE.STAGE3_SEARCH.START) return 0;
    if (frame >= BROWSER_SCENE.STAGE4_SERP.START) return 1;
    return interpolate(
      frame,
      [BROWSER_SCENE.STAGE3_SEARCH.START, BROWSER_SCENE.STAGE3_SEARCH.END],
      [0, 1],
      { extrapolateRight: "clamp" }
    );
  }, [frame]);

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        position: "relative",
        background: BG_DARK,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          width: 1180,
          height: 720,
          borderRadius: 14,
          overflow: "hidden",
          background: SURFACE,
          border: "1px solid rgba(255,255,255,0.08)",
          boxShadow: "0 40px 140px rgba(0,0,0,0.6)",
          position: "relative",
          display: "flex",
          flexDirection: "column",
          opacity: browserAppear,
          transform: `scale(${browserScale})`,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            height: 38,
            padding: "0 16px",
            background: "#080C14",
            borderBottom: "1px solid rgba(255,255,255,0.04)",
            flexShrink: 0,
          }}
        >
          <TrafficLights />
          <div style={{ flex: 1 }} />
          <div
            style={{
              fontSize: 12,
              color: "rgba(255,255,255,0.15)",
              letterSpacing: "0.06em",
              fontWeight: 500,
            }}
          >
            google.com
          </div>
          <div style={{ flex: 1 }} />
          <div
            style={{
              width: 24,
              height: 24,
              borderRadius: 6,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "rgba(255,255,255,0.15)",
              fontSize: 14,
            }}
          >
            —
          </div>
          <div
            style={{
              width: 24,
              height: 24,
              borderRadius: 6,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "rgba(255,255,255,0.15)",
              fontSize: 14,
            }}
          >
            □
          </div>
          <div
            style={{
              width: 24,
              height: 24,
              borderRadius: 6,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "rgba(255,255,255,0.15)",
              fontSize: 14,
            }}
          >
            ✕
          </div>
        </div>

        <BrowserTabBar showTab={showTab} />
        <Omnibox
          typed={frame >= BROWSER_SCENE.STAGE3_SEARCH.START ? CHANNEL_QUERY : "google.com"}
          showCursor={false}
          frame={frame}
        />

        {showTab && <BookmarksBar frame={frame} />}

        {isHome && (
          <div style={{ flex: 1, minHeight: 0, position: "relative" }}>
            <GoogleHomepage
              typed={typed}
              showCursor={showCursor}
              frame={frame}
              startFrame={BROWSER_SCENE.STAGE2_HOME.START}
              exitFrame={BROWSER_SCENE.STAGE3_SEARCH.START}
            />
          </div>
        )}

        {isLoading && (
          <div
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 24,
              background: "#0A0E16",
            }}
          >
            <div
              style={{
                width: 36,
                height: 36,
                border: "3px solid rgba(0,217,255,0.1)",
                borderTop: `3px solid ${CYAN}`,
                borderRadius: "50%",
                transform: `rotate(${loadingProgress * 720}deg)`,
              }}
            />
            <div
              style={{
                fontSize: 13,
                color: "rgba(255,255,255,0.3)",
                letterSpacing: "0.04em",
              }}
            >
                Searching Google...
            </div>
          </div>
        )}

        {showContent && (
          <div style={{ flex: 1, minHeight: 0, position: "relative" }}>
            <GoogleSERP
              query={CHANNEL_QUERY}
              frame={frame}
              startFrame={BROWSER_SCENE.STAGE4_SERP.START}
              resultStartFrames={[
                BROWSER_SCENE.STAGE4_SERP.RESULT_1,
                BROWSER_SCENE.STAGE4_SERP.RESULT_2,
                BROWSER_SCENE.STAGE4_SERP.RESULT_3,
                BROWSER_SCENE.STAGE4_SERP.RESULT_4,
                BROWSER_SCENE.STAGE4_SERP.RESULT_5,
              ]}
            />
          </div>
        )}
      </div>
    </div>
  );
}
