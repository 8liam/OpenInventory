/* oxlint-disable typescript/no-floating-promises -- node:test registers suites synchronously */
import assert from "node:assert/strict";
import { describe, test } from "node:test";
import { COPY } from "~/lib/copy/copy.config";
import { formatMoney } from "~/utils/format";
import type { TradeUpOddsResponse } from "~/lib/items/item.types";
import { makeItem } from "~test/fixtures";
import { render, screen } from "~test/ui";
import { TradeUpSummary } from "./tradeup-summary.component";
import { SUMMARY } from "./tradeup-summary.config";

type Ok = Extract<TradeUpOddsResponse, { ok: true }>;

function odds(prices: (number | null)[]): Ok {
  return {
    ok: true,
    inputCount: 10,
    selected: 10,
    averageFloat: 0.2,
    inputCost: 20,
    expectedValue: 25,
    chanceToProfit: 0.4,
    currency: "USD",
    outcomes: prices.map((price, index) => ({
      name: `Skin ${index}`,
      imageUrl: null,
      rarityColor: null,
      probability: 1 / prices.length,
      float: 0.1,
      wearName: "FT",
      price,
    })),
  };
}

describe("TradeUpSummary", () => {
  test("shows input cost, expected value, best and worst outcome", () => {
    render(<TradeUpSummary result={odds([10, 50])} inputs={[]} />);
    assert.ok(screen.getByText(COPY.tradeup.inputCost));
    assert.ok(screen.getByText(formatMoney(20, "USD")));
    assert.ok(screen.getByText(formatMoney(25, "USD")));
    assert.ok(screen.getByText(SUMMARY.best));
    assert.ok(screen.getByText(formatMoney(50, "USD")));
    assert.ok(screen.getByText(formatMoney(10, "USD")));
  });

  test("when some outcome has no price, best and worst are dashes", () => {
    render(<TradeUpSummary result={odds([10, null])} inputs={[]} />);
    assert.equal(screen.getAllByText(COPY.common.empty).length, 2);
  });

  test("lists each input collection's share", () => {
    const inputs = [
      makeItem({ id: "1", collections: ["Mirage"] }),
      makeItem({ id: "2", collections: ["Mirage"] }),
      makeItem({ id: "3", collections: ["Dust"] }),
    ];
    render(<TradeUpSummary result={odds([10])} inputs={inputs} />);
    assert.ok(screen.getByText(/Mirage/));
    assert.ok(screen.getByText(/Dust/));
  });
});
