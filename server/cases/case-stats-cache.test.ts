/* oxlint-disable typescript/no-floating-promises -- node:test registers suites synchronously */
import assert from "node:assert/strict";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";
import { DEFAULT_OPENING_KIND, OPENING_KINDS } from "../../src/lib/cases/cases.config.ts";
import { openDatabase } from "../db/db.ts";
import { createCaseStatsCache } from "./case-stats-cache.ts";
import type { HistoryEvent } from "./cases.types.ts";

const STEAM_ID = "1";
const event = (id: number): HistoryEvent => ({
  id: `history${id}`,
  occurredAt: id,
  description: "Traded",
  lost: [],
  gained: [],
});

test("cache is reused until new history rows are added", () => {
  const dir = mkdtempSync(join(tmpdir(), "oi-cache-"));
  const db = openDatabase(dir);
  try {
    let loads = 0;
    const cache = createCaseStatsCache({
      historyVersion: db.historyVersion,
      loadHistoryEvents: (id) => (loads++, db.loadHistoryEvents(id)),
    });
    const first = cache.get(STEAM_ID, DEFAULT_OPENING_KIND);
    assert.equal(cache.get(STEAM_ID, DEFAULT_OPENING_KIND), first);
    cache.get(STEAM_ID, OPENING_KINDS[1]);
    assert.equal(loads, 1);

    assert.equal(db.saveHistoryEvents(STEAM_ID, [event(1)]), 1);
    cache.get(STEAM_ID, DEFAULT_OPENING_KIND);
    cache.get(STEAM_ID, OPENING_KINDS[1]);
    assert.equal(loads, 2);

    assert.equal(db.saveHistoryEvents(STEAM_ID, [event(1)]), 0); // duplicate: no invalidation
    cache.get(STEAM_ID, DEFAULT_OPENING_KIND);
    assert.equal(loads, 2);
  } finally {
    db.close();
    rmSync(dir, { recursive: true, force: true });
  }
});

test("saveHistoryEvents rolls back the whole batch on error", () => {
  const dir = mkdtempSync(join(tmpdir(), "oi-tx-"));
  const db = openDatabase(dir);
  try {
    const circular: Record<string, unknown> = {};
    circular.self = circular;
    const bad = { ...event(3), extra: circular } as unknown as HistoryEvent;
    assert.throws(() => db.saveHistoryEvents(STEAM_ID, [event(2), bad]));
    assert.equal(db.hasHistoryEvent(STEAM_ID, "history2"), false);
    assert.equal(db.historyVersion(), 0);
  } finally {
    db.close();
    rmSync(dir, { recursive: true, force: true });
  }
});
