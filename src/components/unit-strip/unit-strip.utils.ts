import { UNIT_STRIP } from "./unit-strip.config";
import type { UnitStripOverflow } from "./unit-strip.types";

/** Counts the cards that are not fully inside the scroll area's visible width. */
export function measureOverflow(scroller: HTMLElement): UnitStripOverflow {
  const { tolerance } = UNIT_STRIP;
  const left = scroller.scrollLeft;
  const right = left + scroller.clientWidth;
  if (scroller.scrollWidth <= scroller.clientWidth + tolerance) return UNIT_STRIP.none;
  let before = 0;
  let after = 0;
  for (const card of Array.from(scroller.children)) {
    if (!(card instanceof HTMLElement)) continue;
    const start = card.offsetLeft - scroller.offsetLeft;
    const end = start + card.offsetWidth;
    if (end > right + tolerance) after += 1;
    else if (start < left - tolerance) before += 1;
  }
  return { before, after };
}
