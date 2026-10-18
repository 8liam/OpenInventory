export type PlotPoint = { readonly x: number; readonly y: number };

/**
 * SVG path through the points as a monotone cubic (Fritsch–Carlson): smooth like a spline
 * but never overshoots between samples, so the line cannot dip below a value it never had.
 */
export function monotonePath(points: readonly PlotPoint[]): string {
  const [first] = points;
  if (!first) return "";
  if (points.length === 1) return `M${first.x},${first.y}`;

  const n = points.length;
  const dx: number[] = [];
  const slope: number[] = [];
  for (let i = 0; i < n - 1; i++) {
    const a = points[i];
    const b = points[i + 1];
    if (!a || !b) continue;
    dx.push(b.x - a.x);
    slope.push(b.x === a.x ? 0 : (b.y - a.y) / (b.x - a.x));
  }
  const tangent: number[] = [slope[0] ?? 0];
  for (let i = 1; i < n - 1; i++) {
    const prev = slope[i - 1] ?? 0;
    const next = slope[i] ?? 0;
    tangent.push(prev * next <= 0 ? 0 : (prev + next) / 2);
  }
  tangent.push(slope[n - 2] ?? 0);
  for (let i = 0; i < n - 1; i++) {
    const s = slope[i] ?? 0;
    if (s === 0) {
      tangent[i] = 0;
      tangent[i + 1] = 0;
      continue;
    }
    const a = (tangent[i] ?? 0) / s;
    const b = (tangent[i + 1] ?? 0) / s;
    const mag = Math.hypot(a, b);
    if (mag > 3) {
      tangent[i] = ((3 * a) / mag) * s;
      tangent[i + 1] = ((3 * b) / mag) * s;
    }
  }

  let path = `M${first.x.toFixed(1)},${first.y.toFixed(1)}`;
  for (let i = 0; i < n - 1; i++) {
    const a = points[i];
    const b = points[i + 1];
    if (!a || !b) continue;
    const step = (dx[i] ?? 0) / 3;
    path += ` C${(a.x + step).toFixed(1)},${(a.y + step * (tangent[i] ?? 0)).toFixed(1)} ${(b.x - step).toFixed(1)},${(b.y - step * (tangent[i + 1] ?? 0)).toFixed(1)} ${b.x.toFixed(1)},${b.y.toFixed(1)}`;
  }
  return path;
}
