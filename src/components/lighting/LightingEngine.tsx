import AtmosphereEngine from "../atmosphere/AtmosphereEngine";
import AuroraBackground from "../background/AuroraBackground";
import DepthEngine from "../depth/DepthEngine";
import ParticleEngine from "../particles/ParticleEngine";
import NoiseEngine from "../noise/NoiseEngine";
import Vignette from "../postfx/Vignette";

export default function LightingEngine() {
  return (
    <>
      <AtmosphereEngine />
      <DepthEngine />
      <AuroraBackground />
      <ParticleEngine />
      <NoiseEngine />
      <Vignette />
    </>
  );
}
