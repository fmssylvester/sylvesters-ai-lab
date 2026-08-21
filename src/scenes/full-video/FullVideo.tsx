import React from 'react';
import { AbsoluteFill, Sequence, Audio, staticFile } from 'remotion';
import { CinematicContainer } from '../../layout/CinematicContainer';
import { GradeLayer } from '../../components/grade/GradeLayer';

import { Seg1Creative } from '../seg1-creative/Seg1Creative';
import { Seg2Creative } from '../seg2-creative/Seg2Creative';
import { AvatarPlaceholder } from '../avatar-placeholder/AvatarPlaceholder';
import { Seg5Creative } from '../seg5-creative/Seg5Creative';
import { Seg6Creative } from '../seg6-creative/Seg6Creative';

// --- Segment Data from Updated EDIT_MAP ---
const SEGMENTS = [
  { id: 1, from: 0, duration: 137, lane: 'MG', component: Seg1Creative, vo: '...every customer message...got an instant intelligent reply,' },
  { id: 2, from: 137, duration: 180, lane: 'MG', component: Seg2Creative, vo: 'even at 3 am... That\'s exactly what I built with n8n.' },
  { id: 3, from: 317, duration: 153, lane: 'AVATAR', component: AvatarPlaceholder, vo: 'In this video I\'m going to show you step by step...' },
  { id: 4, from: 470, duration: 192, lane: 'AVATAR', component: AvatarPlaceholder, vo: '...every node... My name is Sylvester.' },
  { id: 5, from: 662, duration: 192, lane: 'MG', component: Seg5Creative, vo: 'Welcome to Sylvester\'s AI Lab…real AI automations...' },
  { id: 6, from: 854, duration: 149, lane: 'MG', component: Seg6Creative, vo: 'Most small businesses lose customers…they reply too slow.' },
  // ... the rest of the segments still use placeholders for now
];

// Full list of segments for the rest of the video based on EDIT_MAP
const REST_OF_SEGMENTS = [
  { id: 7, from: 1003, duration: 156, lane: 'MG', label: 'NightToDay', vo: 'Someone sends a message at 11 pm... reply the next morning,' },
  { id: 8, from: 1159, duration: 106, lane: 'MG', label: 'CompetitorSlide', vo: '...gone to a competitor who responded faster.' },
  { id: 9, from: 1265, duration: 168, lane: 'MG', label: 'AutomationNode', vo: 'The solution isn\'t hiring more staff. The solution is automation.' },
  { id: 10, from: 1433, duration: 201, lane: 'MG', label: 'CapTiles', vo: 'An AI agent that never sleeps... knows when to escalate...' },
  { id: 11, from: 1634, duration: 173, lane: 'MG', label: 'ToolLock', vo: 'Today we\'re building an AI customer support agent...' },
  { id: 12, from: 1807, duration: 180, lane: 'MG', label: 'ArchDiagram-S1', vo: 'It receives customer messages... processes them through an AI agent,' },
  { id: 13, from: 1987, duration: 108, lane: 'MG', label: 'ArchDiagram-S2', vo: 'detects sensitive requests like billing disputes...' },
  { id: 14, from: 2095, duration: 175, lane: 'MG', label: 'ArchDiagram-S3', vo: 'sends an escalation alert... returns a clean response...' },
  { id: 15, from: 2270, duration: 132, lane: 'AVATAR', label: 'Avatar Transition', vo: 'Before I show you... let me show you what the finished product looks like...' },
  { id: 16, from: 2402, duration: 149, lane: 'AVATAR_SCR', label: 'Avatar to Screen', vo: 'I\'m switching to my screen now to show you a live demo...' },
  { id: 17, from: 2551, duration: 151, lane: 'SCREEN', label: 'Landing Page Demo', vo: 'Watch carefully. This is the exact workflow...' },
  { id: 18, from: 2702, duration: 398, lane: 'SCREEN', label: 'n8n Intro', vo: 'This is n8n... Link is in the description.' },
  { id: 19, from: 3100, duration: 300, lane: 'SCREEN', label: 'n8n Cloud vs Host', vo: 'You can use n8n Cloud... or self host it on your own server.' },
  { id: 20, from: 3400, duration: 400, lane: 'SCREEN', label: 'Node Walkthrough Intro', vo: 'Let me walk you through each node one by one.' },
  { id: 21, from: 3800, duration: 600, lane: 'SCREEN', label: 'Webhook Node', vo: 'This first node is the Webhook node... accept POST requests.' },
  { id: 22, from: 4400, duration: 900, lane: 'SCREEN', label: 'AI Agent Node', vo: 'This is the AI Agent node... customize it for any business.' },
  { id: 23, from: 5300, duration: 800, lane: 'SCREEN', label: 'IF Node', vo: 'After the AI generates its response I added an IF node...' },
  { id: 24, from: 6100, duration: 600, lane: 'SCREEN', label: 'Gmail Node', vo: 'When the TRUE branch fires this Gmail node activates...' },
  { id: 25, from: 6700, duration: 600, lane: 'SCREEN', label: 'Response Node', vo: 'And finally this last node... plug into any frontend.' },
  { id: 26, from: 7300, duration: 500, lane: 'SCREEN', label: 'Normal Request Test', vo: 'I\'m going to send a normal message... Clean professional reply.' },
  { id: 27, from: 7800, duration: 600, lane: 'SCREEN', label: 'Escalation Test', vo: 'Now the escalation test... but this time the escalation message.' },
  { id: 28, from: 8400, duration: 600, lane: 'SCREEN', label: 'Gmail Alert Check', vo: 'And if I check Gmail right now... Everything working as designed.' },
  { id: 29, from: 9000, duration: 800, lane: 'AVATAR', label: 'Recap Summary', vo: 'So let\'s recap what we just built together... without any human involvement.' },
  { id: 30, from: 9800, duration: 700, lane: 'AVATAR', label: 'Template CTA', vo: 'If you want to skip the build... running in your business in under 5 minutes.' },
  { id: 31, from: 10500, duration: 700, lane: 'AVATAR', label: 'Subscribe / Teaser', vo: 'If you found this video useful please subscribe... very interesting.' },
  { id: 32, from: 11200, duration: 800, lane: 'AVATAR', label: 'Outro', vo: 'If you have questions... See you in the next one.' },
];

