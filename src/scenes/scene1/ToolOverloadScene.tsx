import { useCurrentFrame, interpolate } from "remotion";
import { useMemo } from "react";
import BrowserWindow from "../../components/browser/BrowserWindow";
import LoadingSpinner from "../../components/browser/LoadingSpinner";
import BrowserTab from "../../components/browser/BrowserTab";
import Scene1Notification from "./components/Scene1Notification";
import Scene1Cursor from "./components/Scene1Cursor";
import Scene1Silhouette from "./components/Scene1Silhouette";
import { SCENE1 } from "../../core/timeline/scene1Timeline";
import { AI_TOOL_TABS, BOOKMARK_ITEMS, NOTIFICATION_TEXTS } from "./scene1Assets";

export default function ToolOverloadScene() {
  const frame = useCurrentFrame();

  const stage = useMemo(() => {
    if (frame < SCENE1.STAGE2_INTRUSION.START) return 1;
    if (frame < SCENE1.STAGE3_ESCALATION.START) return 2;
    if (frame < SCENE1.STAGE4_CLUTTER.START) return 3;
    if (frame < SCENE1.STAGE5_FREEZE.START) return 4;
    return 5;
  }, [frame]);

  const isDimmed = frame >= SCENE1.STAGE2_INTRUSION.BROWSER_DIM;

  const bookmarkProgress = useMemo(() => {
    if (frame < SCENE1.STAGE4_CLUTTER.START) return 0;
    return interpolate(
      frame,
      [SCENE1.STAGE4_CLUTTER.START, SCENE1.STAGE4_CLUTTER.START + 50],
      [0, 1],
      { extrapolateRight: "clamp" }
    );
  }, [frame]);

  const showSpinner = frame >= SCENE1.STAGE5_FREEZE.SPINNER_APPEAR;

  const showFreezeText =
    frame >= SCENE1.STAGE5_FREEZE.TEXT_FADE;

  const freezeTextOpacity = useMemo(() => {
    if (!showFreezeText) return 0;
    return interpolate(
      frame,
      [SCENE1.STAGE5_FREEZE.TEXT_FADE, SCENE1.STAGE5_FREEZE.TEXT_FADE + 15],
      [0, 1],
      { extrapolateRight: "clamp" }
    );
  }, [frame, showFreezeText]);

  const tabsToRender = useMemo(() => {
    const tabArrivalFrames = [
      SCENE1.STAGE3_ESCALATION.TAB_1,
      SCENE1.STAGE3_ESCALATION.TAB_2,
      SCENE1.STAGE3_ESCALATION.TAB_3,
      SCENE1.STAGE3_ESCALATION.TAB_4,
    ];
    return AI_TOOL_TABS.filter((_, i) => frame >= tabArrivalFrames[i]);
  }, [frame]);

  const isStage4 = stage === 4 || stage === 5;

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        position: "relative",
        background: "radial-gradient(ellipse at 50% 60%, #0B1220, #050914)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        overflow: "hidden",
      }}
    >
      <Scene1Silhouette />

      <BrowserWindow
        dimmed={isDimmed}
        bookmarkProgress={isStage4 ? bookmarkProgress : 0}
        bookmarks={isStage4 ? BOOKMARK_ITEMS : undefined}
        renderTabBar={() => (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 2,
              height: "100%",
              padding: "0 12px",
              overflow: "hidden",
            }}
          >
            <BrowserTab
              label="Sylvester's AI"
              active={tabsToRender.length === 0}
              arrivalDelay={0}
            />
            {tabsToRender.map((tool, i) => (
              <BrowserTab
                key={tool.label}
                label={tool.label}
                active={i === tabsToRender.length - 1}
                arrivalDelay={(i + 1) * 500}
              />
            ))}
          </div>
        )}
        notification={
          stage >= 2 && (
            <Scene1Notification
              text={NOTIFICATION_TEXTS[0]}
              arriveAt={SCENE1.STAGE2_INTRUSION.NOTIFICATION_ARRIVE}
              currentFrame={frame}
            />
          )
        }
      >
        {showSpinner ? (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 24,
            }}
          >
            <LoadingSpinner size={56} />
          </div>
        ) : (
          <div
            style={{
              fontSize: 22,
              fontWeight: 600,
              color: "rgba(255,255,255,0.15)",
              letterSpacing: "0.02em",
              textAlign: "center",
              lineHeight: 1.6,
            }}
          >
            Welcome to
            <br />
            Sylvester's AI Lab
          </div>
        )}
      </BrowserWindow>

      <Scene1Cursor
        appearAt={SCENE1.STAGE5_FREEZE.CURSOR_APPEAR}
        hesitateAt={SCENE1.STAGE5_FREEZE.CURSOR_HESITATE}
        freezeAt={SCENE1.STAGE5_FREEZE.FREEZE}
        currentFrame={frame}
      />

      {showFreezeText && (
        <div
          style={{
            position: "absolute",
            bottom: "6%",
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 50,
            opacity: freezeTextOpacity,
            textAlign: "center",
          }}
        >
          <div
            style={{
              fontSize: 20,
              fontWeight: 400,
              color: "rgba(245,247,250,0.6)",
              letterSpacing: "0.06em",
              fontStyle: "italic",
            }}
          >
            Still not getting faster?
          </div>
        </div>
      )}
    </div>
  );
}
