declare module "globaloffensive" {
  import type { EventEmitter } from "node:events";

  /** Minimal shape of an item from the `globaloffensive` inventory. */
  export interface GcItem {
    readonly id: string;
    readonly def_index: number;
    readonly paint_index?: number;
    readonly paint_wear?: number;
    readonly custom_name?: string;
    readonly casket_id?: string;
    readonly casket_contained_item_count?: number;
    readonly quality?: number;
    readonly kill_eater_value?: number;
    readonly tradable_after?: Date;
    readonly attribute?: readonly { readonly def_index: number; readonly value_bytes?: Buffer }[];
    readonly stickers?: readonly { readonly sticker_id: number }[];
  }

  export default class GlobalOffensive extends EventEmitter {
    constructor(steamUser: unknown);
    inventory?: GcItem[];
    haveGCSession: boolean;
    addToCasket(casketId: string, itemId: string): void;
    removeFromCasket(casketId: string, itemId: string): void;
    getCasketContents(
      casketId: string,
      callback: (err: Error | null, items?: GcItem[]) => void,
    ): void;
  }
}
