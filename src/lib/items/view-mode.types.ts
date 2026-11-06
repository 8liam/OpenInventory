export const ITEM_VIEW_MODES = ["list", "grid"] as const;
export type ItemViewMode = (typeof ITEM_VIEW_MODES)[number];

export type ItemViewModeState = {
  readonly mode: ItemViewMode;
  readonly setMode: (mode: ItemViewMode) => void;
};
