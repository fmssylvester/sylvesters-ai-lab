import { useContext } from "react";
import { MotionContext } from "./MotionContext";

export function useMotionDirector() {
  return useContext(MotionContext);
}
