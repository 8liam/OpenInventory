export type SelectOption = {
  readonly id: string;
  readonly label: string;
  /** Quiet text on the right of the row, such as an item count. */
  readonly detail?: string;
  readonly disabled?: boolean;
};

export type SelectProps = {
  readonly value: string;
  readonly options: readonly SelectOption[];
  readonly onChange: (id: string) => void;
  readonly ariaLabel: string;
  readonly disabled?: boolean;
  readonly className?: string;
};

/** Where the open list sits, in viewport pixels (it is `position: fixed`). */
export type SelectPlacement = {
  readonly left: number;
  readonly width: number;
  readonly top?: number;
  readonly bottom?: number;
  readonly maxHeight: number;
};
