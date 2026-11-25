/* oxlint-disable typescript/no-floating-promises -- node:test registers suites synchronously */
import assert from "node:assert/strict";
import { describe, test } from "node:test";
import { COPY } from "~/lib/copy/copy.config";
import { formatMoney } from "~/utils/format";
import { render, screen } from "~test/ui";
import { TradeUpItemTile } from "./tradeup-item-tile.component";

const base = {
  name: "AK-47 | Redline",
  imageUrl: null,
  rarityColor: null,
  currency: "USD",
} as const;

describe("TradeUpItemTile", () => {
  test("shows the item and its price", () => {
    render(<TradeUpItemTile {...base} price={12.5} />);
    assert.ok(screen.getByText("AK-47 | Redline"));
    assert.ok(screen.getByText(formatMoney(12.5, "USD")));
  });

  test("an unpriced item shows a dash", () => {
    render(<TradeUpItemTile {...base} price={null} />);
    assert.ok(screen.getByText(COPY.common.empty));
  });

  test("shows a count and a probability when given", () => {
    render(<TradeUpItemTile {...base} price={1} count={3} probability={0.25} />);
    assert.ok(screen.getByText(/3/));
    assert.ok(screen.getByText(/25/));
  });
});
