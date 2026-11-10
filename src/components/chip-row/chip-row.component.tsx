import { cn } from "~/utils/cn";
import { CHIP_ROW } from "./chip-row.config";
import type { ChipRowProps } from "./chip-row.types";

/** A wrapping line of chips with consistent spacing above and between them. */
export function ChipRow({ children, className }: ChipRowProps) {
  return <div className={cn(CHIP_ROW.rowClass, className)}>{children}</div>;
}
