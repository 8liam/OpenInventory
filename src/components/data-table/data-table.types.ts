import type { ReactNode } from "react";

export type SortDirection = "asc" | "desc";

/** A row's sort key; `null` (no price, no float) always sorts last. */
export type SortValue = string | number | null;

export type SortState = { readonly columnId: string; readonly direction: SortDirection };

/** The sizing half of a column, shared by the table and its skeleton. */
export type FittableColumn = {
  /** CSS grid track, e.g. "2fr" or "120px". */
  readonly width: string;
  /** Floor in px: the track never shrinks below it, so values like prices never clip. */
  readonly minWidth?: number;
  /** Set on optional columns; when the minimums don't fit, the lowest priority hides first. */
  readonly hidePriority?: number;
};

/** The columns that fit, and whether they are the compact set. */
export type FittedColumns<C> = { readonly compact: boolean; readonly columns: readonly C[] };

export type DataTableColumn<Row> = FittableColumn & {
  readonly id: string;
  readonly header: string;
  /** Keeps the header for assistive tech but not on screen, when another control already labels the column. */
  readonly hideHeader?: boolean;
  readonly align?: "left" | "right";
  /** Sort key; omit to make the column unsortable. */
  readonly sortValue?: (row: Row) => SortValue;
  readonly cell: (row: Row) => ReactNode;
};

/** One entry of the compact layout's sort menu: a column (shown or not) and a direction. */
export type DataTableSortOption = SortState & {
  readonly id: string;
  readonly label: string;
  readonly triggerLabel?: string;
};

/**
 * What the table switches to when its own width can't fit the required columns: fewer, denser
 * columns, taller rows, and a sort menu standing in for the headers that went away.
 */
export type DataTableCompact<Row> = {
  readonly columns: readonly DataTableColumn<Row>[];
  readonly rowHeight: number;
  /** Fills the first header cell; should cover every sort the compact headers can produce. */
  readonly sortOptions: readonly DataTableSortOption[];
  readonly sortLabel: string;
};

export type DataTableSelection = {
  readonly selected: ReadonlySet<string | number>;
  readonly onToggle: (key: string | number) => void;
  /** Checks or clears every currently listed row. */
  readonly onToggleAll: (checked: boolean) => void;
};

export type DataTableProps<Row> = {
  readonly rows: readonly Row[];
  /**
   * The full layout. Sorting may use any column here or in `compact`, rendered or not, but a
   * sort the current layout can't show falls back to `initialSort`.
   */
  readonly columns: readonly DataTableColumn<Row>[];
  readonly compact?: DataTableCompact<Row>;
  readonly getRowKey: (row: Row) => string | number;
  readonly onRowClick?: (row: Row) => void;
  readonly rowHeight?: number;
  /** Adds a checkbox column; clicking a row also toggles it. */
  readonly selection?: DataTableSelection;
  readonly initialSort?: SortState;
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
  /** The compact layout, chosen by the same width rule as the table's. */
  readonly compact?: {
    readonly columns: readonly DataTableSkeletonColumn[];
    readonly rowHeight: number;
  };
  readonly rowHeight?: number;
  readonly rows: number;
  readonly selectable?: boolean;
};
