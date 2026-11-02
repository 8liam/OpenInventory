import { useEffect, useRef, useState } from "react";
import { cn } from "~/utils/cn";
import { REVEAL } from "./reveal.config";
import type { RevealProps } from "./reveal.types";

/** Expands and collapses its content with a height + fade transition instead of popping in. */
export function Reveal({ open, children }: RevealProps) {
  // Last open children, kept in a ref so parent re-renders while open don't cost an extra commit.
  const lastChildren = useRef(children);
  const [unmounted, setUnmounted] = useState(!open);
  const [settled, setSettled] = useState(false);

  // Reset derived state while rendering rather than in an effect.
  if (open && unmounted) setUnmounted(false);
  if (!open && settled) setSettled(false);

  useEffect(() => {
    if (open) {
      lastChildren.current = children;
      return;
    }
    const timer = setTimeout(() => setUnmounted(true), REVEAL.durationMs);
    return () => clearTimeout(timer);
  }, [open, children]);

  return (
    <div
      inert={!open}
      aria-hidden={!open}
      className={cn(
        "grid shrink-0 transition-[grid-template-rows,opacity,margin] ease-out motion-reduce:transition-none",
        open
          ? "grid-rows-[1fr] opacity-100"
          : cn("grid-rows-[0fr] opacity-0", REVEAL.collapsedGapClass),
      )}
      style={{ transitionDuration: `${REVEAL.durationMs}ms` }}
      onTransitionEnd={(e) => {
        if (e.target === e.currentTarget && open) setSettled(true);
      }}
    >
      {/* Clip only while animating so the destination dropdown can overflow when open. */}
      <div
        className={cn(
          "min-h-0",
          open && settled ? "overflow-visible" : "overflow-hidden",
          open && "motion-reduce:overflow-visible",
        )}
      >
        {open ? children : unmounted ? null : lastChildren.current}
      </div>
    </div>
  );
}
