import images from "../../mock/data/item-images.json";
import type { CloudFieldVariant, GlowSkin } from "./cloud-field.types";

/** Match the CSS visibility breakpoints without downloading hidden decorations. */
export const SKIN_DELIVERY = {
  hiddenMedia: { 1: "(max-width: 720px)", 2: "(max-width: 1100px)" },
  placeholder: "data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=",
} as const;

/** Entrance choreography: skins settle in one after another, near planes last. */
export const SKIN_MOTION = {
  enterStart: 0.35,
  enterStagger: 0.14,
} as const;

/** Hand-placed so the scene stays art-directed and keeps clear of the headline column. */
const demo = (name: string) => {
  const image = Object.values(images).find(({ file }) => file.startsWith(`/demo/${name}.`));
  if (!image) throw new Error(`Missing glow skin: ${name}`);
  const heroFile = "heroFile" in image ? image.heroFile : image.file;
  return { src: image.file, srcSet: `${image.file} 96w, ${heroFile} 256w` };
};

/**
 * Three depth planes. Near pieces are big, crisp and travel furthest; far pieces are small, dimmed and soft.
 * Left and right are deliberately unequal so the headline never feels framed by a mirror.
 */
export const GLOW_SKINS: Record<CloudFieldVariant, readonly GlowSkin[]> = {
  hero: [
    {
      ...demo("falchion-knife-fade-factory-new"),
      x: 22,
      y: 41,
      size: 104,
      depth: 8,
      scroll: 30,
      rotate: 12,
      float: 6,
      tilt: 1.5,
      layer: "far",
      duration: 12,
      delay: -6,
      tier: 2,
    },
    {
      ...demo("m4a4-temukau-factory-new"),
      x: 73,
      y: 9,
      size: 84,
      depth: 8,
      scroll: 36,
      rotate: 18,
      float: 6,
      tilt: 1.5,
      layer: "far",
      duration: 13,
      delay: -9,
      tier: 2,
    },
    {
      ...demo("butterfly-knife-vanilla"),
      x: 81,
      y: 35,
      size: 116,
      depth: 10,
      scroll: 24,
      rotate: -12,
      float: 7,
      tilt: 2,
      layer: "far",
      duration: 12,
      delay: -7,
      tier: 2,
    },
    {
      ...demo("sport-gloves-nocts-field-tested"),
      x: 9,
      y: 57,
      size: 172,
      depth: 16,
      scroll: -16,
      rotate: -8,
      float: 10,
      tilt: 2,
      layer: "mid",
      duration: 10,
      delay: -4,
      tier: 1,
    },
    {
      ...demo("ak-47-inheritance-factory-new"),
      x: 91,
      y: 54,
      size: 188,
      depth: 18,
      scroll: -20,
      rotate: 9,
      float: 10,
      tilt: 2,
      layer: "mid",
      duration: 9.5,
      delay: -3,
      tier: 1,
    },
    {
      ...demo("karambit-slaughter-factory-new"),
      x: 11,
      y: 21,
      size: 232,
      depth: 28,
      scroll: -64,
      rotate: -16,
      float: 14,
      tilt: 2.5,
      layer: "near",
      duration: 9,
      delay: -2,
      tier: 1,
    },
    {
      ...demo("awp-asiimov-field-tested"),
      x: 88,
      y: 14,
      size: 264,
      depth: 32,
      scroll: -72,
      rotate: 13,
      float: 14,
      tilt: 2.5,
      layer: "near",
      duration: 10,
      delay: -1,
      tier: 1,
    },
  ],
  band: [],
} as const;
