import { X } from "lucide-react";
import { ITEM_HIGHLIGHTS } from "~/components/item-highlights/item-highlights.config";
import { cn } from "~/utils/cn";
import { ITEM_NOTE_CHIP } from "./item-note-chip.config";
import type { ItemNoteChipProps } from "./item-note-chip.types";

const { classes } = ITEM_NOTE_CHIP;

/** An item's note as a small label, in the same family as the float and pattern chips. */
export function ItemNoteChip({ note, className, onRemove, removing = false }: ItemNoteChipProps) {
  const Icon = ITEM_NOTE_CHIP.icon;
  return (
    <span className={cn(ITEM_HIGHLIGHTS.chipClass, "max-w-full", className)} title={note}>
      <Icon size={ITEM_NOTE_CHIP.iconSize} className={classes.iconClass} aria-hidden />
      <span className="sr-only">{ITEM_NOTE_CHIP.prefix} </span>
      <span className={classes.textClass}>{note}</span>
      {onRemove && (
        <button
          type="button"
          aria-label={ITEM_NOTE_CHIP.removeLabel}
          title={ITEM_NOTE_CHIP.removeLabel}
          disabled={removing}
          onClick={(event) => {
            event.stopPropagation();
            onRemove();
          }}
          className={classes.removeButton}
        >
          <X size={ITEM_NOTE_CHIP.removeIconSize} aria-hidden />
        </button>
      )}
    </span>
  );
}
