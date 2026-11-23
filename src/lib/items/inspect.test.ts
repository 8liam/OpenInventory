/* oxlint-disable typescript/no-floating-promises -- node:test registers suites synchronously */
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { canInspect, type InspectableItem } from "./inspect.ts";

const item = (over: Partial<InspectableItem>): InspectableItem => ({
  wear: null,
  paintSeed: null,
  stickers: [],
  charms: [],
  ...over,
});

describe("canInspect", () => {
  it("is false for items with nothing to show, like cases", () => {
    assert.equal(canInspect(item({})), false);
    assert.equal(canInspect(item({ paintSeed: undefined })), false);
  });
  it("is true for a float, including 0", () => {
    assert.equal(canInspect(item({ wear: 0.12 })), true);
    assert.equal(canInspect(item({ wear: 0 })), true);
  });
  it("is true for a paint seed, including 0", () => {
    assert.equal(canInspect(item({ paintSeed: 0 })), true);
  });
  it("is true for stickers or charms", () => {
    assert.equal(
      canInspect(item({ stickers: [{ name: "Sticker | Crown", imageUrl: null }] })),
      true,
    );
    assert.equal(
      canInspect(
        item({
          charms: [
            {
              name: "Charm",
              imageUrl: null,
              pattern: null,
              videoUrl: null,
              marketHashName: null,
              price: null,
            },
          ],
        }),
      ),
      true,
    );
  });
});
