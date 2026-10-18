import { COPY } from "~/lib/copy/copy.config";
import type { LoadingRegionProps } from "./loading-region.types";

/** Wraps a skeleton so assistive tech hears "Loading…" once instead of nothing. */
export function LoadingRegion({ children, className }: LoadingRegionProps) {
  return (
    <div role="status" aria-busy="true" className={className}>
      <span className="sr-only">{COPY.common.loading}</span>
      {children}
    </div>
  );
}
