/* oxlint-disable typescript/no-floating-promises -- node:test registers suites synchronously */
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { charmTooltipDetail } from "./charm-tooltip.ts";
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

describe("charmTooltipDetail", () => {
  it("shows nothing when there is no pattern or price", () => {
    assert.equal(charmTooltipDetail(charm({}), "USD"), undefined);
  });
  it("shows the pattern alone when unpriced", () => {
    assert.equal(charmTooltipDetail(charm({ pattern: 42 }), "USD"), "Pattern #42");
  });
  it("shows the value, and pattern first when both are known", () => {
    assert.match(
      charmTooltipDetail(charm({ pattern: 7, price: 12.5 }), "USD") ?? "",
      /^Pattern #7 · Value .*12\.50/,
    );
    assert.match(charmTooltipDetail(charm({ price: 3 }), "USD") ?? "", /^Value /);
  });
  it("omits the value without a currency", () => {
    assert.equal(charmTooltipDetail(charm({ price: 3 }), undefined), undefined);
  });
});
