import { UNIT_STRIP } from "./unit-strip.config";
import type { UnitStripOverflow } from "./unit-strip.types";

/** The scroll area's cards, in order, with where each one sits against its visible width. */
function cardsOutside(scroller: HTMLElement): {
  readonly before: readonly HTMLElement[];
  readonly after: readonly HTMLElement[];
} {
  const { tolerance } = UNIT_STRIP;
  const before: HTMLElement[] = [];
  const after: HTMLElement[] = [];
  if (scroller.scrollWidth <= scroller.clientWidth + tolerance) return { before, after };
  const left = scroller.scrollLeft;
  const right = left + scroller.clientWidth;
  for (const card of Array.from(scroller.children)) {
    if (!(card instanceof HTMLElement)) continue;
    const start = card.offsetLeft - scroller.offsetLeft;
    const end = start + card.offsetWidth;
    if (end > right + tolerance) after.push(card);
    else if (start < left - tolerance) before.push(card);
  }
  return { before, after };
}

/** Counts the cards that are not fully inside the scroll area's visible width. */
export function measureOverflow(scroller: HTMLElement): UnitStripOverflow {
  const { before, after } = cardsOutside(scroller);
  return { before: before.length, after: after.length };
}

/** The first card cut off at the right edge: the one "+N more" should bring into view. */
export function firstCardAfter(scroller: HTMLElement): HTMLElement | undefined {
  return cardsOutside(scroller).after[0];
}
