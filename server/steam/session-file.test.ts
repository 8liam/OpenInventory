/* oxlint-disable typescript/no-floating-promises -- node:test registers suites synchronously */
import assert from "node:assert/strict";
import { mkdtempSync, readdirSync, rmSync, statSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test, type TestContext } from "node:test";
import { createSessionFile } from "./session-file.ts";

const SESSION = { refreshToken: "t", accountName: "a", steamId: "1" } as const;
const LEFTOVER_TEMP = "session.json.tmp";
const WINDOWS = "win32";
const OWNER_ONLY_MODE = 0o600;

function tempDir(t: TestContext): string {
  const dir = mkdtempSync(join(tmpdir(), "oi-session-"));
  t.after(() => rmSync(dir, { recursive: true, force: true }));
  return dir;
}

test("save round-trips, stays owner-only and leaves no temp file", (t) => {
  const dir = tempDir(t);
  const file = createSessionFile(dir);
  file.save(SESSION);
  file.save({ ...SESSION, refreshToken: "t2" });
  assert.equal(file.load()?.refreshToken, "t2");
  // Windows has no POSIX permission bits (files report 0o666), so there is no owner-only mode to check.
  if (process.platform !== WINDOWS) {
    assert.equal(statSync(join(dir, "session.json")).mode & 0o777, OWNER_ONLY_MODE);
  }
  assert.deepEqual(readdirSync(dir), ["session.json"]);
  file.clear();
  assert.equal(file.load(), undefined);
});

test("sign-out also removes a token left in the temp file by an interrupted save", (t) => {
  const dir = tempDir(t);
  writeFileSync(join(dir, LEFTOVER_TEMP), JSON.stringify(SESSION));
  createSessionFile(dir).clear();
  assert.deepEqual(readdirSync(dir), []);
});
