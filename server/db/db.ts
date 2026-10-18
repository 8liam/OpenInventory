import { mkdirSync } from "node:fs";
import { join } from "node:path";
import { DatabaseSync } from "node:sqlite";
import { SERVER_LIMITS } from "../server.config.ts";
import type { GcItem } from "../steam/steam.types.ts";
import type { Database, SnapshotKey, ValueSnapshot } from "./db.types.ts";

const DB_FILE = "openinventory.db";
const DAY_MS = 86_400_000;
const BUFFER_TAG = "Buffer";
const DATE_KEYS: ReadonlySet<string> = new Set(["tradable_after"]);

const SCHEMA = `
  PRAGMA journal_mode = WAL;
  PRAGMA synchronous = NORMAL;
  CREATE TABLE IF NOT EXISTS cache (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL,
    fetched_at INTEGER NOT NULL
  );
  CREATE TABLE IF NOT EXISTS unit_contents (
    steam_id TEXT NOT NULL,
    unit_id TEXT NOT NULL,
    item_count INTEGER NOT NULL,
    items_json TEXT NOT NULL,
    loaded_at INTEGER NOT NULL,
    PRIMARY KEY (steam_id, unit_id)
  );
  CREATE TABLE IF NOT EXISTS value_snapshots (
    steam_id TEXT NOT NULL,
    currency TEXT NOT NULL,
    taken_at INTEGER NOT NULL,
    total_value REAL NOT NULL,
    inventory_value REAL NOT NULL,
    storage_value REAL NOT NULL,
    item_count INTEGER NOT NULL,
    PRIMARY KEY (steam_id, currency, taken_at)
  );
`;

type BufferJson = { readonly type: typeof BUFFER_TAG; readonly data: readonly number[] };

function isBufferJson(value: unknown): value is BufferJson {
  return (
    typeof value === "object" &&
    value !== null &&
    (value as BufferJson).type === BUFFER_TAG &&
    Array.isArray((value as BufferJson).data)
  );
}

/** GC items carry Buffers and Dates; revive them after a JSON round-trip. */
function reviveItem(key: string, value: unknown): unknown {
  if (isBufferJson(value)) return Buffer.from(value.data);
  if (DATE_KEYS.has(key) && typeof value === "string") return new Date(value);
  return value;
}

type Row = Record<string, string | number | bigint | Uint8Array | null>;

export function openDatabase(dataDir: string): Database {
  mkdirSync(dataDir, { recursive: true });
  const db = new DatabaseSync(join(dataDir, DB_FILE));
  db.exec(SCHEMA);

  const getCache = db.prepare("SELECT value, fetched_at FROM cache WHERE key = ?");
  const putCache = db.prepare(
    "INSERT INTO cache (key, value, fetched_at) VALUES (?, ?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value, fetched_at = excluded.fetched_at",
  );
  const putUnit = db.prepare(
    "INSERT INTO unit_contents (steam_id, unit_id, item_count, items_json, loaded_at) VALUES (?, ?, ?, ?, ?) ON CONFLICT(steam_id, unit_id) DO UPDATE SET item_count = excluded.item_count, items_json = excluded.items_json, loaded_at = excluded.loaded_at",
  );
  const getUnits = db.prepare(
    "SELECT unit_id, item_count, items_json FROM unit_contents WHERE steam_id = ?",
  );
  const listUnitIds = db.prepare("SELECT unit_id FROM unit_contents WHERE steam_id = ?");
  const deleteUnit = db.prepare("DELETE FROM unit_contents WHERE steam_id = ? AND unit_id = ?");
  const deleteUnits = db.prepare("DELETE FROM unit_contents WHERE steam_id = ?");
  const putSnapshot = db.prepare(
    "INSERT OR REPLACE INTO value_snapshots (steam_id, currency, taken_at, total_value, inventory_value, storage_value, item_count) VALUES (?, ?, ?, ?, ?, ?, ?)",
  );
  const lastSnapshot = db.prepare(
    "SELECT MAX(taken_at) AS taken_at FROM value_snapshots WHERE steam_id = ? AND currency = ?",
  );
  const listSnapshots = db.prepare(
    "SELECT taken_at, total_value, inventory_value, storage_value, item_count FROM value_snapshots WHERE steam_id = ? AND currency = ? ORDER BY taken_at",
  );
  const pruneSnapshots = db.prepare("DELETE FROM value_snapshots WHERE taken_at < ?");

  return {
    getCache(key, maxAgeMs) {
      const row = getCache.get(key) as Row | undefined;
      if (!row || Date.now() - Number(row.fetched_at) > maxAgeMs) return undefined;
      return String(row.value);
    },
    getCacheStale(key) {
      const row = getCache.get(key) as Row | undefined;
      return row ? String(row.value) : undefined;
    },
    setCache(key, value) {
      putCache.run(key, value, Date.now());
    },
    saveUnit(steamId, unitId, itemCount, items) {
      putUnit.run(steamId, unitId, itemCount, JSON.stringify(items), Date.now());
    },
    loadUnits(steamId) {
      const units = new Map<string, { itemCount: number; items: readonly GcItem[] }>();
      for (const row of getUnits.all(steamId) as Row[]) {
        units.set(String(row.unit_id), {
          itemCount: Number(row.item_count),
          items: JSON.parse(String(row.items_json), reviveItem) as GcItem[],
        });
      }
      return units;
    },
    pruneUnits(steamId, keepIds) {
      const keep = new Set(keepIds);
      for (const row of listUnitIds.all(steamId) as Row[]) {
        if (!keep.has(String(row.unit_id))) deleteUnit.run(steamId, String(row.unit_id));
      }
    },
    clearUnits(steamId) {
      deleteUnits.run(steamId);
    },
    addSnapshot({ steamId, currency }: SnapshotKey, s: ValueSnapshot) {
      putSnapshot.run(
        steamId,
        currency,
        s.takenAt,
        s.totalValue,
        s.inventoryValue,
        s.storageValue,
        s.itemCount,
      );
      pruneSnapshots.run(Date.now() - SERVER_LIMITS.snapshotRetentionDays * DAY_MS);
    },
    lastSnapshotAt({ steamId, currency }) {
      const row = lastSnapshot.get(steamId, currency) as Row | undefined;
      return row?.taken_at == null ? undefined : Number(row.taken_at);
    },
    listSnapshots({ steamId, currency }) {
      return (listSnapshots.all(steamId, currency) as Row[]).map((row) => ({
        takenAt: Number(row.taken_at),
        totalValue: Number(row.total_value),
        inventoryValue: Number(row.inventory_value),
        storageValue: Number(row.storage_value),
        itemCount: Number(row.item_count),
      }));
    },
    close: () => db.close(),
  };
}
