import { Composition, staticFile } from 'remotion';
import { AbsoluteFill, Video, useCurrentFrame, useVideoConfig, interpolate, Sequence } from 'remotion';
import {
  GradientBg,
  GlowCircle,
  GlowText,
  HighlightText,
  StepLabel,
  ToolLabel,
  LowerThird,
  COLORS,
  FONTS,
} from '../../components/typography/Typography';

const SCREEN_RECORDINGS = [
  { src: staticFile('ep01/flow_tutorial_1.mp4'), label: 'Google Flow', start: 0, duration: 1800 },
  { src: staticFile('ep01/higgsfield_tutorial.mp4'), label: 'Higgsfield', start: 1800, duration: 1800 },
  { src: staticFile('ep01/topview_canvas.mp4'), label: 'Topview Canvas', start: 3600, duration: 1200 },
];

const ScreenRecording: React.FC<{ src: string; label: string }> = ({ src, label }) => {
  return (
    <AbsoluteFill>
      <Video
        src={src}
        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        volume={0}
      />
      <ToolLabel name={label} />
    </AbsoluteFill>
  );
};

const IntroCard: React.FC = () => {
  const frame = useCurrentFrame();

  const opacity = interpolate(frame, [0, 15, 75, 90], [0, 1, 1, 0], { extrapolateRight: 'clamp' });
  const scale = interpolate(frame, [0, 15], [0.85, 1], { extrapolateRight: 'clamp' });

  return (
    <AbsoluteFill style={{ opacity, transform: `scale(${scale})` }}>
      <GradientBg>
        <GlowCircle size={400} x={300} y={400} color={COLORS.accent} blur={100} />
        <GlowCircle size={300} x={1600} y={600} color={COLORS.gold} blur={80} />

        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <div
            style={{
              color: COLORS.accent,
              fontSize: 20,
              fontFamily: FONTS.mono,
              letterSpacing: 6,
              marginBottom: 24,
              textShadow: `0 0 20px ${COLORS.accentGlow}`,
            }}
          >
            EPISODE 01
          </div>
          <GlowText text="The Motion-First" size={90} delay={10} duration={80} />
          <GlowText text="Secret" size={90} delay={15} duration={75} />
          <div
            style={{
              marginTop: 32,
              opacity: interpolate(frame, [20, 30], [0, 1], { extrapolateRight: 'clamp' }),
            }}
          >
            <span
              style={{
                color: COLORS.gold,
                fontSize: 22,
                fontFamily: FONTS.body,
                fontWeight: 500,
                letterSpacing: 3,
                textShadow: `0 0 15px ${COLORS.goldGlow}`,
              }}
            >
              Mastering AI Image-to-Video Prompting
            </span>
          </div>
        </div>
      </GradientBg>
    </AbsoluteFill>
  );
};

const OutroCard: React.FC = () => {
  const frame = useCurrentFrame();

  const opacity = interpolate(frame, [0, 15], [0, 1], { extrapolateRight: 'clamp' });

  return (
    <AbsoluteFill style={{ opacity }}>
      <GradientBg>
        <GlowCircle size={500} x={960} y={540} color={COLORS.accent} blur={120} />

        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <GlowText text="Subscribe for More" size={56} delay={0} duration={60} />
          <div
            style={{
              marginTop: 24,
              opacity: interpolate(frame, [15, 25], [0, 1], { extrapolateRight: 'clamp' }),
            }}
          >
            <span
              style={{
                color: COLORS.gold,
                fontSize: 24,
                fontFamily: FONTS.body,
                fontWeight: 500,
                letterSpacing: 2,
                textShadow: `0 0 15px ${COLORS.goldGlow}`,
              }}
            >
              Next: The Prompt Formula
            </span>
          </div>
        </div>
      </GradientBg>
    </AbsoluteFill>
  );
};

export const Ep01Scene: React.FC = () => {
  return (
    <AbsoluteFill style={{ background: COLORS.bg }}>
      {/* Intro */}
      <Sequence from={0} durationInFrames={90}>
        <IntroCard />
      </Sequence>

      {/* Screen recordings */}
      {SCREEN_RECORDINGS.map((rec) => (
        <Sequence key={rec.src} from={90 + rec.start} durationInFrames={rec.duration}>
          <ScreenRecording src={rec.src} label={rec.label} />
        </Sequence>
      ))}

      {/* Text overlays */}
      <Sequence from={90} durationInFrames={60}>
        <HighlightText before="Step 1:" highlight="Pick Your Tool" size={56} />
      </Sequence>
      <Sequence from={270} durationInFrames={60}>
        <HighlightText before="Step 2:" highlight="Write Your Prompt" size={56} />
      </Sequence>
      <Sequence from={450} durationInFrames={60}>
        <HighlightText before="Step 3:" highlight="Generate & Iterate" size={56} />
      </Sequence>

      {/* Outro */}
      <Sequence from={540} durationInFrames={60}>
        <OutroCard />
      </Sequence>
    </AbsoluteFill>
  );
};

export default Ep01Scene;
