export type RarityOption = {
  readonly id: string;
  readonly label: string;
  /** In-game tier colour of the circle. */
  readonly color: string;
};

export type RarityPickerProps = {
  readonly label: string;
  readonly options: readonly RarityOption[];
  readonly value: string;
  readonly onChange: (id: string) => void;
};
