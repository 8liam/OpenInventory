import * as z from "zod/mini";
import {
  COLOR_SCHEMES,
  DEFAULT_COLOR_SCHEME,
  DEFAULT_PALETTE_ID,
  PALETTE_IDS,
} from "../theme/theme.config.ts";
import { CURRENCIES, DEFAULT_MARKETPLACE, MARKETPLACES } from "./settings.config.ts";

export const settingsSchema = z.object({
  currency: z.enum(CURRENCIES),
  marketplace: z._default(z.enum(MARKETPLACES), DEFAULT_MARKETPLACE),
  colorScheme: z._default(
    z.catch(z.enum(COLOR_SCHEMES), DEFAULT_COLOR_SCHEME),
    DEFAULT_COLOR_SCHEME,
  ),
  palette: z._default(z.catch(z.enum(PALETTE_IDS), DEFAULT_PALETTE_ID), DEFAULT_PALETTE_ID),
});
export type Settings = z.infer<typeof settingsSchema>;
export type Marketplace = Settings["marketplace"];

export type SettingsState = Settings & {
  readonly setCurrency: (currency: Settings["currency"]) => void;
  readonly setMarketplace: (marketplace: Settings["marketplace"]) => void;
  readonly setColorScheme: (colorScheme: Settings["colorScheme"]) => void;
  readonly setPalette: (palette: Settings["palette"]) => void;
};
