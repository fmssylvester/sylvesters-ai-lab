// Reusable shader building blocks (Asset Vault: "Shaders").
//
// A "shader" here is a named, reusable SVG-filter effect applied to any layer
// through a wrapping component. Effects are resolution-independent and render
// natively in Chromium (Remotion's runtime), so they are safe for headless
// export. Each preset is parameterised by a single `intensity` (0..1) so scenes
// can dial feeling without re-authoring filters.
//
// These are the production-grade cousins of the one-off filters scattered
// through PostFX — centralised so every scene draws from one shader library.

import React, { ReactNode, useId } from "react";
import { AbsoluteFill } from "remotion";

export type ShaderPreset =
  | "chromatic"
  | "bloom"
  | "grain"
  | "glitch"
  | "duotone"
  | "displace";

export const SHADERS: ShaderPreset[] = [
  "chromatic",
  "bloom",
  "grain",
  "glitch",
  "duotone",
  "displace",
];

export interface ShaderProps {
  preset: ShaderPreset;
  intensity?: number; // 0..1
  // duotone colours (hex). Defaults to the lab brand duotone (cyan shadow).
  shadow?: string;
  highlight?: string;
  children: ReactNode;
  style?: React.CSSProperties;
  className?: string;
}

const hexToRgb = (hex: string): [number, number, number] => {
  const h = hex.replace("#", "");
  const n = parseInt(
    h.length === 3
      ? h
          .split("")
          .map((c) => c + c)
          .join("")
      : h,
    16
  );
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
};

function FilterDefs({ id, preset, intensity, shadow, highlight }: {
  id: string;
  preset: ShaderPreset;
  intensity: number;
  shadow: string;
  highlight: string;
}) {
  const amt = Math.max(0, Math.min(1, intensity));

  if (preset === "chromatic") {
    const off = amt * 4;
    return (
      <filter id={id} x="-10%" y="-10%" width="120%" height="120%">
        <feColorMatrix
          in="SourceGraphic"
          type="matrix"
          values="1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0"
          result="r"
        />
        <feOffset in="r" dx={off} dy="0" result="ro" />
        <feColorMatrix
          in="SourceGraphic"
          type="matrix"
          values="0 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 1 0"
          result="gb"
        />
        <feOffset in="gb" dx={-off} dy="0" result="gbo" />
        <feBlend in="ro" in2="gbo" mode="screen" />
      </filter>
    );
  }

  if (preset === "bloom") {
    const dev = 2 + amt * 10;
    return (
      <filter id={id} x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur in="SourceGraphic" stdDeviation={dev} result="blur" />
        <feColorMatrix
          in="blur"
          type="matrix"
          values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 1.6 0"
          result="bright"
        />
        <feBlend in="bright" in2="SourceGraphic" mode="screen" />
      </filter>
    );
  }

  if (preset === "grain") {
    return (
      <filter id={id}>
        <feTurbulence
          type="fractalNoise"
          baseFrequency="0.85"
          numOctaves={2}
          stitchTiles="stitch"
          result="n"
        />
        <feColorMatrix in="n" type="saturate" values="0" result="g" />
        <feComponentTransfer in="g" result="g2">
          <feFuncA type="linear" slope={amt * 0.55} intercept="0" />
        </feComponentTransfer>
        <feBlend in="SourceGraphic" in2="g2" mode="overlay" />
      </filter>
    );
  }

  if (preset === "glitch") {
    const scale = amt * 32;
    return (
      <filter id={id} x="-10%" y="-10%" width="120%" height="120%">
        <feTurbulence
          type="turbulence"
          baseFrequency="0.01 0.2"
          numOctaves={1}
          seed={7}
          result="turb"
        />
        <feDisplacementMap
          in="SourceGraphic"
          in2="turb"
          scale={scale}
          xChannelSelector="R"
          yChannelSelector="G"
        />
      </filter>
    );
  }

  if (preset === "duotone") {
    const [rs, gs, bs] = hexToRgb(shadow).map((v) => v / 255);
    const [rh, gh, bh] = hexToRgb(highlight).map((v) => v / 255);
    return (
      <filter id={id}>
        <feColorMatrix
          in="SourceGraphic"
          type="matrix"
          values="0.33 0.33 0.33 0 0  0.33 0.33 0.33 0 0  0.33 0.33 0.33 0 0  0 0 0 1 0"
          result="lum"
        />
        <feComponentTransfer in="lum" result="duo">
          <feFuncR type="table" tableValues={`${rs} ${rh}`} />
          <feFuncG type="table" tableValues={`${gs} ${gh}`} />
          <feFuncB type="table" tableValues={`${bs} ${bh}`} />
        </feComponentTransfer>
        <feBlend in="duo" in2="SourceGraphic" mode="soft-light" />
      </filter>
    );
  }

  // displace (liquid)
  const scale = amt * 14;
  return (
    <filter id={id} x="-10%" y="-10%" width="120%" height="120%">
      <feTurbulence
        type="fractalNoise"
        baseFrequency="0.012 0.012"
        numOctaves={2}
        seed={3}
        result="t"
      />
      <feDisplacementMap
        in="SourceGraphic"
        in2="t"
        scale={scale}
        xChannelSelector="R"
        yChannelSelector="G"
      />
    </filter>
  );
}

export const Shader: React.FC<ShaderProps> = ({
  preset,
  intensity = 0.5,
  shadow = "#0A2A33",
  highlight = "#EAF6FF",
  children,
  style,
  className,
}) => {
  const raw = useId();
  const id = "sh-" + raw.replace(/:/g, "");
  return (
    <>
      <svg
        width="0"
        height="0"
        style={{ position: "absolute", width: 0, height: 0, pointerEvents: "none" }}
        aria-hidden
      >
        <defs>
          <FilterDefs
            id={id}
            preset={preset}
            intensity={intensity}
            shadow={shadow}
            highlight={highlight}
          />
        </defs>
      </svg>
      <AbsoluteFill
        className={className}
        style={{ ...style, filter: `url(#${id})` }}
      >
        {children}
      </AbsoluteFill>
    </>
  );
};
