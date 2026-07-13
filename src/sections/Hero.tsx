import CinematicStage from "../layout/CinematicStage";
import GlassPanel from "../components/glass/GlassPanel";
import MotionHub from "../modules/MotionHub";

export default function Hero() {
  return (
    <CinematicStage>
      <GlassPanel>
        <div
          style={{
            width: "min(1280px,94vw)",
            minHeight: "640px",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            padding: "72px",
            boxSizing: "border-box",
          }}
        >
          <MotionHub />
        </div>
      </GlassPanel>
    </CinematicStage>
  );
}
