import { ChevronRight } from "lucide-react";
import { useCallback, useLayoutEffect, useRef, useState } from "react";
import { cn } from "~/utils/cn";
import { UNIT_STRIP } from "./unit-strip.config";
import type { UnitStripOverflow, UnitStripProps } from "./unit-strip.types";
import { firstCardAfter, measureOverflow } from "./unit-strip.utils";

const { classes } = UNIT_STRIP;

/**
 * Storage's unit cards. While they scroll sideways, the cut-off edge fades and a "+N more"
 * button says there are more units beyond it (and brings the next one into view).
 */
export function UnitStrip({ children, className }: UnitStripProps) {
  const scroller = useRef<HTMLDivElement>(null);
  const [overflow, setOverflow] = useState<UnitStripOverflow>(UNIT_STRIP.none);

  const measure = useCallback(() => {
    if (!scroller.current) return;
    const next = measureOverflow(scroller.current);
    setOverflow((current) =>
      current.after === next.after && current.before === next.before ? current : next,
    );
  }, []);

  useLayoutEffect(() => {
    const element = scroller.current;
    if (!element) return;
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    for (const child of Array.from(element.children)) observer.observe(child);
    return () => observer.disconnect();
  }, [measure, children]);

  // The button disappears once the last card is in view, so focus moves to the card it revealed
  // instead of falling to the page.
  function revealNext() {
    const card = scroller.current && firstCardAfter(scroller.current);
    if (!card) return;
    const reduced = window.matchMedia(UNIT_STRIP.reducedMotionQuery).matches;
    card.scrollIntoView({
      inline: "nearest",
      block: "nearest",
      behavior: reduced ? "auto" : "smooth",
    });
    card.querySelector<HTMLElement>(UNIT_STRIP.focusTarget)?.focus({ preventScroll: true });
  }

  const fade =
    overflow.after > 0 && overflow.before > 0
      ? classes.fadeBoth
      : overflow.after > 0
        ? classes.fadeAfter
        : overflow.before > 0
          ? classes.fadeBefore
          : undefined;

  return (
    <div className={classes.root}>
      <div
        ref={scroller}
        role="group"
        aria-label={UNIT_STRIP.scrollLabel}
        className={cn(className, fade)}
        onScroll={measure}
      >
        {children}
      </div>
      {overflow.after > 0 && (
        <button
          type="button"
          className={classes.more}
          aria-label={UNIT_STRIP.showMore(overflow.after)}
          onClick={revealNext}
        >
          {UNIT_STRIP.more(overflow.after)}
          <ChevronRight size={UNIT_STRIP.iconSize} aria-hidden />
        </button>
      )}
    </div>
  );
}
