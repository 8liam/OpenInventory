import { useEffect, useMemo, useRef, useState } from "react";
import { monotonePath } from "~/utils/smooth-path";
import { formatCompactMoney, formatDate, formatDateTime, formatMoney } from "~/utils/format";
import { VALUE_CHART } from "./value-chart.config";
import type { ValueChartProps } from "./value-chart.types";

/**
 * Dependency-free SVG area chart in the spec-sheet style: an accent-ink line over a flat lime wash,
 * hairline grid, mono axis labels and a crosshair on hover. `tone` is accepted for callers but the
 * line stays the accent: gains and losses are read from the change line, with a sign.
 */
export function ValueChart({ points, currency }: ValueChartProps) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);
  const [hover, setHover] = useState<number>();
  const color = VALUE_CHART.lineColor;

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
    const values = points.map((pt) => pt.value);
    const min = Math.min(...values);
    const max = Math.max(...values);
    const pad = (max - min || max || 1) * 0.12;
    const lo = Math.max(0, min - pad);
    const hi = max + pad;
    const t0 = points[0]?.takenAt ?? 0;
    const t1 = points[points.length - 1]?.takenAt ?? 1;
    const plotW = width - p.left - p.right;
    const plotH = height - p.top - p.bottom;
    const x = (t: number) => p.left + ((t - t0) / (t1 - t0 || 1)) * plotW;
    const y = (v: number) => p.top + (1 - (v - lo) / (hi - lo || 1)) * plotH;
    const plotted = points.map((pt) => ({ x: x(pt.takenAt), y: y(pt.value) }));
    const line = monotonePath(plotted);
    const area = `${line} L${x(t1).toFixed(1)},${p.top + plotH} L${x(t0).toFixed(1)},${p.top + plotH} Z`;
    return { x, y, line, area, lo, hi, t0, t1, plotW, plotH };
  }, [points, width, height, p.left, p.right, p.top, p.bottom]);

  function onMove(event: React.PointerEvent<SVGSVGElement>) {
    if (!geometry) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const t =
      geometry.t0 +
      ((event.clientX - rect.left - p.left) / geometry.plotW) * (geometry.t1 - geometry.t0);
    let best = 0;
    points.forEach((pt, i) => {
      if (Math.abs(pt.takenAt - t) < Math.abs((points[best]?.takenAt ?? 0) - t)) best = i;
    });
    setHover(best);
  }

  const spanMs = (points[points.length - 1]?.takenAt ?? 0) - (points[0]?.takenAt ?? 0);
  const showTime = spanMs < VALUE_CHART.timeLabelSpanMs;
  const formatTick = showTime ? formatDateTime : formatDate;
  const tickSpacing = VALUE_CHART.xTickSpacing[showTime ? "time" : "date"];
  const xTicks = geometry
    ? Math.min(VALUE_CHART.maxXTicks, Math.max(1, Math.floor(geometry.plotW / tickSpacing)))
    : VALUE_CHART.maxXTicks;
  const active = hover === undefined ? undefined : points[hover];
  const last = points[points.length - 1];
  const dotX = active && geometry ? geometry.x(active.takenAt) : undefined;
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
          className="touch-pan-y"
        >
          {Array.from({ length: VALUE_CHART.yTicks + 1 }, (_, i) => {
            const value = geometry.lo + ((geometry.hi - geometry.lo) * i) / VALUE_CHART.yTicks;
            const y = Math.round(geometry.y(value)) + 0.5;
            return (
              <g key={i}>
                <line
                  x1={p.left}
                  x2={p.left + geometry.plotW}
                  y1={y}
                  y2={y}
                  stroke={VALUE_CHART.gridColor}
                  shapeRendering="crispEdges"
                />
                <text
                  x={p.left - 12}
                  y={y}
                  textAnchor="end"
                  dominantBaseline="middle"
                  fontSize={VALUE_CHART.axisFontSize}
                  fill="var(--muted-foreground)"
                  className="font-mono tabular-nums"
                >
                  {formatCompactMoney(value, currency)}
                </text>
              </g>
            );
          })}
          {Array.from({ length: xTicks + 1 }, (_, i) => {
            const t = geometry.t0 + ((geometry.t1 - geometry.t0) * i) / xTicks;
            return (
              <text
                key={i}
                x={geometry.x(t)}
                y={height - 6}
                textAnchor={i === 0 ? "start" : i === xTicks ? "end" : "middle"}
                fontSize={VALUE_CHART.axisFontSize}
                fill="var(--muted-foreground)"
                className="font-mono tabular-nums"
              >
                {formatTick(t)}
              </text>
            );
          })}
          <path
            d={geometry.area}
            fill={VALUE_CHART.areaColor}
            fillOpacity={VALUE_CHART.areaOpacity}
          />
          <path
            d={geometry.line}
            fill="none"
            stroke={color}
            strokeWidth={VALUE_CHART.strokeWidth}
            strokeLinejoin="round"
            strokeLinecap="round"
          />
          {last && !active && (
            <circle
              cx={geometry.x(last.takenAt)}
              cy={geometry.y(last.value)}
              r={VALUE_CHART.dotRadius}
              fill="var(--card)"
              stroke={color}
              strokeWidth={VALUE_CHART.strokeWidth}
            />
          )}
          {active && dotX !== undefined && (
            <g>
              <line
                x1={Math.round(dotX) + 0.5}
                x2={Math.round(dotX) + 0.5}
                y1={p.top}
                y2={p.top + geometry.plotH}
                stroke={VALUE_CHART.crosshairColor}
                shapeRendering="crispEdges"
              />
              <circle
                cx={dotX}
                cy={geometry.y(active.value)}
                r={VALUE_CHART.dotRadius}
                fill="var(--card)"
                stroke={color}
                strokeWidth={VALUE_CHART.strokeWidth}
              />
            </g>
          )}
        </svg>
      )}
      {active && geometry && dotX !== undefined && (
        <div
          className={VALUE_CHART.classes.tooltip}
          style={{
            left: Math.min(Math.max(dotX, 56), width - 56),
            top: geometry.y(active.value) - VALUE_CHART.tooltipGap,
            transform: "translate(-50%, -100%)",
          }}
        >
          <p className={VALUE_CHART.classes.tooltipValue}>{formatMoney(active.value, currency)}</p>
          <p className={VALUE_CHART.classes.tooltipDate}>{formatDateTime(active.takenAt)}</p>
        </div>
      )}
    </div>
  );
}
