import type { WearSplit } from "./item-grid-card.types.ts";

/** "Point Disarray (Minimal Wear)" becomes the bare skin plus its wear, so the wear can be its own label. */
export function splitWear(skin: string, wearName: string | null): WearSplit {
  const suffix = wearName === null ? null : ` (${wearName})`;
  if (wearName === null || suffix === null || !skin.endsWith(suffix) || skin.length === suffix.length)
    return { skin, wear: null };
  return { skin: skin.slice(0, -suffix.length), wear: wearName };
}
