import { DONUT_CHART } from "./donut-chart.config";

/** A ring the size of the real donut, so the chart pops in without moving anything. */
export function DonutChartSkeleton() {
  const { size, radius, strokeWidth } = DONUT_CHART;
  return (
    <div className="mx-auto" style={{ width: size, height: size }}>
      <svg viewBox="0 0 100 100" width={size} height={size} aria-hidden>
        <circle
          cx={50}
          cy={50}
          r={radius}
          fill="none"
          strokeWidth={strokeWidth}
          className="skeleton-ring"
        />
      </svg>
    </div>
  );
}
