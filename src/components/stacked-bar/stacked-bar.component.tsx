import { formatMoney, formatPercentPlain } from "~/utils/format";
import { STACKED_BAR } from "./stacked-bar.config";
import type { StackedBarProps } from "./stacked-bar.types";

/** Single-row composition bar with a legend. Slice colours come from the data. */
export function StackedBar({ slices, currency }: StackedBarProps) {
  const total = slices.reduce((sum, s) => sum + s.value, 0);
  if (total <= 0) return null;
  return (
    <div>
      <div className="flex h-2 gap-px overflow-hidden rounded-full">
        {slices.map((slice) => (
          <div
            key={slice.label}
            title={`${slice.label}: ${formatMoney(slice.value, currency)}`}
            style={{
              width: `${(slice.value / total) * 100}%`,
              background: slice.color ?? STACKED_BAR.fallbackColor,
            }}
          />
        ))}
      </div>
      <ul className="mt-3 flex flex-col gap-1.5">
        {slices.map((slice) => (
          <li key={slice.label} className="flex items-center justify-between gap-2">
            <span className="flex min-w-0 items-center gap-2">
              <span
                className="size-2 shrink-0 rounded-full"
                style={{ background: slice.color ?? STACKED_BAR.fallbackColor }}
              />
              <span className="truncate">{slice.label}</span>
            </span>
            <span className="tabular shrink-0 text-muted-foreground">
              {formatPercentPlain(slice.value / total)}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
