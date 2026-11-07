import { HelpCircle } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { COPY } from "~/lib/copy/copy.config";
import { cn } from "~/utils/cn";
import { TIERS_HELP } from "./tiers-help.config";

/** A help button that opens a short popover explaining the pattern tier badges. */
export function TiersHelp() {
  const root = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);
  const { tiersHelp } = COPY.items;

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: PointerEvent) => {
      if (!root.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== TIERS_HELP.closeKey) return;
      setOpen(false);
      trigger.current?.focus();
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <div ref={root} className="relative">
      <button
        ref={trigger}
        type="button"
        aria-label={tiersHelp.trigger}
        title={tiersHelp.trigger}
        aria-expanded={open}
        aria-controls={TIERS_HELP.popoverId}
        onClick={() => setOpen((on) => !on)}
        className={cn(
          "flex h-8 items-center rounded-md bg-muted px-2 text-muted-foreground transition-colors hover:text-foreground",
          open && "bg-card text-foreground shadow-sm",
        )}
      >
        <HelpCircle size={TIERS_HELP.iconSize} aria-hidden />
      </button>
      {open && (
        <div
          id={TIERS_HELP.popoverId}
          role="dialog"
          aria-label={tiersHelp.title}
          className="absolute right-0 top-full z-50 mt-1.5 w-72 rounded-md border bg-card p-3 text-xs text-foreground shadow-lg"
        >
          <p className="text-sm font-medium">{tiersHelp.title}</p>
          <p className="mt-1 text-muted-foreground">{tiersHelp.intro}</p>
          <ul className="mt-2 list-disc space-y-1 pl-4 text-muted-foreground">
            {tiersHelp.points.map((point) => (
              <li key={point}>{point}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
