import { registerRoot, Composition } from 'remotion';
import React from 'react';
import N8nIntroScene from './scenes/n8n/N8nIntroScene';
import N8nOutroScene from './scenes/n8n/N8nOutroScene';
import { N8N_INTRO_TIMELINE, N8N_OUTRO_TIMELINE } from './scenes/n8n/n8nTimeline';

registerRoot(() => (
  <React.Fragment>
    <Composition
      id="n8n-intro"
      component={N8nIntroScene}
      durationInFrames={N8N_INTRO_TIMELINE.TOTAL_FRAMES}
      fps={N8N_INTRO_TIMELINE.FPS}
      width={1920}
      height={1080}
    />
    <Composition
      id="n8n-outro"
      component={N8nOutroScene}
      durationInFrames={N8N_OUTRO_TIMELINE.TOTAL_FRAMES}
      fps={N8N_OUTRO_TIMELINE.FPS}
      width={1920}
      height={1080}
    />
  </React.Fragment>
));