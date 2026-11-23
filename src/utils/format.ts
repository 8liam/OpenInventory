import {
  FLOAT_EXACT_MAX_FRACTION_DIGITS,
  FLOAT_EXACT_MAX_SIGNIFICANT_DIGITS,
  FLOAT_FRACTION_DIGITS,
  FORMAT_LOCALE,
  PERCENT_FRACTION_DIGITS,
  RELATIVE_TIME,
} from "./format.config.ts";

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

/** Fraction digits of the shortest decimal that parses back to the same 32-bit float. */
function exactFractionDigits(value: number): number {
  if (!Number.isFinite(value) || value === 0) return FLOAT_FRACTION_DIGITS;
  const target = Math.fround(value);
  for (let digits = 1; digits <= FLOAT_EXACT_MAX_SIGNIFICANT_DIGITS; digits++) {
    const candidate = Number(value.toPrecision(digits));
    if (Math.fround(candidate) !== target) continue;
    const exponent = Math.floor(Math.log10(Math.abs(candidate)));
    return Math.min(
      FLOAT_EXACT_MAX_FRACTION_DIGITS,
      Math.max(FLOAT_FRACTION_DIGITS, digits - 1 - exponent),
    );
  }
  return FLOAT_EXACT_MAX_FRACTION_DIGITS;
}

/** The shortest decimal that identifies a 32-bit float, never fewer than the plain float's digits. */
export function formatFloatExact(value: number): string {
  const digits = exactFractionDigits(value);
  return getFormatter(`float-exact:${digits}`, {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(value);
}

export function formatInteger(value: number): string {
  return getFormatter("int", { maximumFractionDigits: 0 }).format(value);
}

const dateFormatter = new Intl.DateTimeFormat(FORMAT_LOCALE, { dateStyle: "medium" });

export function formatDate(timestamp: number): string {
  return dateFormatter.format(timestamp);
}

const dateTimeFormatter = new Intl.DateTimeFormat(FORMAT_LOCALE, {
  month: "short",
  day: "numeric",
  hour: "numeric",
  minute: "2-digit",
});

export function formatDateTime(timestamp: number): string {
  return dateTimeFormatter.format(timestamp);
}

const relativeFormatter = new Intl.RelativeTimeFormat(FORMAT_LOCALE, { numeric: "always" });
const RELATIVE_UNITS: readonly (readonly [Intl.RelativeTimeFormatUnit, number])[] = [
  ["day", 86_400_000],
  ["hour", 3_600_000],
  ["minute", 60_000],
];

/** "5 minutes ago", "2 hours ago", or "just now" for the last minute. */
export function formatRelativeTime(timestamp: number, now: number): string {
  const elapsed = Math.max(0, now - timestamp);
  if (elapsed < RELATIVE_TIME.justNowMs) return RELATIVE_TIME.justNow;
  const [unit, size] = RELATIVE_UNITS.find(([, ms]) => elapsed >= ms) ?? RELATIVE_UNITS[2]!;
  return relativeFormatter.format(-Math.floor(elapsed / size), unit);
}
