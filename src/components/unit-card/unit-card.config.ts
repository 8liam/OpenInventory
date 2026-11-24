import { STORAGE_LIMITS } from "~/lib/storage/storage.config";

export const UNIT_CARD = {
  previewCount: 4,
  thumbSize: 28,
  /** A fixed width in the stacked strip; the whole column once Storage sits side by side. */
  widthClass: "w-64 @min-[56rem]/storage:w-full",
  /** The crate: one dot per slot, filled in order. 50 x 20 is the unit's 1,000 slots. */
  crate: {
    capacity: STORAGE_LIMITS.unitCapacity,
    columns: 50,
    dotRadius: 0.32,
    /** From this share of capacity the count turns amber with a warning icon. */
    warnRatio: 0.95,
    iconSize: 12,
  },
  labels: {
    capacity: (count: string, capacity: string) => `${count} / ${capacity}`,
    full: "Full",
    nearlyFull: "Nearly full",
    slots: (count: number, capacity: number) => `${count} of ${capacity} slots used`,
  },
  classes: {
    root: "relative shrink-0 rounded-lg border border-control bg-card p-3 text-left transition-colors hover:bg-muted",
    selected: "border-accent-ink bg-muted",
    hit: "focus-inset absolute inset-0 rounded-lg",
    header: "pointer-events-none relative flex items-start justify-between gap-3",
    value: "shrink-0 font-mono text-[13px] tabular-nums",
    dots: "pointer-events-none relative mt-3 block h-auto w-full",
    empty: "fill-slot-empty",
    stored: "fill-fill-2",
    footer: "pointer-events-none relative mt-2.5 flex items-center justify-between gap-3",
    capacity: "inline-flex items-center gap-1 font-mono text-xs tabular-nums",
    warn: "text-warning",
    full: "text-destructive",
    thumbs: "flex gap-1",
  },
} as const;
