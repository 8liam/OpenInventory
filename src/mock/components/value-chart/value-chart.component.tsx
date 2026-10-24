import { useEffect, useId, useMemo, useRef, useState } from "react";
import { monotonePath } from "~/utils/smooth-path";
import { formatCompactMoney, formatDate, formatDateTime, formatMoney } from "~/utils/format";
import { VALUE_CHART } from "./value-chart.config";
import type { ValueChartProps } from "./value-chart.types";

/** Dependency-free SVG area chart: smooth line, dotted grid, hover dot with a price pill. */
export function ValueChart({ points, currency, tone }: ValueChartProps) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);
  const [hover, setHover] = useState<number>();
  const fillId = useId();
  const color = VALUE_CHART.tone[tone];

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
  const formatTick = spanMs < VALUE_CHART.timeLabelSpanMs ? formatDateTime : formatDate;
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
          <defs>
            <linearGradient id={fillId} x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity="0.22" />
              <stop offset="100%" stopColor={color} stopOpacity="0" />
            </linearGradient>
            <pattern
              id={`${fillId}-dots`}
              width={VALUE_CHART.dotSpacing}
              height={VALUE_CHART.dotSpacing}
              patternUnits="userSpaceOnUse"
            >
              <circle
                cx={VALUE_CHART.dotSpacing / 2}
                cy={VALUE_CHART.dotSpacing / 2}
                r={VALUE_CHART.dotRadius}
                fill="var(--muted-foreground)"
                opacity="0.35"
              />
            </pattern>
          </defs>
          <rect
            x={p.left}
            y={p.top}
            width={geometry.plotW}
            height={geometry.plotH}
            fill={`url(#${fillId}-dots)`}
          />
          {Array.from({ length: VALUE_CHART.yTicks + 1 }, (_, i) => {
            const value = geometry.lo + ((geometry.hi - geometry.lo) * i) / VALUE_CHART.yTicks;
            return (
              <text
                key={i}
                x={p.left - 12}
                y={geometry.y(value)}
                textAnchor="end"
                dominantBaseline="middle"
                fontSize="12"
                fill="var(--muted-foreground)"
              >
                {formatCompactMoney(value, currency)}
              </text>
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
                fontSize="12"
                fill="var(--muted-foreground)"
              >
                {formatTick(t)}
              </text>
            );
          })}
          <path d={geometry.area} fill={`url(#${fillId})`} />
          <path
            d={geometry.line}
            fill="none"
            stroke={color}
            strokeWidth={VALUE_CHART.strokeWidth}
            strokeLinejoin="round"
            strokeLinecap="round"
          />
          {last && !active && (
            <g>
              <circle cx={geometry.x(last.takenAt)} cy={geometry.y(last.value)} r={4} fill={color}>
                <animate attributeName="r" values="4;9;4" dur="2s" repeatCount="indefinite" />
                <animate
                  attributeName="opacity"
                  values="0.5;0;0.5"
                  dur="2s"
                  repeatCount="indefinite"
                />
              </circle>
              <circle
                cx={geometry.x(last.takenAt)}
                cy={geometry.y(last.value)}
                r={4}
                fill={color}
              />
            </g>
          )}
          {active && dotX !== undefined && (
            <circle
              cx={dotX}
              cy={geometry.y(active.value)}
              r={5}
              fill={color}
              stroke="var(--card)"
              strokeWidth={2}
            />
          )}
        </svg>
      )}
      {active && geometry && dotX !== undefined && (
        <div
          className="tabular pointer-events-none absolute whitespace-nowrap rounded-lg bg-foreground px-3 py-1.5 text-center text-background shadow-lg"
          style={{
            left: Math.min(Math.max(dotX, 56), width - 56),
            top: geometry.y(active.value) - VALUE_CHART.tooltipGap,
            transform: "translate(-50%, -100%)",
          }}
        >
          <p className="text-sm font-semibold">{formatMoney(active.value, currency)}</p>
          <p className="text-[11px] opacity-70">{formatDateTime(active.takenAt)}</p>
        </div>
      )}
    </div>
  );
}
