export const motionTokens = {
  duration: {
    instant: 0.15,
    micro: 0.18,
    fast: 0.3,
    base: 0.22,
    medium: 0.6,
    transform: 0.8,
    slow: 1.2,
    hero: 8,
    atmosphere: 35,
  },

  // Custom cubic-beziers only — never default ease/in/out/linear.
  // Source: Stripe Design Language + Modern-SaaS-aesthetic (2026-07-13 research).
  easing: {
    standard: [0.4, 0.0, 0.2, 1],
    smooth: [0.22, 1, 0.36, 1],
    quint: [0.23, 1, 0.32, 1], // enter / rest
    stripe: [0.2, 1, 0.2, 1], // Stripe signature (~387 uses in the wild)
    stripeLong: [0.165, 0.84, 0.44, 1], // long transforms
    expressive: [0.25, 1, 0.5, 1], // motion-rich moves
  },

  // Named motion seeds (StyleSeed vocabulary) for intentional, consistent feel.
  spring: {
    soft: {
      type: "spring",
      stiffness: 120,
      damping: 18,
    },

    hero: {
      type: "spring",
      stiffness: 90,
      damping: 20,
    },

    // Silk — smooth, elegant, continuous (Stripe / Linear)
    silk: {
      type: "spring",
      stiffness: 200,
      damping: 20,
    },

    // Snap — instant, decisive, precise (Raycast / Linear)
    snap: {
      type: "spring",
      stiffness: 400,
      damping: 30,
    },

    // Float — weightless, gentle, dreamy (Apple)
    float: {
      type: "spring",
      stiffness: 80,
      damping: 12,
    },
  },
} as const;
