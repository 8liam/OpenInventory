import type { CSSProperties } from "react";
import { CASE_DROP_ODDS, LUCK_AXIS } from "~/lib/cases/cases.config";
import { axisPosition, compareToOdds } from "~/lib/cases/odds-luck";
import { formatInteger } from "~/utils/format";
import { ODDS_LUCK_CHART } from "./odds-luck-chart.config";
import type { AxisLabel, OddsLuckChartProps } from "./odds-luck-chart.types";

const { classes, copy } = ODDS_LUCK_CHART;

const bandStart = axisPosition(-LUCK_AXIS.normalRange);
const bandEnd = axisPosition(LUCK_AXIS.normalRange);
const centre = axisPosition(0);

function axisLabelStyle(label: AxisLabel): CSSProperties {
  if (label.placement === "start") return { left: 0 };
  if (label.placement === "end") return { right: 0 };
  return { left: `${label.percent}%`, transform: "translateX(-50%)" };
}

/** One row per tier: how far your pull count sits from what the published odds predict. */
export function OddsLuckChart({ rarities, total }: OddsLuckChartProps) {
  const rows = rarities.map((rarity) => ({
    rarity,
    luck: compareToOdds(rarity.count, total, CASE_DROP_ODDS[rarity.key]),
  }));
  const unusual = rows.filter((row) => row.luck.status !== "normal");

  return (
    <div className={classes.root}>
      {rows.map(({ rarity, luck }) => {
        const pulled = copy.pulled(formatInteger(rarity.count));
        const expected = copy.expected(luck.expected.toFixed(ODDS_LUCK_CHART.expectedDecimals));
        const status = copy.status[luck.status];
        const colour = `#${rarity.color}`;
        const stemStart = Math.min(centre, luck.position);
        return (
          <div
            key={rarity.key}
            role="group"
            aria-label={copy.group(rarity.label, pulled, expected, status)}
            className={classes.row}
          >
            <span className={classes.name}>
              <span
                className={classes.nameDot}
                style={{ backgroundColor: colour }}
                aria-hidden="true"
              />
              {rarity.label}
            </span>
            <span className={classes.numbers}>
              <span className={classes.pulled}>{pulled}</span>
              <br />
              {expected}
            </span>
            <div className={classes.plot} aria-hidden="true">
              <div
                className={classes.band}
                style={{ left: `${bandStart}%`, width: `${bandEnd - bandStart}%` }}
              />
              <div className={classes.centre} style={{ left: `${centre}%` }} />
              <div
                className={classes.stem}
                style={{
                  left: `${stemStart}%`,
                  width: `${Math.abs(luck.position - centre)}%`,
                  backgroundColor: colour,
                }}
              />
              <div
                className={classes.dot}
                style={{
                  left: `${luck.position}%`,
                  width: ODDS_LUCK_CHART.dotSizePx,
                  height: ODDS_LUCK_CHART.dotSizePx,
                  marginLeft: -ODDS_LUCK_CHART.dotSizePx / 2,
                  marginTop: -ODDS_LUCK_CHART.dotSizePx / 2,
                  backgroundColor: colour,
                }}
              />
            </div>
            <span
              className={`${classes.status} ${
                luck.status === "normal" ? classes.statusNormal : classes.statusUnusual
              }`}
              aria-hidden="true"
            >
              {status}
            </span>
          </div>
        );
      })}
      <div className={classes.axisRow} aria-hidden="true">
        <div className={classes.axis}>
          {ODDS_LUCK_CHART.axisLabels.map((label) => (
            <span key={label.text} className={classes.axisLabel} style={axisLabelStyle(label)}>
              {label.text}
            </span>
          ))}
        </div>
      </div>
      <p className={classes.caption}>{copy.caption}</p>
      <p className={classes.verdict}>
        {unusual.length === 0 ? (
          <span className={classes.verdictStrong}>{copy.allNormal}</span>
        ) : (
          copy.someUnusual(unusual.map((row) => row.rarity.label).join(", "))
        )}
      </p>
    </div>
  );
}
