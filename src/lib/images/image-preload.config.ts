export const IMAGE_PRELOAD = {
  /** Items whose images are fetched ahead of time, in inventory order. */
  itemCount: 100,
  /** Images requested per idle slice, so preloading never competes with interaction. */
  batchSize: 10,
  /** Longest wait for an idle slice before the batch runs anyway. */
  idleTimeoutMs: 1_000,
} as const;
