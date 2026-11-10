/* oxlint-disable typescript/no-floating-promises -- node:test registers suites synchronously */
import assert from "node:assert/strict";
import { test } from "node:test";
import { ITEM_SORTS, ITEM_SORT_IDS } from "../items/item-sort.config.ts";
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
    accent: "default",
    defaultSort: "price-desc",
    floatThreshold: "3",
  });
});

test("new settings round-trip", () => {
  const stored = {
    currency: "GBP",
    marketplace: "skinport",
    colorScheme: "light",
    palette: "nord",
    accent: "violet",
    defaultSort: "float-asc",
    floatThreshold: "off",
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

test("settings saved before the new fields existed get their defaults", () => {
  const settings = parseStoredSettings(
    JSON.stringify({ currency: "EUR", marketplace: "steam", colorScheme: "dark", palette: "nord" }),
  );
  assert.equal(settings.currency, "EUR");
  assert.equal(settings.palette, "nord");
  assert.equal(settings.accent, "default");
  assert.equal(settings.defaultSort, "price-desc");
  assert.equal(settings.floatThreshold, "3");
});

test("invalid accent, sort and threshold fall back without dropping the rest", () => {
  const settings = parseStoredSettings(
    JSON.stringify({
      currency: "GBP",
      accent: "chartreuse",
      defaultSort: "random",
      floatThreshold: "50",
    }),
  );
  assert.equal(settings.currency, "GBP");
  assert.equal(settings.accent, "default");
  assert.equal(settings.defaultSort, "price-desc");
  assert.equal(settings.floatThreshold, "3");
});

test("the validated sort ids match the sort menu", () => {
  assert.deepEqual(
    ITEM_SORTS.map((sort) => sort.id),
    [...ITEM_SORT_IDS],
  );
});
