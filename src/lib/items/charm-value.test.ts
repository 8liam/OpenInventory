/* oxlint-disable typescript/no-floating-promises -- node:test registers suites synchronously */
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { attachedCharmsValue } from "./charm-value.ts";
import type { CharmView } from "./item.types.ts";

const charm = (over: Partial<CharmView>): CharmView => ({
  name: "Charm | Lil' Ava",
  imageUrl: null,
  pattern: null,
  videoUrl: null,
  marketHashName: "Charm | Lil' Ava",
  price: null,
  ...over,
});

describe("attachedCharmsValue", () => {
  it("is null when the weapon has no charms", () => {
    assert.equal(attachedCharmsValue({ charms: [], marketHashName: "AK-47 | Redline" }), null);
  });
  it("is null when no charm is priced", () => {
    assert.equal(
      attachedCharmsValue({ charms: [charm({})], marketHashName: "AK-47 | Redline" }),
      null,
    );
  });
  it("sums priced charms and ignores unpriced ones", () => {
    assert.equal(
      attachedCharmsValue({
        charms: [charm({ price: 12.5 }), charm({ price: null }), charm({ price: 3 })],
        marketHashName: "AK-47 | Redline",
      }),
      15.5,
    );
  });
  it("does not count a loose charm twice", () => {
    assert.equal(
      attachedCharmsValue({
        charms: [charm({ price: 9 })],
        marketHashName: "Charm | Lil' Ava",
      }),
      null,
    );
  });
});
