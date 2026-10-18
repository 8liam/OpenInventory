// Every fiat currency in the CSGOTrader exchange-rate feed.
export const CURRENCIES = [
  "AED",
  "ARS",
  "AUD",
  "BGN",
  "BRL",
  "CAD",
  "CHF",
  "CLP",
  "CNY",
  "COP",
  "CRC",
  "CZK",
  "DKK",
  "EUR",
  "GBP",
  "GEL",
  "HKD",
  "HUF",
  "IDR",
  "ILS",
  "INR",
  "ISK",
  "JPY",
  "KRW",
  "KWD",
  "KZT",
  "MXN",
  "MYR",
  "NOK",
  "NZD",
  "PEN",
  "PHP",
  "PLN",
  "QAR",
  "RON",
  "RUB",
  "SAR",
  "SEK",
  "SGD",
  "THB",
  "TRY",
  "TWD",
  "UAH",
  "USD",
  "UYU",
  "VND",
  "ZAR",
] as const;
export const DEFAULT_CURRENCY = "USD";
export const MARKETPLACES = [
  "skinport",
  "steam",
  "buff163",
  "csfloat",
  "csmoney",
  "youpin",
  "lisskins",
] as const;
export const DEFAULT_MARKETPLACE = "buff163";
/** History recorded before marketplaces existed was priced from this one. */
export const LEGACY_HISTORY_MARKETPLACE = "skinport";
export const THEMES = ["system", "light", "dark"] as const;
export const DEFAULT_THEME = "system";
export const SETTINGS_STORAGE_KEY = "openinventory:settings";
export const DARK_MEDIA_QUERY = "(prefers-color-scheme: dark)";
