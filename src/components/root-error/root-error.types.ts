export type RootErrorProps = {
  /** What a route or the shell threw while rendering; anything can be thrown, so narrow before use. */
  readonly error: unknown;
};
