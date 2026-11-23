import { DEFAULT_ITEM_SORT } from "../items/item-sort.config.ts";
import { DEFAULT_COLOR_SCHEME, DEFAULT_PALETTE_ID } from "../theme/theme.config.ts";
import {
  DEFAULT_CURRENCY,
  DEFAULT_FLOAT_THRESHOLD,
  DEFAULT_MARKETPLACE,
  DEFAULT_SKIN_VIEWER_CONSENT,
  LEGACY_THEME_KEY,
} from "./settings.config.ts";
import { settingsSchema, type Settings } from "./settings.types.ts";

export const FALLBACK_SETTINGS: Settings = {
  currency: DEFAULT_CURRENCY,
  marketplace: DEFAULT_MARKETPLACE,
  colorScheme: DEFAULT_COLOR_SCHEME,
  palette: DEFAULT_PALETTE_ID,
  defaultSort: DEFAULT_ITEM_SORT,
  floatThreshold: DEFAULT_FLOAT_THRESHOLD,
  skinViewerConsent: DEFAULT_SKIN_VIEWER_CONSENT,
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/** Settings saved before the split carried the colour scheme as `theme`. */
function migrate(value: unknown): unknown {
  if (!isRecord(value) || !(LEGACY_THEME_KEY in value) || "colorScheme" in value) return value;
  const { [LEGACY_THEME_KEY]: legacy, ...rest } = value;
  return { ...rest, colorScheme: legacy };
}

/** Parses the persisted JSON, migrating old shapes; anything unusable falls back to defaults. */
export function parseStoredSettings(raw: string | null): Settings {
  if (!raw) return FALLBACK_SETTINGS;
  try {
    const parsed = settingsSchema.safeParse(migrate(JSON.parse(raw)));
    return parsed.success ? parsed.data : FALLBACK_SETTINGS;
  } catch {
    return FALLBACK_SETTINGS;
  }
}

/**
 * Applies a patch on top of what is stored right now, not on top of an in-memory copy, so a write
 * from this tab cannot bring back a value another tab has since changed (e.g. withdrawn consent).
 */
export function mergeStoredSettings(raw: string | null, patch: Partial<Settings>): Settings {
  return { ...parseStoredSettings(raw), ...patch };
}

/** The settings another tab just saved, or null when the event is about some other storage key. */
export function settingsFromStorageEvent(
  event: { readonly key: string | null; readonly newValue: string | null },
  storageKey: string,
): Settings | null {
  // A null key means the whole storage was cleared, which resets settings to their defaults.
  if (event.key !== null && event.key !== storageKey) return null;
  return parseStoredSettings(event.newValue);
}
