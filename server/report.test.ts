/* oxlint-disable typescript/no-floating-promises -- node:test registers suites synchronously */
import assert from "node:assert/strict";
import { test } from "node:test";
import { buildSummaryReport } from "./report.ts";

test("summary report uses the period baseline and ranks current holdings", () => {
  const now = 30 * 86_400_000;
  const report = buildSummaryReport({
    period: "weekly",
    currency: "USD",
    now,
    history: [
      { takenAt: now - 8 * 86_400_000, totalValue: 100, inventoryValue: 80, storageValue: 20 },
      { takenAt: now, totalValue: 135, inventoryValue: 95, storageValue: 40 },
    ],
    holdings: [
      { name: "Second", imageUrl: null, rarityColor: null, count: 1, unitPrice: 20, totalValue: 20 },
      { name: "First", imageUrl: null, rarityColor: null, count: 2, unitPrice: 25, totalValue: 50 },
    ],
  });

  assert.equal(report.valueChange, 35);
  assert.equal(report.currentValue, 135);
  assert.deepEqual(report.topMovers.map(({ name }) => name), ["First", "Second"]);
});
