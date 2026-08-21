import { Composition, staticFile } from 'remotion';
import { AbsoluteFill, Video, useCurrentFrame, useVideoConfig, interpolate, Sequence } from 'remotion';

export const VideoTestScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill style={{ background: '#07080F' }}>
      <Sequence from={0} durationInFrames={180}>
        <AbsoluteFill>
          <Video
            src={staticFile('ep01/flow_tutorial_1.mp4')}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            volume={0}
            onError={(e) => console.error('Video error:', e)}
          />
          <div
            style={{
              position: 'absolute',
              bottom: 40,
              left: 40,
              background: 'rgba(0, 0, 0, 0.7)',
              padding: '12px 24px',
              borderRadius: 8,
              color: '#00D9FF',
              fontSize: 24,
              fontFamily: 'sans-serif',
              fontWeight: 600,
            }}
          >
            Google Flow
          </div>
        </AbsoluteFill>
      </Sequence>
    </AbsoluteFill>
  );
};

export default VideoTestScene;
