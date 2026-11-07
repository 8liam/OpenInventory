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
  moreFailures: (n: number) => `…and ${n} more`,
} as const;
