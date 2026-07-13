import Cursor from "../intro/Cursor";
import useHumanTyping from "../text-engine/useHumanTyping";

export default function BootText() {
  const title = useHumanTyping("Sylvester's AI Lab");

  return (
    <div
      style={{
        textAlign: "center",
      }}
    >
      <h1
        style={{
          margin: 0,
          color: "#F8FAFC",
          fontSize:"84px",
          fontWeight: 800,
          letterSpacing:"-2px",
          lineHeight: 1,
        }}
      >
        {title}
        <Cursor />
      </h1>
    </div>
  );
}
