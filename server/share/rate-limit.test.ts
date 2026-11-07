/* oxlint-disable typescript/no-floating-promises -- node:test registers suites synchronously */
import assert from "node:assert/strict";
import { test } from "node:test";
import { createRateLimiter } from "./rate-limit.ts";

function clock(start = 0) {
  let at = start;
  return { now: () => at, advance: (ms: number) => (at += ms) };
}

test("allows up to the limit, blocks the next request with a retry hint", () => {
  const time = clock(1_000);
  const limiter = createRateLimiter({ limit: 3, windowMs: 10_000, now: time.now });
  for (let i = 0; i < 3; i++) assert.deepEqual(limiter.hit("a"), { allowed: true });
  assert.deepEqual(limiter.hit("a"), { allowed: false, retryAfterSeconds: 10 });
});

test("the window resets once it has elapsed", () => {
  const time = clock();
  const limiter = createRateLimiter({ limit: 1, windowMs: 5_000, now: time.now });
  assert.equal(limiter.hit("a").allowed, true);
  assert.equal(limiter.hit("a").allowed, false);
  time.advance(4_999);
  assert.equal(limiter.hit("a").allowed, false);
  time.advance(1);
  assert.equal(limiter.hit("a").allowed, true);
});

test("clients are counted separately", () => {
  const limiter = createRateLimiter({ limit: 1, windowMs: 5_000, now: clock().now });
  assert.equal(limiter.hit("10.0.0.1").allowed, true);
  assert.equal(limiter.hit("10.0.0.2").allowed, true);
  assert.equal(limiter.hit("10.0.0.1").allowed, false);
});

test("retry-after is never below one second", () => {
  const time = clock();
  const limiter = createRateLimiter({ limit: 0, windowMs: 5_000, now: time.now });
  assert.equal(limiter.hit("a").allowed, false);
  time.advance(4_999);
  assert.deepEqual(limiter.hit("a"), { allowed: false, retryAfterSeconds: 1 });
});
