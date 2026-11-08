import type { Dashboard } from "~/lib/items/dashboard.types";
import type { BREAKDOWN_PANEL } from "./breakdown-panel.config";

export type BreakdownKey = (typeof BREAKDOWN_PANEL.tabs)[number]["key"];

export type BreakdownPanelProps = {
  readonly dashboard: Dashboard;
  readonly currency: string;
  readonly className?: string;
  readonly headingLevel?: 2 | 4;
};

export type BreakdownPanelSkeletonProps = { readonly className?: string };
