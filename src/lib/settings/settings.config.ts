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
export const SETTINGS_STORAGE_KEY = "openinventory:settings";
/** Pre-split settings stored the colour scheme under this key. */
export const LEGACY_THEME_KEY = "theme";

/** How close to a skin's min/max float still counts as a low/high float highlight. */
export const FLOAT_THRESHOLD_IDS = ["off", "1", "3", "5", "10"] as const;
export const DEFAULT_FLOAT_THRESHOLD = "3";
/** Share of the skin's float range at each end; 0 turns the highlight off. */
export const FLOAT_THRESHOLD_FRACTIONS = {
  off: 0,
  "1": 0.01,
  "3": 0.03,
  "5": 0.05,
  "10": 0.1,
} as const satisfies Record<(typeof FLOAT_THRESHOLD_IDS)[number], number>;
