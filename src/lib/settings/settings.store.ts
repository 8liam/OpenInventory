import { create } from "zustand";
import { applyTheme, watchSystemScheme } from "../theme/theme.dom";
import { SETTINGS_STORAGE_KEY } from "./settings.config";
import { parseStoredSettings } from "./settings.parse";
import type { Settings, SettingsState } from "./settings.types";

function persist(settings: Settings): void {
  localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
}

export const useSettings = create<SettingsState>((set, get) => {
  const save = (patch: Partial<Settings>): void => {
    set(patch);
    const { currency, marketplace, colorScheme, palette } = get();
    applyTheme(colorScheme, palette);
    persist({ currency, marketplace, colorScheme, palette });
  };
  return {
    ...parseStoredSettings(localStorage.getItem(SETTINGS_STORAGE_KEY)),
    setCurrency: (currency) => save({ currency }),
    setMarketplace: (marketplace) => save({ marketplace }),
    setColorScheme: (colorScheme) => save({ colorScheme }),
    setPalette: (palette) => save({ palette }),
  };
});

/** Applies the stored theme and keeps it current when the OS scheme changes. Call once before first render. */
export function initTheme(): void {
  const apply = (): void => {
    const { colorScheme, palette } = useSettings.getState();
    applyTheme(colorScheme, palette);
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
