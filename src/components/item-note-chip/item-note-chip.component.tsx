import { Chip } from "~/components/chip/chip.component";
import { ITEM_NOTE_CHIP } from "./item-note-chip.config";
import type { ItemNoteChipProps } from "./item-note-chip.types";

/** An item's note as a chip, removable when `onRemove` is given. */
export function ItemNoteChip({ note, className, onRemove, removing }: ItemNoteChipProps) {
  return (
    <Chip
      icon={ITEM_NOTE_CHIP.icon}
      title={note}
      className={className}
      onRemove={onRemove}
      removeLabel={ITEM_NOTE_CHIP.removeLabel}
      removing={removing}
    >
      <span className="sr-only">{ITEM_NOTE_CHIP.prefix} </span>
      {note}
    </Chip>
  );
}
