import { Composition, Sequence } from 'remotion';
import { SceneAChatDemo as S0_SceneAChatDemo } from './Scene0';
import S1_Scene3amMoment from './Scene1';
import S2_Scene3 from './Scene2';
import S3_Scene3 from './Scene3';
import S4_Scene4 from './Scene4';
import { Scene5 as S5_Scene5 } from './Scene5';
import { Scene6 as S6_Scene6 } from './Scene6';
import { MainScene as S7_MainScene } from './Scene7';
import { Scene8 as S8_Scene8 } from './Scene8';
import { Scene10 as S9_Scene10 } from './Scene9';
import S10_Scene10 from './Scene10';
import S11_Scene11 from './Scene11';
import S12_Scene12 from './Scene12';
import S13_Scene13 from './Scene13';
import S14_Scene14 from './Scene14';
import S15_Scene16 from './Scene15';
import S16_Scene16 from './Scene16';

const FullVideo = () => (
  <>
    <Sequence from={0} durationInFrames={137}><S0_SceneAChatDemo /></Sequence>
    <Sequence from={137} durationInFrames={209}><S1_Scene3amMoment /></Sequence>
    <Sequence from={346} durationInFrames={125}><S2_Scene3 /></Sequence>
    <Sequence from={471} durationInFrames={221}><S3_Scene3 /></Sequence>
    <Sequence from={692} durationInFrames={192}><S4_Scene4 /></Sequence>
    <Sequence from={884} durationInFrames={151}><S5_Scene5 /></Sequence>
    <Sequence from={1035} durationInFrames={125}><S6_Scene6 /></Sequence>
    <Sequence from={1160} durationInFrames={132}><S7_MainScene /></Sequence>
    <Sequence from={1292} durationInFrames={170}><S8_Scene8 /></Sequence>
    <Sequence from={1462} durationInFrames={202}><S9_Scene10 /></Sequence>
    <Sequence from={1664} durationInFrames={173}><S10_Scene10 /></Sequence>
    <Sequence from={1837} durationInFrames={151}><S11_Scene11 /></Sequence>
    <Sequence from={1988} durationInFrames={108}><S12_Scene12 /></Sequence>
    <Sequence from={2096} durationInFrames={175}><S13_Scene13 /></Sequence>
    <Sequence from={2271} durationInFrames={161}><S14_Scene14 /></Sequence>
    <Sequence from={2432} durationInFrames={149}><S15_Scene16 /></Sequence>
    <Sequence from={2581} durationInFrames={156}><S16_Scene16 /></Sequence>
  </>
);

export const Root = () => (
  <Composition id="pipeline-full" component={FullVideo} durationInFrames={2737} fps={30} width={1920} height={1080} />
);