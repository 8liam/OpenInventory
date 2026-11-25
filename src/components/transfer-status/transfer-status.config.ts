export const TRANSFER_STATUS = {
  running: (done: number, total: number, from: string, to: string) =>
    `Moving ${done} of ${total} from ${from} to ${to}`,
  planStep: (step: number, steps: number) => `Step ${step} of ${steps}`,
  cancel: "Cancel",
  cancelling: "Stopping after this item…",
  finished: (done: number, total: number, to: string) => `Moved ${done} of ${total} to ${to}`,
  planFinished: (done: number, total: number, steps: number) =>
    `Organiser moved ${done} of ${total} items in ${steps} ${steps === 1 ? "step" : "steps"}`,
  cancelled: "Cancelled.",
  dismiss: "Dismiss",
  maxFailuresShown: 4,
  regionId: "transfer-status",
  regionLabel: "Transfer status",
  progressLabel: "Transfer progress",
  iconSize: 14,
  /** Roller dots under the belt, one per this many px. */
  rollerSpacing: 12,
  classes: {
    region:
      "shrink-0 outline-offset-[-2px] focus-visible:outline-2 focus-visible:outline-accent-ink",
    banner:
      "mx-4 mb-4 flex flex-col gap-3 rounded-lg border border-border-strong bg-card px-4 py-3 md:mx-6 md:mb-6",
    owner: "text-xs text-muted-foreground",
    row: "flex flex-wrap items-center justify-between gap-2",
    text: "tabular inline-flex flex-wrap items-center gap-x-2",
    done: "text-success",
    failed: "text-destructive",
    statusIcon: "shrink-0",
    /** The conveyor: two docks and a belt between them. Items ride it one at a time. */
    conveyor: "grid grid-cols-[minmax(0,6rem)_minmax(0,1fr)_minmax(0,6rem)] items-center gap-3",
    dock: "flex min-w-0 flex-col text-[11px] text-muted-foreground",
    dockRight: "text-right",
    dockName: "truncate",
    dockCount: "font-mono text-[13px] font-medium tabular-nums text-foreground",
    belt: "relative h-7 overflow-hidden border-y border-control",
    rollers: "absolute inset-x-0 bottom-0.5 h-1 w-full text-control",
    tile: "belt-tile absolute top-1 h-3.5 w-10 rounded-sm border border-accent-ink bg-card",
    track: "relative h-2 overflow-hidden rounded-sm border border-control",
    /** Lime while live, grey once done. */
    bar: "absolute inset-y-0 left-0 border-r border-accent-edge bg-accent transition-[width]",
    barDone: "absolute inset-y-0 left-0 bg-fill-2",
    failures: "flex flex-col gap-1 text-xs text-destructive",
  },
  moreFailures: (n: number) => `…and ${n} more`,
} as const;
