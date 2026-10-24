import type { MetricTone } from "./metric.types";

export const METRIC_TONE_CLASS: Record<MetricTone, string> = {
  neutral: "text-muted-foreground",
  positive: "text-success",
  negative: "text-destructive",
};
