/* oxlint-disable typescript/no-floating-promises -- node:test registers suites synchronously */
import assert from "node:assert/strict";
import { describe, test } from "node:test";
import { render, screen, setupUser, within } from "~test/ui";
import { DataTable } from "./data-table.component";
import { DATA_TABLE } from "./data-table.config";
import type { DataTableColumn, DataTableProps } from "./data-table.types";

type Row = { readonly id: number; readonly name: string; readonly price: number };

const ROWS: readonly Row[] = [
  { id: 1, name: "Bravo", price: 20 },
  { id: 2, name: "Alpha", price: 30 },
  { id: 3, name: "Charlie", price: 10 },
];

const COLUMNS: readonly DataTableColumn<Row>[] = [
  { id: "name", header: "Name", width: "1fr", sortValue: (row) => row.name, cell: (row) => row.name },
  { id: "price", header: "Price", width: "80px", align: "right", sortValue: (row) => row.price, cell: (row) => `$${row.price}` },
];

function props(overrides: Partial<DataTableProps<Row>> = {}): DataTableProps<Row> {
  return { rows: ROWS, columns: COLUMNS, getRowKey: (row) => row.id, ...overrides };
}

function bodyNames(): string[] {
  return screen.getAllByRole("row").slice(1).map((row) => within(row).getAllByRole("gridcell")[0]?.textContent ?? "");
}

describe("DataTable", () => {
  test("is a grid with a header row and a row per item", () => {
    render(<DataTable {...props()} />);
    assert.ok(screen.getByRole("grid"));
    assert.ok(screen.getByRole("columnheader", { name: "Name" }));
    assert.deepEqual(bodyNames(), ["Bravo", "Alpha", "Charlie"]);
  });

  test("clicking a sortable header sorts descending first, then ascending", async () => {
    render(<DataTable {...props()} />);
    const user = setupUser();
    await user.click(within(screen.getByRole("columnheader", { name: "Name" })).getByRole("button"));
    assert.deepEqual(bodyNames(), ["Charlie", "Bravo", "Alpha"]);
    assert.equal(screen.getByRole("columnheader", { name: "Name" }).getAttribute("aria-sort"), "descending");
    await user.click(within(screen.getByRole("columnheader", { name: "Name" })).getByRole("button"));
    assert.deepEqual(bodyNames(), ["Alpha", "Bravo", "Charlie"]);
    assert.equal(screen.getByRole("columnheader", { name: "Name" }).getAttribute("aria-sort"), "ascending");
  });

  test("initialSort applies on first render", () => {
    render(<DataTable {...props({ initialSort: { columnId: "price", direction: "desc" } })} />);
    assert.deepEqual(bodyNames(), ["Alpha", "Bravo", "Charlie"]);
  });

  test("onRowClick fires with the row", async () => {
    const clicked: number[] = [];
    render(<DataTable {...props({ onRowClick: (row) => clicked.push(row.id) })} />);
    await setupUser().click(screen.getAllByRole("row")[2] as HTMLElement);
    assert.deepEqual(clicked, [2]);
  });

  test("selection renders a checkbox per row and a select-all", async () => {
    const toggled: (string | number)[] = [];
    const all: boolean[] = [];
    render(
      <DataTable
        {...props({
          selection: {
            selected: new Set([2]),
            onToggle: (key) => toggled.push(key),
            onToggleAll: (checked) => all.push(checked),
          },
        })}
      />,
    );
    const boxes = screen.getAllByRole("checkbox");
    assert.equal(boxes.length, ROWS.length + 1);
    const user = setupUser();
    await user.click(screen.getAllByRole("checkbox", { name: DATA_TABLE.selectRowLabel })[0] as HTMLElement);
    assert.deepEqual(toggled, [1]);
    await user.click(screen.getByRole("checkbox", { name: DATA_TABLE.selectAllLabel }));
    assert.equal(all.length, 1);
    assert.equal(screen.getAllByRole("row")[2]?.getAttribute("aria-selected"), "true");
  });

  test("no rows renders just the header", () => {
    render(<DataTable {...props({ rows: [] })} />);
    assert.equal(screen.getAllByRole("row").length, 1);
  });
});
