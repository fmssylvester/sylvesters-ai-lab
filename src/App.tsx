import { MotionDirector } from "./core/motion/MotionDirector";
import { TransitionEngine } from "./core/transitions/TransitionEngine";

export default function App() {
  return (
    <MotionDirector>
      <TransitionEngine>
        {/* Your Hero / Landing Scene will go here later */}
        <div />
      </TransitionEngine>
    </MotionDirector>
  );
}
