/* oxlint-disable typescript/no-floating-promises -- node:test registers suites synchronously */
import assert from "node:assert/strict";
import { existsSync, mkdtempSync, readdirSync, rmSync, statSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test, type TestContext } from "node:test";
import { createSessionStore, LEGACY_SESSION_FILE, SESSIONS_DIR } from "./session-store.ts";

const FIRST = { refreshToken: "t1", accountName: "one", steamId: "76561190000000001" } as const;
const SECOND = { refreshToken: "t2", accountName: "two", steamId: "76561190000000002" } as const;
const WINDOWS = "win32";
const OWNER_ONLY_MODE = 0o600;

function tempDir(t: TestContext): string {
  const dir = mkdtempSync(join(tmpdir(), "oi-sessions-"));
  t.after(() => rmSync(dir, { recursive: true, force: true }));
  return dir;
}

test("each account keeps its own session file", (t) => {
  const store = createSessionStore(tempDir(t));
  store.forAccount(FIRST.steamId).save(FIRST);
  store.forAccount(SECOND.steamId).save(SECOND);
  assert.equal(store.forAccount(FIRST.steamId).load()?.refreshToken, "t1");
  assert.deepEqual(
    store.listSaved().map((s) => s.steamId),
    [FIRST.steamId, SECOND.steamId],
  );
  store.forAccount(FIRST.steamId).clear();
  assert.deepEqual(
    store.listSaved().map((s) => s.steamId),
    [SECOND.steamId],
  );
});

test("a SteamID that isn't 17 digits is rejected, so it can't escape the sessions directory", (t) => {
  const store = createSessionStore(tempDir(t));
  assert.throws(() => store.forAccount("../session"));
});

test("a file whose content names another account is ignored", (t) => {
  const dir = tempDir(t);
  const store = createSessionStore(dir);
  store.forAccount(FIRST.steamId).save({ ...SECOND });
  assert.deepEqual(store.listSaved(), []);
});

test("the legacy session.json moves into sessions/ and the old file is removed", (t) => {
  const dir = tempDir(t);
  writeFileSync(join(dir, LEGACY_SESSION_FILE), JSON.stringify(FIRST));
  const store = createSessionStore(dir);
  assert.equal(store.migrateLegacy()?.steamId, FIRST.steamId);
  assert.equal(existsSync(join(dir, LEGACY_SESSION_FILE)), false);
  assert.deepEqual(readdirSync(join(dir, SESSIONS_DIR)), [`${FIRST.steamId}.json`]);
  assert.equal(store.forAccount(FIRST.steamId).load()?.refreshToken, "t1");
  if (process.platform !== WINDOWS) {
    const mode = statSync(join(dir, SESSIONS_DIR, `${FIRST.steamId}.json`)).mode & 0o777;
    assert.equal(mode, OWNER_ONLY_MODE);
  }
  assert.equal(store.migrateLegacy(), undefined);
});

test("migration never overwrites a newer per-account session", (t) => {
  const dir = tempDir(t);
  const store = createSessionStore(dir);
  store.forAccount(FIRST.steamId).save({ ...FIRST, refreshToken: "newer" });
  writeFileSync(join(dir, LEGACY_SESSION_FILE), JSON.stringify(FIRST));
  store.migrateLegacy();
  assert.equal(store.forAccount(FIRST.steamId).load()?.refreshToken, "newer");
});

test("an unreadable legacy file is left alone", (t) => {
  const dir = tempDir(t);
  writeFileSync(join(dir, LEGACY_SESSION_FILE), "{not json");
  assert.equal(createSessionStore(dir).migrateLegacy(), undefined);
  assert.equal(existsSync(join(dir, LEGACY_SESSION_FILE)), true);
});
