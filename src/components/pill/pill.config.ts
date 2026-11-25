export const PILL = {
  checkSize: 11,
  classes: {
    base: "inline-flex h-7 items-center gap-1.5 rounded-md border px-2.5 text-xs whitespace-nowrap transition-colors disabled:cursor-not-allowed disabled:opacity-45",
    idle: "border-control text-foreground hover:bg-muted",
    /** Pressed fills lime and gains a tick, so the state survives greyscale. */
    active: "border-accent-edge bg-accent font-semibold text-accent-foreground",
    check: "shrink-0",
  },
} as const;
