export const SMS_BOT_DEMO = {
  TOTAL_FRAMES: 540,
  FPS: 30,

  INTRO:          { START: 0,   END: 60 },
  WORKFLOW_SHOW:  { START: 60,  END: 180,  NODE_APPEAR: 10 },
  PHONE_DEMO:     { START: 180, END: 390,  SMS_INTERVAL: 35 },
  FEATURES:       { START: 390, END: 480,  FEATURE_INTERVAL: 25 },
  CTA:            { START: 480, END: 540 },
} as const;
