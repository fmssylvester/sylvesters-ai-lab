import { useEffect, useState } from "react";
import { FONT_BODY, COLOR } from "../../core/typography/typography";

export type TextAnimationType =
  | "typewriter"
  | "fade"
  | "characters"
  | "words";

interface Props {
  text: string;
  type: TextAnimationType;
  speed?: number;
}

export default function TextAnimationEngine({
  text,
  type,
  speed = 80,
}: Props) {
  const [displayed, setDisplayed] = useState(
    type !== "typewriter" ? text : ""
  );

  useEffect(() => {
    if (type !== "typewriter") return;

    let index = 0;

    const interval = setInterval(() => {
      index++;
      setDisplayed(text.slice(0, index));

      if (index >= text.length) {
        clearInterval(interval);
      }
    }, speed);

    return () => clearInterval(interval);
  }, [text, type, speed, setDisplayed]);

  return (
    <span style={{ whiteSpace: "pre", fontFamily: FONT_BODY }}>
      {displayed}
      {type === "typewriter" && (
        <span style={{ color: COLOR.accent, marginLeft: 2 }}>|</span>
      )}
    </span>
  );
}
