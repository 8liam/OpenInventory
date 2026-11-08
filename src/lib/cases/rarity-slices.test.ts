/* oxlint-disable typescript/no-floating-promises -- node:test registers suites synchronously */
import assert from "node:assert/strict";
import { test } from "node:test";
import { buildRaritySlices } from "./rarity-slices.ts";

const UNKNOWN = { label: "Unknown rarity", color: "8b8b94" } as const;
const RARITY = [
  { label: "Mil-Spec", color: "4b69ff", count: 3 },
  { label: "Restricted", color: "8847ff", count: 1 },
] as const;

test("openings with no recorded rarity become their own slice so the chart matches the total", () => {
  const slices = buildRaritySlices(RARITY, 6, UNKNOWN);
  assert.deepEqual(slices.at(-1), {
    label: "Unknown rarity",
    value: 2,
    count: 2,
    color: "#8b8b94",
  });
  assert.equal(
    slices.reduce((sum, s) => sum + s.value, 0),
    6,
  );
});

test("no unknown slice when every opening has a rarity", () => {
  const slices = buildRaritySlices(RARITY, 4, UNKNOWN);
  assert.deepEqual(
    slices.map((s) => s.label),
    ["Mil-Spec", "Restricted"],
  );
});
