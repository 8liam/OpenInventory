/* oxlint-disable typescript/no-floating-promises -- node:test registers suites synchronously */
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { splitWear } from "./item-grid-card.utils.ts";

describe("splitWear", () => {
  it("moves the trailing wear out of the skin name", () => {
    assert.deepEqual(splitWear("Point Disarray (Minimal Wear)", "Minimal Wear"), {
      skin: "Point Disarray",
      wear: "Minimal Wear",
    });
  });

  it("leaves the name alone without a wear name or a matching suffix", () => {
    assert.deepEqual(splitWear("Point Disarray (Minimal Wear)", null), {
      skin: "Point Disarray (Minimal Wear)",
      wear: null,
    });
    assert.deepEqual(splitWear("Point Disarray", "Minimal Wear"), {
      skin: "Point Disarray",
      wear: null,
    });
  });
});
