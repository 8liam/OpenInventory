import { useState } from "react";
import { formatMoney, formatPercentPlain } from "~/utils/format";
import { DONUT_CHART } from "./donut-chart.config";
import type { DonutChartProps } from "./donut-chart.types";

/** Share-of-value donut; hovering a segment swaps the centre readout to that slice. */
export function DonutChart({ slices, currency, totalLabel, formatValue }: DonutChartProps) {
  const format = formatValue ?? ((value: number) => formatMoney(value, currency));
  const [hover, setHover] = useState<string>();
  const total = slices.reduce((sum, s) => sum + s.value, 0);
  if (total <= 0) return null;

  const { size, radius, strokeWidth, gap, dimmedOpacity } = DONUT_CHART;
  const circumference = 2 * Math.PI * radius;
  const active = slices.find((s) => s.label === hover);
  const segments = slices.map((slice, index) => ({
    slice,
    share: (slice.value / total) * 100,
    start: (slices.slice(0, index).reduce((sum, s) => sum + s.value, 0) / total) * 100,
  }));
  return (
    <div className="relative mx-auto" style={{ width: size, height: size }}>
      <svg viewBox="0 0 100 100" width={size} height={size} role="img" aria-label={totalLabel}>
        <g transform="rotate(-90 50 50)" fill="none" strokeWidth={strokeWidth}>
          {segments.map(({ slice, share, start }) => {
            const dash = Math.max(share - gap, 0.01);
            return (
              <circle
                key={slice.label}
                cx={50}
                cy={50}
                r={radius}
                stroke={slice.color}
                strokeDasharray={`${(dash / 100) * circumference} ${circumference}`}
                strokeDashoffset={-(start / 100) * circumference}
                opacity={hover && hover !== slice.label ? dimmedOpacity : 1}
                onPointerEnter={() => setHover(slice.label)}
                onPointerLeave={() => setHover(undefined)}
                className="transition-opacity"
              />
            );
          })}
        </g>
      </svg>
      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center px-8 text-center">
        <span className="max-w-full truncate text-xs text-muted-foreground">
          {active ? active.label : totalLabel}
        </span>
        <span className="tabular text-base font-semibold">
          {format(active ? active.value : total)}
        </span>
        {active && (
          <span className="tabular text-xs text-muted-foreground">
            {formatPercentPlain(active.value / total)}
          </span>
        )}
      </div>
    </div>
  );
}
