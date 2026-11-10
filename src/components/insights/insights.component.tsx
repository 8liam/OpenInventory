import { ItemLabel } from "~/components/item-label/item-label.component";
import { Link } from "@tanstack/react-router";
import { COPY } from "~/lib/copy/copy.config";
import { formatFloat, formatInteger, formatMoney } from "~/utils/format";
import { INSIGHTS } from "./insights.config";
import type { InsightRow, InsightSectionProps, InsightsProps } from "./insights.types";

function Section({ title, rows }: InsightSectionProps) {
  return (
    <div>
      <h3 className="mb-2 text-xs text-muted-foreground">{title}</h3>
      {rows.length === 0 ? (
        <p className="text-muted-foreground">{COPY.insights.empty}</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {rows.map((row) => (
            <li key={row.key} className="flex items-center justify-between gap-3">
              <Link
                to="/items"
                search={{ q: row.query }}
                title={INSIGHTS.findItem}
                className="min-w-0 rounded-sm focus-visible:outline-2 focus-visible:outline-primary"
              >
                <ItemLabel
                  name={row.name}
                  imageUrl={row.imageUrl}
                  rarityColor={row.rarityColor}
                  size={INSIGHTS.thumbSize}
                />
              </Link>
              <span className="tabular shrink-0 text-muted-foreground">{row.value}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function Insights({ insights, currency }: InsightsProps) {
  const floatRow = (f: InsightsProps["insights"]["lowestFloats"][number]): InsightRow => ({
    key: f.id,
    name: f.name,
    imageUrl: f.imageUrl,
    rarityColor: f.rarityColor,
    value: formatFloat(f.wear),
    query: f.id,
  });
  const stackRows: InsightRow[] = insights.stacks.map((s) => ({
    key: s.name,
    name: s.name,
    imageUrl: s.imageUrl,
    rarityColor: s.rarityColor,
    value: `×${formatInteger(s.count)} · ${formatMoney(s.totalValue, currency)}`,
    query: s.name,
  }));
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
      <Section title={COPY.insights.lowestFloats} rows={insights.lowestFloats.map(floatRow)} />
      <Section title={COPY.insights.highestFloats} rows={insights.highestFloats.map(floatRow)} />
      <Section title={COPY.insights.stacks} rows={stackRows} />
    </div>
  );
}
