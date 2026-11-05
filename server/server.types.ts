/** Handles for the background value-snapshot job, so shutdown can cancel them. */
export type SnapshotTimers = {
  initial?: NodeJS.Timeout;
  interval?: NodeJS.Timeout;
};
