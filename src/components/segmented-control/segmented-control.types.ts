export type SegmentedOption<T extends string> = {
  readonly id: T;
  readonly label: string;
};

export type SegmentedControlProps<T extends string> = {
  readonly value: T;
  readonly options: readonly SegmentedOption<T>[];
  readonly onChange: (id: T) => void;
  readonly ariaLabel: string;
};
