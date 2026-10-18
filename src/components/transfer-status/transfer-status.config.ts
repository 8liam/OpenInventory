export const TRANSFER_STATUS = {
  running: (done: number, total: number, from: string, to: string) =>
    `Moving ${done} of ${total} from ${from} to ${to}`,
  cancel: "Cancel",
  cancelling: "Stopping after this item…",
  finished: (done: number, total: number, to: string) => `Moved ${done} of ${total} to ${to}`,
  cancelled: "Cancelled.",
  dismiss: "Dismiss",
  maxFailuresShown: 4,
  moreFailures: (n: number) => `…and ${n} more`,
} as const;
