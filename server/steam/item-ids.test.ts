/* oxlint-disable typescript/no-floating-promises -- node:test registers suites synchronously */
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { isPlaceholderItemId } from "./item-ids.ts";

describe("isPlaceholderItemId", () => {
  it("flags the placeholder ids seen on a real account", () => {
    assert.equal(isPlaceholderItemId("17293822569102708641"), true); // CS:GO Weapon Case
    assert.equal(isPlaceholderItemId("17293822569110896676"), true); // P250
  });

  it("flags the whole 0xF… range, not just known ids", () => {
    assert.equal(isPlaceholderItemId("18446744073709551615"), true); // 0xFFFF…
    assert.equal(isPlaceholderItemId("17293822569102708642"), true);
  });

  it("keeps real asset ids", () => {
    assert.equal(isPlaceholderItemId("30355550178"), false); // a real storage unit
    assert.equal(isPlaceholderItemId("1"), false);
    assert.equal(isPlaceholderItemId("17293822569102708641".slice(0, 18)), false);
  });

  it("does not throw on non-numeric ids", () => {
    assert.equal(isPlaceholderItemId("not-a-number"), false);
    assert.equal(isPlaceholderItemId(""), false);
  });
});
