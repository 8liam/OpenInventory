import { useState } from "react";
import { DonutChart } from "~/components/donut-chart/donut-chart.component";
import { BarList } from "~/components/bar-list/bar-list.component";
import { ItemLabel } from "~/components/item-label/item-label.component";
import { COPY } from "~/lib/copy/copy.config";
import { formatMoney } from "~/utils/format";
import { cn } from "~/utils/cn";
import { BREAKDOWN_PANEL } from "./breakdown-panel.config";
import { colorSlices } from "./breakdown-panel.utils";
import type { BreakdownKey, BreakdownPanelProps } from "./breakdown-panel.types";

/** One panel, one question at a time: where the value sits by type, rarity, wear or location. */
export function BreakdownPanel({ dashboard, currency, className }: BreakdownPanelProps) {
  const [active, setActive] = useState<BreakdownKey>(BREAKDOWN_PANEL.defaultTab);
  const slices = colorSlices(dashboard[active], COPY.dashboard.otherLabel);
  return (
    <section className={cn("rounded-xl border bg-card p-4", className)}>
      <header className="mb-4 flex items-center justify-between gap-3">
        <div className="text-[13px] font-medium">{COPY.dashboard.breakdownTitle}</div>
        <div role="tablist" className="flex rounded-md bg-muted p-0.5">
          {BREAKDOWN_PANEL.tabs.map((tab) => (
            <button
              key={tab.key}
              role="tab"
              type="button"
              aria-selected={active === tab.key}
              onClick={() => setActive(tab.key)}
              className={cn(
                "rounded px-2 py-1 text-xs text-muted-foreground transition-colors hover:bg-foreground/12 hover:text-foreground",
                active === tab.key && "bg-card font-medium text-foreground shadow-sm hover:bg-foreground/18",
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </header>
      <DonutChart slices={slices} currency={currency} totalLabel={COPY.dashboard.totalValue} />
      <div className="mt-5">
        <BarList slices={slices} currency={currency} limit={slices.length} />
      </div>
      <div className="mt-5 border-t pt-4">
        <div className="mb-2 text-xs text-muted-foreground">{COPY.dashboard.holdingsTitle}</div>
        <ul className="flex flex-col gap-2">
          {dashboard.topHoldings.slice(0, 3).map((holding) => (
            <li key={holding.name} className="flex items-center justify-between gap-3">
              <ItemLabel
                name={holding.name}
                imageUrl={holding.imageUrl}
                rarityColor={holding.rarityColor}
                size={28}
              />
              <span className="shrink-0 tabular text-muted-foreground">
                {formatMoney(holding.totalValue, currency)}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
