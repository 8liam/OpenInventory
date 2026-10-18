import { formatInteger, formatMoney, formatPercentPlain } from "~/utils/format";
import { BAR_LIST } from "./bar-list.config";
import type { BarListProps } from "./bar-list.types";

/** Ranked rows: label and value on one line, a thin share bar beneath. */
export function BarList({
  slices,
  currency,
  limit = BAR_LIST.defaultLimit,
  showValue = true,
}: BarListProps) {
  const total = slices.reduce((sum, s) => sum + s.value, 0);
  const max = Math.max(...slices.map((s) => s.value), 0);
  return (
    <ul className="flex flex-col gap-3">
      {slices.slice(0, limit).map((slice) => {
        const color = slice.color ?? BAR_LIST.fallbackColor;
        return (
          <li key={slice.label}>
            <div className="flex items-baseline justify-between gap-3">
              <span className="flex min-w-0 items-baseline gap-1.5">
                <span className="truncate">{slice.label}</span>
                {showValue && (
                  <span className="tabular shrink-0 text-xs text-muted-foreground">
                    {formatInteger(slice.count)}
                  </span>
                )}
              </span>
              <span className="tabular shrink-0">
                {showValue ? formatMoney(slice.value, currency) : formatInteger(slice.count)}
                <span className="ml-2 inline-block w-11 text-right text-xs text-muted-foreground">
                  {formatPercentPlain(total > 0 ? slice.value / total : 0)}
                </span>
              </span>
            </div>
            <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full"
                style={{ width: `${max > 0 ? (slice.value / max) * 100 : 0}%`, background: color }}
              />
            </div>
          </li>
        );
      })}
    </ul>
  );
}
