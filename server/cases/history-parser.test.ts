/* oxlint-disable typescript/no-floating-promises -- node:test registers suites synchronously */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import type { HistoryPage } from "./cases.types.ts";
import { classifyEvent } from "./history-classify.ts";
import { parseHistoryDate, parseHistoryPage } from "./history-parser.ts";

const page = JSON.parse(
  readFileSync(new URL("./fixtures/history-page.json", import.meta.url), "utf8"),
) as HistoryPage;

test("parses a date and 12-hour time", () => {
  assert.equal(parseHistoryDate("23 Sep, 2026", "9:51pm"), new Date(2026, 8, 23, 21, 51).getTime());
  assert.equal(parseHistoryDate("1 Jan, 2025", "12:05am"), new Date(2025, 0, 1, 0, 5).getTime());
  assert.equal(parseHistoryDate("1 Jan, 2025", "12:05pm"), new Date(2025, 0, 1, 12, 5).getTime());
  assert.equal(parseHistoryDate("nonsense", "9:51pm"), undefined);
});

test("reads events with their gained and lost items from a real page", () => {
  const events = parseHistoryPage(page);
  assert.ok(events.length >= 3);
  const opening = events.find((e) => e.lost.some((i) => i.name.endsWith("Case Key")));
  assert.ok(opening, "expected a case opening");
  assert.equal(opening.gained.length, 1);
  assert.equal(opening.lost.length, 2);
  assert.match(opening.id, /^history[0-9a-f]+$/);
  assert.ok(opening.gained[0]?.color, "rarity colour comes from the description tags");
});

test("classifies case openings apart from other containers", () => {
  const events = parseHistoryPage(page);
  const kinds = events.map(classifyEvent);
  assert.ok(kinds.includes("case"));
  const terminal = events.find((e) => e.gained.some((i) => i.name.includes("Terminal")));
  assert.equal(terminal ? classifyEvent(terminal) : "other", "other");
});
