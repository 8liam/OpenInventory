import { STATTRAK_KINDS } from "~/lib/cases/cases.config";
import { COPY } from "~/lib/copy/copy.config";
import { formatDate, formatInteger } from "~/utils/format";
import { CASE_SUMMARY } from "./case-summary.config";
import type { CaseSummaryProps } from "./case-summary.types";

const { classes } = CASE_SUMMARY;

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
    <section className={classes.root}>
      <div className={classes.top}>
        <div className="min-w-0">
          <p className="kicker">{copy.kinds[stats.kind].headline}</p>
          <p className={classes.figure}>{formatInteger(stats.total)}</p>
        </div>
        <dl className={classes.stats}>
          {tiles.map((tile) => (
            <div key={tile.label} className="contents">
              <dt className={classes.statLabel}>{tile.label}</dt>
              <dd className={classes.statValue}>{tile.value}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
