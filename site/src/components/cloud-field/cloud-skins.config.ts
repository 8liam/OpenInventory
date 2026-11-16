import images from "../../mock/data/item-images.json";
import type { CloudFieldVariant, GlowSkin } from "./cloud-field.types";

/** Match the CSS visibility breakpoints without downloading hidden decorations. */
export const SKIN_DELIVERY = {
  hiddenMedia: { 1: "(max-width: 720px)", 2: "(max-width: 1100px)" },
  placeholder: "data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=",
} as const;

/** Hand-placed so the scene stays art-directed and keeps clear of the headline column. */
const demo = (name: string) => {
  const image = Object.values(images).find(({ file }) => file.startsWith(`/demo/${name}.`));
  if (!image) throw new Error(`Missing glow skin: ${name}`);
  const heroFile = "heroFile" in image ? image.heroFile : image.file;
  return { src: image.file, srcSet: `${image.file} 96w, ${heroFile} 256w` };
};

export const GLOW_SKINS: Record<CloudFieldVariant, readonly GlowSkin[]> = {
  hero: [
    {
      ...demo("karambit-slaughter-factory-new"),
      x: 7,
      y: 13,
      size: 112,
      depth: 22,
      rotate: -14,
      duration: 9,
      delay: -2,
      tier: 1,
    },
    {
      ...demo("falchion-knife-fade-factory-new"),
      x: 17,
      y: 36,
      size: 84,
      depth: 12,
      rotate: 10,
      duration: 11,
      delay: -6,
      tier: 2,
    },
    {
      ...demo("sport-gloves-nocts-field-tested"),
      x: 5,
      y: 50,
      size: 96,
      depth: 28,
      rotate: -6,
      duration: 10,
      delay: -4,
      tier: 1,
    },
    {
      ...demo("awp-asiimov-field-tested"),
      x: 93,
      y: 11,
      size: 124,
      depth: 24,
      rotate: 12,
      duration: 10,
      delay: -1,
      tier: 1,
    },
    {
      ...demo("butterfly-knife-vanilla"),
      x: 83,
      y: 33,
      size: 88,
      depth: 14,
      rotate: -9,
      duration: 12,
      delay: -7,
      tier: 2,
    },
    {
      ...demo("ak-47-inheritance-factory-new"),
      x: 95,
      y: 49,
      size: 100,
      depth: 30,
      rotate: 7,
      duration: 9.5,
      delay: -3,
      tier: 1,
    },
    {
      ...demo("m4a4-temukau-factory-new"),
      x: 78,
      y: 10,
      size: 66,
      depth: 8,
      rotate: 16,
      duration: 13,
      delay: -9,
      tier: 2,
    },
  ],
  band: [],
} as const;
