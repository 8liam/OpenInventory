/* oxlint-disable typescript/no-floating-promises -- node:test registers suites synchronously */
import assert from "node:assert/strict";
import { describe, test } from "node:test";
import { makeItem } from "~test/fixtures";
import { renderWithRouter } from "~test/router";
import { screen } from "~test/ui";
import { ItemCollection } from "./item-collection.component";

const ITEMS = [makeItem({ id: "a" }), makeItem({ id: "b", name: "M4A4 | Howl" })];

describe("ItemCollection", () => {
  test("list view shows the items as table rows", async () => {
    await renderWithRouter(<ItemCollection view="list" items={ITEMS} currency="USD" />);
    assert.ok(screen.getByRole("columnheader", { name: /Item/ }));
    assert.equal(screen.getAllByRole("row").length, ITEMS.length + 1);
  });

  test("grid view shows the items as cards", async () => {
    await renderWithRouter(<ItemCollection view="grid" items={ITEMS} currency="USD" />);
    assert.equal(screen.getAllByRole("gridcell").length, ITEMS.length);
  });
});
