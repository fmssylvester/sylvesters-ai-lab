export const motionTokens = {
  duration: {
    instant: 0.15,
    fast: 0.3,
    medium: 0.6,
    slow: 1.2,
    hero: 8,
    atmosphere: 35,
  },

  easing: {
    standard: [0.4, 0.0, 0.2, 1],
    smooth: [0.22, 1, 0.36, 1],
  },

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
  },
} as const;
