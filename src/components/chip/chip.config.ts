export const CHIP_TONES = ["neutral", "accent", "success", "warning"] as const;

export const CHIP = {
  iconSize: 11,
  removeIconSize: 10,
  defaultTone: "neutral",
  classes: {
    base: "inline-flex min-w-0 items-center gap-1 rounded-sm border px-1.5 py-px font-mono text-[10.5px] leading-4 tabular-nums",
    text: "truncate",
    icon: "shrink-0",
    /** Clickable chips keep their small look but get a 24px-tall hit area. */
    interactive:
      "relative cursor-pointer transition-colors before:absolute before:inset-x-0 before:-inset-y-1 before:content-[''] hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-accent-ink",
    removeButton:
      "relative -mr-1 ml-0.5 grid size-4 shrink-0 place-items-center rounded-sm opacity-70 before:absolute before:-inset-1 before:content-[''] hover:bg-foreground/15 hover:opacity-100 focus-visible:outline-2 focus-visible:outline-accent-ink disabled:opacity-40",
  },
  /** Content labels: hairline outlines in greys. Colour only where it is a status. */
  tones: {
    neutral: "border-border-strong text-muted-foreground",
    accent: "border-control text-foreground",
    success: "border-success/50 text-success",
    warning: "border-warning/60 text-warning",
  } as const satisfies Record<(typeof CHIP_TONES)[number], string>,
} as const;
