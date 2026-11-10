import { TOOLTIP } from "./tooltip.config.ts";
import type {
  TooltipAnchor,
  TooltipName,
  TooltipPlacement,
  TooltipViewport,
} from "./tooltip.types.ts";

/** "Sticker | Natus Vincere | Katowice 2014" becomes kind "Sticker" and the rest as the title. */
export function splitName(name: string): TooltipName {
  const at = name.indexOf(TOOLTIP.nameSeparator);
  if (at <= 0) return { kind: null, title: name };
  return { kind: name.slice(0, at), title: name.slice(at + TOOLTIP.nameSeparator.length) };
}

/** Centres the bubble on the anchor, kept inside the viewport, above it unless cramped. */
export function placeTooltip(anchor: TooltipAnchor, viewport: TooltipViewport): TooltipPlacement {
  const width = Math.min(TOOLTIP.maxWidth, viewport.width - TOOLTIP.viewportMargin * 2);
  const half = width / 2;
  const centre = (anchor.left + anchor.right) / 2;
  const left = Math.min(
    Math.max(centre, TOOLTIP.viewportMargin + half),
    viewport.width - TOOLTIP.viewportMargin - half,
  );
  return anchor.top < TOOLTIP.minRoomAbove
    ? { left, top: anchor.bottom + TOOLTIP.gap }
    : { left, bottom: viewport.height - anchor.top + TOOLTIP.gap };
}
