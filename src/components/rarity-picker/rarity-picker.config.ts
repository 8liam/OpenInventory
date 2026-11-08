export const RARITY_PICKER = {
  classes: {
    root: "flex items-center gap-2.5 text-muted-foreground",
    group: "flex items-center gap-2",
    option:
      "group relative size-[22px] rounded-full opacity-55 transition duration-150 hover:scale-110 hover:opacity-100 focus-visible:opacity-100 focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-ring",
    optionActive: "opacity-100 ring-2 ring-current ring-offset-2 ring-offset-background",
    tooltip:
      "pointer-events-none absolute bottom-[130%] left-1/2 -translate-x-1/2 whitespace-nowrap z-10 rounded-md border bg-card px-2 py-1 text-[11px] text-foreground shadow-md opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100",
    current: "text-foreground",
  },
  keys: {
    next: ["ArrowRight", "ArrowDown"] as readonly string[],
    previous: ["ArrowLeft", "ArrowUp"] as readonly string[],
  },
} as const;
