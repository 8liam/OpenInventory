import type { RateLimiter, RateLimitDecision, RateLimitOptions } from "./rate-limit.types.ts";

const MS_PER_SECOND = 1000;

type Window = { readonly startedAt: number; count: number };

/** Fixed-window limiter. Windows are swept once they have fully elapsed, so memory stays bounded by active clients. */
export function createRateLimiter({ limit, windowMs, now }: RateLimitOptions): RateLimiter {
  const windows = new Map<string, Window>();
  let lastSweep = now();

  const sweep = (at: number): void => {
    if (at - lastSweep < windowMs) return;
    lastSweep = at;
    for (const [key, window] of windows) {
      if (at - window.startedAt >= windowMs) windows.delete(key);
    }
  };

  return {
    hit(key: string): RateLimitDecision {
      const at = now();
      sweep(at);
      const current = windows.get(key);
      const window: Window =
        current && at - current.startedAt < windowMs ? current : { startedAt: at, count: 0 };
      window.count += 1;
      windows.set(key, window);
      if (window.count <= limit) return { allowed: true };
      const resetAt = window.startedAt + windowMs;
      return {
        allowed: false,
        retryAfterSeconds: Math.max(1, Math.ceil((resetAt - at) / MS_PER_SECOND)),
      };
    },
  };
}
