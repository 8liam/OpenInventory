import { Check } from "lucide-react";
import { cn } from "~/utils/cn";
import { PILL } from "./pill.config";
import type { PillProps } from "./pill.types";

const { classes } = PILL;

/** A toggle chip: lime with a tick when active, an outline otherwise. */
export function Pill({ active, disabled, onClick, children }: PillProps) {
  return (
    <button
      type="button"
      aria-pressed={active}
      disabled={disabled}
      onClick={onClick}
      className={cn(classes.base, active ? classes.active : classes.idle)}
    >
      {active && (
        <Check size={PILL.checkSize} strokeWidth={2.5} className={classes.check} aria-hidden />
      )}
      {children}
    </button>
  );
}
