/* oxlint-disable typescript/no-floating-promises -- node:test registers suites synchronously */
import assert from "node:assert/strict";
import { test } from "node:test";
import { FALLBACK_SETTINGS, parseStoredSettings } from "./settings.parse.ts";

test("old { theme } settings migrate to colorScheme with the default palette", () => {
  const settings = parseStoredSettings(
    JSON.stringify({ currency: "EUR", marketplace: "steam", theme: "dark" }),
  );
  assert.deepEqual(settings, {
    currency: "EUR",
    marketplace: "steam",
    colorScheme: "dark",
    palette: "default",
  });
});

test("new settings round-trip", () => {
  const stored = {
    currency: "GBP",
    marketplace: "skinport",
    colorScheme: "light",
    palette: "nord",
  };
  assert.deepEqual(parseStoredSettings(JSON.stringify(stored)), stored);
});

test("missing fields default and unknown palettes fall back", () => {
  const settings = parseStoredSettings(JSON.stringify({ currency: "USD", palette: "nope" }));
  assert.equal(settings.colorScheme, "system");
  assert.equal(settings.palette, "default");
  assert.equal(settings.marketplace, FALLBACK_SETTINGS.marketplace);
});

test("an existing colorScheme wins over a stray theme", () => {
  const settings = parseStoredSettings(
    JSON.stringify({ currency: "USD", theme: "dark", colorScheme: "light" }),
  );
  assert.equal(settings.colorScheme, "light");
});

test("garbage falls back to defaults", () => {
  assert.deepEqual(parseStoredSettings(null), FALLBACK_SETTINGS);
  assert.deepEqual(parseStoredSettings("{nope"), FALLBACK_SETTINGS);
});
