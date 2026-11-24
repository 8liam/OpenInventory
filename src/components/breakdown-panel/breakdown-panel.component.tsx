import { useState } from "react";
import { DonutChart } from "~/components/donut-chart/donut-chart.component";
import { BarList } from "~/components/bar-list/bar-list.component";
import { COPY } from "~/lib/copy/copy.config";
import { cn } from "~/utils/cn";
import { BREAKDOWN_PANEL } from "./breakdown-panel.config";
import { colorSlices } from "./breakdown-panel.utils";
import type { BreakdownKey, BreakdownPanelProps } from "./breakdown-panel.types";

/** One panel, one question at a time: where the value sits by type, rarity, wear or location. */
export function BreakdownPanel({
  dashboard,
  currency,
  className,
  headingLevel = 2,
}: BreakdownPanelProps) {
  const [active, setActive] = useState<BreakdownKey>(BREAKDOWN_PANEL.defaultTab);
  const slices = colorSlices(dashboard[active], COPY.dashboard.otherLabel);
  const Heading = `h${headingLevel}` as const;
  return (
    <section className={cn(BREAKDOWN_PANEL.classes.section, className)}>
      <header className={BREAKDOWN_PANEL.classes.header}>
        <Heading className={BREAKDOWN_PANEL.classes.title}>{COPY.dashboard.breakdownTitle}</Heading>
        <div role="tablist" className={BREAKDOWN_PANEL.classes.tablist}>
          {BREAKDOWN_PANEL.tabs.map((tab) => (
            <button
              key={tab.key}
              role="tab"
              type="button"
              aria-selected={active === tab.key}
              onClick={() => setActive(tab.key)}
              className={cn(
                BREAKDOWN_PANEL.classes.tab,
                active === tab.key && BREAKDOWN_PANEL.classes.tabActive,
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
