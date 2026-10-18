import type { ReactNode } from "react";

export type MetricTone = "neutral" | "positive" | "negative";

export type MetricProps = {
  readonly label: string;
  readonly value: string;
  readonly detail?: ReactNode;
  readonly tone?: MetricTone;
};
