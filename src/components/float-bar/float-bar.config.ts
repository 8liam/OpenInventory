import type { WearBandId } from "~/lib/items/float-bar.types";

export const FLOAT_BAR = {
  label: "Float",
  rangeLabel: "Skin range",
  rangeAriaLabel: (min: string, max: string) => `Skin range ${min} to ${max}`,
  /** Wear zones are grey steps drawn to scale, cleanest first. Float is content, never the accent. */
  bandClass: {
    fn: "bg-fill-1",
    mw: "bg-fill-2",
    ft: "bg-fill-3",
    ww: "bg-fill-4",
    bs: "bg-fill-5",
  } as const satisfies Record<WearBandId, string>,
  classes: {
    root: "flex flex-col gap-1",
    track: "relative flex h-3 w-full",
    clip: "absolute inset-0 flex gap-px overflow-hidden bg-card",
    segment: "h-full shrink-0",
    /** Outside this skin's float range: hatched, as on the spec sheet. */
    dim: "absolute inset-y-0 bg-card [background-image:repeating-linear-gradient(135deg,var(--control-border)_0_1px,transparent_1px_5px)]",
    range: "absolute inset-y-0 border-x border-foreground",
    marker:
      "absolute -top-1.5 -bottom-1.5 w-[3px] -translate-x-1/2 border-x border-card bg-foreground",
    labels: "flex w-full font-mono text-[10px] leading-3 text-muted-foreground",
    labelCell: "shrink-0 overflow-hidden text-center",
  },
} as const;
