import { cn } from "~/utils/cn";
import type { SkeletonProps } from "./skeleton.types";

/** One shimmering placeholder block; size it to match the content it stands in for. */
export function Skeleton({ className, style }: SkeletonProps) {
  return <span aria-hidden className={cn("skeleton block rounded", className)} style={style} />;
}
