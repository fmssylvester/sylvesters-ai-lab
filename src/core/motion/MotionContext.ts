import { createContext } from "react";

export type MotionState = {
  elapsed: number;
};

export const MotionContext = createContext<MotionState>({
  elapsed: 0,
});
