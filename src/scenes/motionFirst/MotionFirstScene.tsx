import { AbsoluteFill } from "remotion";
import { computeTimeline } from "../../core/motion/MasterDirector";
import SceneManager from "../../core/scene-manager/SceneManager";
import runtime from "./motionFirstRuntime.json";

/**
 * MotionFirstScene is a thin director shell. All cinematic decisions live in
 * MasterDirector (timeline, via motionFirstRuntime.json) and SceneManager
 * (frame-driven direction, mf_* visual treatments). Nothing is hardcoded here.
 */
export default function MotionFirstScene() {
  const timeline = computeTimeline(runtime as any);
  return (
    <AbsoluteFill style={{ backgroundColor: "#07090D" }}>
      <SceneManager
        timeline={timeline}
        channelName="Sylvester's AI Lab"
        motionFirst
        vertical
        title={runtime.title ?? "The Motion-First Secret"}
      />
    </AbsoluteFill>
  );
}
