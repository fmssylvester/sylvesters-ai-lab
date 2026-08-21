// Part 1 beat renderer — CORRECTED architecture.
// Hero = real 3D motion graphics (GlassPanel). Text lives ON the surfaces.
// Real footage (brand logos + screen recordings) sits on glass/device panels
// as SUPPORTING elements that interpret the script line — never as a hero
// background, never a static-photo + floating caption.

import React from "react";
import { AbsoluteFill } from "remotion";
import {
  GlassPanel,
  GlassChip,
  LogoMark,
  DeviceFootage,
  ACCENT_COLOR,
} from "./GlassPanel";
import { renderGold, type Phrase } from "./part1Phrase";

const Row: React.FC<{ children: React.ReactNode; gap?: number; style?: React.CSSProperties }> = ({
  children,
  gap = 60,
  style,
}) => (
  <AbsoluteFill
    style={{
      alignItems: "center",
      justifyContent: "center",
      gap,
      flexDirection: "row",
      padding: "0 90px",
      ...style,
    }}
  >
    {children}
  </AbsoluteFill>
);

// Small SVG diagram used as panel media (real motion-graphic content).
const Diagram: React.FC<{ kind: "camera" | "action" | "physics" | "hand"; color: string }> = ({ kind, color }) => {
  const stroke: React.CSSProperties = {
    stroke: color,
    strokeWidth: 3,
    fill: "none",
    strokeLinecap: "round",
    strokeLinejoin: "round",
  };
  if (kind === "camera")
    return (
      <svg width={150} height={150} viewBox="0 0 150 150">
        <rect x={35} y={50} width={80} height={50} rx={8} style={stroke} />
        <circle cx={75} cy={75} r={16} style={stroke} />
        <path d="M20 75 h12 M118 75 h12" style={stroke} />
        <path d="M40 110 q35 26 70 0" strokeDasharray="5 7" style={stroke} />
      </svg>
    );
  if (kind === "action")
    return (
      <svg width={150} height={150} viewBox="0 0 150 150">
        <circle cx={75} cy={45} r={14} style={stroke} />
        <path d="M75 59 v34 M75 70 l-26 22 M75 70 l26 22" style={stroke} />
        <path d="M30 120 q45 -14 90 0" strokeDasharray="5 7" style={stroke} />
      </svg>
    );
  if (kind === "physics")
    return (
      <svg width={150} height={150} viewBox="0 0 150 150">
        {[40, 75, 110].map((x, i) => (
          <circle key={i} cx={x} cy={55 + (i % 2) * 30} r={8} style={stroke} />
        ))}
        <path d="M30 120 q45 -30 90 0" strokeDasharray="5 7" style={stroke} />
      </svg>
    );
  // hand
  return (
    <svg width={150} height={150} viewBox="0 0 150 150">
      <path d="M55 110 v-40 M70 110 v-55 M85 110 v-46 M100 110 v-30" style={stroke} />
      <path d="M45 110 q30 14 70 0" style={stroke} />
    </svg>
  );
};

