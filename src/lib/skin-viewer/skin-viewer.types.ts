import type { ItemView } from "../items/item.types.ts";

/** The slice of an item the embed URL is built from. */
export type SkinViewerItem = Pick<ItemView, "defIndex" | "paintIndex" | "wear" | "paintSeed">;

/** A message from the embed, narrowed to the shapes the app acts on. */
export type SkinViewerMessage =
  | { readonly kind: "ready" }
  | { readonly kind: "loading" }
  | { readonly kind: "loaded" }
  | { readonly kind: "error" }
  | { readonly kind: "escape" };
