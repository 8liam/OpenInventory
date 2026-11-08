import { formatInteger } from "~/utils/format";
import { MONTHLY_BARS } from "./monthly-bars.config";
import type { MonthlyBarsProps } from "./monthly-bars.types";

/** One bar per month, with an expandable count list for touch and keyboard users. */
export function MonthlyBars({ months }: MonthlyBarsProps) {
  const shown = months.slice(-MONTHLY_BARS.maxMonths);
  const max = Math.max(...shown.map((m) => m.count), 1);
  return (
    <div>
      <div
        className="flex items-end gap-1"
        style={{ height: MONTHLY_BARS.height }}
        aria-hidden="true"
      >
        {shown.map((m) => (
          <div
            key={m.month}
            className="min-w-0 flex-1 rounded-t bg-primary/80 transition-colors hover:bg-primary"
            style={{ height: `${(m.count / max) * 100}%` }}
          />
        ))}
      </div>
      <div className="tabular mt-1.5 flex justify-between text-[11px] text-muted-foreground">
        <span>{shown[0]?.month}</span>
        <span>{shown[shown.length - 1]?.month}</span>
      </div>
      <details className="mt-3 text-xs">
        <summary className="w-fit cursor-pointer rounded text-muted-foreground underline-offset-2 hover:text-foreground hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring">
          View monthly counts
        </summary>
        <dl className="mt-2 grid grid-cols-2 gap-x-5 gap-y-1 sm:grid-cols-3 lg:grid-cols-4">
          {shown.map((month) => (
            <div key={month.month} className="flex justify-between gap-2 border-b py-1">
              <dt>{month.month}</dt>
              <dd className="tabular font-medium">{formatInteger(month.count)}</dd>
            </div>
          ))}
        </dl>
      </details>
    </div>
  );
}
