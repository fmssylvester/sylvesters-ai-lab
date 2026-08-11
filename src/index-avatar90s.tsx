// CI entry point for AvatarNarration90s — registers ONLY this composition.
// (Guide rule: src/index.ts imports many scenes never committed → CI bundling fails.)
import { registerRoot, Composition } from 'remotion';
import React from 'react';
import '@fontsource/inter/400.css';
import '@fontsource/inter/500.css';
import '@fontsource/inter/700.css';
import './styles/playfair-font.css';
import { AvatarNarration90s } from './scenes/avatar-narration/AvatarNarration90s';
import { Smoke3D } from './scenes/avatar-narration/smoke/Smoke3D';
import { S1Question3D } from './scenes/avatar-narration/3d/S1Question3D';
import { S2Promise3D } from './scenes/avatar-narration/3d/S2Promise3D';
import { S3Lab3D } from './scenes/avatar-narration/3d/S3Lab3D';
import { S4Problem3D } from './scenes/avatar-narration/3d/S4Problem3D';
import { S5Solution3D } from './scenes/avatar-narration/3d/S5Solution3D';
import { S6Agent3D } from './scenes/avatar-narration/3d/S6Agent3D';
import { S7Pipeline3D } from './scenes/avatar-narration/3d/S7Pipeline3D';
import { S8Speed3D } from './scenes/avatar-narration/3d/S8Speed3D';
import { S9Handoff3D } from './scenes/avatar-narration/3d/S9Handoff3D';
import { TOTAL } from './scenes/avatar-narration/timeline';

const SCENE3D: [string, React.FC, number][] = [
  ['S1-3D', S1Question3D, 318],
  ['S2-3D', S2Promise3D, 317],
  ['S3-3D', S3Lab3D, 164],
  ['S4-3D', S4Problem3D, 383],
  ['S5-3D', S5Solution3D, 172],
  ['S6-3D', S6Agent3D, 173],
  ['S7-3D', S7Pipeline3D, 433],
  ['S8-3D', S8Speed3D, 176],
  ['S9-3D', S9Handoff3D, 459],
];

registerRoot(() => (
  <React.Fragment>
    <Composition
      id="AvatarNarration90s"
      component={AvatarNarration90s}
      durationInFrames={TOTAL}
      fps={30}
      width={1920}
      height={1080}
    />
    <Composition
      id="Smoke3D"
      component={Smoke3D}
      durationInFrames={48}
      fps={30}
      width={1280}
      height={720}
    />
    {SCENE3D.map(([id, comp, dur]) => (
      <Composition key={id} id={id} component={comp} durationInFrames={dur} fps={30} width={1280} height={720} />
    ))}
  </React.Fragment>
));
