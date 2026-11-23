import { ScanSearch } from "lucide-react";
import { lazy, Suspense, useRef, useState } from "react";
import { canInspect } from "~/lib/items/inspect";
import { restoreLostFocus } from "~/utils/restore-focus";
import { ITEM_INSPECT } from "./item-inspect.config";
import type { ItemInspectButtonProps } from "./item-inspect.types";

/** Loaded on first open: keeps the card out of the initial bundle. */
const ItemInspectDialog = lazy(
  () => import("~/components/item-inspect-dialog/item-inspect-dialog.component"),
);

/** Icon button that opens a 2D inspect card for a skin. Renders nothing for items with nothing to inspect. */
export function ItemInspectButton({ item, currency, className }: ItemInspectButtonProps) {
  const [open, setOpen] = useState(false);
  const trigger = useRef<HTMLButtonElement>(null);
  if (!canInspect(item)) return null;

  // The dialog sits inside a selectable card or row, so its clicks and keys must not reach it.
  return (
    <span
      className={className}
      onClick={(event) => event.stopPropagation()}
      onKeyDown={(event) => event.stopPropagation()}
    >
      <button
        ref={trigger}
        type="button"
        className={ITEM_INSPECT.buttonClass}
        aria-label={`${ITEM_INSPECT.buttonLabel}: ${item.name}`}
        title={ITEM_INSPECT.buttonLabel}
        aria-haspopup="dialog"
        onClick={() => {
          // Pointer clicks can leave another control focused (Safari); showModal() remembers the focused one.
          trigger.current?.focus({ preventScroll: true });
          setOpen(true);
        }}
      >
        <ScanSearch size={ITEM_INSPECT.iconSize} aria-hidden />
      </button>
      {open && (
        <Suspense fallback={null}>
          <ItemInspectDialog
            item={item}
            currency={currency}
            onClose={() => {
              setOpen(false);
              restoreLostFocus(trigger.current);
            }}
          />
        </Suspense>
      )}
    </span>
  );
}
