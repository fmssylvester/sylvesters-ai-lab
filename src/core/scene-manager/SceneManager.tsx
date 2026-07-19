import React from "react";
import {
  AbsoluteFill,
  Img,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { COLOR, FONT_DISPLAY } from "../../core/typography/typography";
import {
  MasterTimeline,
  Beat,
  activeBeatIndex,
} from "../../core/motion/MasterDirector";
import { TransitionEngine } from "../../core/transitions/TransitionEngine";
import AtmosphereEngine from "../../components/atmosphere/AtmosphereEngine";
import CinematicBackdrop from "../../components/cinematic/CinematicBackdrop";
import KineticScript from "../../components/cinematic/KineticScript";
import GlassPanel from "../../components/glass/GlassPanel";
import GlowText from "../../components/motion/GlowText";
import { LogoReveal, StepTimeline, CtaEndCard } from "../../components/ui-kit/PremiumTemplates";
import { DataFlowDashboard } from "../../components/ui-kit/UiKit";
import { BeforeAfter } from "../../components/ui-kit/AutomationTemplates";
import BrowserWindow from "../../components/browser/BrowserWindow";

/* ------------------------------------------------------------------ */
/* Helpers (no hardcoded content — everything derived from the beat)   */
/* ------------------------------------------------------------------ */
function moodGrade(mood?: string): { overlay: string; accent: string } {
  switch (mood) {
    case "urgent":
      return { overlay: "rgba(255,107,107,0.06)", accent: "#FF6B6B" };
    case "energetic":
      return { overlay: "rgba(231,180,77,0.05)", accent: "#E7B84D" };
    case "dramatic":
      return { overlay: "rgba(0,0,0,0.22)", accent: COLOR.accent };
    case "calm":
    default:
      return { overlay: "transparent", accent: COLOR.accent };
  }
}

function sentences(text: string): string[] {
  return (text || "")
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter(Boolean);
}

function iconFor(name: string): string {
  const n = (name || "").toLowerCase();
  if (n.includes("youtube")) return "youtube";
  if (n.includes("github")) return "github";
  if (n.includes("medium")) return "medium";
  if (n.includes("doc")) return "doc";
  if (n.includes("branch") || n.includes("flow")) return "branch";
  return "spark";
}

function splitComparison(text: string) {
  const t = text || "";
  let beforeText = t;
  let afterText = "";
  const m = t.match(/^(.*?)\s+(?:vs\.?|versus|compared to|—|–)\s+(.*)$/i);
  if (m) {
    beforeText = m[1];
    afterText = m[2];
  } else if (t.toLowerCase().includes("before") && t.toLowerCase().includes("after")) {
    const i = t.toLowerCase().indexOf("after");
    beforeText = t.slice(0, i);
    afterText = t.slice(i);
  }
  const mk = (s: string) => [
    { k: "Detail", v: s.length > 40 ? s.slice(0, 40) + "…" : s, icon: "spark" },
  ];
  return {
    beforeLabel: "Before",
    afterLabel: "After",
    before: mk(beforeText.trim()),
    after: mk(afterText.trim()),
  };
}

function BrandLogos({ assets }: { assets: { name: string; path: string }[] }) {
  if (!assets || !assets.length) return null;
  return (
    <div
      style={{
        display: "flex",
        gap: 24,
        alignItems: "center",
        justifyContent: "center",
        flexWrap: "wrap",
      }}
    >
      {assets.map((a, i) => (
        <div
          key={i}
          style={{
            width: 110,
            height: 110,
            borderRadius: 20,
            background: "rgba(255,255,255,0.06)",
            border: "1px solid rgba(255,255,255,0.14)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 14,
          }}
        >
          <Img
            src={staticFile(a.path)}
            style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }}
          />
        </div>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Beat scene dispatch                                                 */
/* ------------------------------------------------------------------ */
function BeatScene({ beat, channelName }: { beat: Beat; channelName: string }) {
  const grade = moodGrade(beat.mood);
  const treatment = beat.visualTreatment ?? "text_statement";
  const assets = beat.assets ?? [];

  switch (treatment) {
    case "tool_showcase": {
      const name = assets[0]?.name ?? channelName;
      return (
        <AbsoluteFill>
          <LogoReveal wordmark={name} tagline={beat.heading ?? ""} />
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              alignItems: "flex-end",
              justifyContent: "center",
              padding: 60,
              pointerEvents: "none",
            }}
          >
            <GlassPanel>
              <div
                style={{
                  padding: "36px 52px",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 18,
                }}
              >
                <BrandLogos assets={assets} />
                {beat.heading ? (
                  <div
                    style={{
                      fontFamily: FONT_DISPLAY,
                      fontSize: 26,
                      letterSpacing: "0.3em",
                      textTransform: "uppercase",
                      color: COLOR.muted,
                    }}
                  >
                    {beat.heading}
                  </div>
                ) : null}
              </div>
            </GlassPanel>
          </div>
        </AbsoluteFill>
      );
    }

    case "browser_demo": {
      const tool = assets[0]?.name ?? beat.heading ?? channelName;
      const host = (tool || "tool")
        .toLowerCase()
        .replace(/[^a-z0-9]/g, "");
      return (
        <AbsoluteFill
          style={{
            background: COLOR.bg,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 28,
            }}
          >
            <BrowserWindow
              tabs={[{ title: tool, active: true }]}
              url={`https://${host}.ai`}
              width={1200}
              height={700}
            >
              <div
                style={{
                  width: "100%",
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 30,
                  background: "linear-gradient(180deg,#0B1220,#050914)",
                  padding: 40,
                }}
              >
                <BrandLogos assets={assets} />
                {beat.heading ? (
                  <div
                    style={{
                      fontFamily: FONT_DISPLAY,
                      fontSize: 26,
                      letterSpacing: "0.3em",
                      textTransform: "uppercase",
                      color: COLOR.muted,
                    }}
                  >
                    {beat.heading}
                  </div>
                ) : null}
              </div>
            </BrowserWindow>
            {beat.broll ? (
              <div
                style={{
                  color: COLOR.muted,
                  fontSize: 24,
                  maxWidth: 900,
                  textAlign: "center",
                }}
              >
                {beat.broll}
              </div>
            ) : null}
          </div>
        </AbsoluteFill>
      );
    }

    case "data_visualization":
    case "chart_animation": {
      const sources =
        assets && assets.length
          ? assets.map((a) => ({ label: a.name, icon: iconFor(a.name) }))
          : [{ label: beat.heading ?? "Data", icon: "spark" }];
      return (
        <DataFlowDashboard
          title={beat.heading ?? "Data"}
          tag={beat.mood ?? ""}
          sources={sources}
        />
      );
    }

    case "comparison_reveal": {
      const parts = splitComparison(beat.text);
      return (
        <BeforeAfter
          beforeLabel={parts.beforeLabel}
          afterLabel={parts.afterLabel}
          before={parts.before}
          after={parts.after}
        />
      );
    }

    case "list_reveal": {
      const steps = sentences(beat.text).slice(0, 6);
      return (
        <StepTimeline
          title={beat.heading ?? "Steps"}
          steps={steps.length ? steps : ["Step 1", "Step 2"]}
        />
      );
    }

    case "cta": {
      return (
        <CtaEndCard
          wordmark={channelName}
          cta={beat.text}
          sub={beat.heading ?? ""}
        />
      );
    }

    case "text_statement":
    default: {
      return (
        <AbsoluteFill style={{ background: COLOR.bg }}>
          <div style={{ position: "absolute", inset: 0, opacity: 0.6 }}>
            <AtmosphereEngine mood={beat.mood} />
          </div>
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: 80,
            }}
          >
            <GlassPanel>
              <div
                style={{
                  padding: "56px 72px",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 18,
                  maxWidth: 1300,
                }}
              >
                {beat.heading ? (
                  <div
                    style={{
                      fontFamily: FONT_DISPLAY,
                      fontSize: 28,
                      letterSpacing: "0.3em",
                      textTransform: "uppercase",
                      color: COLOR.muted,
                    }}
                  >
                    {beat.heading}
                  </div>
                ) : null}
                <GlowText
                  text={beat.text}
                  fontSize={64}
                  maxWidth={1200}
                  keywordColor={grade.accent}
                />
              </div>
            </GlassPanel>
          </div>
        </AbsoluteFill>
      );
    }
  }
}

