export type CloudFieldVariant = "hero" | "band";

export interface CloudFieldProps {
  variant?: CloudFieldVariant;
}

/** Which breakpoint tier a skin survives into: 1 = shown from tablet up, 2 = wide screens only. */
export type SkinTier = 1 | 2;

/** Depth plane a skin sits on; drives blur, dimming and shadow weight in CSS. */
export type SkinLayer = "near" | "mid" | "far";

export interface GlowSkin {
  /** Public path of a CS2 skin thumbnail. */
  src: string;
  /** Small demo thumbnail plus a sharp 2x hero variant. */
  srcSet: string;
  /** Horizontal centre as a percentage of the panel width. */
  x: number;
  /** Vertical centre as a percentage of the panel height. */
  y: number;
  /** Rendered edge length in px. */
  size: number;
  /** Mouse-parallax travel in px (larger = nearer to the viewer). */
  depth: number;
  /** Scroll-parallax travel in px over one panel height (negative = rises faster than the page). */
  scroll: number;
  /** Resting tilt in degrees. */
  rotate: number;
  /** Float amplitude in px. */
  float: number;
  /** Float tilt swing in degrees either side of the resting tilt. */
  tilt: number;
  layer: SkinLayer;
  /** Float animation duration in seconds. */
  duration: number;
  /** Float animation delay in seconds (negative = start mid-cycle). */
  delay: number;
  tier: SkinTier;
}
