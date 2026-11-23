import type { ItemView } from "~/lib/items/item.types";

export type ItemInspectCardProps = {
  readonly item: ItemView;
  /** Currency for prices; they are left out without it. */
  readonly currency?: string;
  /** Epoch ms used to tell whether a trade lock is still running. */
  readonly now: number;
};

/** One label and value row in the details list. */
export type Fact = {
  readonly label: string;
  readonly value: string;
  readonly strong: boolean;
};
