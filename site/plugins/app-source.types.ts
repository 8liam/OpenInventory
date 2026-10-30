export type AppReplacement = {
  readonly from: string;
  readonly to: string;
};

export type AppPatch = {
  /** Path relative to the app's `src/`. */
  readonly file: string;
  readonly replacements: readonly AppReplacement[];
};
