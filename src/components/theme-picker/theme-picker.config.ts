export const THEME_PICKER = {
  /** Tilt of an idle grenade and of the chosen one, in degrees. */
  angle: { idle: 12, chosen: 8 },
  classes: {
    shelf:
      "grid grid-cols-2 overflow-hidden rounded-lg border bg-card @xl:grid-cols-3 @3xl:grid-cols-5",
    cell: "group relative flex flex-col items-center text-center outline-none focus-visible:bg-muted",
    stage: "relative flex h-[116px] w-full items-end justify-center pt-4",
    burst:
      "pointer-events-none absolute left-1/2 top-1/2 size-[132px] -translate-x-1/2 -translate-y-[58%] opacity-0 transition-opacity duration-300",
    burstOn: "opacity-100",
    nade: "relative z-10 h-[100px] w-auto transition-transform duration-200 group-hover:-translate-y-1",
    nadeOn: "-translate-y-2 -rotate-3 group-hover:-translate-y-2",
    plank: "h-1 w-full bg-foreground/10",
    name: "w-full truncate px-2 py-2 text-xs font-medium text-muted-foreground",
    nameOn: "text-foreground",
  },
} as const;
