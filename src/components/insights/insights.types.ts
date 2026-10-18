import type { DashboardInsights } from "~/lib/items/dashboard.types";

export type InsightsProps = { readonly insights: DashboardInsights; readonly currency: string };

/** One row in any of the three lists. */
export type InsightRow = {
  readonly key: string;
  readonly name: string;
  readonly imageUrl: string | null;
  readonly rarityColor: string | null;
  readonly value: string;
};

export type InsightSectionProps = { readonly title: string; readonly rows: readonly InsightRow[] };
