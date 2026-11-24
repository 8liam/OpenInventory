/* oxlint-disable typescript/no-floating-promises -- node:test registers suites synchronously */
import assert from "node:assert/strict";
import { describe, test } from "node:test";
import { makeItem } from "~test/fixtures";
import { renderWithRouter } from "~test/router";
import { screen, setupUser } from "~test/ui";
import { ItemGrid } from "./item-grid.component";
import { ITEM_GRID } from "./item-grid.config";

const ITEMS = [
  makeItem({ id: "a", name: "AK-47 | Redline", price: 10 }),
  makeItem({ id: "b", name: "M4A4 | Howl", price: 50 }),
];

describe("ItemGrid", () => {
  test("renders a card per item in a grid", async () => {
    await renderWithRouter(<ItemGrid items={ITEMS} currency="USD" />);
    assert.ok(screen.getByRole("grid"));
    assert.equal(screen.getAllByRole("gridcell").length, ITEMS.length);
  });

  test("an empty list renders no grid", async () => {
    await renderWithRouter(<ItemGrid items={[]} currency="USD" />);
    assert.ok(screen.queryByRole("grid") === null);
  });

  test("offers a sort control", async () => {
    await renderWithRouter(<ItemGrid items={ITEMS} currency="USD" />);
    assert.ok(screen.getByRole("combobox", { name: ITEM_GRID.sortLabel }));
  });

  test("selecting a card reports the new selection", async () => {
    const seen: ReadonlySet<string>[] = [];
    await renderWithRouter(
      <ItemGrid
        items={ITEMS}
        currency="USD"
        selected={new Set()}
        onSelectionChange={(next) => seen.push(next)}
      />,
    );
    await setupUser().click(screen.getAllByRole("gridcell")[0] as HTMLElement);
    assert.equal(seen.length, 1);
    assert.equal(seen[0]?.size, 1);
  });

  test("select all picks every item", async () => {
    const seen: ReadonlySet<string>[] = [];
    await renderWithRouter(
      <ItemGrid
        items={ITEMS}
        currency="USD"
        selected={new Set()}
        onSelectionChange={(next) => seen.push(next)}
      />,
    );
    await setupUser().click(screen.getByRole("checkbox", { name: ITEM_GRID.selectAllLabel }));
    assert.equal(seen[0]?.size, ITEMS.length);
  });

  test("without a selection handler cards are not selectable", async () => {
    await renderWithRouter(<ItemGrid items={ITEMS} currency="USD" />);
    assert.ok(screen.queryByRole("checkbox") === null);
  });
});
