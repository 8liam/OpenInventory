/* oxlint-disable typescript/no-floating-promises -- node:test registers suites synchronously */
import assert from "node:assert/strict";
import { test } from "node:test";
import { DEFAULT_SETTINGS_TAB, SETTINGS_TABS } from "./settings-tabs.config.ts";
import { parseSettingsTab } from "./settings-tabs.ts";

test("known categories parse and anything else is dropped", () => {
  assert.equal(parseSettingsTab("pricing"), "pricing");
  assert.equal(parseSettingsTab("nope"), undefined);
  assert.equal(parseSettingsTab(3), undefined);
  assert.equal(parseSettingsTab(undefined), undefined);
});

test("the default is the first category", () => {
  assert.equal(DEFAULT_SETTINGS_TAB, SETTINGS_TABS[0]);
});
