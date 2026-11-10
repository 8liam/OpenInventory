import * as z from "zod/mini";
import { DEFAULT_ITEM_SORT, ITEM_SORT_IDS } from "../items/item-sort.config.ts";
import {
  ACCENT_IDS,
  COLOR_SCHEMES,
  DEFAULT_ACCENT_ID,
  DEFAULT_COLOR_SCHEME,
  DEFAULT_PALETTE_ID,
  PALETTE_IDS,
} from "../theme/theme.config.ts";
import {
  CURRENCIES,
  DEFAULT_FLOAT_THRESHOLD,
  DEFAULT_MARKETPLACE,
  FLOAT_THRESHOLD_IDS,
  MARKETPLACES,
} from "./settings.config.ts";

/** A stored value that is no longer valid becomes the default instead of discarding every setting. */
function withDefault<const T extends readonly [string, ...string[]]>(
  values: T,
  fallback: T[number],
) {
  return z._default(z.catch(z.enum(values), fallback), fallback);
}

export const settingsSchema = z.object({
  currency: z.enum(CURRENCIES),
  marketplace: z._default(z.enum(MARKETPLACES), DEFAULT_MARKETPLACE),
  colorScheme: withDefault(COLOR_SCHEMES, DEFAULT_COLOR_SCHEME),
  palette: withDefault(PALETTE_IDS, DEFAULT_PALETTE_ID),
  accent: withDefault(ACCENT_IDS, DEFAULT_ACCENT_ID),
  defaultSort: withDefault(ITEM_SORT_IDS, DEFAULT_ITEM_SORT),
  floatThreshold: withDefault(FLOAT_THRESHOLD_IDS, DEFAULT_FLOAT_THRESHOLD),
});
export type Settings = z.infer<typeof settingsSchema>;
export type Marketplace = Settings["marketplace"];
export type FloatThresholdId = Settings["floatThreshold"];

export type SettingsState = Settings & {
  readonly setCurrency: (currency: Settings["currency"]) => void;
  readonly setMarketplace: (marketplace: Settings["marketplace"]) => void;
  readonly setColorScheme: (colorScheme: Settings["colorScheme"]) => void;
  readonly setPalette: (palette: Settings["palette"]) => void;
  readonly setAccent: (accent: Settings["accent"]) => void;
  readonly setDefaultSort: (sort: Settings["defaultSort"]) => void;
  readonly setFloatThreshold: (threshold: Settings["floatThreshold"]) => void;
  /** Puts every local preference back to its default, including the default view. */
  readonly resetAll: () => void;
};
