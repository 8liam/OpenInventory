/* oxlint-disable typescript/no-floating-promises -- node:test registers suites synchronously */
import assert from "node:assert/strict";
import { test } from "node:test";
import { COPY } from "./copy.config.ts";

test("pull share uses the singular only when the total is one", () => {
  assert.equal(COPY.cases.pullShare(1, 1), "1 / 1 pull");
  assert.equal(COPY.cases.pullShare(0, 1), "0 / 1 pull");
  assert.equal(COPY.cases.pullShare(3, 4), "3 / 4 pulls");
  assert.equal(COPY.cases.pullShare(1200, 1500), "1,200 / 1,500 pulls");
});

test("the unclassified note pluralises its count", () => {
  assert.match(COPY.cases.unclassified(1), /^1 opening with an unknown rarity/);
  assert.match(COPY.cases.unclassified(2), /^2 openings with an unknown rarity/);
});
