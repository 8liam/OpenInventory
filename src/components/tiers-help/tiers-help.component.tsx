import { HelpCircle } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";
import { Button } from "~/components/button/button.component";
import { COPY } from "~/lib/copy/copy.config";
import { TIERS_HELP } from "./tiers-help.config";
import type { TiersHelpPlacement } from "./tiers-help.types";

/** Right-aligns the panel under its trigger, kept inside the viewport on narrow screens. */
function placementFor(trigger: HTMLElement): TiersHelpPlacement {
  const rect = trigger.getBoundingClientRect();
  const { width: preferred, viewportMargin: margin, gap } = TIERS_HELP;
  const width = Math.min(preferred, window.innerWidth - margin * 2);
  const left = Math.min(Math.max(margin, rect.right - width), window.innerWidth - width - margin);
  return { left, top: rect.bottom + gap, width };
}

/**
 * A disclosure explaining highlights and pattern tiers. It is plain content (no focus trap),
 * so Tab moves on naturally; Escape or a click outside closes it and returns focus to the button.
 */
export function TiersHelp() {
  const root = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const [placement, setPlacement] = useState<TiersHelpPlacement>();
  const panelId = useId();
  const headingId = useId();
  const { tiersHelp } = COPY.items;
  const open = placement !== undefined;

  useEffect(() => {
    if (!open) return;
    const close = () => setPlacement(undefined);
    const onPointerDown = (event: PointerEvent) => {
      if (!root.current?.contains(event.target as Node)) close();
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== TIERS_HELP.closeKey) return;
      close();
      trigger.current?.focus();
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    window.addEventListener("resize", close);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("resize", close);
    };
  }, [open]);

  return (
    <div ref={root} className="relative">
      <Button
        ref={trigger}
        aria-label={tiersHelp.trigger}
        title={tiersHelp.trigger}
        aria-expanded={open}
        aria-controls={panelId}
        className="px-2 aria-expanded:bg-muted aria-expanded:text-foreground max-sm:h-9"
        onClick={() =>
          setPlacement((current) =>
            current || !trigger.current ? undefined : placementFor(trigger.current),
          )
        }
      >
        <HelpCircle size={TIERS_HELP.iconSize} aria-hidden />
      </Button>
      <section
        id={panelId}
        aria-labelledby={headingId}
        hidden={!open}
        style={placement}
        className="fixed z-50 max-h-[70vh] overflow-y-auto rounded-md border bg-card p-3 text-xs text-foreground shadow-lg"
      >
        <h2 id={headingId} className="text-sm font-medium">
          {tiersHelp.title}
        </h2>
        <p className="mt-1 text-muted-foreground">{tiersHelp.intro}</p>
        <ul className="mt-2 space-y-1 text-muted-foreground">
          {tiersHelp.signals.map((signal) => (
            <li key={signal.label}>
              <span className="font-medium text-foreground">{signal.label}:</span> {signal.text}
            </li>
          ))}
        </ul>
        <ul className="mt-2 list-disc space-y-1 pl-4 text-muted-foreground">
          {tiersHelp.points.map((point) => (
            <li key={point}>{point}</li>
          ))}
        </ul>
      </section>
    </div>
  );
}
