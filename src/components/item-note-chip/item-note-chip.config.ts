import { NotebookPen } from "lucide-react";

export const ITEM_NOTE_CHIP = {
  icon: NotebookPen,
  removeLabel: "Remove note",
  /** Screen-reader prefix, since the icon is decorative. */
  prefix: "Note:",
} as const;
