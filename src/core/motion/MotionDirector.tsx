import { useEffect, useState } from "react";
import { MotionContext } from "./MotionContext";

export function MotionDirector({ children }: { children: React.ReactNode }) {

  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {

    const start = performance.now();

    let frame: number;

    const loop = () => {

      const now = performance.now();
      setElapsed((now - start) / 1000);

      frame = requestAnimationFrame(loop);

    };

    loop();

    return () => cancelAnimationFrame(frame);

  }, []);

  return (
    <MotionContext.Provider value={{ elapsed }}>
      {children}
    </MotionContext.Provider>
  );
}
