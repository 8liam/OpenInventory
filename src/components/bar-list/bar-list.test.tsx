/* oxlint-disable typescript/no-floating-promises -- node:test registers suites synchronously */
import assert from "node:assert/strict";
import { describe, test } from "node:test";
import { formatMoney } from "~/utils/format";
import { makeSlice } from "~test/fixtures";
import { render, screen } from "~test/ui";
import { BarList } from "./bar-list.component";

const SLICES = [makeSlice("Rifles", 75, 3), makeSlice("Pistols", 25, 1)];

describe("BarList", () => {
  test("lists each slice with its money value and share", () => {
    render(<BarList slices={SLICES} currency="USD" />);
    assert.equal(screen.getAllByRole("listitem").length, 2);
    assert.ok(screen.getByText("Rifles"));
    assert.ok(screen.getByText(formatMoney(75, "USD"), { exact: false }));
    assert.ok(screen.getByText("75%", { exact: false }));
    assert.ok(screen.getByText("25%", { exact: false }));
  });

  test("limit caps the rows", () => {
    render(<BarList slices={SLICES} currency="USD" limit={1} />);
    assert.equal(screen.getAllByRole("listitem").length, 1);
    assert.ok(screen.queryByText("Pistols") === null);
  });

  test("showValue=false shows counts instead of money", () => {
    render(<BarList slices={SLICES} currency="USD" showValue={false} />);
    assert.ok(screen.queryByText(formatMoney(75, "USD"), { exact: false }) === null);
    assert.ok(screen.getByText("3", { exact: false }));
  });

  test("an empty list renders no rows and zero total is safe", () => {
    const { rerender } = render(<BarList slices={[]} currency="USD" />);
    assert.equal(screen.queryAllByRole("listitem").length, 0);
    rerender(<BarList slices={[makeSlice("Zero", 0, 0)]} currency="USD" />);
    assert.ok(screen.getByText("0%", { exact: false }));
  });
});
