# Remotion Video Generation Skill

<!-- INSTALL_MODE: lite -->

Remotion is a framework for creating videos programmatically using React.

---

## Forbidden Patterns

These **will break your renders** (flickering, desynced, or failed):

| Pattern | Why Broken | Use Instead |
|---------|------------|-------------|
| CSS `transition-*` | Not frame-synchronized | `interpolate()` |
| CSS `animation` | Not frame-synchronized | `spring()` |
| Tailwind `animate-*` | Uses CSS animations | `useCurrentFrame()` + inline styles |
| Tailwind `transition-*` | Uses CSS transitions | `interpolate()` |
| Framer Motion | Async, not frame-based | Remotion's `spring()` |
| GSAP | Async, not frame-based | Remotion's `interpolate()` |
| `setTimeout` / `setInterval` | Wall-clock time, not video time | Frame-based logic |
| `requestAnimationFrame` | Browser-controlled | `useCurrentFrame()` |
| R3F `useFrame()` | Not Remotion-controlled | `useCurrentFrame()` |

**Golden Rule**: ALL animations MUST be driven by `useCurrentFrame()`.

```tsx
// WRONG - will flicker
<div className="transition-opacity duration-300" style={{ opacity: show ? 1 : 0 }}>

// CORRECT - frame-synchronized
const frame = useCurrentFrame();
const opacity = interpolate(frame, [0, 30], [0, 1], { extrapolateRight: 'clamp' });
<div style={{ opacity }}>
```

---

## Quick Start

```bash
npx create-video@latest      # Create project
npx remotion studio          # Start development
```

### Essential Pattern

```tsx
import { useCurrentFrame, useVideoConfig, interpolate, AbsoluteFill } from 'remotion';

export const MyVideo: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Always use fps for time-based values (e.g., 2 seconds = 2 * fps)
  const opacity = interpolate(frame, [0, 1 * fps], [0, 1], {
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill style={{ backgroundColor: 'white' }}>
      <h1 style={{ opacity }}>Hello Remotion!</h1>
    </AbsoluteFill>
  );
};
```

### Register in Root.tsx

```tsx
import { Composition } from 'remotion';
import { MyVideo } from './MyVideo';

export const RemotionRoot: React.FC = () => {
  return (
    <Composition
      id="MyVideo"
      component={MyVideo}
      durationInFrames={5 * 30}  // 5 seconds at 30fps
      fps={30}
      width={1920}
      height={1080}
    />
  );
};
```

---

## CLI Commands

### Development
```bash
npx remotion studio              # Start Studio
npx remotion studio --port=3001  # Custom port
```

### Rendering
```bash
# Basic render
npx remotion render src/index.ts CompositionId out/video.mp4

# With props
npx remotion render src/index.ts MyVideo out/video.mp4 \
  --props='{"title":"Hello"}'

# Specific frames
npx remotion render src/index.ts MyVideo out/video.mp4 --frames=0-100

# Custom codec & quality
npx remotion render src/index.ts MyVideo out/video.mp4 \
  --codec=h264 --crf=18

# Render still image
npx remotion still src/index.ts MyVideo out/thumb.png --frame=30

# List all compositions
npx remotion compositions src/index.ts
```

### Codecs
| Codec | Format | Use Case |
|-------|--------|----------|
| `h264` | MP4 | Default, most compatible |
| `h265` | MP4 | Smaller files |
| `vp9` | WebM | Web delivery |
| `prores` | MOV | Professional editing |
| `gif` | GIF | Short loops |

---

## Packages

| Package | Purpose | Install |
|---------|---------|---------|
| `remotion` | Core library | Included |
| `@remotion/cli` | CLI tools | Included |
| `@remotion/media` | Video/Audio components | `npx remotion add @remotion/media` |
| `@remotion/player` | Web player | `npx remotion add @remotion/player` |
| `@remotion/transitions` | Scene transitions | `npx remotion add @remotion/transitions` |
| `@remotion/three` | 3D with Three.js | `npx remotion add @remotion/three` |
| `@remotion/captions` | Subtitles | `npx remotion add @remotion/captions` |
| `@remotion/google-fonts` | Google Fonts | `npx remotion add @remotion/google-fonts` |
| `@remotion/lottie` | Lottie animations | `npx remotion add @remotion/lottie` |

---

## AI Workflow: MANDATORY Verification

**You MUST follow this workflow when generating Remotion code.**

### Step 1: Generate
Create video components following the patterns above. **Respect forbidden patterns.**

### Step 2: Register
Add composition to `src/Root.tsx`.

### Step 3: Verify (REQUIRED)
Run render and fix ALL errors:
```bash
npx remotion render src/index.ts MyVideo out/video.mp4
```

### Step 4: Fix Loop
If render fails:
1. Read error message
2. Fix the source code
3. Run render again
4. Repeat until success

**DO NOT notify user until render passes.**

### Step 5: Report
Only after successful render:
- Confirm video rendered
- Output path and file size

### Common Errors

| Error | Cause | Fix |
|-------|-------|-----|
| `Cannot find module` | Missing import | Add import statement |
| `input range must be monotonic` | Keyframes not ascending | Fix array order in `interpolate()` |
| `fps must be positive` | Missing fps | Pass `fps` from `useVideoConfig()` |
| `Composition not found` | Not registered | Check `Root.tsx` |

---

## Attribution

Technical patterns reference [Remotion's official skill](https://github.com/remotion-dev/remotion/tree/main/packages/skills).
AI workflow, CLI reference, and rendering/player guides are original content.
