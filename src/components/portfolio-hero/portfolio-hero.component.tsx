import { ChangeLine } from "~/components/change-line/change-line.component";
import { HistoryPanel } from "~/components/history-panel/history-panel.component";
import { MoneyFigure } from "~/components/money-figure/money-figure.component";
import { COPY } from "~/lib/copy/copy.config";
import { formatInteger, formatMoney } from "~/utils/format";
import { PORTFOLIO_HERO } from "./portfolio-hero.config";
import type { PortfolioHeroProps } from "./portfolio-hero.types";

const { classes } = PORTFOLIO_HERO;

/** The page's focal point: total value as a ledger figure, its movement, the split, and the history line. */
export function PortfolioHero({ dashboard, currency }: PortfolioHeroProps) {
  const copy = COPY.dashboard;
  const { totals } = dashboard;
  const stats = [
    { label: copy.inventory, value: formatMoney(totals.inventoryValue, currency) },
    {
      label: copy.storage,
      value: formatMoney(totals.storageValue, currency),
      detail: `${totals.unitsLoaded}/${totals.unitsTotal} units`,
    },
    { label: copy.items, value: formatInteger(totals.itemCount) },
    ...(totals.charmsValue > 0
      ? [
          {
            label: copy.charms,
            value: formatMoney(totals.charmsValue, currency),
            detail: copy.charmsDetail,
          },
        ]
      : []),
  ];
  return (
    <section className={classes.root}>
      {/* Sized by the section, not the viewport: the sidebar narrows it at tablet widths. */}
      <div className={classes.top}>
        <div className="min-w-0">
          <p className="kicker">{copy.totalValue}</p>
          <p className={classes.figure}>
            <MoneyFigure amount={totals.value} currency={currency} />
          </p>
          <div className={classes.change}>
            <ChangeLine change={dashboard.change} currency={currency} />
          </div>
        </div>
        <dl className={classes.stats}>
          {stats.map((stat) => (
            <div key={stat.label} className="contents">
              <dt className={classes.statLabel}>{stat.label}</dt>
              <dd className={classes.statValue}>
                {stat.value}
                {stat.detail && <span className={classes.statDetail}>{stat.detail}</span>}
              </dd>
            </div>
          ))}
        </dl>
      </div>
      <div className={classes.chart}>
        {dashboard.history.length >= PORTFOLIO_HERO.minHistoryPoints ? (
          <HistoryPanel history={dashboard.history} currency={currency} />
        ) : (
          <p className={classes.empty}>{copy.historyEmpty}</p>
        )}
      </div>
    </section>
  );
}
