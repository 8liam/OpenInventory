import type { OpeningKind } from "~/lib/cases/cases.types";

export type KindPillsProps = {
  readonly selected: OpeningKind;
  /** Omit while loading: pills keep their labels and show a placeholder count. */
  readonly counts?: Readonly<Record<OpeningKind, number>>;
  readonly onSelect: (kind: OpeningKind) => void;
};
