import { FORMAT_LOCALE } from "./format.config.ts";
import { formatInteger } from "./format.ts";
import type { PluralForms } from "./plural.types.ts";

const rules = new Intl.PluralRules(FORMAT_LOCALE);

/** The form of `forms` that fits `count`: "item" for 1, "items" for 0 or 2+. */
export function pluralize(count: number, forms: PluralForms): string {
  return rules.select(count) === "one" ? forms.one : forms.other;
}

/** A grouped count with its noun, e.g. "1 item" or "1,204 items". */
export function formatCount(count: number, forms: PluralForms): string {
  return `${formatInteger(count)} ${pluralize(count, forms)}`;
}
