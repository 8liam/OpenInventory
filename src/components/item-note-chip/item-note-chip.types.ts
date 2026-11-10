export type ItemNoteChipProps = {
  readonly note: string;
  readonly className?: string;
  /** When set, the chip shows a remove button that calls this. */
  readonly onRemove?: () => void;
  readonly removing?: boolean;
};
