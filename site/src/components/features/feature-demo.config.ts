/** Width the app renders at inside the panel, before it is scaled down to fit. */
export const DEMO_WIDTH = 1000;
/** How much of that width stays visible; the rest bleeds off the card edge like a cropped screenshot. */
export const DEMO_VISIBLE_WIDTH = 880;
/** App height shown inside the panel, in unscaled pixels. */
export const DEMO_HEIGHT = 560;
export const DEMO_MIN_SCALE = 0.3;

export const FEATURE_DEMO_LABELS = {
  open: (id: string) => `Explore full ${id} demo`,
  dialog: (id: string) => `${id} demo`,
  dialogTitle: (id: string) => `OpenInventory · ${id} demo`,
  close: "Close demo",
} as const;
