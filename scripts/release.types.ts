import type { BUMP } from "./release.config.ts";

export type Bump = (typeof BUMP)[keyof typeof BUMP];
