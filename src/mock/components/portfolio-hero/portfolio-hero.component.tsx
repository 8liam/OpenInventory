import { ChangeLine } from "~/components/change-line/change-line.component";
import { HistoryPanel } from "~/components/history-panel/history-panel.component";
import { COPY } from "~/lib/copy/copy.config";
import { formatInteger, formatMoney } from "~/utils/format";
import { PORTFOLIO_HERO } from "./portfolio-hero.config";
import type { PortfolioHeroProps } from "./portfolio-hero.types";

/** The page's focal point: total value, its movement, the split, and the history line. */
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
  ];
  return (
    <section className="overflow-hidden rounded-xl border bg-card">
      <div className="flex flex-col gap-6 p-5 md:flex-row md:items-end md:justify-between md:p-6">
        <div>
          <p className="text-xs text-muted-foreground">{copy.totalValue}</p>
          <p className="tabular mt-1 text-[40px] font-semibold leading-none tracking-tight md:text-5xl">
            {formatMoney(totals.value, currency)}
          </p>
          <div className="mt-3 min-h-5">
            <ChangeLine change={dashboard.change} currency={currency} />
          </div>
        </div>
        <dl className="flex gap-6 md:gap-8">
          {stats.map((stat) => (
            <div key={stat.label} className="min-w-0">
              <dt className="text-xs text-muted-foreground">{stat.label}</dt>
              <dd className="tabular mt-1 text-base font-medium">{stat.value}</dd>
              {stat.detail && (
                <dd className="tabular text-xs text-muted-foreground">{stat.detail}</dd>
              )}
            </div>
          ))}
        </dl>
      </div>
      <div className="border-t">
        {dashboard.history.length >= PORTFOLIO_HERO.minHistoryPoints ? (
          <HistoryPanel history={dashboard.history} currency={currency} />
        ) : (
          <p className="py-10 text-center text-muted-foreground">{copy.historyEmpty}</p>
        )}
      </div>
    </section>
  );
}
