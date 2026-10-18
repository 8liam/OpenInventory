/* oxlint-disable typescript/no-floating-promises -- node:test registers suites synchronously */
import assert from "node:assert/strict";
import { test } from "node:test";
import { buildCaseStats } from "./case-stats.ts";
import type { HistoryEvent, HistoryItem } from "./cases.types.ts";

const base: Omit<HistoryItem, "name" | "type" | "color"> = {
  icon: null,
  wear: null,
  statTrak: false,
  collection: null,
};
const container: HistoryItem = {
  ...base,
  name: "Test Case",
  type: "CSGO_Type_WeaponCase",
  color: "b0c3d9",
};

function opening(id: number, reward: string, color: string, at: number): HistoryEvent {
  return {
    id: `history${id}`,
    occurredAt: at,
    description: "Unlocked a container",
    lost: [container],
    gained: [{ ...base, name: reward, type: "CSGO_Type_Rifle", color }],
  };
}

// Newest first, as the database returns them.
const events: HistoryEvent[] = [
  opening(4, "AK-47 | Redline", "eb4b4b", Date.UTC(2026, 2, 4)),
  opening(3, "★ Karambit | Fade", "eb4b4b", Date.UTC(2026, 1, 3)),
  opening(2, "M4A4 | Howl", "d32ce6", Date.UTC(2026, 1, 2)),
  opening(1, "P250 | Sand Dune", "4b69ff", Date.UTC(2026, 0, 1)),
];

test("counts openings, rarity and gold", () => {
  const stats = buildCaseStats(events, "case");
  assert.equal(stats.total, 4);
  assert.equal(stats.gold, 1);
  assert.deepEqual(
    stats.rarity.map((r) => [r.label, r.count]),
    [
      ["Gold", 1],
      ["Covert", 1],
      ["Classified", 1],
      ["Mil-Spec", 1],
    ],
  );
});

test("measures the gold drought in both directions", () => {
  const stats = buildCaseStats(events, "case");
  assert.equal(stats.casesSinceGold, 1); // one case opened after the knife
  assert.equal(stats.casesToFirstGold, 3); // knife was the 3rd opening ever
});

test("handles an account with no openings", () => {
  const stats = buildCaseStats([], "case");
  assert.equal(stats.casesSinceGold, null);
  assert.equal(stats.casesToFirstGold, null);
  assert.deepEqual(stats.perMonth, []);
});

test("fills months without openings so the chart keeps its time axis", () => {
  const stats = buildCaseStats(events, "case");
  assert.deepEqual(
    stats.perMonth.map((m) => m.month),
    ["2026-01", "2026-02", "2026-03"],
  );
  const gapped = buildCaseStats(
    [
      opening(2, "A", "4b69ff", new Date(2026, 4, 10).getTime()),
      opening(1, "B", "4b69ff", new Date(2026, 1, 10).getTime()),
    ],
    "case",
  );
  assert.deepEqual(
    gapped.perMonth.map((m) => [m.month, m.count]),
    [
      ["2026-02", 1],
      ["2026-03", 0],
      ["2026-04", 0],
      ["2026-05", 1],
    ],
  );
});

test("breaks the same history down by kind", () => {
  const capsule: HistoryEvent = {
    id: "history9",
    occurredAt: Date.UTC(2026, 3, 1),
    description: "Unlocked a container",
    lost: [{ ...container, name: "Test Capsule" }],
    gained: [{ ...base, name: "Sticker | Test", type: "CSGO_Tool_Sticker", color: "4b69ff" }],
  };
  const all = [capsule, ...events];
  const capsules = buildCaseStats(all, "capsule");
  assert.equal(capsules.total, 1);
  assert.equal(capsules.kindCounts.case, 4);
  assert.equal(capsules.kindCounts.capsule, 1);
  assert.equal(capsules.topCases[0]?.name, "Test Capsule");
  assert.equal(capsules.casesSinceGold, null);
  assert.equal(buildCaseStats(all, "case").total, 4);
});

test("ranks rarest pulls gold first, then by rarity, newest first among equals", () => {
  const stats = buildCaseStats(events, "case");
  assert.deepEqual(
    stats.rarest.map((o) => o.itemName),
    ["★ Karambit | Fade", "AK-47 | Redline", "M4A4 | Howl", "P250 | Sand Dune"],
  );
});
