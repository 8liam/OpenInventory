import { Panel } from "~/components/panel/panel.component";
import { CASE_DROP_ODDS, CASE_DROP_ODDS_SOURCE } from "~/lib/cases/cases.config";
import type { CaseStats } from "~/lib/cases/cases.types";
import { COPY } from "~/lib/copy/copy.config";
import { formatInteger } from "~/utils/format";

const DISPLAY_ORDER = ["milSpec", "restricted", "classified", "covert", "gold"] as const;

/** Exact-tier streaks and observed case drops beside published reference odds. */
export function CaseRarityInsights({ stats }: { readonly stats: CaseStats }) {
  const copy = COPY.cases;
  const rarities = DISPLAY_ORDER.flatMap((key) => {
    const rarity = stats.caseRarities.find((entry) => entry.key === key);
    return rarity ? [rarity] : [];
  });
  const classified = rarities.reduce((sum, rarity) => sum + rarity.count, 0);
  const unclassified = stats.total - classified;

  return (
    <div className="grid grid-cols-1 gap-4 xl:grid-cols-5">
      <Panel title={copy.streaksTitle} className="xl:col-span-2 xl:self-start">
        <dl className="grid grid-cols-2 gap-x-4 gap-y-4 sm:grid-cols-5 xl:grid-cols-1 xl:gap-y-0">
          {rarities.map((rarity) => (
            <div
              key={rarity.key}
              className="min-w-0 xl:grid xl:grid-cols-[minmax(0,1fr)_auto] xl:items-baseline xl:gap-x-3 xl:border-b xl:py-3 xl:last:border-0"
            >
              <dt className="flex items-center gap-2 text-xs text-muted-foreground">
                <span
                  className="h-2.5 w-2.5 shrink-0 rounded-full"
                  style={{ backgroundColor: `#${rarity.color}` }}
                  aria-hidden="true"
                />
                {rarity.label}
              </dt>
              <dd className="tabular mt-1 text-xl font-semibold leading-tight xl:col-start-2 xl:row-start-1 xl:mt-0">
                {rarity.uncertain
                  ? copy.upperBound(formatInteger(rarity.sinceLast))
                  : formatInteger(rarity.sinceLast)}
              </dd>
              {(!rarity.hasDrop || rarity.uncertain) && (
                <dd className="text-xs text-muted-foreground xl:col-start-1 xl:row-start-2">
                  {rarity.uncertain ? copy.uncertainStreak : copy.noRecordedPull}
                </dd>
              )}
            </div>
          ))}
        </dl>
      </Panel>
      <Panel title={copy.oddsTitle} className="xl:col-span-3">
        <p className="mb-4 text-xs leading-relaxed text-muted-foreground">
          {copy.oddsDescription}{" "}
          <a
            href={CASE_DROP_ODDS_SOURCE}
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-foreground underline underline-offset-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          >
            {copy.oddsSource}
          </a>
          .
        </p>
        {classified > 0 && classified < 500 && (
          <p className="mb-4 text-xs leading-relaxed text-muted-foreground">{copy.smallSample}</p>
        )}
        {classified === 0 && <p className="text-sm text-muted-foreground">{copy.noClassified}</p>}
        {classified > 0 && (
          <div className="space-y-4">
            {rarities.map((rarity) => {
              const expected = CASE_DROP_ODDS[rarity.key];
              const observed = classified > 0 ? (rarity.count / classified) * 100 : 0;
              const scale = Math.max(expected, observed);
              return (
                <div key={rarity.key}>
                  <div className="mb-1.5 flex flex-wrap items-baseline justify-between gap-x-2 gap-y-0.5 text-xs">
                    <span className="font-medium">{rarity.label}</span>
                    <span className="tabular text-muted-foreground">
                      {copy.pullShare(formatInteger(rarity.count), formatInteger(classified))}
                    </span>
                  </div>
                  <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-3 gap-y-1 text-xs">
                    <div className="flex min-w-0 items-center gap-2">
                      <span className="w-14 shrink-0 text-muted-foreground">{copy.observed}</span>
                      <div className="h-2.5 min-w-0 flex-1 overflow-hidden rounded-full bg-muted-foreground/25">
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${(observed / scale) * 100}%`,
                            backgroundColor: `#${rarity.color}`,
                          }}
                        />
                      </div>
                    </div>
                    <span className="tabular w-14 text-right font-medium">
                      {observed.toFixed(2)}%
                    </span>
                    <div className="flex min-w-0 items-center gap-2">
                      <span className="w-14 shrink-0 text-muted-foreground">{copy.expected}</span>
                      <div className="h-2.5 min-w-0 flex-1 overflow-hidden rounded-full bg-muted-foreground/25">
                        <div
                          className="h-full rounded-full bg-muted-foreground/50"
                          style={{ width: `${(expected / scale) * 100}%` }}
                        />
                      </div>
                    </div>
                    <span className="tabular w-14 text-right text-muted-foreground">
                      {expected.toFixed(3)}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
        {unclassified > 0 && (
          <p className="mt-4 text-xs text-muted-foreground">{copy.unclassified(unclassified)}</p>
        )}
      </Panel>
    </div>
  );
}
