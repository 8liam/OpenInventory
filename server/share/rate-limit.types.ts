export type RateLimitDecision =
  | { readonly allowed: true }
  | { readonly allowed: false; readonly retryAfterSeconds: number };

export type RateLimiter = {
  /** Counts one request from `key` and says whether it may proceed. */
  readonly hit: (key: string) => RateLimitDecision;
};

export type RateLimitOptions = {
  readonly limit: number;
  readonly windowMs: number;
  readonly now: () => number;
};
