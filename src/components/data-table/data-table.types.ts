import type { ReactNode } from "react";

export type SortDirection = "asc" | "desc";

export type DataTableColumn<Row> = {
  readonly id: string;
  readonly header: string;
  /** CSS grid track, e.g. "2fr" or "120px". */
  readonly width: string;
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
