/* oxlint-disable typescript/no-floating-promises -- node:test registers suites synchronously */
import assert from "node:assert/strict";
import { test } from "node:test";
import { COPY } from "./copy.config.ts";

test("the unclassified note pluralises its count", () => {
  assert.match(COPY.cases.unclassified(1), /^1 opening with an unknown rarity/);
  assert.match(COPY.cases.unclassified(2), /^2 openings with an unknown rarity/);
});
