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
import { GlassPoster, GamifiedBanner, DataFlowDashboard, PromptInputBar, VoiceBanner, OtpSheet, SwipeCard, FrostedPoster, AppNavMenu } from './components/ui-kit/UiKit';
import { AgentWorkflow, ToolGrid, BeforeAfter } from './components/ui-kit/AutomationTemplates';
import { ProblemSolution, StepTimeline, AgentActivityStream, CtaEndCard, LogoReveal } from './components/ui-kit/PremiumTemplates';

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

      {/* ── Reusable UI-kit templates (faithful replicas, 16:9) ── */}
      <Composition id="GlassPoster" component={GlassPoster} durationInFrames={180} fps={30} width={1920} height={1080}
        defaultProps={{ heading: "KEEP PUSHING FORWARD!", sub: "A glassmorphism exploration" }} />
      <Composition id="GamifiedBanner" component={GamifiedBanner} durationInFrames={240} fps={30} width={1920} height={1080}
        defaultProps={{ brand: "RoomStake.com", heading: "Many play. One wins. None lose.", sub: "Every deposit returns, minus a small fee — the thrill stays.", cta: "Choose a room", big: "60" }} />
      <Composition id="DataFlowDashboard" component={DataFlowDashboard} durationInFrames={180} fps={30} width={1920} height={1080}
        defaultProps={{ title: "Gyanaguru 2.0", tag: "Beta", sources: [
          { label: "YouTube", icon: "youtube" }, { label: "Medium", icon: "medium" }, { label: "GitHub", icon: "github" },
          { label: "Leetcode", icon: "leetcode" }, { label: "PDF, Word, other docs", icon: "doc" },
        ] }} />
      <Composition id="PromptInputBar" component={PromptInputBar} durationInFrames={180} fps={30} width={1920} height={1080}
        defaultProps={{ query: "Provide complex widgets to improve d", typed: "Provide complex widgets to improve d" }} />
      <Composition id="VoiceBanner" component={VoiceBanner} durationInFrames={180} fps={30} width={1920} height={1080}
        defaultProps={{ placeholder: "Ask anything...", left: "Normal", right: "DeepThink" }} />
      <Composition id="OtpSheet" component={OtpSheet} durationInFrames={120} fps={30} width={1920} height={1080}
        defaultProps={{ title: "Let's verify your number", filled: ["1", "2"], resend: "Resend" }} />
      <Composition id="SwipeCard" component={SwipeCard} durationInFrames={270} fps={30} width={1920} height={1080}
        defaultProps={{ title: "TROJENA MOUNTAIN", badge: "$ High ROI", desc: "Trojena will be an iconic, world-class destination, blending natural and developed landscapes." }} />
      <Composition id="FrostedPoster" component={FrostedPoster} durationInFrames={180} fps={30} width={1920} height={1080}
        defaultProps={{ topTitle: "Frosted", topSub: "Concept", blTitle: "Clear", blSub: "iOS", brTitle: "Blur", brSub: "One UI" }} />
      <Composition id="AppNavMenu" component={AppNavMenu} durationInFrames={350} fps={30} width={1920} height={1080}
        defaultProps={{ appName: "YouTube", menu: [
          { label: "Home", icon: "home" }, { label: "Explore", icon: "search" }, { label: "Short", icon: "film" },
          { label: "Subscription", icon: "folder" }, { label: "Information", icon: "info" }, { label: "Settings", icon: "gear" }, { label: "Log out", icon: "logout" },
        ] }} />

      {/* ── Automation-explainer templates (brand-skinned) ── */}
      <Composition id="AgentWorkflow" component={AgentWorkflow} durationInFrames={200} fps={30} width={1920} height={1080} />
      <Composition id="ToolGrid" component={ToolGrid} durationInFrames={180} fps={30} width={1920} height={1080} />
      <Composition id="BeforeAfter" component={BeforeAfter} durationInFrames={150} fps={30} width={1920} height={1080} />

      {/* ── Premium automation-explainer templates ── */}
      <Composition id="ProblemSolution" component={ProblemSolution} durationInFrames={160} fps={30} width={1920} height={1080} />
      <Composition id="StepTimeline" component={StepTimeline} durationInFrames={180} fps={30} width={1920} height={1080} />
      <Composition id="AgentActivityStream" component={AgentActivityStream} durationInFrames={150} fps={30} width={1920} height={1080} />
      <Composition id="CtaEndCard" component={CtaEndCard} durationInFrames={120} fps={30} width={1920} height={1080} />
      <Composition id="LogoReveal" component={LogoReveal} durationInFrames={150} fps={30} width={1920} height={1080} />
    </>
  );
};
