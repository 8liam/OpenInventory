/* oxlint-disable typescript/no-floating-promises -- node:test registers suites synchronously */
import assert from "node:assert/strict";
import { describe, test } from "node:test";
import { COPY } from "~/lib/copy/copy.config";
import { formatMoney } from "~/utils/format";
import { makeHolding } from "~test/fixtures";
import { renderWithRouter } from "~test/router";
import { screen } from "~test/ui";
import { HoldingsTable } from "./holdings-table.component";

const columns = COPY.dashboard.holdingsColumns;

describe("HoldingsTable", () => {
  test("has the four column headers and a row per holding", async () => {
    await renderWithRouter(
      <HoldingsTable
        currency="USD"
        holdings={[
          makeHolding({ name: "Case A" }),
          makeHolding({ name: "Case B", count: 1, unitPrice: 2, totalValue: 2 }),
        ]}
      />,
    );
    for (const header of [columns.item, columns.qty, columns.unit, columns.total]) {
      assert.ok(screen.getByRole("columnheader", { hidden: true, name: header }));
    }
    assert.equal(screen.getAllByRole("row", { hidden: true }).length, 3);
  });

  test("each holding links to a search for it in Items", async () => {
    await renderWithRouter(
      <HoldingsTable currency="USD" holdings={[makeHolding({ name: "Case A" })]} />,
    );
    const links = screen.getAllByRole("link", { hidden: true });
    assert.ok(links.length >= 1);
    assert.ok(links.every((link) => link.getAttribute("href")?.startsWith("/items")));
  });

  test("shows quantity, unit price and total", async () => {
    await renderWithRouter(
      <HoldingsTable
        currency="USD"
        holdings={[makeHolding({ count: 3, unitPrice: 1.5, totalValue: 4.5 })]}
      />,
    );
    assert.ok(screen.getAllByText(formatMoney(4.5, "USD")).length >= 1);
    assert.ok(screen.getAllByText(formatMoney(1.5, "USD")).length >= 1);
  });
});
