// MotionFirstPart1 — Part 1 of the 6-part series ("The Motion-First Secret"),
// 16:9 build, rendered with reusable engines. Content lives in part1Runtime.json;
// text is caption-only and phrase-based (BRAIN.md: "text is never the hero").

import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate } from "remotion";
import { Part1Beat } from "./Part1Beat";
import { GlassPanel, ACCENT_COLOR, type Accent } from "./GlassPanel";
import { Grid } from "../../components/grid/GridEngine";
import { Scanline } from "../../components/effects/ScanlineEngine";
import { PART1, SectionId, TOTAL, sectionAtFrame } from "./part1Timeline";
import { phraseState, renderGold, type Phrase } from "./part1Phrase";
import runtime from "./part1Runtime.json";

type Section = (typeof runtime.sections)[number];

const BG: React.CSSProperties = {
  background:
    "radial-gradient(120% 80% at 50% 12%, rgba(0,217,255,0.10), rgba(7,9,13,0) 55%)," +
    "radial-gradient(120% 90% at 50% 100%, rgba(231,184,77,0.06), rgba(7,9,13,0) 60%)," +
    "linear-gradient(180deg, #07090D 0%, #090C12 50%, #07090D 100%)",
};

const ChapterHeading: React.FC<{ section: Section; local: number }> = ({ section, local }) => {
  const o =
    interpolate(local, [0, 40], [0, 1], { extrapolateRight: "clamp" }) *
    interpolate(local, [160, 240], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const y = interpolate(local, [0, 60], [36, 0], { extrapolateRight: "clamp" });
  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "flex-start", paddingTop: 90, pointerEvents: "none" }}>
      <div
        style={{
          transform: `translateY(${y}px)`,
          opacity: o,
          color: "#E7B84D",
          fontFamily: "monospace",
          fontWeight: 700,
          letterSpacing: "0.22em",
          fontSize: 20,
          textTransform: "uppercase",
        }}
      >
        {section.heading}
      </div>
    </AbsoluteFill>
  );
};

const Hook: React.FC<{ frame: number }> = ({ frame }) => {
  const phrase = phraseState(runtime.hook, frame, 120);
  return (
    <AbsoluteFill style={{ ...BG, alignItems: "center", justifyContent: "center", pointerEvents: "none" }}>
      <GlassPanel
        frame={frame}
        accent="cyan"
        width="74%"
        height="58%"
        tilt={-4}
        title="SYLVESTER'S AI LAB"
        body={
          <span style={{ opacity: phrase.op, fontSize: 32, lineHeight: 1.42, color: "#EAF1F8" }}>
            {renderGold(phrase.shown)}
            <span style={{ color: ACCENT_COLOR.cyan }}>▍</span>
          </span>
        }
      />
    </AbsoluteFill>
  );
};

const CTA: React.FC<{ frame: number }> = ({ frame }) => {
  const local = frame - PART1.verdict.end;
  const phrase = phraseState(runtime.cta, local, 120);
  return (
    <AbsoluteFill style={{ ...BG, alignItems: "center", justifyContent: "center", pointerEvents: "none" }}>
      <GlassPanel
        frame={frame}
        accent="gold"
        width="70%"
        height="52%"
        tilt={3}
        title="THANKS FOR WATCHING"
        body={
          <span style={{ opacity: phrase.op, fontSize: 30, lineHeight: 1.42, color: "#EAF1F8" }}>
            {renderGold(phrase.shown)}
            <span style={{ color: ACCENT_COLOR.gold }}>▍</span>
          </span>
        }
      />
      <div style={{ position: "absolute", bottom: 90, display: "flex", justifyContent: "center", gap: 22, color: "rgba(245,247,250,0.72)", fontSize: 20 }}>
        <span>▸ Subscribe</span>
        <span>▸ Like</span>
        <span>▸ Comment</span>
      </div>
    </AbsoluteFill>
  );
};

export const MotionFirstPart1: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill style={BG}>
      <Grid frame={frame} cell={54} color="rgba(0,217,255,0.16)" glow="rgba(0,217,255,0.05)" speed={0.5} style={{ opacity: 1 }} />
      <Scanline frame={frame} color="rgba(0,217,255,0.10)" opacity={0.4} lineGap={4} beam />

      {frame < PART1.HOOK.end && <Hook frame={frame} />}

      {frame >= PART1.HOOK.end && frame < PART1.verdict.end && (
        <>
          <BeatLayer frame={frame} fps={fps} />
        </>
      )}

      {frame >= PART1.verdict.end && <CTA frame={frame} />}
    </AbsoluteFill>
  );
};

const BeatLayer: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => {
  const sec = sectionAtFrame(frame) as SectionId;
  const section = runtime.sections.find((s) => s.id === sec)!;
  const local = frame - PART1[sec].start;
  return (
    <AbsoluteFill>
      <Part1Beat id={sec} frame={frame} fps={fps} section={section} phrase={phraseState(section.voiceover, local)} />
      <ChapterHeading section={section} local={local} />
    </AbsoluteFill>
  );
};
