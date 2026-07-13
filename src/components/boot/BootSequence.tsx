import { useEffect, useState } from "react";
import Cursor from "../intro/Cursor";
import useHumanTyping from "../text-engine/useHumanTyping";

export default function BootSequence() {
  const [startTitle, setStartTitle] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setStartTitle(true);
    }, 2500);

    return () => clearTimeout(timer);
  }, []);

  const title = useHumanTyping(
    startTitle ? "Sylvester's AI Lab" : ""
  );

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 22,
      }}
    >
      <h1
        style={{
          color: "#F8FAFC",
          fontSize: "84px",
          fontWeight: 800,
          margin: 0,
          letterSpacing: "-4px",
        }}
      >
        {title}
        <Cursor />
      </h1>
    </div>
  );
}
