// ImageText — Text overlaid on an image or footage.
// The image IS the content. Text is a label/callout on top.
// Dark gradient at bottom ensures text readability.

import React from "react";
import { AbsoluteFill, Img, staticFile, useCurrentFrame, useVideoConfig, interpolate, spring } from "remotion";

interface ImageTextProps {
  imageSrc: string;
  text: string;
  subtitle?: string;
  delay?: number;
  textPosition?: "center" | "bottom-left" | "bottom-center" | "top-left";
  fontSize?: number;
  gradientOpacity?: number;
}

export const ImageText: React.FC<ImageTextProps> = ({
  imageSrc,
  text,
  subtitle,
  delay = 0,
  textPosition = "bottom-left",
  fontSize = 72,
  gradientOpacity = 0.7,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const local = frame - delay;

  if (local < 0) return null;

  const textScale = spring({
    frame: local,
    fps,
    config: { stiffness: 200, damping: 20 },
  });

  const textOpacity = interpolate(local, [0, 6], [0, 1], {
    extrapolateRight: "clamp",
  });

  const subtitleOpacity = interpolate(local, [8, 14], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const positionStyle: React.CSSProperties = (() => {
    switch (textPosition) {
      case "center":
        return { alignItems: "center", justifyContent: "center", textAlign: "center" };
      case "bottom-left":
        return { alignItems: "flex-start", justifyContent: "flex-end", textAlign: "left" };
      case "bottom-center":
        return { alignItems: "center", justifyContent: "flex-end", textAlign: "center" };
      case "top-left":
        return { alignItems: "flex-start", justifyContent: "flex-start", textAlign: "left" };
      default:
        return { alignItems: "flex-start", justifyContent: "flex-end", textAlign: "left" };
    }
  })();

  const textPadding = textPosition.startsWith("bottom") || textPosition === "top-left"
    ? "0 0 80px 80px"
    : "80px";

  return (
    <AbsoluteFill>
      {/* Background image with slow Ken Burns zoom */}
      <Img
        src={imageSrc}
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
          transform: `scale(${1 + local * 0.0003})`,
        }}
      />

      {/* Dark gradient overlay for text readability */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: textPosition.startsWith("bottom")
            ? `linear-gradient(to top, rgba(0,0,0,${gradientOpacity}) 0%, rgba(0,0,0,${gradientOpacity * 0.4}) 40%, transparent 70%)`
            : textPosition === "top-left"
            ? `linear-gradient(to bottom, rgba(0,0,0,${gradientOpacity}) 0%, rgba(0,0,0,${gradientOpacity * 0.4}) 40%, transparent 70%)`
            : `radial-gradient(ellipse at center, rgba(0,0,0,${gradientOpacity * 0.3}) 0%, rgba(0,0,0,${gradientOpacity * 0.6}) 100%)`,
        }}
      />

      {/* Text overlay */}
      <AbsoluteFill
        style={{
          display: "flex",
          flexDirection: "column",
          padding: textPadding,
          gap: 12,
          ...positionStyle,
        }}
      >
        <div
          style={{
            fontFamily: "'Melodrama', 'Switzer', sans-serif",
            fontWeight: 700,
            fontSize,
            color: "#FFFFFF",
            textTransform: "uppercase",
            letterSpacing: "-0.02em",
            lineHeight: 1.1,
            textShadow: "0 2px 40px rgba(0,0,0,0.8), 0 0 80px rgba(0,0,0,0.4)",
            transform: `scale(${textScale})`,
            opacity: textOpacity,
          }}
        >
          {text}
        </div>
        {subtitle && (
          <div
            style={{
              fontFamily: "'Switzer', sans-serif",
              fontWeight: 400,
              fontSize: 28,
              color: "#F1F5F9",
              textShadow: "0 2px 20px rgba(0,0,0,0.8)",
              opacity: subtitleOpacity,
              maxWidth: 600,
            }}
          >
            {subtitle}
          </div>
        )}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
