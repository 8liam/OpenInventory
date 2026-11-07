/* oxlint-disable typescript/no-floating-promises -- node:test registers suites synchronously */
import assert from "node:assert/strict";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { DatabaseSync } from "node:sqlite";
import { afterEach, test } from "node:test";
import { LOGIN_COOLDOWN_KEY } from "../../src/lib/storage/storage.config.ts";
import { openDatabase } from "../db/db.ts";
import { createSessionStore, LEGACY_SESSION_FILE } from "../steam/session-store.ts";
import { bootstrapAccounts } from "./accounts.bootstrap.ts";

const STEAM_ID = "76561190000000001";
const SESSION = { refreshToken: "t", accountName: "a", steamId: STEAM_ID } as const;
const DB_FILE = "openinventory.db";
const COOLDOWN = "1234567890123";

const cleanups: (() => void)[] = [];
afterEach(() => {
  while (cleanups.length > 0) cleanups.pop()?.();
});

/** A data directory as the single-account version left it: old schema, rows, `session.json`. */
function legacyDir(): string {
  const dir = mkdtempSync(join(tmpdir(), "oi-legacy-"));
  cleanups.push(() => rmSync(dir, { recursive: true, force: true }));
  const raw = new DatabaseSync(join(dir, DB_FILE));
  raw.exec(`
    CREATE TABLE cache (key TEXT PRIMARY KEY, value TEXT NOT NULL, fetched_at INTEGER NOT NULL);
    CREATE TABLE unit_contents (steam_id TEXT NOT NULL, unit_id TEXT NOT NULL, item_count INTEGER NOT NULL, items_json TEXT NOT NULL, loaded_at INTEGER NOT NULL, PRIMARY KEY (steam_id, unit_id));
    CREATE TABLE value_snapshots (steam_id TEXT NOT NULL, currency TEXT NOT NULL, taken_at INTEGER NOT NULL, total_value REAL NOT NULL, inventory_value REAL NOT NULL, storage_value REAL NOT NULL, item_count INTEGER NOT NULL, PRIMARY KEY (steam_id, currency, taken_at));
    CREATE TABLE history_events (steam_id TEXT NOT NULL, event_id TEXT NOT NULL, occurred_at INTEGER NOT NULL, event_json TEXT NOT NULL, PRIMARY KEY (steam_id, event_id));
    CREATE TABLE history_sync (steam_id TEXT PRIMARY KEY, state_json TEXT NOT NULL);
  `);
  raw.prepare("INSERT INTO value_snapshots VALUES (?, 'USD', 1000, 5, 3, 2, 7)").run(STEAM_ID);
  raw.prepare("INSERT INTO unit_contents VALUES (?, '42', 1, '[]', 1)").run(STEAM_ID);
  raw.prepare("INSERT INTO cache VALUES (?, ?, 1)").run(LOGIN_COOLDOWN_KEY, COOLDOWN);
  raw.close();
  writeFileSync(join(dir, LEGACY_SESSION_FILE), JSON.stringify(SESSION));
  return dir;
}

test("upgrading keeps every existing row and gives the existing account its data", () => {
  const dir = legacyDir();
  const db = openDatabase(dir);
  cleanups.push(() => db.close());
  const saved = bootstrapAccounts(db, createSessionStore(dir));

  assert.deepEqual(
    saved.map((s) => s.steamId),
    [STEAM_ID],
  );
  assert.deepEqual(
    db.listAccounts().map((a) => [a.steamId, a.label]),
    [[STEAM_ID, null]],
  );
  const key = { steamId: STEAM_ID, currency: "USD" };
  assert.equal(db.listSnapshots(key).length, 1);
  assert.equal(db.listSnapshots(key)[0]?.totalValue, 5);
  assert.equal(db.loadUnits(STEAM_ID).get("42")?.itemCount, 1);
  assert.equal(db.getCacheStale(`${LOGIN_COOLDOWN_KEY}:${STEAM_ID}`), COOLDOWN);
});

test("running the upgrade twice changes nothing", () => {
  const dir = legacyDir();
  const db = openDatabase(dir);
  cleanups.push(() => db.close());
  const sessions = createSessionStore(dir);
  bootstrapAccounts(db, sessions);
  db.setAccountLabel(STEAM_ID, "main");
  bootstrapAccounts(db, sessions);
  assert.equal(db.listAccounts().length, 1);
  assert.equal(db.listAccounts()[0]?.label, "main");
});
