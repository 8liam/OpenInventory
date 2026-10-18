import type { CSSProperties } from "react";

export type SkeletonProps = {
  /** Size, radius and margins; the shimmer itself is applied for you. */
  readonly className?: string;
  /** For sizes that come from config constants rather than Tailwind classes. */
  readonly style?: CSSProperties;
};
