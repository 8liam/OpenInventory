import * as z from "zod/mini";
import { CURRENCIES, THEMES } from "./settings.config";

export const settingsSchema = z.object({
  currency: z.enum(CURRENCIES),
  theme: z.enum(THEMES),
});
export type Settings = z.infer<typeof settingsSchema>;

export type SettingsState = Settings & {
  readonly setCurrency: (currency: Settings["currency"]) => void;
  readonly setTheme: (theme: Settings["theme"]) => void;
};
