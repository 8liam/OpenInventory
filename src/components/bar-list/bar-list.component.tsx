import { formatInteger, formatMoney, formatPercentPlain } from "~/utils/format";
import { BAR_LIST } from "./bar-list.config";
import type { BarListProps } from "./bar-list.types";

/** Ranked horizontal bars: label, count, value and share of the total. */
export function BarList({ slices, currency, limit = BAR_LIST.defaultLimit }: BarListProps) {
  const total = slices.reduce((sum, s) => sum + s.value, 0);
  const max = Math.max(...slices.map((s) => s.value), 0);
  return (
    <ul className="flex flex-col gap-2.5">
      {slices.slice(0, limit).map((slice) => (
        <li key={slice.label}>
          <div className="flex items-baseline justify-between gap-3">
            <span className="truncate">{slice.label}</span>
            <span className="tabular shrink-0 text-muted-foreground">
              {formatInteger(slice.count)} · {formatMoney(slice.value, currency)} ·{" "}
              {formatPercentPlain(total > 0 ? slice.value / total : 0)}
            </span>
          </div>
          <div className="mt-1 h-1 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full"
              style={{
                width: `${max > 0 ? (slice.value / max) * 100 : 0}%`,
                background: slice.color ?? BAR_LIST.fallbackColor,
              }}
            />
          </div>
        </li>
      ))}
    </ul>
  );
}
