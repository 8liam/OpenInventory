import type { HistoryPoint } from '~/lib/items/dashboard.types';
import { monotonePath } from '~/utils/smooth-path';
import { seeded } from '@demo/data/mock.config';
import { howConfig } from './how.config';
import type { HowChart, HowChartDot } from './how.types';

type Cell = readonly [x: number, y: number];

/** True when (x, y) sits inside the 7x7 finder box whose top-left is (ox, oy) and is dark. */
function finderDark(x: number, y: number, ox: number, oy: number): boolean {
  const { finder } = howConfig.qr;
  const radius = (finder - 1) / 2;
  const edge = Math.max(Math.abs(x - ox - radius), Math.abs(y - oy - radius));
  return edge === radius || edge <= 1;
}

/** Deterministic QR-shaped matrix: real finder, timing and alignment patterns around seeded data modules. */
export function buildQrPath(): string {
  const { size, seed, finder, alignmentAt, alignmentSize, timingAt, fill } = howConfig.qr;
  const rand = seeded(seed);
  const farEdge = size - finder;
  const finders: readonly Cell[] = [
    [0, 0],
    [farEdge, 0],
    [0, farEdge],
  ];
  const dark: Cell[] = [];
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const random = rand() < fill;
      const owner = finders.find(([ox, oy]) => x >= ox - 1 && x <= ox + finder && y >= oy - 1 && y <= oy + finder);
      if (owner) {
        const [ox, oy] = owner;
        const inside = x >= ox && x < ox + finder && y >= oy && y < oy + finder;
        if (inside && finderDark(x, y, ox, oy)) dark.push([x, y]);
        continue;
      }
      if (y === timingAt || x === timingAt) {
        if ((x + y) % 2 === 0) dark.push([x, y]);
        continue;
      }
      const ax = x - alignmentAt;
      const ay = y - alignmentAt;
      if (ax >= 0 && ax < alignmentSize && ay >= 0 && ay < alignmentSize) {
        const centre = (alignmentSize - 1) / 2;
        if (Math.max(Math.abs(ax - centre), Math.abs(ay - centre)) !== 1) dark.push([x, y]);
        continue;
      }
      if (random) dark.push([x, y]);
    }
  }
  return dark.map(([x, y]) => `M${x} ${y}h1v1h-1z`).join('');
}

/** The dashboard's value line over the last day of hourly snapshots, drawn with the app chart's own smoothing. */
export function buildChart(history: readonly HistoryPoint[]): HowChart {
  const { width, height, padTop, padBottom, padRight, padLeft, windowPoints, stride, dotEvery } = howConfig.chart;
  const window = history.slice(-((windowPoints - 1) * stride + 1)).filter((_, i) => i % stride === 0);
  const values = window.map((p) => p.totalValue);
  const lo = Math.min(...values);
  const hi = Math.max(...values);
  const span = hi - lo || 1;
  const plotW = width - padLeft - padRight;
  const plotH = height - padTop - padBottom;
  const points = window.map((p, i) => ({
    x: padLeft + (plotW * i) / Math.max(window.length - 1, 1),
    y: padTop + plotH * (1 - (p.totalValue - lo) / span),
  }));
  const line = monotonePath(points);
  const last = points[points.length - 1] ?? { x: width, y: height };
  const area = `${line}L${last.x.toFixed(1)},${height}L${padLeft},${height}Z`;
  const dots: HowChartDot[] = points
    .map((pt, i) => ({ ...pt, progress: (pt.x - padLeft) / plotW, index: i }))
    .filter(({ index }) => index % dotEvery === 0 && index !== points.length - 1)
    .map(({ x, y, progress }) => ({ x, y, progress }));
  return { line, area, dots, last };
}
