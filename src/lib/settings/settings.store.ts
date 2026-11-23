import { create } from "zustand";
import { setFloatThreshold } from "../items/highlights";
import { DEFAULT_VIEW_MODE } from "../items/view-mode.config";
import { useItemViewMode } from "../items/view-mode.store";
import { applyTheme, watchSystemScheme } from "../theme/theme.dom";
import { SETTINGS_STORAGE_KEY } from "./settings.config";
import {
  FALLBACK_SETTINGS,
  mergeStoredSettings,
  parseStoredSettings,
  settingsFromStorageEvent,
} from "./settings.parse";
import type { Settings, SettingsState } from "./settings.types";

function persist(settings: Settings): void {
  localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
}

/** Pushes the settings that live outside React (theme tokens, highlight rules) into place. */
function applyPreferences(settings: Settings): void {
  applyTheme(settings.colorScheme, settings.palette);
  setFloatThreshold(settings.floatThreshold);
}

export const useSettings = create<SettingsState>((set) => {
  const save = (patch: Partial<Settings>): void => {
    const next = mergeStoredSettings(localStorage.getItem(SETTINGS_STORAGE_KEY), patch);
    set(next);
    applyPreferences(next);
    persist(next);
  };
  // Another tab saved settings: adopt them so this tab shows (and later writes) the current values.
  window.addEventListener("storage", (event) => {
    const next = settingsFromStorageEvent(event, SETTINGS_STORAGE_KEY);
    if (next === null) return;
    set(next);
    applyPreferences(next);
  });
  const stored = parseStoredSettings(localStorage.getItem(SETTINGS_STORAGE_KEY));
  setFloatThreshold(stored.floatThreshold);
  return {
    ...stored,
    setCurrency: (currency) => save({ currency }),
    setMarketplace: (marketplace) => save({ marketplace }),
    setColorScheme: (colorScheme) => save({ colorScheme }),
    setPalette: (palette) => save({ palette }),
    setDefaultSort: (defaultSort) => save({ defaultSort }),
    setFloatThreshold: (floatThreshold) => save({ floatThreshold }),
    setSkinViewerConsent: (skinViewerConsent) => save({ skinViewerConsent }),
    resetAll: () => {
      save(FALLBACK_SETTINGS);
      useItemViewMode.getState().setMode(DEFAULT_VIEW_MODE);
    },
  };
});

/** Applies the stored theme and keeps it current when the OS scheme changes. Call once before first render. */
export function initTheme(): void {
  const apply = (): void => {
    applyPreferences(useSettings.getState());
  };
  apply();
  watchSystemScheme(apply);
}

/** Query-string fragment that tells the API which currency and marketplace to price in. */
export function usePriceQuery(): string {
  const currency = useSettings((s) => s.currency);
  const marketplace = useSettings((s) => s.marketplace);
  return `currency=${currency}&marketplace=${marketplace}`;
}
