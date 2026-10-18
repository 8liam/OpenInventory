import * as z from "zod/mini";
import { CURRENCIES, DEFAULT_MARKETPLACE, MARKETPLACES, THEMES } from "./settings.config";

export const settingsSchema = z.object({
  currency: z.enum(CURRENCIES),
  marketplace: z._default(z.enum(MARKETPLACES), DEFAULT_MARKETPLACE),
  theme: z.enum(THEMES),
});
export type Settings = z.infer<typeof settingsSchema>;
export type Marketplace = Settings["marketplace"];

export type SettingsState = Settings & {
  readonly setCurrency: (currency: Settings["currency"]) => void;
  readonly setMarketplace: (marketplace: Settings["marketplace"]) => void;
  readonly setTheme: (theme: Settings["theme"]) => void;
};
