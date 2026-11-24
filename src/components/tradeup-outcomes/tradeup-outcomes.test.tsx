/* oxlint-disable typescript/no-floating-promises -- node:test registers suites synchronously */
import assert from "node:assert/strict";
import { describe, test } from "node:test";
import { COPY } from "~/lib/copy/copy.config";
import { formatMoney } from "~/utils/format";
import type { TradeUpOutcome } from "~/lib/items/item.types";
import { render, screen } from "~test/ui";
import { TradeUpOutcomes } from "./tradeup-outcomes.component";

const OUTCOME: TradeUpOutcome = {
  name: "M4A4 | Howl",
  imageUrl: null,
  rarityColor: null,
  probability: 0.5,
  float: 0.1,
  wearName: "Minimal Wear",
  price: 40,
};

describe("TradeUpOutcomes", () => {
  test("lists each possible outcome with its price", () => {
    render(<TradeUpOutcomes outcomes={[OUTCOME, { ...OUTCOME, name: "AK-47 | Redline", price: null }]} inputCost={20} currency="USD" />);
    assert.ok(screen.getByText("Howl"));
    assert.ok(screen.getByText("Redline"));
    assert.ok(screen.getByText(formatMoney(40, "USD")));
    assert.ok(screen.getAllByText(COPY.common.empty).length >= 1);
  });

  test("no outcomes renders nothing to read", () => {
    const { container } = render(<TradeUpOutcomes outcomes={[]} inputCost={0} currency="USD" />);
    assert.equal(container.textContent?.includes("Howl"), false);
  });
});
