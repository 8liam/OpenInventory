export type TerminalActivateProps = {
  readonly itemId: string;
  readonly accountId: string;
  readonly name: string;
  /** A compact link inside a table row (default), or a full button where there is room for one. */
  readonly presentation?: "link" | "button";
};
