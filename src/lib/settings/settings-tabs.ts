import { SETTINGS_TABS } from "./settings-tabs.config.ts";
import type { SettingsTab } from "./settings-tabs.types.ts";

/** The `?tab=` search param if it names a category, otherwise undefined (so the default shows). */
export function parseSettingsTab(value: unknown): SettingsTab | undefined {
  return SETTINGS_TABS.find((tab) => tab === value);
}
