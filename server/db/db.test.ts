/* oxlint-disable typescript/no-floating-promises -- node:test registers suites synchronously */
import assert from "node:assert/strict";
import {
  mkdirSync,
  mkdtempSync,
  openSync,
  readdirSync,
  rmSync,
  statSync,
  writeFileSync,
  writeSync,
  closeSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { DatabaseSync } from "node:sqlite";
import { afterEach, test } from "node:test";
import type { HistoryEvent } from "../cases/cases.types.ts";
import type { GcItem } from "../steam/steam.types.ts";
import { openDatabase } from "./db.ts";
import type { Database, ValueSnapshot } from "./db.types.ts";

const STEAM_ID = "76561190000000001";
const OTHER_STEAM_ID = "76561190000000002";
const KEY = { steamId: STEAM_ID, currency: "USD" } as const;
const TEMP_PREFIX = "openinventory-db-";
const DB_FILE = "openinventory.db";
const QUARANTINE_MARKER = ".corrupt-";
const FILLER_ROWS = 200;
const FILLER_BYTES = 1024;
const DAMAGE_BYTES = 4096;

const cleanups: (() => void)[] = [];
afterEach(() => {
  while (cleanups.length > 0) cleanups.pop()?.();
});

function tempDir(): string {
  const dir = mkdtempSync(join(tmpdir(), TEMP_PREFIX));
  cleanups.push(() => rmSync(dir, { recursive: true, force: true }));
  return dir;
}

function freshDb(): { db: Database; dir: string } {
  const dir = tempDir();
  const db = openDatabase(dir);
  cleanups.push(() => db.close());
  return { db, dir };
}

function quarantined(dir: string): string[] {
  return readdirSync(dir).filter((name) => name.includes(QUARANTINE_MARKER));
}

function snapshot(takenAt: number, totalValue: number): ValueSnapshot {
  return { takenAt, totalValue, inventoryValue: totalValue, storageValue: 0, itemCount: 3 };
}

function event(id: string, occurredAt: number): HistoryEvent {
  return { id, occurredAt, description: `event ${id}`, lost: [], gained: [] };
}

test("cache honours max age but getCacheStale ignores it", () => {
  const { db } = freshDb();
  assert.equal(db.getCache("k", 60_000), undefined);
  db.setCache("k", "v1");
  assert.equal(db.getCache("k", 60_000), "v1");
  assert.equal(db.getCache("k", -1), undefined, "an already-expired window misses");
  assert.equal(db.getCacheStale("k"), "v1");
  db.setCache("k", "v2");
  assert.equal(db.getCacheStale("k"), "v2", "upsert replaces the value");
});

test("data persists across reopening the same directory", () => {
  const { db, dir } = freshDb();
  db.setCache("persist", "yes");
  db.addSnapshot(KEY, snapshot(Date.now(), 12.5));
  const reopened = openDatabase(dir);
  cleanups.push(() => reopened.close());
  assert.equal(reopened.getCacheStale("persist"), "yes");
  assert.equal(reopened.listSnapshots(KEY).length, 1);
});

test("unit contents round-trip Buffers and tradable_after dates", () => {
  const { db } = freshDb();
  const when = new Date("2030-01-02T03:04:05.000Z");
  const items = [
    { id: "1", custom_name: Buffer.from([1, 2, 3]), tradable_after: when },
  ] as unknown as readonly GcItem[];
  db.saveUnit(STEAM_ID, "u1", 1, items);
  const loaded = db.loadUnits(STEAM_ID).get("u1");
  assert.equal(loaded?.itemCount, 1);
  const first = loaded?.items[0] as unknown as Record<string, unknown>;
  assert.ok(Buffer.isBuffer(first.custom_name));
  assert.deepEqual([...(first.custom_name as Buffer)], [1, 2, 3]);
  assert.ok(first.tradable_after instanceof Date);
  assert.equal((first.tradable_after as Date).getTime(), when.getTime());
});

test("units are scoped per account and can be pruned or cleared", () => {
  const { db } = freshDb();
  db.saveUnit(STEAM_ID, "a", 0, []);
  db.saveUnit(STEAM_ID, "b", 0, []);
  db.saveUnit(OTHER_STEAM_ID, "z", 0, []);
  db.pruneUnits(STEAM_ID, ["a"]);
  assert.deepEqual([...db.loadUnits(STEAM_ID).keys()], ["a"]);
  assert.deepEqual([...db.loadUnits(OTHER_STEAM_ID).keys()], ["z"]);
  db.clearUnits(STEAM_ID);
  assert.equal(db.loadUnits(STEAM_ID).size, 0);
  assert.equal(db.loadUnits(OTHER_STEAM_ID).size, 1);
});

test("snapshots list in time order, per currency, and report the latest", () => {
  const { db } = freshDb();
  const now = Date.now();
  assert.equal(db.lastSnapshotAt(KEY), undefined);
  db.addSnapshot(KEY, snapshot(now - 2000, 20));
  db.addSnapshot(KEY, snapshot(now - 5000, 5));
  db.addSnapshot({ steamId: STEAM_ID, currency: "EUR" }, snapshot(now, 99));
  assert.deepEqual(
    db.listSnapshots(KEY).map((s) => s.totalValue),
    [5, 20],
  );
  assert.equal(db.lastSnapshotAt(KEY), now - 2000);
  // Same timestamp replaces rather than duplicating.
  db.addSnapshot(KEY, snapshot(now - 2000, 21));
  assert.equal(db.listSnapshots(KEY).length, 2);
});

test("snapshots older than the retention window are pruned on write", () => {
  const { db } = freshDb();
  const now = Date.now();
  const threeYearsMs = 3 * 365 * 86_400_000;
  db.addSnapshot(KEY, snapshot(now - threeYearsMs, 1));
  db.addSnapshot(KEY, snapshot(now, 2));
  assert.deepEqual(
    db.listSnapshots(KEY).map((s) => s.totalValue),
    [2],
  );
});

test("history events dedupe by id, count only new rows and bump the version", () => {
  const { db } = freshDb();
  assert.equal(db.historyVersion(), 0);
  assert.equal(db.saveHistoryEvents(STEAM_ID, [event("a", 100), event("b", 200)]), 2);
  assert.equal(db.historyVersion(), 1);
  assert.equal(db.saveHistoryEvents(STEAM_ID, [event("a", 100), event("c", 150)]), 1);
  assert.equal(db.historyVersion(), 2);
  assert.equal(db.saveHistoryEvents(STEAM_ID, [event("a", 100)]), 0);
  assert.equal(db.historyVersion(), 2, "no new rows leaves the version alone");
  assert.equal(db.hasHistoryEvent(STEAM_ID, "c"), true);
  assert.equal(db.hasHistoryEvent(OTHER_STEAM_ID, "c"), false);
  assert.deepEqual(
    db.loadHistoryEvents(STEAM_ID).map((e) => e.id),
    ["b", "c", "a"],
    "newest first",
  );
});

test("history sync state round-trips and is undefined before first save", () => {
  const { db } = freshDb();
  assert.equal(db.loadHistorySync(STEAM_ID), undefined);
  const state = { complete: true, resumeFrom: undefined, updatedAt: 42 };
  db.saveHistorySync(STEAM_ID, state);
  assert.equal(db.loadHistorySync(STEAM_ID)?.updatedAt, 42);
  db.saveHistorySync(STEAM_ID, { ...state, updatedAt: 43 });
  assert.equal(db.loadHistorySync(STEAM_ID)?.updatedAt, 43);
});

test("history reads and snapshot retention use timestamp indexes", () => {
  const { dir } = freshDb();
  const raw = new DatabaseSync(join(dir, DB_FILE));
  cleanups.push(() => raw.close());
  const history = raw
    .prepare(
      "EXPLAIN QUERY PLAN SELECT event_json FROM history_events WHERE steam_id = ? ORDER BY occurred_at DESC, event_id DESC",
    )
    .all("account");
  const retention = raw
    .prepare("EXPLAIN QUERY PLAN DELETE FROM value_snapshots WHERE taken_at < ?")
    .all(Date.now());
  assert.ok(history.some((row) => String(row.detail).includes("history_events_by_time")));
  assert.ok(retention.some((row) => String(row.detail).includes("value_snapshots_by_time")));
  assert.ok(history.every((row) => !String(row.detail).includes("TEMP B-TREE")));
});

test("a file that is not a database is quarantined and replaced by a working one", () => {
  const dir = tempDir();
  writeFileSync(join(dir, DB_FILE), "this is not a sqlite database".repeat(100));
  const db = openDatabase(dir);
  cleanups.push(() => db.close());
  db.setCache("k", "v");
  assert.equal(db.getCacheStale("k"), "v");
  assert.equal(quarantined(dir).length, 1, readdirSync(dir).join(","));
});

test("a database with damaged pages is set aside intact, never deleted", () => {
  const dir = tempDir();
  const original = openDatabase(dir);
  for (let i = 0; i < FILLER_ROWS; i++) original.setCache(`k${i}`, "x".repeat(FILLER_BYTES));
  original.close();
  const file = join(dir, DB_FILE);
  const size = statSync(file).size;
  const fd = openSync(file, "r+");
  writeSync(fd, Buffer.alloc(DAMAGE_BYTES, 0xff), 0, DAMAGE_BYTES, Math.floor(size / 2));
  closeSync(fd);

  const db = openDatabase(dir);
  cleanups.push(() => db.close());
  assert.equal(db.getCacheStale("k0"), undefined, "starts fresh");
  const [moved] = quarantined(dir);
  assert.ok(moved, readdirSync(dir).join(","));
  assert.equal(statSync(join(dir, moved)).size, size, "the damaged copy is kept as it was");
});

test("a healthy database is left alone", () => {
  const { db, dir } = freshDb();
  db.setCache("k", "v");
  const reopened = openDatabase(dir);
  cleanups.push(() => reopened.close());
  assert.equal(reopened.getCacheStale("k"), "v");
  assert.deepEqual(quarantined(dir), []);
});

test("a database that can't be opened for other reasons is an error, not a quarantine", () => {
  const dir = tempDir();
  mkdirSync(join(dir, DB_FILE));
  assert.throws(() => openDatabase(dir));
  assert.deepEqual(quarantined(dir), []);
});

test("accounts: add is idempotent, labels persist, removal keeps the account's history", () => {
  const { db } = freshDb();
  db.addAccount(STEAM_ID);
  db.addAccount(OTHER_STEAM_ID);
  db.addAccount(STEAM_ID);
  assert.equal(db.setAccountLabel(STEAM_ID, "trade"), true);
  assert.equal(db.setAccountLabel("76561190000000099", "alt"), false);
  assert.deepEqual(
    db.listAccounts().map((a) => [a.steamId, a.label]),
    [
      [STEAM_ID, "trade"],
      [OTHER_STEAM_ID, null],
    ],
  );
  db.addSnapshot(KEY, snapshot(Date.now(), 5));
  db.removeAccount(STEAM_ID);
  assert.equal(db.listAccounts().length, 1);
  assert.equal(db.listSnapshots(KEY).length, 1);
});
