import type { CloudFieldVariant, GlowSkin } from './cloud-field.types';

export const GLOW_FIELD = {
  selector: '[data-glow-field]',
  variantAttribute: 'data-glow-field',
  reducedMotionQuery: '(prefers-reduced-motion: reduce)',
  finePointerQuery: '(hover: hover) and (pointer: fine)',
  mouseXVar: '--mx',
  mouseYVar: '--my',
  /** Fraction of the way the pointer value eases toward its target each frame. */
  easing: 0.07,
  /** Stop easing once within this distance of the target. */
  settleEpsilon: 0.001,
} as const;

/** Hand-placed so the scene stays art-directed and keeps clear of the headline column. */
const demo = (name: string) => `/demo/${name}.webp`;

export const GLOW_SKINS: Record<CloudFieldVariant, readonly GlowSkin[]> = {
  hero: [
    { src: demo('karambit-slaughter-factory-new'), x: 7, y: 13, size: 112, depth: 22, rotate: -14, duration: 9, delay: -2, tier: 1 },
    { src: demo('falchion-knife-fade-factory-new'), x: 17, y: 36, size: 84, depth: 12, rotate: 10, duration: 11, delay: -6, tier: 2 },
    { src: demo('sport-gloves-nocts-field-tested'), x: 5, y: 50, size: 96, depth: 28, rotate: -6, duration: 10, delay: -4, tier: 1 },
    { src: demo('awp-asiimov-field-tested'), x: 93, y: 11, size: 124, depth: 24, rotate: 12, duration: 10, delay: -1, tier: 1 },
    { src: demo('butterfly-knife-vanilla'), x: 83, y: 33, size: 88, depth: 14, rotate: -9, duration: 12, delay: -7, tier: 2 },
    { src: demo('ak-47-inheritance-factory-new'), x: 95, y: 49, size: 100, depth: 30, rotate: 7, duration: 9.5, delay: -3, tier: 1 },
    { src: demo('m4a4-temukau-factory-new'), x: 78, y: 10, size: 66, depth: 8, rotate: 16, duration: 13, delay: -9, tier: 2 },
  ],
  band: [],
} as const;
