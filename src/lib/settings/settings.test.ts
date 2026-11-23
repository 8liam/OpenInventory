/* oxlint-disable typescript/no-floating-promises -- node:test registers suites synchronously */
import assert from "node:assert/strict";
import { test } from "node:test";
import { ITEM_SORTS, ITEM_SORT_IDS } from "../items/item-sort.config.ts";
import {
  FALLBACK_SETTINGS,
  mergeStoredSettings,
  parseStoredSettings,
  settingsFromStorageEvent,
} from "./settings.parse.ts";
import { SETTINGS_STORAGE_KEY } from "./settings.config.ts";

test("old { theme } settings migrate to colorScheme with the default palette", () => {
  const settings = parseStoredSettings(
    JSON.stringify({ currency: "EUR", marketplace: "steam", theme: "dark" }),
  );
  assert.deepEqual(settings, {
    currency: "EUR",
    marketplace: "steam",
    colorScheme: "dark",
    palette: "default",
    defaultSort: "price-desc",
    floatThreshold: "3",
    skinViewerConsent: false,
  });
});

test("new settings round-trip", () => {
  const stored = {
    currency: "GBP",
    marketplace: "skinport",
    colorScheme: "light",
    palette: "nord",
    defaultSort: "float-asc",
    floatThreshold: "off",
    skinViewerConsent: true,
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
  assert.equal(settings.defaultSort, "price-desc");
  assert.equal(settings.floatThreshold, "3");
});

test("invalid sort and threshold fall back without dropping the rest", () => {
  const settings = parseStoredSettings(
    JSON.stringify({
      currency: "GBP",
      defaultSort: "random",
      floatThreshold: "50",
    }),
  );
  assert.equal(settings.currency, "GBP");
  assert.equal(settings.defaultSort, "price-desc");
  assert.equal(settings.floatThreshold, "3");
});

test("the validated sort ids match the sort menu", () => {
  assert.deepEqual(
    ITEM_SORTS.map((sort) => sort.id),
    [...ITEM_SORT_IDS],
  );
});

test("a patch merges onto the stored value, so withdrawn consent is not resurrected", () => {
  const stale = { ...FALLBACK_SETTINGS, skinViewerConsent: true };
  const stored = JSON.stringify({ ...stale, skinViewerConsent: false });
  const next = mergeStoredSettings(stored, { currency: "EUR" });
  assert.equal(next.currency, "EUR");
  assert.equal(next.skinViewerConsent, false);
});

test("a patch can still change consent explicitly", () => {
  const next = mergeStoredSettings(JSON.stringify(FALLBACK_SETTINGS), { skinViewerConsent: true });
  assert.equal(next.skinViewerConsent, true);
});

test("storage events for the settings key carry the new settings", () => {
  const newValue = JSON.stringify({ ...FALLBACK_SETTINGS, skinViewerConsent: true });
  const next = settingsFromStorageEvent(
    { key: SETTINGS_STORAGE_KEY, newValue },
    SETTINGS_STORAGE_KEY,
  );
  assert.equal(next?.skinViewerConsent, true);
});

test("storage events for other keys are ignored", () => {
  assert.equal(
    settingsFromStorageEvent({ key: "other", newValue: "{}" }, SETTINGS_STORAGE_KEY),
    null,
  );
});

test("a cleared or removed settings key resets to defaults", () => {
  assert.deepEqual(
    settingsFromStorageEvent({ key: null, newValue: null }, SETTINGS_STORAGE_KEY),
    FALLBACK_SETTINGS,
  );
  assert.deepEqual(
    settingsFromStorageEvent({ key: SETTINGS_STORAGE_KEY, newValue: null }, SETTINGS_STORAGE_KEY),
    FALLBACK_SETTINGS,
  );
});
