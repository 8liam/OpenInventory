import type { CaseOpening } from "~/lib/cases/cases.types";

export type OpeningListProps = {
  readonly openings: readonly CaseOpening[];
  readonly emptyText: string;
};
