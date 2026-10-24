import { create } from "zustand";
import {
  DARK_MEDIA_QUERY,
  DEFAULT_CURRENCY,
  DEFAULT_MARKETPLACE,
  DEFAULT_THEME,
  SETTINGS_STORAGE_KEY,
} from "./settings.config";
import { settingsSchema, type Settings, type SettingsState } from "./settings.types";

const FALLBACK: Settings = {
  currency: DEFAULT_CURRENCY,
  marketplace: DEFAULT_MARKETPLACE,
  theme: DEFAULT_THEME,
};

function loadSettings(): Settings {
  try {
    const raw = localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (!raw) return FALLBACK;
    const parsed = settingsSchema.safeParse(JSON.parse(raw));
    return parsed.success ? parsed.data : FALLBACK;
  } catch {
    return FALLBACK;
  }
}

function persist(settings: Settings): void {
  localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
}

export function applyTheme(theme: Settings["theme"]): void {
  const resolved =
    theme === "system" ? (window.matchMedia(DARK_MEDIA_QUERY).matches ? "dark" : "light") : theme;
  document.documentElement.dataset.theme = resolved;
}

export const useSettings = create<SettingsState>((set, get) => {
  const save = (patch: Partial<Settings>): void => {
    set(patch);
    const { currency, marketplace, theme } = get();
    persist({ currency, marketplace, theme });
  };
  return {
    ...loadSettings(),
    setCurrency: (currency) => save({ currency }),
    setMarketplace: (marketplace) => save({ marketplace }),
    setTheme: (theme) => {
      applyTheme(theme);
      save({ theme });
    },
  };
});

/** Query-string fragment that tells the API which currency and marketplace to price in. */
export function usePriceQuery(): string {
  const currency = useSettings((s) => s.currency);
  const marketplace = useSettings((s) => s.marketplace);
  return `currency=${currency}&marketplace=${marketplace}`;
}
