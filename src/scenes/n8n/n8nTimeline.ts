export const N8N_INTRO_TIMELINE = {
  FPS: 30,
  TOTAL_FRAMES: 840, // ~28s viral-reel hook piece

  /* PHASE A — COLD OPEN: the hook question (~0–7.4s) */
  COLD_OPEN: {
    START: 0,
    END: 220,
    KINETIC_HOOK: 10, // words start rolling in
    PHONE_LAND: 30, // phone/3AM card slams in
    CLOCK_SWEEP: 90, // clock hand sweep accent
  },

  /* PHASE B — THE REVEAL: "that's exactly what I built with n8n" (~7.4–10.6s) */
  REVEAL: {
    START: 222,
    END: 320,
    PULL_BACK: 225, // camera zoom from phone to full canvas
    LOGO_STAMP: 250, // n8n + logo reveal punch
  },

  /* PHASE C — THE BUILD: node-by-node glass cards + data flow (~11.6–28s) */
  BUILD: {
    START: 322,
    END: 840,
    WEBHOOK: 340,
    AI_AGENT: 430,
    IF_NODE: 530,
    GMAIL: 620,
    RESPONSE: 700,
    DATA_RACE: 400, // "under 3 seconds" data-packet sprint
    TAGLINE: 780, // closing brand tagline
  },
};

export const N8N_OUTRO_TIMELINE = {
  FPS: 30,
  TOTAL_FRAMES: 900, // 30 seconds

  RECAP: {
    START: 0,
    NODES_RECAP: 30,
  },

  END_CARD: {
    START: 450,
    PANELS_ENTER: 480,
    BUTTON_PULSE: 540,
  },
};