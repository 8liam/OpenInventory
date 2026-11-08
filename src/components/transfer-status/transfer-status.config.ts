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
  classes: {
    region: "shrink-0 outline-offset-[-2px] focus-visible:outline-2 focus-visible:outline-ring",
    banner: "mx-4 mb-4 rounded-lg border bg-card px-4 py-3 md:mx-6 md:mb-6",
    owner: "mb-1 text-xs text-muted-foreground",
    row: "flex flex-wrap items-center justify-between gap-2",
    text: "tabular",
    track: "mt-2 h-1 overflow-hidden rounded-full bg-muted",
    bar: "h-full rounded-full bg-primary transition-[width]",
    failures: "mt-2 flex flex-col gap-1 text-xs text-destructive",
  },
  moreFailures: (n: number) => `…and ${n} more`,
} as const;
