import { useEffect, useId, useRef, useState } from "react";
import { Button } from "~/components/button/button.component";
import { ItemInspectCard } from "~/components/item-inspect-card/item-inspect-card.component";
import { ITEM_INSPECT_DIALOG } from "./item-inspect-dialog.config";
import type { ItemInspectDialogProps } from "./item-inspect-dialog.types";

const { classes } = ITEM_INSPECT_DIALOG;

/** Modal around the inspect card. Escape, a click on the backdrop and the Close button all close it. */
export default function ItemInspectDialog({ item, currency, onClose }: ItemInspectDialogProps) {
  const dialog = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  // Read once on open, so the trade-lock line does not change under a card that is on screen.
  const [now] = useState(() => Date.now());

  useEffect(() => {
    const element = dialog.current;
    if (element && !element.open) element.showModal();
  }, []);

  return (
    <dialog
      ref={dialog}
      className={classes.dialog}
      aria-labelledby={titleId}
      onClose={onClose}
      onClick={(event) => {
        if (event.target === event.currentTarget) dialog.current?.close();
      }}
    >
      <div className={classes.header}>
        <h2 id={titleId} className={classes.title}>
          {item.name}
        </h2>
        <Button small variant="ghost" onClick={() => dialog.current?.close()}>
          {ITEM_INSPECT_DIALOG.closeLabel}
        </Button>
      </div>
      <div className={classes.body}>
        <ItemInspectCard item={item} currency={currency} now={now} />
      </div>
    </dialog>
  );
}
