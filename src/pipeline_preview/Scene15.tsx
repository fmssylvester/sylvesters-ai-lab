// duration: 149
import React from 'react';
import {
  useCurrentFrame,
  useVideoConfig,
  spring,
  interpolate,
  Sequence,
  Audio,
  Img,
  staticFile,
} from 'remotion';

export default function Scene16() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Header Text Animations
  const text1Spring = spring({ frame, fps, config: { damping: 14 } });
  
  // Viewport Glide Perspective Animation
  const uiGlideSpring = spring({ frame: Math.max(0, frame - 6), fps, config: { damping: 16 } });
  const uiRotateX = interpolate(uiGlideSpring, [0, 1], [22, 4]);
  const uiScale = interpolate(uiGlideSpring, [0, 1], [0.88, 1]);
  const uiTranslateY = interpolate(uiGlideSpring, [0, 1], [70, 0]);

  // Floating Widget Entrance Pop (sfx at frame 54)
  const widgetSpring = spring({ frame: Math.max(0, frame - 54), fps, config: { damping: 12, stiffness: 180 } });

  // Widget Click & Dialogue Reveal (sfx at frame 90)
  const clickSpring = spring({ frame: Math.max(0, frame - 90), fps, config: { damping: 15 } });

  return (
    <div style={{
      width: 1920,
      height: 1080,
      background: 'radial-gradient(circle at 50% 50%, #0B1120 0%, #07090D 100%)',
      fontFamily: "'Plus Jakarta Sans', sans-serif",
      color: '#FFFFFF',
      overflow: 'hidden',
      position: 'relative',
    }}>
      <style>
        {`@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@700;800;900&family=JetBrains+Mono:wght@500;700;800&display=swap');`}
      </style>

      {/* Gradient Mesh Base */}
      <div style={{
        position: 'absolute',
        inset: 0,
        background: 'radial-gradient(circle at 20% 30%, rgba(0, 217, 255, 0.15) 0%, transparent 55%), radial-gradient(circle at 82% 72%, rgba(16, 185, 129, 0.10) 0%, transparent 50%), radial-gradient(circle at 48% 88%, rgba(231, 184, 77, 0.08) 0%, transparent 55%)',
        transform: `translate(${Math.sin(frame / 80) * 7}px, ${Math.cos(frame / 100) * 7}px)`,
        pointerEvents: 'none',
      }} />

      {/* Grid Pattern */}
      <div style={{
        position: 'absolute',
        inset: 0,
        backgroundImage: 'linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)',
        backgroundSize: '80px 80px',
        opacity: 0.6,
        maskImage: 'radial-gradient(ellipse at center, black 30%, transparent 82%)',
        WebkitMaskImage: 'radial-gradient(ellipse at center, black 30%, transparent 82%)',
      }} />

      {/* Audio SFX */}
      <Sequence from={6}>
        <Audio src={staticFile('sfx/whoosh-a.wav')} volume={0.25} />
      </Sequence>
      <Sequence from={54}>
        <Audio src={staticFile('sfx/pop.wav')} volume={0.3} />
      </Sequence>
      <Sequence from={90}>
        <Audio src={staticFile('sfx/click.wav')} volume={0.3} />
      </Sequence>

      {/* Header Region */}
      <div style={{
        position: 'absolute',
        top: 60,
        left: 0,
        width: 1920,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        zIndex: 20,
      }}>
        {/* Text 1 Badge */}
        <div style={{
          transform: `translateY(${interpolate(text1Spring, [0, 1], [-30, 0])}px)`,
          opacity: text1Spring,
          background: 'rgba(0, 217, 255, 0.12)',
          border: '1px solid rgba(0, 217, 255, 0.4)',
          borderRadius: 30,
          padding: '10px 28px',
          color: '#00D9FF',
          fontSize: 18,
          fontWeight: 900,
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          boxShadow: '0 0 20px rgba(0, 217, 255, 0.2)',
        }}>
          LIVE DEMO ON LANDING PAGE
        </div>

        {/* Text 2 Header */}
        <div style={{
          marginTop: 14,
          transform: `translateY(${interpolate(text1Spring, [0, 1], [20, 0])}px)`,
          opacity: text1Spring,
          fontSize: 40,
          fontWeight: 900,
          letterSpacing: '-0.02em',
          background: 'linear-gradient(180deg, #FFFFFF 0%, #00D9FF 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          textShadow: '0 10px 30px rgba(0,0,0,0.5)',
        }}>
          Floating AI Assistant Widget
        </div>
      </div>

      {/* Canvas Main Web Viewport */}
      <div style={{
        position: 'absolute',
        top: 210,
        left: 160,
        width: 1600,
        height: 800,
        perspective: 1200,
        display: 'flex',
        justifyContent: 'center',
      }}>
        {/* Web UI Glass Container */}
        <div style={{
          width: 1540,
          height: 780,
          background: 'rgba(255, 255, 255, 0.04)',
          borderRadius: 24,
          border: '1px solid rgba(255, 255, 255, 0.12)',
          backdropFilter: 'blur(12px) saturate(120%)',
          WebkitBackdropFilter: 'blur(12px) saturate(120%)',
          boxShadow: '0 30px 80px rgba(0, 0, 0, 0.6), 0 0 100px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.12), 0 0 100px rgba(0, 217, 255, 0.06)',
          transform: `rotateX(${uiRotateX}deg) scale(${uiScale}) translateY(${uiTranslateY}px)`,
          transformOrigin: 'center top',
          position: 'relative',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
        }}>
          {/* Top Window Bar */}
          <div style={{
            height: 48,
            borderBottom: '1px solid rgba(255, 255, 255, 0.12)',
            display: 'flex',
            alignItems: 'center',
            padding: '0 20px',
            gap: 8,
            background: 'rgba(255, 255, 255, 0.03)',
          }}>
            <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#FF6D5A' }} />
            <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#E7B84D' }} />
            <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#10B981' }} />
            <div style={{
              marginLeft: 20,
              flex: 1,
              maxWidth: 380,
              height: 26,
              borderRadius: 13,
              background: 'rgba(255, 255, 255, 0.06)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              display: 'flex',
              alignItems: 'center',
              paddingLeft: 16,
              fontSize: 12,
              color: 'rgba(255, 255, 255, 0.5)',
              fontFamily: "'JetBrains Mono', 'IBM Plex Mono', monospace",
            }}>
              https://app.launchpad.ai
            </div>
          </div>

          {/* Web Landing Page Frame - Simplified Clean Hero Layout */}
          <div style={{
            flex: 1,
            padding: '60px 80px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            position: 'relative',
          }}>
            {/* Clean Hero Content Section */}
            <div style={{ maxWidth: 780 }}>
              <div style={{
                display: 'inline-block',
                padding: '6px 16px',
                borderRadius: 20,
                background: 'rgba(0, 217, 255, 0.1)',
                border: '1px solid rgba(0, 217, 255, 0.3)',
                color: '#00D9FF',
                fontSize: 13,
                fontWeight: 800,
                letterSpacing: '0.08em',
                marginBottom: 24,
              }}>
                AUTOMATION SUITE
              </div>

              {/* Exact Storyboard Headline */}
              <div style={{
                fontSize: 52,
                fontWeight: 900,
                lineHeight: 1.15,
                color: '#FFFFFF',
                letterSpacing: '-0.02em',
                marginBottom: 20,
              }}>
                Floating AI Assistant Widget
              </div>

              {/* Minimal Clean Subtitle */}
              <div style={{
                fontSize: 18,
                lineHeight: 1.6,
                color: 'rgba(255, 255, 255, 0.65)',
                maxWidth: 580,
                marginBottom: 36,
              }}>
                Instant 24/7 intelligent assistance directly embedded into your landing page and product workflow.
              </div>

              <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                <div style={{
                  padding: '14px 32px',
                  borderRadius: 12,
                  background: '#00D9FF',
                  color: '#07090D',
                  fontSize: 15,
                  fontWeight: 900,
                  boxShadow: '0 0 25px rgba(0, 217, 255, 0.4)',
                }}>
                  Get Started
                </div>
                <div style={{
                  padding: '14px 28px',
                  borderRadius: 12,
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  color: 'rgba(255, 255, 255, 0.7)',
                  fontSize: 15,
                  fontWeight: 700,
                }}>
                  Documentation
                </div>
              </div>
            </div>

            {/* Subtle Minimal Background Decorative Card (Keeps layout clean without clutter) */}
            <div style={{
              position: 'absolute',
              right: 80,
              top: '50%',
              transform: 'translateY(-50%)',
              width: 480,
              height: 320,
              borderRadius: 20,
              border: '1px dashed rgba(0, 217, 255, 0.2)',
              background: 'rgba(0, 217, 255, 0.02)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              gap: 16,
            }}>
              <div style={{
                width: 64,
                height: 64,
                borderRadius: '50%',
                background: 'rgba(0, 217, 255, 0.08)',
                border: '1px solid rgba(0, 217, 255, 0.25)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <div style={{ width: 14, height: 14, borderRadius: '50%', background: '#00D9FF' }} />
              </div>
              <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.4)', fontWeight: 600 }}>
                Live Widget Workspace
              </div>
            </div>

            {/* Isolated & Heroic Floating Support Widget + Glass Chat Window */}
            <div style={{
              position: 'absolute',
              bottom: 40,
              right: 48,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-end',
              zIndex: 30,
            }}>
              {/* Floating Chat Dialogue Box */}
              <div style={{
                marginBottom: 20,
                width: 380,
                background: 'rgba(11, 17, 32, 0.88)',
                border: '2px solid #00D9FF',
                borderRadius: 22,
                padding: 22,
                boxShadow: '0 30px 80px rgba(0, 0, 0, 0.8), 0 0 50px rgba(0, 217, 255, 0.35)',
                backdropFilter: 'blur(16px) saturate(140%)',
                WebkitBackdropFilter: 'blur(16px) saturate(140%)',
                transform: `scale(${clickSpring}) translateY(${interpolate(clickSpring, [0, 1], [30, 0])}px)`,
                opacity: clickSpring,
                transformOrigin: 'bottom right',
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  borderBottom: '1px solid rgba(255, 255, 255, 0.12)',
                  paddingBottom: 12,
                  marginBottom: 16,
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{
                      width: 32,
                      height: 32,
                      borderRadius: '50%',
                      background: 'rgba(0, 217, 255, 0.2)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: '1.5px solid #00D9FF',
                    }}>
                      <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#00D9FF' }} />
                    </div>
                    <span style={{ fontSize: 14, fontWeight: 800, color: '#FFFFFF' }}>AI Support Assistant</span>
                  </div>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    fontSize: 12,
                    color: '#10B981',
                    fontWeight: 700,
                  }}>
                    <div style={{
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      background: '#10B981',
                      boxShadow: '0 0 10px #10B981',
                    }} />
                    Active Now
                  </div>
                </div>

                <div style={{
                  background: 'rgba(0, 217, 255, 0.12)',
                  border: '1px solid rgba(0, 217, 255, 0.4)',
                  borderRadius: 14,
                  padding: '16px 18px',
                  fontSize: 15,
                  lineHeight: 1.5,
                  color: '#FFFFFF',
                  fontWeight: 600,
                }}>
                  Hello! How can I assist you with your AI widget deployment today?
                </div>
              </div>

              {/* Enlarged Floating Cyan Launcher Icon Button */}
              <div style={{
                transform: `scale(${widgetSpring})`,
                opacity: widgetSpring,
              }}>
                <div style={{
                  width: 82,
                  height: 82,
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #00D9FF 0%, #00B3FF 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: `0 0 45px rgba(0, 217, 255, 0.8), 0 12px 35px rgba(0, 0, 0, 0.5)`,
                  transform: `scale(${1 + Math.sin(frame / 10) * 0.04})`,
                  position: 'relative',
                  cursor: 'pointer',
                }}>
                  <Img
                    src={staticFile('02_ICONS/ai-chat.svg')}
                    style={{
                      width: 38,
                      height: 38,
                      filter: 'brightness(0) invert(1)',
                    }}
                  />
                  <div style={{
                    position: 'absolute',
                    inset: -6,
                    borderRadius: '50%',
                    border: '2px solid #00D9FF',
                    opacity: 0.4 + Math.sin(frame / 6) * 0.35,
                    boxShadow: '0 0 20px rgba(0, 217, 255, 0.6)',
                  }} />
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Film Grain Overlay */}
      <div style={{
        position: 'absolute',
        inset: 0,
        opacity: 0.05,
        pointerEvents: 'none',
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
      }} />

      {/* Vignette */}
      <div style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        background: 'radial-gradient(ellipse at center, transparent 45%, rgba(0, 0, 0, 0.5) 100%)',
      }} />
    </div>
  );
}