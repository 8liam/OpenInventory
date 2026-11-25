/** Shared by thumbnails and the larger inspect stage. */
export const ITEM_THUMB_BACKDROP = "isolate bg-card";

export const ITEM_THUMB = {
  classes: {
    root: `relative flex shrink-0 items-center justify-center overflow-hidden rounded-sm border ${ITEM_THUMB_BACKDROP}`,
    rarity: "absolute inset-x-0 bottom-0 h-0.5",
    halftone: "item-thumb-halftone",
    image: "size-full object-contain p-0.5 transition-opacity duration-300",
  },
} as const;
