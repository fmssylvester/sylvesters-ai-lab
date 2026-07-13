export const FPS = 30;

export const COLLECTOR = {
  TOTAL_FRAMES: 390,
  FPS,

  ACT1_ANON: {
    START: 0,
    END: 90,
    CAPTION_IN: 14,
    CAPTION_OUT: 84,
  },

  ACT2_BOOKMARK: {
    START: 90,
    END: 210,
    CAPTION_IN: 96,
    CAPTION_OUT: 204,
    CURSOR_MOVE: 108,
    STAR_CLICK: 150,
    TOAST_IN: 152,
    COUNTER_START: 150,
    COUNTER_END: 182,
    COUNTER_FROM: 31,
    COUNTER_TO: 40,
  },

  ACT3_UNEXPLORED: {
    START: 210,
    END: 300,
    CAPTION_IN: 216,
    CAPTION_OUT: 294,
    TABS_REVEAL: 214,
  },

  ACT4_NEVER: {
    START: 300,
    END: 390,
    CAPTION_IN: 308,
    PULLBACK_START: 300,
    PULLBACK_END: 372,
    NEWEST_DIM: 312,
  },
} as const;

export const CAPTIONS = [
  {
    text: "Somewhere right now\u2026",
    in: COLLECTOR.ACT1_ANON.CAPTION_IN,
    out: COLLECTOR.ACT1_ANON.CAPTION_OUT,
    emphasis: [] as string[],
  },
  {
    text: "someone is bookmarking their fortieth AI tool.",
    in: COLLECTOR.ACT2_BOOKMARK.CAPTION_IN,
    out: COLLECTOR.ACT2_BOOKMARK.CAPTION_OUT,
    emphasis: ["fortieth"],
  },
  {
    text: "They haven't finished exploring the last ten.",
    in: COLLECTOR.ACT3_UNEXPLORED.CAPTION_IN,
    out: COLLECTOR.ACT3_UNEXPLORED.CAPTION_OUT,
    emphasis: ["last", "ten."],
  },
  {
    text: "They won't finish exploring this one either.",
    in: COLLECTOR.ACT4_NEVER.CAPTION_IN,
    out: COLLECTOR.TOTAL_FRAMES,
    emphasis: ["either."],
  },
] as const;
