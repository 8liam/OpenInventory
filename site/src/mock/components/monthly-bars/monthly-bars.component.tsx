import { formatInteger } from "~/utils/format";
import { MONTHLY_BARS } from "./monthly-bars.config";
import type { MonthlyBarsProps } from "./monthly-bars.types";

/** One bar per month; hover (or long-press) a bar for the exact count. */
export function MonthlyBars({ months }: MonthlyBarsProps) {
  const shown = months.slice(-MONTHLY_BARS.maxMonths);
  const max = Math.max(...shown.map((m) => m.count), 1);
  return (
    <div>
      <div className="flex items-end gap-1" style={{ height: MONTHLY_BARS.height }}>
        {shown.map((m) => (
          <div
            key={m.month}
            title={`${m.month}: ${formatInteger(m.count)}`}
            className="min-w-0 flex-1 rounded-t bg-primary/80 transition-colors hover:bg-primary"
            style={{ height: `${(m.count / max) * 100}%` }}
          />
        ))}
      </div>
      <div className="tabular mt-1.5 flex justify-between text-[11px] text-muted-foreground">
        <span>{shown[0]?.month}</span>
        <span>{shown[shown.length - 1]?.month}</span>
      </div>
    </div>
  );
}
