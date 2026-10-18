// Every currency the Skinport price feed accepts (https://docs.skinport.com/items).
export const CURRENCIES = [
  "AUD",
  "BRL",
  "CAD",
  "CHF",
  "CNY",
  "CZK",
  "DKK",
  "EUR",
  "GBP",
  "NOK",
  "PLN",
  "RUB",
  "SEK",
  "TRY",
  "USD",
] as const;
export const DEFAULT_CURRENCY = "USD";
export const THEMES = ["system", "light", "dark"] as const;
export const DEFAULT_THEME = "system";
export const SETTINGS_STORAGE_KEY = "openinventory:settings";
export const DARK_MEDIA_QUERY = "(prefers-color-scheme: dark)";
