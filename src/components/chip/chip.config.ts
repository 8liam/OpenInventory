export const CHIP_TONES = ["neutral", "accent", "success", "warning"] as const;

export const CHIP = {
  iconSize: 11,
  removeIconSize: 10,
  defaultTone: "neutral",
  classes: {
    base: "inline-flex min-w-0 items-center gap-1 rounded px-1.5 py-px text-[11px] leading-4",
    text: "truncate",
    icon: "shrink-0",
    interactive:
      "cursor-pointer transition-colors hover:brightness-125 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-ring",
    removeButton:
      "-mr-1 ml-0.5 grid size-4 shrink-0 place-items-center rounded-sm opacity-70 hover:bg-foreground/15 hover:opacity-100 focus-visible:outline-2 focus-visible:outline-ring disabled:opacity-40",
  },
  tones: {
    neutral: "bg-foreground/[0.07] text-foreground/80",
    accent: "bg-accent/35 text-foreground",
    success: "bg-success/15 text-success",
    warning: "bg-warning/15 text-warning",
  } as const satisfies Record<(typeof CHIP_TONES)[number], string>,
} as const;
