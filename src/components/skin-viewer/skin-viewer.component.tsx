import { Rotate3d } from "lucide-react";
import { lazy, Suspense, useState } from "react";
import { buildSkinViewerUrl } from "~/lib/skin-viewer/skin-viewer";
import { SKIN_VIEWER } from "./skin-viewer.config";
import type { SkinViewerButtonProps } from "./skin-viewer.types";

/** Loaded on first open: keeps the settings store and the dialog out of the initial bundle. */
const SkinViewerDialog = lazy(() => import("./skin-viewer-dialog.component"));

/**
 * Icon button that opens a 3D preview of a skin in a modal. Renders nothing for items without a
 * def and paint index. The dialog (and its iframe) mounts only while open.
 */
export function SkinViewerButton({ item, className }: SkinViewerButtonProps) {
  const url = buildSkinViewerUrl(item);
  const [open, setOpen] = useState(false);
  if (url === null) return null;

  // The dialog sits inside a selectable card, so its clicks and keys must not reach the card.
  return (
    <span
      className={className}
      onClick={(event) => event.stopPropagation()}
      onKeyDown={(event) => event.stopPropagation()}
    >
      <button
        type="button"
        className={SKIN_VIEWER.classes.button}
        aria-label={`${SKIN_VIEWER.buttonLabel}: ${item.name}`}
        title={SKIN_VIEWER.buttonLabel}
        onClick={() => setOpen(true)}
      >
        <Rotate3d size={SKIN_VIEWER.iconSize} aria-hidden />
      </button>
      {open && (
        <Suspense fallback={null}>
          <SkinViewerDialog url={url} name={item.name} onClose={() => setOpen(false)} />
        </Suspense>
      )}
    </span>
  );
}
