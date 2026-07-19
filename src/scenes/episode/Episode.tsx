import { AbsoluteFill } from "remotion";
import { computeTimeline } from "../../core/motion/MasterDirector";
import SceneManager from "../../core/scene-manager/SceneManager";

/**
 * Episode is a thin shell. All cinematic decisions live in MasterDirector
 * (timeline) and SceneManager (frame-driven direction). The Component receives
 * the entire enriched runtime (episodeRuntime.json) as its props — nothing is
 * hardcoded; every visual is derived from that data.
 */
export default function Episode(props: any) {
  const runtime = props ?? {};
  const channelName: string = props?.channelName ?? "Sylvester's AI Lab";
  const timeline = computeTimeline(runtime);
  return (
    <AbsoluteFill style={{ backgroundColor: "#07080F" }}>
      <SceneManager timeline={timeline} channelName={channelName} />
    </AbsoluteFill>
  );
}