export const Part1Beat: React.FC<{ id: string; frame: number; fps: number; section: any; phrase: Phrase }> = ({
  id,
  frame,
  fps,
  section,
  phrase,
}) => {
  // The spoken script line, rendered ON the primary glass panel as its body.
  const phraseBody = (
    <span style={{ opacity: phrase.op, fontSize: 21, lineHeight: 1.42, color: "#EAF1F8" }}>
      {renderGold(phrase.shown)}
      <span style={{ color: ACCENT_COLOR.cyan }}>▍</span>
    </span>
  );
  switch (id) {
    case "hook":
      return (
        <Row>
          <GlassPanel
            frame={frame}
            accent="cyan"
            width="64%"
            height="70%"
            tilt={0}
            media={
              <div style={{ textAlign: "center" }}>
                <div style={{ color: ACCENT_COLOR.cyan, fontFamily: "monospace", letterSpacing: "0.32em", fontSize: 26 }}>
                  SYLVESTER&rsquo;S AI LAB
                </div>
                <div style={{ color: "#F5F7FA", fontSize: 46, fontWeight: 700, marginTop: 18, lineHeight: 1.2 }}>
                  The Motion-First Secret
                </div>
                <div style={{ color: "#9FB1C7", fontSize: 24, marginTop: 14, maxWidth: 760 }}>
                  Why your Text-to-Video looks like everyone else&rsquo;s &mdash; and how to fix it.
                </div>
              </div>
            }
            title="PART 1 / 6"
            body={phraseBody}
          />
        </Row>
      );

    case "trap":
      return (
        <Row gap={36}>
          {/* IMAGE GEN — real brand logos on a glass panel */}
          <GlassPanel
            frame={frame}
            accent="cyan"
            tilt={-9}
            width="32%"
            height="64%"
            media={
              <div style={{ display: "flex", gap: 30, alignItems: "center", justifyContent: "center" }}>
                <LogoMark name="flux.svg" size={120} />
                <div style={{ color: "#EAF1F8", fontSize: 30, fontWeight: 700, letterSpacing: "0.04em" }}>Midjourney</div>
              </div>
            }
            title="IMAGE GEN"
            body="Midjourney · Flux — you mastered this."
          />
          {/* trap connector */}
          <div style={{ color: ACCENT_COLOR.red, fontSize: 96, fontWeight: 800, fontFamily: "monospace" }}>≠</div>
          {/* VIDEO GEN — real screen recording in a device frame */}
          <GlassPanel
            frame={frame}
            accent="red"
            tilt={9}
            width="40%"
            height="70%"
            media={<DeviceFootage frame="screen/website-scroll.webm" device="desktop" glitch />}
            title="VIDEO GEN"
            body={phraseBody}
          />
        </Row>
      );

    case "shift":
      return (
        <Row gap={70}>
          <GlassPanel
            frame={frame}
            accent="cyan"
            tilt={-8}
            width="40%"
            height="66%"
            media={<DeviceFootage frame="screen/screen-mouse.webm" device="phone" />}
            title="YOUR IMAGE"
            body={phraseBody}
          />
          <div style={{ display: "flex", flexDirection: "column", gap: 30, alignItems: "center" }}>
            <GlassChip label="CAMERA" accent="gold" frame={frame} delay={10} />
            <GlassChip label="TIME" accent="gold" frame={frame} delay={20} />
            <div style={{ color: "#9FB1C7", fontSize: 22, maxWidth: 320, textAlign: "center" }}>
              Let the prompt focus on motion, not pixels.
            </div>
          </div>
        </Row>
      );

    case "formula":
      return (
        <Row gap={46}>
          <GlassPanel
            frame={frame}
            accent="cyan"
            tilt={-7}
            width="30%"
            height="66%"
            media={<Diagram kind="camera" color={ACCENT_COLOR.cyan} />}
            title="CAMERA MOVEMENT"
            body="Push-in, parallax, orbit — direction first."
          />
          <GlassPanel
            frame={frame}
            accent="gold"
            tilt={0}
            width="30%"
            height="66%"
            media={<Diagram kind="action" color={ACCENT_COLOR.gold} />}
            title="SUBJECT ACTION"
            body={phraseBody}
          />
          <GlassPanel
            frame={frame}
            accent="cyan"
            tilt={7}
            width="30%"
            height="66%"
            media={<Diagram kind="physics" color={ACCENT_COLOR.cyan} />}
            title="ENV. PHYSICS"
            body="Light, cloth, gravity — make it obey rules."
          />
        </Row>
      );

    case "demo":
      return (
        <Row gap={50}>
          <GlassPanel
            frame={frame}
            accent="red"
            tilt={-8}
            width="40%"
            height="72%"
            media={<DeviceFootage frame="screen/website-scroll.webm" device="laptop" glitch />}
            title="✗ BAD PROMPT"
            body="Describes every detail → morphing, melting mess."
          />
          <GlassPanel
            frame={frame}
            accent="gold"
            tilt={8}
            width="40%"
            height="72%"
            media={<DeviceFootage frame="screen/screen-mouse.webm" device="laptop" />}
            title="✓ MOTION-FIRST"
            body={phraseBody}
          />
        </Row>
      );

    case "limits":
      return (
        <Row gap={46}>
          <GlassPanel
            frame={frame}
            accent="red"
            tilt={-7}
            width="30%"
            height="66%"
            media={<Diagram kind="hand" color={ACCENT_COLOR.red} />}
            title="HANDS FAIL"
            body="Generators still can't hold a hand."
          />
          <GlassPanel
            frame={frame}
            accent="red"
            tilt={0}
            width="30%"
            height="66%"
            media={
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 10 }}>
                <div style={{ color: "#C9D6E5", fontSize: 34, fontWeight: 700, letterSpacing: "0.04em" }}>1080p</div>
                <div style={{ fontSize: 15, color: "rgba(159,177,199,0.92)" }}>detail collapses</div>
                <div style={{ marginTop: 4, fontFamily: "monospace", fontSize: 13, letterSpacing: "0.22em", color: "#FF6B6B", border: "1px solid #FF6B6B", borderRadius: 6, padding: "3px 9px" }}>
                  LOW-RES
                </div>
              </div>
            }
            title="LOW-RES FAIL"
            body={phraseBody}
          />
          <GlassPanel
            frame={frame}
            accent="gold"
            tilt={7}
            width="30%"
            height="66%"
            media={<DeviceFootage frame="screen/website-scroll.webm" device="tablet" />}
            title="MOTION TRANSFER"
            body="Paste real footage, let AI restyle the motion."
          />
        </Row>
      );

    case "verdict":
      return (
        <Row>
          <GlassPanel
            frame={frame}
            accent="gold"
            width="60%"
            height="66%"
            tilt={0}
            media={
              <div style={{ display: "flex", gap: 30, alignItems: "center", justifyContent: "center" }}>
                <LogoMark name="flux.svg" size={92} />
                <LogoMark name="minimax.svg" size={96} />
                <div style={{ color: "#EAF1F8", fontSize: 24, fontWeight: 700 }}>Midjourney</div>
              </div>
            }
            title="SYLVESTER'S VERDICT"
            body={phraseBody}
          />
        </Row>
      );

    default:
      return null;
  }
};
