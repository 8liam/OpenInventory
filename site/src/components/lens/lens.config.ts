export const LENS_ROTATION_MS = 4200;
export const LENS_CANVAS_WIDTH = 900;

export const LENS_TABLIST_LABEL = "Product views";
export const LENS_ICON_SIZE = 16;
export const LENS_ICON_STROKE = 1.7;
export const LENS_REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

/** Keys the tablist handles; anything else is left to the browser. */
export const LENS_NAV_KEYS = {
  next: "ArrowRight",
  prev: "ArrowLeft",
  first: "Home",
  last: "End",
} as const;
