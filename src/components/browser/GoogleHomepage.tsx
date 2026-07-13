import { useCurrentFrame, interpolate, staticFile, Img } from "remotion";
import { GoogleLogo, Magnifier } from "./GoogleSERP";

interface Suggestion {
  text: string;
  revealAt: number;
}

const SUGGESTIONS: Suggestion[] = [
  { text: "Sylvester's AI Lab", revealAt: 4 },
  { text: "Sylvester's AI Lab youtube", revealAt: 9 },
  { text: "Sylvester's AI Lab github", revealAt: 13 },
  { text: "Sylvester's AI Lab discord", revealAt: 17 },
];

export default function GoogleHomepage({
  typed,
  showCursor,
  frame,
  startFrame,
  exitFrame,
}: {
  typed: string;
  showCursor: boolean;
  frame: number;
  startFrame: number;
  exitFrame?: number;
}) {
  const cursorVisible = frame % 12 < 6;
  const appear = interpolate(frame, [startFrame, startFrame + 12], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const exit = exitFrame
    ? interpolate(frame, [exitFrame, exitFrame + 10], [1, 0], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      })
    : 1;
  const opacity = Math.min(appear, exit);

  const visibleSuggestions = SUGGESTIONS.filter((s) => typed.length >= s.revealAt);

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        position: "relative",
        overflow: "hidden",
        background: "#0A0E16",
        opacity,
      }}
    >
      <Img
        src={staticFile("backgrounds/car-bg.jpg")}
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(180deg, rgba(7,9,13,0.45) 0%, rgba(7,9,13,0.30) 45%, rgba(7,9,13,0.55) 100%)",
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          paddingBottom: 60,
        }}
      >
        <GoogleLogo size={64} />
        <div style={{ height: 34 }} />
        <div style={{ width: 580, position: "relative" }}>
          <div
            style={{
              height: 48,
              borderRadius: 24,
              border: "1px solid rgba(255,255,255,0.5)",
              background: "rgba(255,255,255,0.96)",
              boxShadow: "0 4px 18px rgba(0,0,0,0.35)",
              display: "flex",
              alignItems: "center",
              padding: "0 18px",
              gap: 12,
            }}
          >
            <span
              style={{
                flex: 1,
                fontSize: 18,
                color: "#202124",
                fontFamily: "arial, sans-serif",
                whiteSpace: "pre",
              }}
            >
              {typed}
              {showCursor && (
                <span
                  style={{
                    display: "inline-block",
                    width: 2,
                    height: 20,
                    background: "#202124",
                    marginLeft: 1,
                    verticalAlign: "middle",
                    opacity: cursorVisible ? 1 : 0,
                  }}
                />
              )}
            </span>
            <Magnifier size={20} color="#9aa0a6" />
          </div>

          {visibleSuggestions.length > 0 && (
            <div
              style={{
                marginTop: 8,
                borderRadius: 16,
                background: "#fff",
                boxShadow: "0 8px 28px rgba(0,0,0,0.35)",
                padding: "8px 0",
                overflow: "hidden",
              }}
            >
              {visibleSuggestions.map((s, i) => (
                <div
                  key={s.text}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 16,
                    padding: "10px 20px",
                    fontSize: 16,
                    color: "#202124",
                    fontFamily: "arial, sans-serif",
                    background: i === 0 ? "rgba(0,0,0,0.04)" : "transparent",
                  }}
                >
                  <Magnifier size={18} color="#9aa0a6" />
                  <span>
                    <span style={{ fontWeight: 700 }}>{typed}</span>
                    <span>{s.text.slice(typed.length)}</span>
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
