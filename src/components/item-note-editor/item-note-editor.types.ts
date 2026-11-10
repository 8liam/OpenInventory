import type { ItemView } from "~/lib/items/item.types";

export type ItemNoteEditorProps = {
  /** The item the note belongs to. Remount (key) per item so a draft never carries across items. */
  readonly item: ItemView;
};
