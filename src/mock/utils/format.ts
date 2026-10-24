import { FLOAT_FRACTION_DIGITS, FORMAT_LOCALE, PERCENT_FRACTION_DIGITS } from "./format.config";

const formatters = new Map<string, Intl.NumberFormat>();

function getFormatter(key: string, options: Intl.NumberFormatOptions): Intl.NumberFormat {
  let formatter = formatters.get(key);
  if (!formatter) {
    formatter = new Intl.NumberFormat(FORMAT_LOCALE, options);
    formatters.set(key, formatter);
  }
  return formatter;
}

export function formatMoney(amount: number, currency: string): string {
  return getFormatter(`money:${currency}`, { style: "currency", currency }).format(amount);
}

/** Short form for chart axes, e.g. $1.2K. */
export function formatCompactMoney(amount: number, currency: string): string {
  return getFormatter(`compact:${currency}`, {
    style: "currency",
    currency,
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(amount);
}

export function formatPercentPlain(ratio: number): string {
  return getFormatter("percent-plain", { style: "percent", maximumFractionDigits: 1 }).format(
    ratio,
  );
}

/** An unsigned chance, precise enough for sub-1% odds, e.g. 0.05%. */
export function formatChance(ratio: number): string {
  return getFormatter("chance", {
    style: "percent",
    minimumFractionDigits: 1,
    maximumFractionDigits: PERCENT_FRACTION_DIGITS,
  }).format(ratio);
}

/** Signed money, e.g. +$12.40 / −$3.10. */
export function formatSignedMoney(amount: number, currency: string): string {
  return getFormatter(`signed:${currency}`, {
    style: "currency",
    currency,
    signDisplay: "exceptZero",
  }).format(amount);
}

export function formatPercent(ratio: number): string {
  return getFormatter("percent", {
    style: "percent",
    maximumFractionDigits: PERCENT_FRACTION_DIGITS,
    signDisplay: "exceptZero",
  }).format(ratio);
}

export function formatFloat(value: number): string {
  return getFormatter("float", {
    minimumFractionDigits: FLOAT_FRACTION_DIGITS,
    maximumFractionDigits: FLOAT_FRACTION_DIGITS,
  }).format(value);
}

export function formatInteger(value: number): string {
  return getFormatter("int", { maximumFractionDigits: 0 }).format(value);
}

const dateFormatter = new Intl.DateTimeFormat(FORMAT_LOCALE, { dateStyle: "medium", timeZone: "UTC" });

export function formatDate(timestamp: number): string {
  return dateFormatter.format(timestamp);
}

const dateTimeFormatter = new Intl.DateTimeFormat(FORMAT_LOCALE, {
  month: "short",
  day: "numeric",
  hour: "numeric",
  minute: "2-digit",
  timeZone: "UTC",
});

export function formatDateTime(timestamp: number): string {
  return dateTimeFormatter.format(timestamp);
}
