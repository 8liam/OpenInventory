export type DangerDialogProps = {
  readonly open: boolean;
  readonly title: string;
  /** The one-line headline of what is about to happen. */
  readonly warning: string;
  readonly effects: readonly string[];
  readonly acknowledgement: string;
  readonly confirmLabel: string;
  readonly workingLabel: string;
  readonly cancelLabel: string;
  readonly onConfirm: () => Promise<void>;
  readonly onClose: () => void;
};
