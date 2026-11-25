/* oxlint-disable typescript/no-floating-promises -- node:test registers suites synchronously */
import assert from "node:assert/strict";
import { describe, test } from "node:test";
import { COPY } from "~/lib/copy/copy.config";
import { formatMoney } from "~/utils/format";
import { makeItem } from "~test/fixtures";
import { renderWithRouter } from "~test/router";
import { screen, setupUser } from "~test/ui";
import { ItemTable } from "./item-table.component";

const ITEMS = [
  makeItem({ id: "a", name: "AK-47 | Redline", price: 10 }),
  makeItem({ id: "b", name: "M4A4 | Howl", price: 50 }),
  makeItem({ id: "c", name: "AWP | Asiimov", price: null }),
];

describe("ItemTable", () => {
  test("renders a grid with a row per item and the price column", async () => {
    await renderWithRouter(<ItemTable items={ITEMS} currency="USD" />);
    assert.ok(screen.getByRole("grid"));
    assert.equal(screen.getAllByRole("row").length, ITEMS.length + 1);
    assert.ok(screen.getByText(formatMoney(50, "USD")));
    assert.ok(screen.getByRole("columnheader", { name: COPY.itemColumns.price }));
  });

  test("an item without a price shows a dash", async () => {
    await renderWithRouter(
      <ItemTable items={[ITEMS[2] as (typeof ITEMS)[number]]} currency="USD" />,
    );
    assert.ok(screen.getAllByText(COPY.common.empty).length >= 1);
  });

  test("the location column shows by default", async () => {
    await renderWithRouter(<ItemTable items={ITEMS} currency="USD" />);
    assert.ok(screen.getByRole("columnheader", { name: COPY.itemColumns.location }));
  });

  test("showLocation=false leaves the location column out", async () => {
    await renderWithRouter(<ItemTable items={ITEMS} currency="USD" showLocation={false} />);
    assert.ok(screen.queryByRole("columnheader", { name: COPY.itemColumns.location }) === null);
  });

  test("with a selection handler each row has a checkbox that reports the new set", async () => {
    const seen: ReadonlySet<string>[] = [];
    await renderWithRouter(
      <ItemTable
        items={ITEMS}
        currency="USD"
        selected={new Set()}
        onSelectionChange={(next) => seen.push(next)}
      />,
    );
    await setupUser().click(screen.getAllByRole("checkbox")[1] as HTMLElement);
    assert.equal(seen.length, 1);
    assert.equal(seen[0]?.size, 1);
  });

  test("an empty list renders just the header", async () => {
    await renderWithRouter(<ItemTable items={[]} currency="USD" />);
    assert.equal(screen.getAllByRole("row").length, 1);
  });
});
