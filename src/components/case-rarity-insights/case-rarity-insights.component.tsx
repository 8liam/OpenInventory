import { Panel } from "~/components/panel/panel.component";
import { CASE_DROP_ODDS } from "~/lib/cases/cases.config";
import { COPY } from "~/lib/copy/copy.config";
import { formatInteger } from "~/utils/format";
import { CASE_RARITY_INSIGHTS } from "./case-rarity-insights.config";
import type { CaseRarityInsightsProps } from "./case-rarity-insights.types";

const { classes, copy: insightCopy } = CASE_RARITY_INSIGHTS;

const formatPercent = (value: number, decimals: number = CASE_RARITY_INSIGHTS.percentDecimals) =>
  insightCopy.percent(value.toFixed(decimals));

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
  const smallSample = classified > 0 && classified < CASE_RARITY_INSIGHTS.smallSampleThreshold;
  // A few pulls cannot support three decimals; the published odds keep theirs.
  const observedDecimals = smallSample
    ? CASE_RARITY_INSIGHTS.smallSampleObservedDecimals
    : CASE_RARITY_INSIGHTS.percentDecimals;

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
        {classified > 0 && (
          <div className={classes.rows}>
            {rarities.map((rarity) => {
              const expected = CASE_DROP_ODDS[rarity.key];
              const observed = (rarity.count / classified) * CASE_RARITY_INSIGHTS.fullTrackPercent;
              const scale = Math.max(expected, observed);
              const share = (value: number) =>
                (value / scale) * CASE_RARITY_INSIGHTS.fullTrackPercent;
              return (
                <div
                  key={rarity.key}
                  role="group"
                  aria-label={insightCopy.group(
                    rarity.label,
                    formatPercent(observed, observedDecimals),
                    formatPercent(expected),
                    rarity.count,
                    classified,
                  )}
                >
                  <div className={classes.rowHead}>
                    <span className={classes.rowLabel}>{rarity.label}</span>
                    <span className={classes.rowCount}>
                      {copy.pullShare(rarity.count, classified)}
                    </span>
                  </div>
                  <div className={classes.track} aria-hidden="true">
                    <div className={classes.fillClip}>
                      <div
                        className={classes.fill}
                        style={{
                          width: `${share(observed)}%`,
                          backgroundColor: `#${rarity.color}`,
                        }}
                      />
                    </div>
                    <div
                      className={classes.marker}
                      style={{
                        left: `calc(${share(expected)}% - ${CASE_RARITY_INSIGHTS.markerWidthPx / 2}px)`,
                        width: CASE_RARITY_INSIGHTS.markerWidthPx,
                      }}
                    />
                  </div>
                  <div className={classes.values}>
                    <span className={classes.value}>
                      <span
                        className={classes.legendFill}
                        style={{ backgroundColor: `#${rarity.color}` }}
                        aria-hidden="true"
                      />
                      <span className={classes.valueName}>{copy.observed}</span>
                      <span className={classes.valueNumber}>
                        {formatPercent(observed, observedDecimals)}
                      </span>
                    </span>
                    <span className={classes.value}>
                      <span className={classes.legendMarker} aria-hidden="true" />
                      <span className={classes.valueName}>{copy.expected}</span>
                      <span className={classes.valueNumber}>{formatPercent(expected)}</span>
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
        {unclassified > 0 && (
          <p className={classes.unclassified}>{copy.unclassified(unclassified)}</p>
        )}
      </Panel>
    </div>
  );
}
