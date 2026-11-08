import { useId } from "react";
import { Select } from "~/components/select/select.component";
import { TRADE_UP_FINDER } from "~/lib/storage/storage.config";
import { TRADEUP_FINDER_CONTROLS } from "./tradeup-finder-controls.config";
import type { TradeUpFinderControlsProps } from "./tradeup-finder-controls.types";

/** Filters for the best-EV contract search: StatTrak mix and whether storage units count. */
export function TradeUpFinderControls({
  statTrak,
  onStatTrakChange,
  includeStorage,
  onIncludeStorageChange,
}: TradeUpFinderControlsProps) {
  const copy = TRADEUP_FINDER_CONTROLS;
  const headingId = useId();
  return (
    <section
      aria-labelledby={headingId}
      className="flex shrink-0 flex-wrap items-center gap-x-4 gap-y-2 rounded-lg border bg-card p-3"
    >
      <h2 id={headingId} className="mr-auto font-medium">
        {copy.title}
      </h2>
      <div className="flex items-center gap-2 text-muted-foreground">
        <span aria-hidden>{copy.statTrakLabel}</span>
        <Select
          value={statTrak}
          ariaLabel={copy.statTrakLabel}
          className={copy.selectWidth}
          options={copy.statTrakOptions}
          onChange={(id) => {
            const next = TRADE_UP_FINDER.statTrakFilters.find((filter) => filter === id);
            if (next) onStatTrakChange(next);
          }}
        />
      </div>
      <label className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={includeStorage}
          onChange={(event) => onIncludeStorageChange(event.target.checked)}
          className="size-4 accent-primary"
        />
        {copy.includeStorage}
      </label>
    </section>
  );
}
