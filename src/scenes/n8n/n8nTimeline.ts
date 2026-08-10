export const N8N_INTRO_TIMELINE = {
  FPS: 30,
  TOTAL_FRAMES: 900, // 30 seconds at 30fps

  PHASE_1_CHAT: {
    START: 0,
    END: 240, // 0 - 8s
    CHAT_CARD_ENTRY: 10,
    MESSAGE_ENTRY: 30,
    CLOCK_SWEEP: 70,
  },

  PHASE_2_WORKFLOW: {
    START: 240,
    END: 450, // 8 - 15s
    WEBHOOK_NODE: 250,
    AI_AGENT_NODE: 280,
    IF_NODE: 310,
    GMAIL_NODE: 340,
    RESPONSE_NODE: 370,
  },

  PHASE_3_KINETIC: {
    START: 450,
    END: 720, // 15 - 24s
    TEXT_1_ENTER: 460,
    HIGHLIGHT_SWEEP: 540,
  },

  PHASE_4_LOGO: {
    START: 720,
    END: 900, // 24 - 30s
    LOGO_ENTER: 730,
    SUBTITLE_ENTER: 780,
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
