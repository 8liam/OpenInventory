import { formatInteger } from "~/utils/format";
import { MONTHLY_BARS } from "./monthly-bars.config";
import type { MonthlyBarsProps } from "./monthly-bars.types";

const { classes } = MONTHLY_BARS;

/**
 * One bar per month, with an expandable count list for touch and keyboard users. Up to a dozen
 * months each bar shows its count and month (in full while there are few) and stays narrow; with
 * more, only the first and last month are labelled.
 */
export function MonthlyBars({ months }: MonthlyBarsProps) {
  const shown = months.slice(-MONTHLY_BARS.maxMonths);
  const max = Math.max(...shown.map((m) => m.count), 1);
  const labelled = shown.length <= MONTHLY_BARS.labelledMax;
  const fullMonths = shown.length <= MONTHLY_BARS.fullMonthMax;
  const monthLabel = (month: string) =>
    fullMonths ? month : (month.split(MONTHLY_BARS.monthSeparator)[1] ?? month);
  return (
    <div>
      <div className={classes.chart} style={{ height: MONTHLY_BARS.height }} aria-hidden="true">
        {shown.map((m) => {
          const share = m.count / max;
          return labelled ? (
            <div key={m.month} className={classes.column}>
              <span className={classes.value}>{formatInteger(m.count)}</span>
              <div
                className={classes.bar}
                style={{
                  height:
                    m.count === 0
                      ? 0
                      : `max(${MONTHLY_BARS.minBar}, calc((100% - ${MONTHLY_BARS.labelReserve}) * ${share}))`,
                }}
              />
              <span className={classes.month}>{monthLabel(m.month)}</span>
            </div>
          ) : (
            <div key={m.month} className={classes.slimBar} style={{ height: `${share * 100}%` }} />
          );
        })}
      </div>
      {!(labelled && fullMonths) && (
        <div className={classes.ends}>
          <span>{shown[0]?.month}</span>
          <span>{shown[shown.length - 1]?.month}</span>
        </div>
      )}
      <details className={classes.details}>
        <summary className={classes.summary}>{MONTHLY_BARS.summary}</summary>
        <dl className={classes.list}>
          {shown.map((month) => (
            <div key={month.month} className={classes.item}>
              <dt>{month.month}</dt>
              <dd className={classes.count}>{formatInteger(month.count)}</dd>
            </div>
          ))}
        </dl>
      </details>
    </div>
  );
}
