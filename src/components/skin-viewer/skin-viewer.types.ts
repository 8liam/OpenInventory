import type { SkinViewerItem } from "~/lib/skin-viewer/skin-viewer.types";

export type SkinViewerButtonProps = {
  readonly item: SkinViewerItem & { readonly name: string };
  /** Positions the button inside its card or row. */
  readonly className?: string;
};

export type SkinViewerStatus = "loading" | "loaded" | "error";

export type SkinViewerDialogProps = {
  readonly url: string;
  readonly name: string;
  readonly onClose: () => void;
};