/* ------------------------------------------------------------------ */
/* SceneManager — the cinematic director                              */
/* ------------------------------------------------------------------ */
export function SceneManager({
  timeline,
  channelName = "Sylvester's AI Lab",
}: {
  timeline: MasterTimeline;
  channelName?: string;
}) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const idx = activeBeatIndex(timeline, frame);
  const inIntro = frame < timeline.introFrames;

  if (inIntro) {
    return (
      <AbsoluteFill style={{ background: COLOR.bg }}>
        <CinematicBackdrop mood="energetic" frame={frame} />
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 24,
          }}
        >
          <LogoReveal wordmark={channelName} tagline="AI automations, built for you" />
        </div>
      </AbsoluteFill>
    );
  }

  const beat = timeline.beats[idx] ?? timeline.beats[timeline.beats.length - 1];
  const grade = moodGrade(beat.mood);

  // Caption shows the spoken line only when the scene does NOT already render
  // it as its hero text (text_statement renders the line via GlowText).
  const showCaption =
    beat.kind !== "cta" &&
    beat.visualTreatment !== "text_statement" &&
    beat.words.length > 0;

  return (
    <AbsoluteFill style={{ background: COLOR.bg }}>
      <TransitionEngine
        frame={frame}
        enterFrame={beat.startFrame}
        exitFrame={beat.kind === "cta" ? undefined : beat.endFrame}
        mode="fade"
      >
        <BeatScene beat={beat} channelName={channelName} />
      </TransitionEngine>

      {grade.overlay !== "transparent" && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: grade.overlay,
            pointerEvents: "none",
          }}
        />
      )}

      {showCaption && (
        <div
          style={{
            position: "absolute",
            bottom: 110,
            left: 0,
            right: 0,
            display: "flex",
            justifyContent: "center",
            padding: "0 80px",
            pointerEvents: "none",
            zIndex: 40,
          }}
        >
          <GlassPanel>
            <div style={{ padding: "26px 48px" }}>
              <KineticScript
                words={beat.words}
                audioStartFrame={timeline.audioStartFrame}
                fps={fps}
                frame={frame}
                fontSize={44}
              />
            </div>
          </GlassPanel>
        </div>
      )}
    </AbsoluteFill>
  );
}

export default SceneManager;
