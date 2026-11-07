import type { ShareScope } from "~/lib/shares/share.types";

export type ShareDialogProps = {
  readonly open: boolean;
  /** The items the new link covers. */
  readonly scope: ShareScope;
  /** How the scope is described to the owner, e.g. a unit's name or "3 selected items". */
  readonly scopeLabel: string;
  readonly onCreated?: () => void;
  readonly onClose: () => void;
};
