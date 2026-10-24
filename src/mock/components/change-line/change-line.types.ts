import type { ValueChange } from "~/lib/items/dashboard.types";

export type ChangeLineProps = {
  readonly change: ValueChange;
  readonly currency: string;
};
