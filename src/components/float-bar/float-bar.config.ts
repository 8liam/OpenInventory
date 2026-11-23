import type { WearBandId } from "~/lib/items/float-bar.types";

export const FLOAT_BAR = {
  label: "Float",
  rangeLabel: "Skin range",
  rangeAriaLabel: (min: string, max: string) => `Skin range ${min} to ${max}`,
  /** Tailwind colour per band, from cleanest to most worn. */
  bandClass: {
    fn: "bg-success/70",
    mw: "bg-success/40",
    ft: "bg-warning/50",
    ww: "bg-warning/75",
    bs: "bg-destructive/60",
  } as const satisfies Record<WearBandId, string>,
  classes: {
    root: "flex flex-col gap-1",
    track: "relative flex h-3 w-full rounded-full",
    clip: "absolute inset-0 flex overflow-hidden rounded-full",
    segment: "h-full shrink-0",
    dim: "absolute inset-y-0 bg-card/70",
    range: "absolute inset-y-0 rounded-sm ring-1 ring-foreground/60",
    marker:
      "absolute -top-1 -bottom-1 w-0.5 -translate-x-1/2 rounded-full bg-foreground shadow-[0_0_0_1.5px_var(--card)]",
    labels: "flex w-full text-[10px] leading-3 text-muted-foreground",
    labelCell: "shrink-0 overflow-hidden text-center",
  },
} as const;
