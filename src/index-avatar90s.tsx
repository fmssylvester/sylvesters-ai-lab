// CI entry point for AvatarNarration90s — registers ONLY this composition.
// (Guide rule: src/index.ts imports many scenes never committed → CI bundling fails.)
import { registerRoot, Composition } from 'remotion';
import React from 'react';
import '@fontsource/inter/400.css';
import '@fontsource/inter/500.css';
import '@fontsource/inter/700.css';
import './styles/playfair-font.css';
import { AvatarNarration90s } from './scenes/avatar-narration/AvatarNarration90s';
import { TOTAL } from './scenes/avatar-narration/timeline';

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
  </React.Fragment>
));
