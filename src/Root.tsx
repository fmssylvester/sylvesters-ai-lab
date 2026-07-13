import { Composition } from 'remotion';
import './styles/global.css';
import ToolOverloadScene from './scenes/scene1/ToolOverloadScene';
import BrowserScene from './scenes/browser/BrowserScene';
import { BROWSER_SCENE } from './scenes/browser/browserTimeline';
import TextTemplateA from './components/text/TextTemplateA';
import TextTemplateB from './components/text/TextTemplateB';
import TextTemplateC from './components/text/TextTemplateC';
import CollectorScene from './scenes/collector/CollectorScene';
import CollectorCinematic from './scenes/collector/CollectorCinematic';
import OpeningSequence from './scenes/collector/OpeningSequence';
import { COLLECTOR } from './scenes/collector/collectorTimeline';

export const RemotionRoot = () => {
  return (
    <>
      <Composition
        id="ToolOverload"
        component={ToolOverloadScene}
        durationInFrames={300}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="Collector"
        component={CollectorScene}
        durationInFrames={COLLECTOR.TOTAL_FRAMES}
        fps={COLLECTOR.FPS}
        width={1920}
        height={1080}
      />
      <Composition
        id="CollectorCinematic"
        component={CollectorCinematic}
        durationInFrames={COLLECTOR.TOTAL_FRAMES}
        fps={COLLECTOR.FPS}
        width={1920}
        height={1080}
      />
      <Composition
        id="OpeningSequence"
        component={OpeningSequence}
        durationInFrames={COLLECTOR.TOTAL_FRAMES}
        fps={COLLECTOR.FPS}
        width={1920}
        height={1080}
      />
      <Composition
        id="BrowserScene"
        component={BrowserScene}
        durationInFrames={BROWSER_SCENE.TOTAL_FRAMES}
        fps={BROWSER_SCENE.FPS}
        width={1920}
        height={1080}
      />
      <Composition
        id="Empty"
        component={() => <div style={{ backgroundColor: 'white', flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '100px' }}>Hello Remotion</div>}
        durationInFrames={60}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="TextAurora"
        component={TextTemplateA}
        durationInFrames={180}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="TextGlass"
        component={TextTemplateB}
        durationInFrames={180}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="TextForge"
        component={TextTemplateC}
        durationInFrames={180}
        fps={30}
        width={1920}
        height={1080}
      />
    </>
  );
};
