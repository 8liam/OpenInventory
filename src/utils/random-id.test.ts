/* oxlint-disable typescript/no-floating-promises -- node:test registers suites synchronously */
import assert from "node:assert/strict";
import { test } from "node:test";
import { RANDOM_ID } from "./random-id.config.ts";
import { randomId } from "./random-id.ts";

test("produces distinct fixed-length hex ids", () => {
  const ids = new Set(Array.from({ length: 50 }, randomId));
  assert.equal(ids.size, 50);
  for (const id of ids) assert.match(id, new RegExp(`^[0-9a-f]{${RANDOM_ID.bytes * 2}}$`));
});
