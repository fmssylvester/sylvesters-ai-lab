import { useCurrentFrame, useVideoConfig, spring, interpolate } from "remotion";

interface GlowTextProps {
  text: string;
  keywords?: Record<string, string>;
  fontSize?: number;
  color?: string;
  keywordColor?: string;
  align?: "left" | "center" | "right";
  maxWidth?: number;
  enterDelay?: number;
  style?: React.CSSProperties;
}

export default function GlowText({
  text,
  keywords = {},
  fontSize = 48,
  color = "rgba(255,255,255,0.9)",
  keywordColor = "#00D9FF",
  align = "center",
  maxWidth = 900,
  enterDelay = 0,
  style = {},
}: GlowTextProps) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const pop = spring({
    frame: frame - enterDelay,
    fps,
    config: { damping: 16, stiffness: 100 },
  });

  const yOffset = interpolate(pop, [0, 1], [20, 0]);

  const words = text.split(" ");
  let globalIndex = 0;

  return (
    <div
      style={{
        fontFamily: "'Inter', sans-serif",
        fontSize,
        fontWeight: 800,
        fontStyle: "italic",
        lineHeight: 1.2,
        color,
        textAlign: align,
        maxWidth,
        transform: `translateY(${yOffset}px)`,
        opacity: pop,
        ...style,
      }}
    >
      {words.map((word, i) => {
        const cleanWord = word.replace(/[.,!?;:]/g, "");
        const punct = word.slice(cleanWord.length);
        const isKeyword = cleanWord in keywords;
        const wordColor = isKeyword
          ? keywords[cleanWord] || keywordColor
          : color;
        const wordIndex = globalIndex++;
        const wordDelay = enterDelay + wordIndex * 2;
        const wordPop = spring({
          frame: frame - wordDelay,
          fps,
          config: { damping: 20, stiffness: 120 },
        });

        return (
          <span
            key={i}
            style={{
              color: wordColor,
              opacity: wordPop,
              textShadow: isKeyword
                ? `0 0 30px ${wordColor}66, 0 0 60px ${wordColor}33`
                : "none",
              display: "inline-block",
              marginRight: fontSize * 0.25,
            }}
          >
            {word}
            {punct}
          </span>
        );
      })}
    </div>
  );
}
