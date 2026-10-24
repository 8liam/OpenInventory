import { cn } from "~/utils/cn";
import type { PillProps } from "./pill.types";

/** A toggle chip: filled when active, quiet otherwise. */
export function Pill({ active, disabled, onClick, children }: PillProps) {
  return (
    <button
      type="button"
      aria-pressed={active}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "rounded-lg border px-3 py-1 text-xs transition-colors disabled:opacity-40",
        active
          ? "border-foreground bg-foreground text-background hover:bg-foreground/85"
          : "text-muted-foreground hover:text-foreground",
      )}
    >
      {children}
    </button>
  );
}
