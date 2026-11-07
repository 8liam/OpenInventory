import type { Holding, HistoryPoint } from "../src/lib/items/dashboard.types.ts";

export type SummaryReport = {
  readonly period: "weekly" | "monthly";
  readonly generatedAt: number;
  readonly currency: string;
  readonly periodStart: number;
  readonly periodEnd: number;
  readonly valueChange: number | null;
  readonly currentValue: number;
  /** Largest current holdings, since historic item-level prices are not stored. */
  readonly topMovers: readonly {
    readonly name: string;
    readonly value: number;
    readonly count: number;
  }[];
};

const DAY_MS = 86_400_000;

export function buildSummaryReport(args: {
  readonly period: "weekly" | "monthly";
  readonly history: readonly HistoryPoint[];
  readonly holdings: readonly Holding[];
  readonly currency: string;
  readonly now?: number;
}): SummaryReport {
  const now = args.now ?? Date.now();
  const periodStart = now - DAY_MS * (args.period === "weekly" ? 7 : 30);
  const baseline = [...args.history].reverse().find((point) => point.takenAt <= periodStart);
  const latest = args.history.at(-1);
  const currentValue = latest?.totalValue ?? 0;
  return {
    period: args.period,
    generatedAt: now,
    currency: args.currency,
    periodStart,
    periodEnd: now,
    valueChange: baseline ? currentValue - baseline.totalValue : null,
    currentValue,
    topMovers: [...args.holdings]
      .sort((a, b) => b.totalValue - a.totalValue)
      .slice(0, 5)
      .map(({ name, totalValue, count }) => ({ name, value: totalValue, count })),
  };
}
