import CinematicContainer from "../../layout/CinematicContainer";
import LightingEngine from "../../components/lighting/LightingEngine";
import CameraEngine from "../../components/camera/CameraEngine";
import Hero from "../../sections/Hero";

export default function LandingScene() {
  return (
    <CinematicContainer>
      <LightingEngine />
      <CameraEngine>
        <Hero />
      </CameraEngine>
    </CinematicContainer>
  );
}
