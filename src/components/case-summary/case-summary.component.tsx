import { STATTRAK_KINDS } from "~/lib/cases/cases.config";
import { COPY } from "~/lib/copy/copy.config";
import { formatDate, formatInteger } from "~/utils/format";
import type { CaseSummaryProps } from "./case-summary.types";

/** Headline counter for the selected kind, plus the stats that make sense for it. */
export function CaseSummary({ stats }: CaseSummaryProps) {
  const copy = COPY.cases;
  const dash = COPY.common.empty;
  const count = (value: number | null) => (value === null ? dash : formatInteger(value));
  const date = (value: number | null) => (value === null ? dash : formatDate(value));
  // Gold is a case-only idea: no other source drops knives or gloves.
  const base =
    stats.kind === "case"
      ? [
          { label: copy.stats.gold, value: count(stats.gold) },
          { label: copy.stats.sinceGold, value: count(stats.casesSinceGold) },
          { label: copy.stats.toFirstGold, value: count(stats.casesToFirstGold) },
        ]
      : [
          { label: copy.stats.first, value: date(stats.firstOpenedAt) },
          { label: copy.stats.latest, value: date(stats.lastOpenedAt) },
        ];
  const tiles = STATTRAK_KINDS.includes(stats.kind)
    ? [...base, { label: copy.stats.statTrak, value: count(stats.statTrak) }]
    : base;
  return (
    <section className="rounded-xl border bg-card">
      <div className="flex flex-col gap-6 p-5 md:flex-row md:items-end md:justify-between md:p-6">
        <div>
          <p className="text-xs text-muted-foreground">{copy.kinds[stats.kind].headline}</p>
          <p className="tabular mt-1 text-[40px] font-semibold leading-none tracking-tight md:text-5xl">
            {formatInteger(stats.total)}
          </p>
        </div>
        <dl className="grid grid-cols-2 gap-x-8 gap-y-3 sm:grid-cols-4">
          {tiles.map((tile) => (
            <div key={tile.label}>
              <dt className="text-xs text-muted-foreground">{tile.label}</dt>
              <dd className="tabular mt-1 text-base font-medium">{tile.value}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
