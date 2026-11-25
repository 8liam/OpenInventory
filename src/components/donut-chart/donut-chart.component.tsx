import { useState } from "react";
import { formatMoney, formatPercentPlain } from "~/utils/format";
import { DONUT_CHART } from "./donut-chart.config";
import type { DonutChartProps } from "./donut-chart.types";

/** Share-of-value donut; hovering a segment swaps the centre readout to that slice. */
export function DonutChart({
  slices,
  currency,
  totalLabel,
  formatValue,
  activeLabel,
  onActiveChange,
}: DonutChartProps) {
  const format = formatValue ?? ((value: number) => formatMoney(value, currency));
  const [ownHover, setOwnHover] = useState<string>();
  // Last hovered slice stays rendered so its readout can fade out after the pointer leaves.
  const [lastHover, setLastHover] = useState<string>();
  const hover = ownHover ?? activeLabel;
  const total = slices.reduce((sum, s) => sum + s.value, 0);
  if (total <= 0) return null;

  const { size, radius, strokeWidth, fadeMs, viewBox, gapPx } = DONUT_CHART;
  const circumference = 2 * Math.PI * radius;
  // The gap in circumference percent, so it measures `gapPx` on screen whatever the size.
  const gap = ((gapPx * viewBox) / size / circumference) * 100;
  const shownLabel = activeLabel ?? lastHover;
  function setHover(label: string | undefined) {
    setOwnHover(label);
    if (label !== undefined) setLastHover(label);
    onActiveChange?.(label);
  }
  const active = slices.find((s) => s.label === hover);
  const shown = slices.find((s) => s.label === (ownHover ?? shownLabel));
  const segments = slices.map((slice, index) => ({
    slice,
    share: (slice.value / total) * 100,
    start: (slices.slice(0, index).reduce((sum, s) => sum + s.value, 0) / total) * 100,
  }));
  return (
    <div className="relative mx-auto" style={{ width: size, height: size }}>
      <svg viewBox="0 0 100 100" width={size} height={size} role="img" aria-label={totalLabel}>
        <g transform="rotate(-90 50 50)" fill="none" strokeWidth={strokeWidth}>
          {segments.map(({ slice, share, start }, index) => {
            const dash = Math.max(share - gap, 0.01);
            return (
              <circle
                key={`${index}:${slice.label}`}
                cx={50}
                cy={50}
                r={radius}
                // Set as style, not an attribute: chart colours are CSS (var(), light-dark()).
                style={{
                  stroke: slice.color || DONUT_CHART.fallbackColor,
                  opacity: hover && hover !== slice.label ? DONUT_CHART.dimmedOpacity : 1,
                }}
                strokeDasharray={`${(dash / 100) * circumference} ${circumference}`}
                strokeDashoffset={-(start / 100) * circumference}
                onPointerEnter={() => setHover(slice.label)}
                onPointerLeave={() => setHover(undefined)}
                className="transition-opacity"
              />
            );
          })}
        </g>
      </svg>
      <div
        className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center px-8 text-center transition-opacity"
        style={{ opacity: active ? 0 : 1, transitionDuration: `${fadeMs}ms` }}
      >
        <span className="max-w-full truncate text-xs text-muted-foreground">{totalLabel}</span>
        <span className="figure text-xl">{format(total)}</span>
      </div>
      {shown && (
        <div
          key={shown.label}
          className="donut-readout pointer-events-none absolute inset-0 flex flex-col items-center justify-center px-8 text-center transition-opacity"
          style={{
            opacity: active ? 1 : 0,
            transitionDuration: `${fadeMs}ms`,
            animationDuration: `${fadeMs}ms`,
          }}
        >
          <span className="max-w-full truncate text-xs text-muted-foreground">{shown.label}</span>
          <span className="figure text-xl">{format(shown.value)}</span>
          <span className="tabular text-xs text-muted-foreground">
            {formatPercentPlain(shown.value / total)}
          </span>
        </div>
      )}
    </div>
  );
}
