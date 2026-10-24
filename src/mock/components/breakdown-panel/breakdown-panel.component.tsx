import { useState } from "react";
import { DonutChart } from "~/components/donut-chart/donut-chart.component";
import { BarList } from "~/components/bar-list/bar-list.component";
import { COPY } from "~/lib/copy/copy.config";
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
        <h4 className="text-[13px] font-medium">{COPY.dashboard.breakdownTitle}</h4>
        <div role="tablist" className="flex rounded-md bg-muted p-0.5">
          {BREAKDOWN_PANEL.tabs.map((tab) => (
            <button
              key={tab.key}
              role="tab"
              type="button"
              aria-selected={active === tab.key}
              onClick={() => setActive(tab.key)}
              className={cn(
                "rounded px-2 py-1 text-xs text-muted-foreground transition-colors hover:text-foreground",
                active === tab.key && "bg-card font-medium text-foreground shadow-sm hover:bg-accent",
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
    </section>
  );
}
