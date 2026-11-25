/* oxlint-disable typescript/no-floating-promises -- node:test registers suites synchronously */
import assert from "node:assert/strict";
import { test } from "node:test";
import { makeHistory } from "~test/fixtures";
import { filterRange, rangeStart } from "./history-panel.utils";

const NOW = Date.UTC(2026, 5, 15, 12);
const DAY = 86_400_000;

test("rangeStart is null for all time and now minus the window otherwise", () => {
  assert.equal(rangeStart("all", NOW), null);
  assert.equal(rangeStart("1d", NOW), NOW - DAY);
  assert.equal(rangeStart("1w", NOW), NOW - 7 * DAY);
});

test("rangeStart for year to date is the start of the year", () => {
  const start = rangeStart("ytd", NOW);
  assert.equal(start, new Date(new Date(NOW).getFullYear(), 0, 1).getTime());
});

test("filterRange keeps points inside the window and everything for all time", () => {
  const history = makeHistory(10, NOW);
  assert.equal(filterRange(history, "all", NOW).length, 10);
  assert.equal(filterRange(history, "1w", NOW).length, 8);
  assert.equal(filterRange(history, "1d", NOW).length, 2);
});
