import React from 'react';
import { AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame } from 'remotion';
import { S, FPS, TOTAL } from './timeline';
import { SceneBackdrop, FilmGrade } from './kit';
import { S1Question3D } from './3d/S1Question3D';
import { S2Promise3D } from './3d/S2Promise3D';
import { S3Lab3D } from './3d/S3Lab3D';
import { S4Problem3D } from './3d/S4Problem3D';
import { S5Solution3D } from './3d/S5Solution3D';
import { S6Agent3D } from './3d/S6Agent3D';
import { S7Pipeline3D } from './3d/S7Pipeline3D';
import { S8Speed3D } from './3d/S8Speed3D';
import { S9Handoff3D } from './3d/S9Handoff3D';

// ── SFX helper: placed on motion beats, low volume so VO dominates ──────────
const Sfx: React.FC<{ from: number; file: string; volume: number }> = ({ from, file, volume }) => (
  <Sequence from={from} durationInFrames={60} layout="none">
    <Audio src={staticFile(`sfx/${file}`)} volume={volume} />
  </Sequence>
);

// ── Cross-dissolve + parallax between scenes: a fading dark overlay that
//    recedes/scales with the outgoing scene for the last 16 frames ──────────
export const AvatarNarration90s: React.FC = () => {
  const frame = useCurrentFrame();

  return (
    <AbsoluteFill style={{ background: '#07090D' }}>
      {/* voiceover (90s Kiki, made from this script) */}
      <Audio src={staticFile('kiki.wav')} />

      {/* SFX bed — beats from the approved storyboard (scene-relative → absolute) */}
      <Sfx from={S.S1.start + 255} file="ding-low.wav" volume={0.34} />   {/* S1: reply arrives @8.5s */}
      <Sfx from={S.S1.start + 10} file="riser-hit.wav" volume={0.2} />    {/* S1: hook riser */}
      <Sfx from={S.S1.end - 4} file="whoosh-a.wav" volume={0.22} />       {/* S1 → S2 transition */}
      <Sfx from={S.S2.start + 40} file="typewriter.wav" volume={0.14} />  {/* S2: node lines */}
      <Sfx from={S.S2.start + 70} file="typewriter.wav" volume={0.14} />
      <Sfx from={S.S2.start + 100} file="typewriter.wav" volume={0.14} />
      <Sfx from={S.S2.start + 108} file="pop.wav" volume={0.18} />        {/* S2: avatar chip */}
      <Sfx from={S.S3.start + 4} file="whoosh-b.wav" volume={0.24} />     {/* S3: card drop */}
      <Sfx from={S.S3.start + 32} file="pop.wav" volume={0.18} />
      <Sfx from={S.S3.start + 44} file="pop.wav" volume={0.18} />
      <Sfx from={S.S4.start + 30} file="clock-tick.wav" volume={0.3} />   {/* S4: slow clock */}
      <Sfx from={S.S4.start + 84} file="error-beep.wav" volume={0.24} />  {/* S4: lost customer */}
      <Sfx from={S.S4.start + 120} file="whoosh-a.wav" volume={0.2} />    {/* S4: avatar drift */}
      <Sfx from={S.S5.start + 44} file="whoosh-b.wav" volume={0.22} />    {/* S5: staff dim thud */}
      <Sfx from={S.S5.start + 70} file="riser-hit2.wav" volume={0.26} />  {/* S5: automation pop */}
      <Sfx from={S.S6.start + 40} file="robot-blip.wav" volume={0.2} />   {/* S6: trait chips */}
      <Sfx from={S.S6.start + 90} file="robot-blip.wav" volume={0.2} />
      <Sfx from={S.S6.start + 158} file="ding-confirm.wav" volume={0.3} />{/* S6: 999 count */}
      <Sfx from={S.S7.start + 30} file="pop.wav" volume={0.16} />         {/* S7: nodes 1-5 */}
      <Sfx from={S.S7.start + 50} file="pop.wav" volume={0.16} />
      <Sfx from={S.S7.start + 70} file="pop.wav" volume={0.16} />
      <Sfx from={S.S7.start + 90} file="pop.wav" volume={0.16} />
      <Sfx from={S.S7.start + 110} file="pop.wav" volume={0.16} />
      <Sfx from={S.S7.start + 320} file="email-notif.wav" volume={0.3} /> {/* S7: alert to email */}
      <Sfx from={S.S8.start + 12} file="clock-tick-fast.wav" volume={0.24} /> {/* S8: fast ticks */}
      <Sfx from={S.S8.start + 100} file="riser-hit.wav" volume={0.3} />   {/* S8: 2.8s landing */}
      <Sfx from={S.S8.start + 110} file="ding-low.wav" volume={0.34} />   {/* S8: JSON pop */}
      <Sfx from={S.S9.start + 8} file="whoosh-a.wav" volume={0.24} />     {/* S9: frame in */}
      <Sfx from={S.S9.start + 192} file="click.wav" volume={0.5} />       {/* S9: cursor click */}
      <Sfx from={S.S9.start + 200} file="pop.wav" volume={0.18} />

      {/* scenes with 16-frame cross-dissolve overlaps */}
      <Sequence from={S.S1.start} durationInFrames={S.S2.start - S.S1.start + 16}>
        <FadeScene dur={S.S2.start - S.S1.start + 16}><S1Question3D /></FadeScene>
      </Sequence>
      <Sequence from={S.S2.start} durationInFrames={S.S3.start - S.S2.start + 16}>
        <FadeScene dur={S.S3.start - S.S2.start + 16}><S2Promise3D /></FadeScene>
      </Sequence>
      <Sequence from={S.S3.start} durationInFrames={S.S4.start - S.S3.start + 16}>
        <FadeScene dur={S.S4.start - S.S3.start + 16}><S3Lab3D /></FadeScene>
      </Sequence>
      <Sequence from={S.S4.start} durationInFrames={S.S5.start - S.S4.start + 16}>
        <FadeScene dur={S.S5.start - S.S4.start + 16}><S4Problem3D /></FadeScene>
      </Sequence>
      <Sequence from={S.S5.start} durationInFrames={S.S6.start - S.S5.start + 16}>
        <FadeScene dur={S.S6.start - S.S5.start + 16}><S5Solution3D /></FadeScene>
      </Sequence>
      <Sequence from={S.S6.start} durationInFrames={S.S7.start - S.S6.start + 16}>
        <FadeScene dur={S.S7.start - S.S6.start + 16}><S6Agent3D /></FadeScene>
      </Sequence>
      <Sequence from={S.S7.start} durationInFrames={S.S8.start - S.S7.start + 16}>
        <FadeScene dur={S.S8.start - S.S7.start + 16}><S7Pipeline3D /></FadeScene>
      </Sequence>
      <Sequence from={S.S8.start} durationInFrames={S.S9.start - S.S8.start + 16}>
        <FadeScene dur={S.S9.start - S.S8.start + 16}><S8Speed3D /></FadeScene>
      </Sequence>
      <Sequence from={S.S9.start} durationInFrames={TOTAL - S.S9.start}>
        <FadeScene dur={TOTAL - S.S9.start}><S9Handoff3D /></FadeScene>
      </Sequence>

      {/* global grade over everything */}
      <FilmGrade frame={frame} />
    </AbsoluteFill>
  );
};

// fade the scene in/out on its first/last 12 frames for the dissolve
const FadeScene: React.FC<{ children: React.ReactNode; dur: number }> = ({ children, dur }) => {
  const frame = useCurrentFrame();
  const o = Math.min(1, frame / 12, (dur - frame) / 12);
  return <div style={{ opacity: o, width: '100%', height: '100%' }}>{children}</div>;
};
