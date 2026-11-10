import { NotebookPen } from "lucide-react";

export const ITEM_NOTE_CHIP = {
  icon: NotebookPen,
  iconSize: 11,
  removeIconSize: 10,
  removeLabel: "Remove note",
  /** Screen-reader prefix, since the icon is decorative. */
  prefix: "Note:",
  classes: {
    iconClass: "shrink-0",
    textClass: "truncate",
    removeButton:
      "-mr-1 ml-0.5 grid size-4 shrink-0 place-items-center rounded-sm text-foreground/60 hover:bg-foreground/15 hover:text-foreground focus-visible:outline-2 focus-visible:outline-ring disabled:opacity-50",
  },
} as const;
