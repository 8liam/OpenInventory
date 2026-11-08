import type { LucideIcon } from "lucide-react";

export type EmptyStateProps = {
  readonly icon: LucideIcon;
  /** The one-line headline: what is missing. */
  readonly title: string;
  /** Quieter detail: why, or what to try next. */
  readonly body: string;
};
