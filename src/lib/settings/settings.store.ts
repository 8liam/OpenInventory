import { create } from "zustand";
import {
  DARK_MEDIA_QUERY,
  DEFAULT_CURRENCY,
  DEFAULT_THEME,
  SETTINGS_STORAGE_KEY,
} from "./settings.config";
import { settingsSchema, type Settings, type SettingsState } from "./settings.types";

const FALLBACK: Settings = { currency: DEFAULT_CURRENCY, theme: DEFAULT_THEME };

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

export const useSettings = create<SettingsState>((set, get) => ({
  ...loadSettings(),
  setCurrency: (currency) => {
    set({ currency });
    persist({ currency, theme: get().theme });
  },
  setTheme: (theme) => {
    set({ theme });
    applyTheme(theme);
    persist({ currency: get().currency, theme });
  },
}));
