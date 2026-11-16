export type CloudFieldVariant = "hero" | "band";

export interface CloudFieldProps {
  variant?: CloudFieldVariant;
}

/** Which breakpoint tier a skin survives into: 1 = shown from tablet up, 2 = wide screens only. */
export type SkinTier = 1 | 2;

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
  /** Resting tilt in degrees. */
  rotate: number;
  /** Float animation duration in seconds. */
  duration: number;
  /** Float animation delay in seconds (negative = start mid-cycle). */
  delay: number;
  tier: SkinTier;
}
