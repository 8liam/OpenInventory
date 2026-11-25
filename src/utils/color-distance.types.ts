import type { CVD_MATRICES } from "./color-distance.config.ts";

export type Oklab = readonly [lightness: number, a: number, b: number];
export type Deficiency = keyof typeof CVD_MATRICES;
