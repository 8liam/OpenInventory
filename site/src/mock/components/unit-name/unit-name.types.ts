export type UnitNameProps = {
  readonly name: string;
  /** Saves the new name; rejects with a user-readable message on failure. */
  readonly onRename: (name: string) => Promise<void>;
};
