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
      if (!(event.target instanceof Node && root.current?.contains(event.target))) close();
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
    <div ref={root} className={TIERS_HELP.rootClass}>
      <Button
        ref={trigger}
        aria-label={tiersHelp.trigger}
        title={tiersHelp.trigger}
        aria-expanded={open}
        aria-controls={panelId}
        className={TIERS_HELP.triggerClass}
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
        className={TIERS_HELP.panelClass}
      >
        <h2 id={headingId} className={TIERS_HELP.titleClass}>
          {tiersHelp.title}
        </h2>
        <p className={TIERS_HELP.introClass}>{tiersHelp.intro}</p>
        <ul className={TIERS_HELP.signalsClass}>
          {tiersHelp.signals.map((signal) => (
            <li key={signal.label}>
              <span className={TIERS_HELP.signalLabelClass}>{signal.label}:</span> {signal.text}
            </li>
          ))}
        </ul>
        <ul className={TIERS_HELP.pointsClass}>
          {tiersHelp.points.map((point) => (
            <li key={point}>{point}</li>
          ))}
        </ul>
      </section>
    </div>
  );
}
