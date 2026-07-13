import { useEffect, useState } from "react";
import Cursor from "../intro/Cursor";

interface Props {
  title: string;
  subtitle: string;
}

export default function GlassTypewriter({
  title,
  subtitle,
}: Props) {
  const [typedTitle, setTypedTitle] = useState("");
  const [typedSubtitle, setTypedSubtitle] = useState("");
  const [showSubtitle, setShowSubtitle] = useState(false);

  useEffect(() => {
    let i = 0;

    const typeTitle = setInterval(() => {
      i++;
      setTypedTitle(title.slice(0, i));

      if (i >= title.length) {
        clearInterval(typeTitle);

        // pause before subtitle
        setTimeout(() => {
          setShowSubtitle(true);

          let j = 0;
          const typeSub = setInterval(() => {
            j++;
            setTypedSubtitle(subtitle.slice(0, j));

            if (j >= subtitle.length) {
              clearInterval(typeSub);
            }
          }, 35);
        }, 500);
      }
    }, 70);

    return () => clearInterval(typeTitle);
  }, [title, subtitle]);

  return (
    <div>
      {/* TITLE */}
      <h1
        style={{
          fontSize: 92,
          fontWeight: 800,
          color: "#fff",
          letterSpacing: "-4px",
          lineHeight: 1.05,
        }}
      >
        {typedTitle}
        <Cursor />
      </h1>

      {/* SUBTITLE (clean fade-in + readable) */}
      <div
        style={{
          marginTop: 24,
          fontSize: 18,
          letterSpacing: "0.25em",
          color: "#CBD5E1",
          opacity: showSubtitle ? 1 : 0,
          transform: showSubtitle
            ? "translateY(0px)"
            : "translateY(10px)",
          transition: "all 0.8s ease",
          lineHeight: 1.6,
        }}
      >
        {typedSubtitle}
      </div>
    </div>
  );
}
