import assert from "node:assert/strict";
import { test } from "node:test";
import { TRADE_LOCK_BADGE } from "./trade-lock-badge.config.ts";

test("trade lock badge labels stay plain text", () => {
  assert.equal(TRADE_LOCK_BADGE.label(3), "3d");
});
