import type { ReactNode } from "react";

export type UnitStripProps = {
  /** The unit cards. */
  readonly children: ReactNode;
  /** Layout classes from the page: a sideways strip while narrow, a column once wide. */
  readonly className: string;
};

/** How much of the strip lies beyond each edge of its scroll area. */
export type UnitStripOverflow = {
  /** Cards cut off by (or past) the right edge. */
  readonly after: number;
  /** Cards cut off by (or past) the left edge. */
  readonly before: number;
};