const SegmentPlaceholder = ({ segment }: { segment: any }) => {
  const laneColors: Record<string, string> = {
    MG: '#2A1B47',
    AVATAR: '#C0A080',
    SCREEN: '#1A2B3C',
    AVATAR_SCR: '#4A3B5C',
  };

  if (segment.component) {
    const Component = segment.component;
    return <Component />;
  }

  return (
    <AbsoluteFill style={{
      backgroundColor: laneColors[segment.lane] || '#333',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      color: 'white',
      fontFamily: 'sans-serif',
      border: '20px solid rgba(255,255,255,0.1)'
    }}>
      <div style={{ fontSize: '80px', fontWeight: 'bold', marginBottom: '20px' }}>
        {segment.label}
      </div>
      <div style={{ fontSize: '40px', opacity: 0.8, textAlign: 'center', maxWidth: '80%', padding: '0 40px' }}>
        "{segment.vo}"
      </div>
      <div style={{
        marginTop: '40px',
        padding: '10px 20px',
        borderRadius: '10px',
        backgroundColor: 'rgba(255,255,255,0.2)',
        fontSize: '30px'
      }}>
        Lane: {segment.lane} | Duration: {segment.duration}f
      </div>
    </AbsoluteFill>
  );
};

export const FullVideo = () => {
  return (
    <CinematicContainer>
      <Audio src={staticFile('kiki.mp3')} />

      {SEGMENTS.map((seg) => (
        <Sequence
          key={seg.id}
          from={seg.from}
          durationInFrames={seg.duration}
        >
          <SegmentPlaceholder segment={seg} />
        </Sequence>
      ))}

      {REST_OF_SEGMENTS.map((seg) => (
        <Sequence
          key={seg.id}
          from={seg.from}
          durationInFrames={seg.duration}
        >
          <SegmentPlaceholder segment={seg} />
        </Sequence>
      ))}

      <GradeLayer />
    </CinematicContainer>
  );
};
