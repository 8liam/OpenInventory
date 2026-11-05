import type { ItemView } from "./item.types.ts";
import { EXPORT_CSV } from "./export-csv.config.ts";

const FORMULA_PREFIX = /^[=+\-@]/u;

function cell(value: string | number | boolean | null): string {
  if (value === null) return "";
  const text = String(value);
  const safe =
    typeof value === "string" && FORMULA_PREFIX.test(text.trimStart())
      ? `${EXPORT_CSV.formulaEscape}${text}`
      : text;
  return `"${safe.replaceAll('"', '""')}"`;
}

/** Every listed item as one CSV row; text that could run as a formula is escaped. */
export function itemsToCsv(items: readonly ItemView[], currency: string): string {
  const lines = [EXPORT_CSV.headers.map(cell).join(",")];
  for (const item of items) {
    lines.push(
      [
        item.id,
        item.name,
        item.customName,
        item.category,
        item.rarityName,
        item.wear,
        item.wearName,
        item.isStatTrak,
        item.isSouvenir,
        item.stickers.map((sticker) => sticker.name).join(EXPORT_CSV.listSeparator),
        item.charms.map((charm) => charm.name).join(EXPORT_CSV.listSeparator),
        item.pattern,
        item.locationName,
        item.price,
        currency,
      ]
        .map(cell)
        .join(","),
    );
  }
  return `${EXPORT_CSV.byteOrderMark}${lines.join(EXPORT_CSV.lineBreak)}${EXPORT_CSV.lineBreak}`;
}
