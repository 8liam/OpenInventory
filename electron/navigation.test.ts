/* oxlint-disable typescript/no-floating-promises -- node:test registers suites synchronously */
import assert from "node:assert/strict";
import { test } from "node:test";
import { isAppUrl, isSafeExternalUrl } from "./navigation.ts";

test("only http(s) links may leave the app", () => {
  assert.equal(isSafeExternalUrl("https://github.com/8liam/OpenInventory"), true);
  assert.equal(isSafeExternalUrl("http://example.com"), true);
  for (const bad of [
    "file:///etc/passwd",
    "smb://host/share",
    "ms-msdt:/id",
    "javascript:1",
    "x",
  ]) {
    assert.equal(isSafeExternalUrl(bad), false, bad);
  }
});

test("app URL match is by origin, not string prefix", () => {
  const app = "http://127.0.0.1:4174";
  assert.equal(isAppUrl("http://127.0.0.1:4174/dashboard", app), true);
  assert.equal(isAppUrl("http://127.0.0.1:41740/", app), false);
  assert.equal(isAppUrl("http://127.0.0.1:4174.evil.com/", app), false);
  assert.equal(isAppUrl("not a url", app), false);
});
