export const THEME_PICKER = {
  /** Tilt of an idle grenade and of the chosen one, in degrees. */
  angle: { idle: 12, chosen: 8 },
  classes: {
    grid: "grid grid-cols-2 gap-3 @xl:grid-cols-3 @3xl:grid-cols-5",
    cell: "group relative flex flex-col items-center overflow-hidden rounded-lg border bg-card text-center transition-colors hover:bg-muted",
    cellOn: "border-primary",
    stage: "relative flex h-[124px] w-full items-center justify-center pt-3",
    burst:
      "pointer-events-none absolute left-1/2 top-1/2 size-[132px] -translate-x-1/2 -translate-y-1/2 opacity-0 transition-opacity duration-300",
    burstOn: "opacity-100",
    nade: "relative z-10 h-[100px] w-auto transition-transform duration-200 group-hover:-translate-y-1",
    nadeOn: "-translate-y-2 -rotate-3 group-hover:-translate-y-2",
    name: "w-full truncate px-2 pb-3 text-xs font-medium text-muted-foreground",
    nameOn: "text-foreground",
  },
} as const;
