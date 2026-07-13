import { useEffect, useState } from "react";

function seededRandom(seed: number) {
  const x = Math.sin(seed * 127.1) * 43758.5453;
  return x - Math.floor(x);
}

export default function useHumanTyping(text: string) {
  const [displayed, setDisplayed] = useState("");

  useEffect(() => {
    let cancelled = false;
    let s = 0;

    async function type() {
      let current = "";

      for (let i = 0; i < text.length; i++) {
        current += text[i];

        if (cancelled) return;

        setDisplayed(current);

        s++;
        let delay = 65 + seededRandom(s) * 55;

        if (text[i] === " ") delay = 180;

        if (text[i] === "'") delay = 150;

        await new Promise((r) => setTimeout(r, delay));
      }
    }

    type();

    return () => {
      cancelled = true;
    };
  }, [text]);

  return displayed;
}
