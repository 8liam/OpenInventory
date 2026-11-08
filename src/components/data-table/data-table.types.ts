import type { ReactNode } from "react";

export type SortDirection = "asc" | "desc";

/** The sizing half of a column, shared by the table and its skeleton. */
export type FittableColumn = {
  /** CSS grid track, e.g. "2fr" or "120px". */
  readonly width: string;
  /** Floor in px: the track never shrinks below it, so values like prices never clip. */
  readonly minWidth?: number;
  /** Set on optional columns; when the minimums don't fit, the lowest priority hides first. */
  readonly hidePriority?: number;
};

export type DataTableColumn<Row> = FittableColumn & {
  readonly id: string;
  readonly header: string;
  readonly align?: "left" | "right";
  /** Sort key; omit to make the column unsortable. */
  readonly sortValue?: (row: Row) => string | number;
  readonly cell: (row: Row) => ReactNode;
};

export type DataTableSelection = {
  readonly selected: ReadonlySet<string | number>;
  readonly onToggle: (key: string | number) => void;
  /** Checks or clears every currently listed row. */
  readonly onToggleAll: (checked: boolean) => void;
};

export type DataTableProps<Row> = {
  readonly rows: readonly Row[];
  readonly columns: readonly DataTableColumn<Row>[];
  readonly getRowKey: (row: Row) => string | number;
  readonly onRowClick?: (row: Row) => void;
  readonly rowHeight?: number;
  /** Adds a checkbox column; clicking a row also toggles it. */
  readonly selection?: DataTableSelection;
  readonly initialSort?: { readonly columnId: string; readonly direction: SortDirection };
};

export type DataTableSkeletonColumn = FittableColumn & {
  readonly id: string;
  readonly header: string;
  readonly align?: "left" | "right";
  /** Placeholder shown in this column's cell of every row. */
  readonly cell: ReactNode;
};

export type DataTableSkeletonProps = {
  readonly columns: readonly DataTableSkeletonColumn[];
  readonly rowHeight?: number;
  readonly rows: number;
  readonly selectable?: boolean;
};
