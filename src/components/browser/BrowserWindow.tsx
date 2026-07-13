import { useCurrentFrame, useVideoConfig, spring, interpolate } from "remotion";

interface Tab {
  title: string;
  favicon?: string;
  active?: boolean;
}

interface Bookmark {
  icon: string;
  label: string;
}

interface BrowserWindowProps {
  tabs?: Tab[];
  bookmarks?: Bookmark[];
  url?: string;
  children?: React.ReactNode;
  width?: number;
  height?: number;
  enterDelay?: number;
  style?: React.CSSProperties;
}

const CHROME_BG = "#2B2B2F";
const TAB_BAR_BG = "#1E1E22";
const CONTENT_BG = "#FFFFFF";
const ACCENT = "#4285F4";

export default function BrowserWindow({
  tabs = [{ title: "AI Tools Directory", active: true }],
  bookmarks = [],
  url = "https://aitools.directory",
  children,
  width = 1400,
  height = 850,
  enterDelay = 0,
  style = {},
}: BrowserWindowProps) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const pop = spring({
    frame: frame - enterDelay,
    fps,
    config: { damping: 16, stiffness: 100 },
  });

  const scale = interpolate(pop, [0, 1], [0.95, 1]);
  const opacity = pop;

  const chromeHeight = 88;
  const tabBarHeight = 38;
  const navBarHeight = 42;
  const bookmarksBarHeight = bookmarks.length > 0 ? 34 : 0;

  return (
    <div
      style={{
        width,
        height,
        borderRadius: 12,
        overflow: "hidden",
        boxShadow: `
          0 25px 60px rgba(0,0,0,0.6),
          0 8px 20px rgba(0,0,0,0.3),
          0 0 0 1px rgba(255,255,255,0.06)
        `,
        transform: `scale(${scale})`,
        opacity,
        display: "flex",
        flexDirection: "column",
        position: "relative",
        ...style,
      }}
    >
      {/* Tab Bar */}
      <div
        style={{
          height: tabBarHeight,
          background: TAB_BAR_BG,
          display: "flex",
          alignItems: "flex-end",
          paddingLeft: 8,
          paddingRight: 8,
          gap: 2,
        }}
      >
        {tabs.map((tab, i) => (
          <div
            key={i}
            style={{
              height: 30,
              padding: "0 14px",
              borderRadius: "8px 8px 0 0",
              background: tab.active ? CHROME_BG : "transparent",
              display: "flex",
              alignItems: "center",
              gap: 8,
              minWidth: 140,
              maxWidth: 220,
              cursor: "pointer",
            }}
          >
            {tab.favicon && (
              <div
                style={{
                  width: 16,
                  height: 16,
                  borderRadius: 3,
                  background: ACCENT,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 10,
                  color: "white",
                  fontWeight: 700,
                }}
              >
                {tab.favicon}
              </div>
            )}
            <span
              style={{
                fontSize: 12,
                color: tab.active ? "#E0E0E0" : "#8E8E8E",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
                fontFamily: "'Inter', -apple-system, sans-serif",
              }}
            >
              {tab.title}
            </span>
          </div>
        ))}
      </div>

      {/* Navigation Bar */}
      <div
        style={{
          height: navBarHeight,
          background: CHROME_BG,
          display: "flex",
          alignItems: "center",
          paddingLeft: 12,
          paddingRight: 12,
          gap: 8,
        }}
      >
        {/* Nav buttons */}
        <NavButton icon="←" />
        <NavButton icon="→" />
        <NavButton icon="↻" />

        {/* Home button */}
        <div
          style={{
            width: 28,
            height: 28,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 14,
            color: "#8E8E8E",
            cursor: "pointer",
          }}
        >
          ⌂
        </div>

        {/* Address bar */}
        <div
          style={{
            flex: 1,
            height: 30,
            borderRadius: 20,
            background: "#1A1A1E",
            border: "1px solid #3C3C42",
            display: "flex",
            alignItems: "center",
            paddingLeft: 12,
            paddingRight: 12,
            gap: 8,
          }}
        >
          <span style={{ fontSize: 12, color: "#6B9F4E" }}>🔒</span>
          <span
            style={{
              fontSize: 13,
              color: "#B0B0B0",
              fontFamily: "'Inter', -apple-system, sans-serif",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {url}
          </span>
        </div>

        {/* Extension icons */}
        <div style={{ display: "flex", gap: 6 }}>
          <ExtDot />
          <ExtDot />
        </div>
      </div>

      {/* Bookmarks Bar */}
      {bookmarks.length > 0 && (
        <div
          style={{
            height: bookmarksBarHeight,
            background: CHROME_BG,
            borderTop: "1px solid #3C3C42",
            display: "flex",
            alignItems: "center",
            paddingLeft: 12,
            paddingRight: 12,
            gap: 4,
          }}
        >
          {bookmarks.map((bm, i) => (
            <BookmarkItem key={i} icon={bm.icon} label={bm.label} index={i} />
          ))}
        </div>
      )}

      {/* Content Area */}
      <div
        style={{
          flex: 1,
          background: CONTENT_BG,
          overflow: "hidden",
          position: "relative",
        }}
      >
        {children}
      </div>
    </div>
  );
}

function NavButton({ icon }: { icon: string }) {
  return (
    <div
      style={{
        width: 28,
        height: 28,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 14,
        color: "#6E6E6E",
        cursor: "pointer",
        borderRadius: 4,
      }}
    >
      {icon}
    </div>
  );
}

function ExtDot() {
  return (
    <div
      style={{
        width: 20,
        height: 20,
        borderRadius: 4,
        background: "#3C3C42",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#6E6E6E" }} />
    </div>
  );
}

function BookmarkItem({ icon, label, index }: { icon: string; label: string; index: number }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 6,
        padding: "3px 8px",
        borderRadius: 4,
        cursor: "pointer",
        fontSize: 12,
        color: "#B0B0B0",
        fontFamily: "'Inter', -apple-system, sans-serif",
      }}
    >
      <span style={{ fontSize: 14 }}>{icon}</span>
      <span>{label}</span>
    </div>
  );
}
