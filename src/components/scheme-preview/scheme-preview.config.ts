export const SCHEME_PREVIEW = {
  /** The dark half of a split preview starts here. */
  splitClip: "inset(0 0 0 50%)",
  classes: {
    root: "relative aspect-[16/9] w-full overflow-hidden rounded-md",
    layer: "absolute inset-0",
    ui: "flex h-full w-full overflow-hidden rounded-md border",
    sidebar: "flex w-[22%] shrink-0 flex-col gap-1.5 border-r p-2",
    pill: "h-2.5 w-full rounded-full border",
    bar: "h-2 w-full rounded-full",
    main: "relative flex min-w-0 flex-1 flex-col gap-1.5 p-3",
    lineLong: "h-2 w-3/5 rounded-full",
    lineShort: "h-2 w-2/5 rounded-full",
    headerBar: "ml-auto h-3 w-1/4 rounded-full",
    popover: "absolute right-3 top-6 flex w-[34%] flex-col gap-1.5 rounded-md border p-2",
    popoverRow: "flex items-center gap-1.5",
    dot: "size-1.5 shrink-0 rounded-full",
    popoverLine: "h-1 flex-1 rounded-full",
    input: "mt-auto flex items-center justify-between rounded-md border px-2 py-1.5",
    inputLine: "h-1.5 w-1/3 rounded-full",
    inputDot: "size-3 rounded-full",
  },
  /** Placeholder text lines and the active nav bar are this share of their colour. */
  fadePercent: 22,
} as const;
