import type { BentoIconName } from "../bento.types";

export type BentoIconProps = {
  readonly name: BentoIconName;
  /** Pixel size; the glyph is square. */
  readonly size?: number;
  readonly class?: string;
};
