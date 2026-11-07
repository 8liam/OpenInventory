import type { ItemView } from "./item.types.ts";

export type TradabilityGroup = {
  readonly key: string;
  readonly label: string;
  readonly items: readonly ItemView[];
};
