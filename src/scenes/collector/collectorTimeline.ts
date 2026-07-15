export const FPS = 30;

export const COLLECTOR = {
  TOTAL_FRAMES: 840,
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

  // ACT5 — THE OVERWHELM: a cluttered workstation; every tab a promise. (~5s)
  ACT5_OVERWHELM: {
    START: 390,
    END: 540,
    CAPTION_IN: 398,
    TAB_FLOOD_START: 390,
    TAB_FLOOD_END: 472,
    COUNTER_IN: 404,
  },

  // ACT6 — THE ABANDONMENT: one isolated folder, a cursor that won't click,
  // then the lid closes. (~5s)
  ACT6_ABANDON: {
    START: 540,
    END: 690,
    CAPTION_IN: 576,
    FOLDER_IN: 546,
    FOLDER_SETTLE: 600,
    CURSOR_DRIFT: 560,
    CURSOR_HOVER: 660,
    LID_CLOSE: 662,
    LID_END: 690,
  },

  // ACT7 — RESOLUTION / CTA: from black, a single gold focal point. (~5s)
  ACT7_RESOLVE: {
    START: 690,
    END: 840,
    CAPTION_IN: 728,
    DOT_IN: 696,
    CTA_IN: 760,
    CTA_PULSE: 766,
  },
} as const;

const A = COLLECTOR;

export const CAPTIONS = [
  {
    text: "Somewhere right now…",
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
    out: COLLECTOR.ACT4_NEVER.END,
    emphasis: ["either."],
  },
  {
    text: "Every open tab is a promise you won't keep.",
    in: COLLECTOR.ACT5_OVERWHELM.CAPTION_IN,
    out: COLLECTOR.ACT5_OVERWHELM.END,
    emphasis: ["promise", "keep."],
  },
  {
    text: "A folder named 'AI Tools.' Forty-one saved. Zero opened.",
    in: COLLECTOR.ACT6_ABANDON.CAPTION_IN,
    out: COLLECTOR.ACT6_ABANDON.END,
    emphasis: ["Forty-one", "Zero"],
  },
  {
    text: "So what if you actually finished just one?",
    in: A.ACT7_RESOLVE.CAPTION_IN,
    out: A.ACT7_RESOLVE.CTA_IN - 8,
    emphasis: ["one?"],
  },
] as const;
