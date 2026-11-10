import { OddsLuckChart } from "~/components/odds-luck-chart/odds-luck-chart.component";
import { Panel } from "~/components/panel/panel.component";
import { COPY } from "~/lib/copy/copy.config";
import { formatInteger } from "~/utils/format";
import { CASE_RARITY_INSIGHTS } from "./case-rarity-insights.config";
import type { CaseRarityInsightsProps } from "./case-rarity-insights.types";

const { classes, copy: insightCopy } = CASE_RARITY_INSIGHTS;

/** Exact-tier streaks and observed case drops beside published reference odds. */
export function CaseRarityInsights({ stats }: CaseRarityInsightsProps) {
  const copy = COPY.cases;
  const rarities = CASE_RARITY_INSIGHTS.displayOrder.flatMap((key) => {
    const rarity = stats.caseRarities.find((entry) => entry.key === key);
    return rarity ? [rarity] : [];
  });
  const classified = rarities.reduce((sum, rarity) => sum + rarity.count, 0);
  const unclassified = stats.total - classified;
  const hasUncertain = rarities.some((rarity) => rarity.uncertain);

  return (
    <div className={classes.grid}>
      <Panel title={copy.streaksTitle} className={classes.streaksPanel}>
        <dl className={classes.streakList}>
          {rarities.map((rarity) => (
            <div key={rarity.key} className={classes.streak}>
              <dt className={classes.streakTerm}>
                <span
                  className={classes.streakDot}
                  style={{ backgroundColor: `#${rarity.color}` }}
                  aria-hidden="true"
                />
                {rarity.label}
              </dt>
              <dd className={classes.streakValue}>
                {rarity.uncertain
                  ? copy.upperBound(formatInteger(rarity.sinceLast))
                  : formatInteger(rarity.sinceLast)}
              </dd>
              {(!rarity.hasDrop || rarity.uncertain) && (
                <dd className={classes.streakNote}>
                  {rarity.uncertain ? copy.uncertainStreak : copy.noRecordedPull}
                </dd>
              )}
            </div>
          ))}
        </dl>
        {hasUncertain && (
          <details className={classes.explainer}>
            <summary className={classes.explainerSummary}>{insightCopy.upperBoundSummary}</summary>
            <div className={classes.explainerBody}>
              {insightCopy.upperBoundBody.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
          </details>
        )}
      </Panel>
      <Panel title={copy.oddsTitle} className={classes.oddsPanel}>
        {classified === 0 && <p className={classes.empty}>{copy.noClassified}</p>}
        {classified > 0 && <OddsLuckChart rarities={rarities} total={classified} />}
        {unclassified > 0 && (
          <p className={classes.unclassified}>{copy.unclassified(unclassified)}</p>
        )}
      </Panel>
    </div>
  );
}
