/* oxlint-disable typescript/no-floating-promises -- node:test registers suites synchronously */
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { placeTooltip, splitName } from "./tooltip.utils.ts";

describe("splitName", () => {
  it("separates the type from the readable name", () => {
    assert.deepEqual(splitName("Sticker | Natus Vincere | Katowice 2014"), {
      kind: "Sticker",
      title: "Natus Vincere | Katowice 2014",
    });
  });

  it("keeps names without a type whole", () => {
    assert.deepEqual(splitName("Hot Howl"), { kind: null, title: "Hot Howl" });
  });
});

describe("placeTooltip", () => {
  const viewport = { width: 1000, height: 800 };

  it("opens above and centres on the anchor", () => {
    const place = placeTooltip({ left: 480, right: 520, top: 400, bottom: 420 }, viewport);
    assert.equal(place.left, 500);
    assert.equal(place.bottom, 800 - 400 + 8);
    assert.equal(place.top, undefined);
  });

  it("opens below when there is no room above", () => {
    const place = placeTooltip({ left: 480, right: 520, top: 20, bottom: 40 }, viewport);
    assert.equal(place.top, 48);
    assert.equal(place.bottom, undefined);
  });

  it("stays inside the viewport at the edges", () => {
    const left = placeTooltip({ left: 0, right: 10, top: 400, bottom: 420 }, viewport);
    assert.equal(left.left, 8 + 140);
    const right = placeTooltip({ left: 990, right: 1000, top: 400, bottom: 420 }, viewport);
    assert.equal(right.left, 1000 - 8 - 140);
  });
});
