/* oxlint-disable typescript/no-floating-promises -- node:test registers suites synchronously */
import assert from "node:assert/strict";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";
import { openDatabase } from "../db/db.ts";
import { createHistorySync } from "./history-sync.ts";

test("automatic sync starts a new history and resumes an unfinished first pass", async (t) => {
  const dir = mkdtempSync(join(tmpdir(), "openinventory-history-"));
  const db = openDatabase(dir);
  const originalFetch = globalThis.fetch;
  t.after(() => {
    globalThis.fetch = originalFetch;
    db.close();
    rmSync(dir, { recursive: true, force: true });
  });
  const requests: URL[] = [];
  globalThis.fetch = async (input) => {
    const url = input instanceof Request ? input.url : input instanceof URL ? input.href : input;
    requests.push(new URL(url));
    const response = new Response(JSON.stringify({ success: true, html: "", descriptions: {} }));
    Object.defineProperty(response, "url", {
      value: "https://steamcommunity.com/inventoryhistory/",
    });
    return response;
  };
  const sync = createHistorySync(db, async () => []);

  sync.start("new-account", { onlyIfStale: true });
  assert.equal(sync.status("new-account").state, "running");
  await new Promise<void>((resolve) => setImmediate(resolve));
  assert.equal(db.loadHistorySync("new-account")?.complete, true);

  // A history finished moments ago is not read again until it goes stale.
  const requestsAfterFirstPass = requests.length;
  sync.start("new-account", { onlyIfStale: true });
  assert.equal(sync.status("new-account").state, "idle");
  assert.equal(requests.length, requestsAfterFirstPass);

  db.saveHistorySync("interrupted-account", {
    complete: false,
    resumeFrom: { time: 1, timeFrac: 0, s: "cursor" },
    updatedAt: Date.now(),
  });
  sync.start("interrupted-account", { onlyIfStale: true });
  assert.equal(sync.status("interrupted-account").state, "running");
  await new Promise<void>((resolve) => setImmediate(resolve));
  assert.equal(db.loadHistorySync("interrupted-account")?.complete, true);
  assert.equal(requests[1]?.searchParams.get("cursor[time]"), "1");
});

test("one account's sync state never shows on another account", async (t) => {
  const dir = mkdtempSync(join(tmpdir(), "openinventory-history-"));
  const db = openDatabase(dir);
  const originalFetch = globalThis.fetch;
  const originalWarn = console.warn;
  t.after(() => {
    globalThis.fetch = originalFetch;
    console.warn = originalWarn;
    db.close();
    rmSync(dir, { recursive: true, force: true });
  });
  console.warn = () => undefined;
  globalThis.fetch = async () => {
    throw new Error("steam is down");
  };
  const sync = createHistorySync(db, async () => []);
  sync.start("broken-account");
  assert.equal(sync.status("other-account").state, "idle");
  await new Promise<void>((resolve) => setTimeout(resolve, 20));
  assert.equal(sync.status("broken-account").state, "error");
  assert.equal(sync.status("other-account").state, "idle");
  assert.equal(sync.status("other-account").message, null);
});
