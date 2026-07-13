export const BROWSER_SCENE = {
  TOTAL_FRAMES: 270,
  FPS: 30,

  STAGE1_APPEAR: {
    START: 0,
    END: 30,
  },

  STAGE2_HOME: {
    START: 30,
    END: 120,
    TAB_APPEAR: 35,
    TYPING_START: 55,
  },

  STAGE3_SEARCH: {
    START: 120,
    END: 140,
    ENTER_PRESS: 120,
  },

  STAGE4_SERP: {
    START: 140,
    END: 270,
    RESULT_1: 154,
    RESULT_2: 170,
    RESULT_3: 186,
    RESULT_4: 202,
    RESULT_5: 218,
  },

  CHARS_PER_FRAME: 3,
} as const;
