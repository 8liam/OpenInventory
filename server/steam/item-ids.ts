import { PLACEHOLDER_ITEM_ID } from "../../src/lib/storage/storage.config.ts";

/** True for the GC's placeholder entries (see PLACEHOLDER_ITEM_ID); never real, ownable assets. */
export function isPlaceholderItemId(id: string): boolean {
  try {
    return BigInt(id) >> PLACEHOLDER_ITEM_ID.shiftBits === PLACEHOLDER_ITEM_ID.topNibble;
  } catch {
    return false; // not numeric: leave it for the caller to handle as a normal item
  }
}
