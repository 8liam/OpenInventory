/* oxlint-disable typescript/no-floating-promises -- node:test registers suites synchronously */
import assert from "node:assert/strict";
import { describe, test } from "node:test";
import { makeCaseStats } from "~test/fixtures";
import { render, screen } from "~test/ui";
import { OddsLuckChart } from "./odds-luck-chart.component";
import { ODDS_LUCK_CHART } from "./odds-luck-chart.config";

describe("OddsLuckChart", () => {
  test("one labelled group per rarity naming the pulls, expectation and status", () => {
    const { caseRarities } = makeCaseStats();
    render(<OddsLuckChart rarities={caseRarities} total={100} />);
    const groups = screen.getAllByRole("group");
    assert.equal(groups.length, caseRarities.length);
    for (const [index, rarity] of caseRarities.entries()) {
      assert.ok(groups[index]?.getAttribute("aria-label")?.includes(rarity.label));
    }
  });

  test("a rarity far from its odds reads as unusual", () => {
    const { caseRarities } = makeCaseStats();
    const skewed = caseRarities.map((rarity) => (rarity.key === "covert" ? { ...rarity, count: 40 } : rarity));
    render(<OddsLuckChart rarities={skewed} total={120} />);
    const covert = screen.getByRole("group", { name: /Covert/ });
    assert.ok(
      covert.getAttribute("aria-label")?.includes(ODDS_LUCK_CHART.copy.status.high),
    );
  });
});
