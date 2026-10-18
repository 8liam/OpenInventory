import { useEffect, useMemo, useRef, useState } from "react";
import { formatCompactMoney, formatDate, formatDateTime, formatMoney } from "~/utils/format";
import { VALUE_CHART } from "./value-chart.config";
import type { ValueChartProps } from "./value-chart.types";

/** Dependency-free SVG area chart with a hover crosshair. */
export function ValueChart({ points, currency }: ValueChartProps) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);
  const [hover, setHover] = useState<number>();

  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;
    const observer = new ResizeObserver(
      ([entry]) => entry && setWidth(Math.floor(entry.contentRect.width)),
    );
    observer.observe(wrap);
    return () => observer.disconnect();
  }, []);

  const { height, padding: p } = VALUE_CHART;
  const geometry = useMemo(() => {
    if (width === 0 || points.length < 2) return undefined;
    const values = points.map((pt) => pt.totalValue);
    const min = Math.min(...values);
    const max = Math.max(...values);
    const pad = (max - min || max || 1) * 0.1;
    const lo = Math.max(0, min - pad);
    const hi = max + pad;
    const t0 = points[0]?.takenAt ?? 0;
    const t1 = points[points.length - 1]?.takenAt ?? 1;
    const plotW = width - p.left - p.right;
    const plotH = height - p.top - p.bottom;
    const x = (t: number) => p.left + ((t - t0) / (t1 - t0 || 1)) * plotW;
    const y = (v: number) => p.top + (1 - (v - lo) / (hi - lo || 1)) * plotH;
    const line = points
      .map(
        (pt, i) =>
          `${i === 0 ? "M" : "L"}${x(pt.takenAt).toFixed(1)},${y(pt.totalValue).toFixed(1)}`,
      )
      .join(" ");
    const area = `${line} L${x(t1).toFixed(1)},${p.top + plotH} L${x(t0).toFixed(1)},${p.top + plotH} Z`;
    return { x, y, line, area, lo, hi, t0, t1, plotH };
  }, [points, width, height, p.left, p.right, p.top, p.bottom]);

  function onMove(event: React.PointerEvent<SVGSVGElement>) {
    if (!geometry) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const t =
      geometry.t0 +
      ((event.clientX - rect.left - p.left) / (rect.width - p.left - p.right)) *
        (geometry.t1 - geometry.t0);
    let best = 0;
    points.forEach((pt, i) => {
      if (Math.abs(pt.takenAt - t) < Math.abs((points[best]?.takenAt ?? 0) - t)) best = i;
    });
    setHover(best);
  }

  const spanMs = (points[points.length - 1]?.takenAt ?? 0) - (points[0]?.takenAt ?? 0);
  const formatTick = spanMs < VALUE_CHART.timeLabelSpanMs ? formatDateTime : formatDate;
  const active = hover === undefined ? undefined : points[hover];
  return (
    <div ref={wrapRef} className="relative w-full">
      {geometry && (
        <svg
          width={width}
          height={height}
          onPointerMove={onMove}
          onPointerLeave={() => setHover(undefined)}
          role="img"
          aria-label="Value over time"
        >
          <defs>
            <linearGradient id="value-fill" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.18" />
              <stop offset="100%" stopColor="var(--primary)" stopOpacity="0" />
            </linearGradient>
          </defs>
          {Array.from({ length: VALUE_CHART.yTicks + 1 }, (_, i) => {
            const value = geometry.lo + ((geometry.hi - geometry.lo) * i) / VALUE_CHART.yTicks;
            const y = geometry.y(value);
            return (
              <g key={i}>
                <line x1={p.left} x2={width - p.right} y1={y} y2={y} stroke="var(--border)" />
                <text
                  x={p.left - 8}
                  y={y}
                  textAnchor="end"
                  dominantBaseline="middle"
                  fontSize="11"
                  fill="var(--muted-foreground)"
                >
                  {formatCompactMoney(value, currency)}
                </text>
              </g>
            );
          })}
          {Array.from({ length: VALUE_CHART.xTicks + 1 }, (_, i) => {
            const t = geometry.t0 + ((geometry.t1 - geometry.t0) * i) / VALUE_CHART.xTicks;
            return (
              <text
                key={i}
                x={geometry.x(t)}
                y={height - 6}
                textAnchor={i === 0 ? "start" : i === VALUE_CHART.xTicks ? "end" : "middle"}
                fontSize="11"
                fill="var(--muted-foreground)"
              >
                {formatTick(t)}
              </text>
            );
          })}
          <path d={geometry.area} fill="url(#value-fill)" />
          <path
            d={geometry.line}
            fill="none"
            stroke="var(--primary)"
            strokeWidth={VALUE_CHART.strokeWidth}
            strokeLinejoin="round"
          />
          {active && (
            <g>
              <line
                x1={geometry.x(active.takenAt)}
                x2={geometry.x(active.takenAt)}
                y1={p.top}
                y2={p.top + geometry.plotH}
                stroke="var(--muted-foreground)"
                strokeDasharray="3 3"
              />
              <circle
                cx={geometry.x(active.takenAt)}
                cy={geometry.y(active.totalValue)}
                r={3.5}
                fill="var(--primary)"
                stroke="var(--card)"
                strokeWidth={2}
              />
            </g>
          )}
        </svg>
      )}
      {active && (
        <div className="tabular pointer-events-none absolute right-2 top-1 rounded-md border bg-card px-2 py-1 text-xs shadow-sm">
          <span className="text-muted-foreground">{formatDateTime(active.takenAt)}</span> ·{" "}
          {formatMoney(active.totalValue, currency)}
        </div>
      )}
    </div>
  );
}
