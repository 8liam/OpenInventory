import { ChevronRight } from "lucide-react";
import { useCallback, useLayoutEffect, useRef, useState } from "react";
import { cn } from "~/utils/cn";
import { UNIT_STRIP } from "./unit-strip.config";
import type { UnitStripOverflow, UnitStripProps } from "./unit-strip.types";
import { measureOverflow } from "./unit-strip.utils";

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
          onClick={() =>
            scroller.current?.scrollBy({
              left: scroller.current.clientWidth * 0.8,
              behavior: "smooth",
            })
          }
        >
          {UNIT_STRIP.more(overflow.after)}
          <ChevronRight size={UNIT_STRIP.iconSize} aria-hidden />
        </button>
      )}
    </div>
  );
}
