/* oxlint-disable typescript/no-floating-promises -- node:test registers suites synchronously */
import assert from "node:assert/strict";
import { test } from "node:test";
import { isAllowedHost } from "./host-guard.ts";
import { ENV, readSettings } from "./server.config.ts";

test("accepts loopback names, IP literals and MagicDNS names", () => {
  for (const host of [
    "localhost:4174",
    "LOCALHOST",
    "127.0.0.1:3000",
    "192.168.1.5:3000",
    "[::1]:3000",
    "box.tail1234.ts.net:5173",
    "app.localhost",
  ]) {
    assert.equal(isAllowedHost(host, []), true, host);
  }
});

test("accepts names that never resolve through public DNS", () => {
  for (const host of [
    "nas:3000",
    "openinventory:3000",
    "raspberrypi.local:3000",
    "router.home.arpa",
    "host.docker.internal:3000",
  ]) {
    assert.equal(isAllowedHost(host, []), true, host);
  }
});

test("rejects names an attacker could rebind", () => {
  for (const host of [
    "evil.example.com",
    "evil.example.com:4174",
    "localhost.evil.com",
    "evilts.net",
    "ts.net.evil.com",
    "nas.local.evil.com",
    "evil-internal.com",
    "nas.lan",
    "evil.",
    "",
    undefined,
    "bad host",
  ]) {
    assert.equal(isAllowedHost(host, []), false, String(host));
  }
});

test("honours the configured extras, exact and suffix", () => {
  assert.equal(isAllowedHost("nas.lan:3000", []), false);
  assert.equal(isAllowedHost("nas.lan:3000", ["nas.lan"]), true);
  assert.equal(isAllowedHost("inv.home.example", [".home.example"]), true);
  assert.equal(isAllowedHost("evil-home.example", [".home.example"]), false);
});

test("allowed-host entries are trimmed, lowercased and stripped of a port", () => {
  const { allowedHosts } = readSettings({ [ENV.allowedHosts]: " NAS.lan:3000 , .Home.Example ,," });
  assert.deepEqual(allowedHosts, ["nas.lan", ".home.example"]);
  assert.equal(isAllowedHost("nas.lan:3000", allowedHosts), true);
});
