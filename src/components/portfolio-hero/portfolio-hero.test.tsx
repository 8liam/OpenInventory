/* oxlint-disable typescript/no-floating-promises -- node:test registers suites synchronously */
import assert from "node:assert/strict";
import { describe, test } from "node:test";
import { COPY } from "~/lib/copy/copy.config";
import { formatInteger, formatMoney } from "~/utils/format";
import { makeDashboard, makeHistory } from "~test/fixtures";
import { render, screen } from "~test/ui";
import { PortfolioHero } from "./portfolio-hero.component";
import { PORTFOLIO_HERO } from "./portfolio-hero.config";

const copy = COPY.dashboard;

describe("PortfolioHero", () => {
  test("shows the total, its parts and item count", () => {
    const dashboard = makeDashboard();
    render(<PortfolioHero dashboard={dashboard} currency="USD" />);
    assert.ok(screen.getByText(formatMoney(dashboard.totals.value, "USD")));
    assert.ok(screen.getAllByText(copy.inventory).length >= 1);
    assert.ok(screen.getByText(formatMoney(dashboard.totals.inventoryValue, "USD")));
    assert.ok(screen.getByText(formatInteger(dashboard.totals.itemCount)));
    assert.ok(screen.getByText("2/3 units"));
  });

  test("the charms line shows only when charms have value", () => {
    const base = makeDashboard();
    const { rerender } = render(<PortfolioHero dashboard={base} currency="USD" />);
    assert.ok(screen.queryByText(copy.charms) === null);
    rerender(<PortfolioHero dashboard={{ ...base, totals: { ...base.totals, charmsValue: 12 } }} currency="USD" />);
    assert.ok(screen.getByText(copy.charms));
  });

  test("with too little history it says so instead of drawing a chart", () => {
    render(
      <PortfolioHero
        dashboard={makeDashboard({ history: makeHistory(PORTFOLIO_HERO.minHistoryPoints - 1) })}
        currency="USD"
      />,
    );
    assert.ok(screen.getByText(copy.historyEmpty));
  });

  test("with enough history it shows the history controls", () => {
    render(
      <PortfolioHero
        dashboard={makeDashboard({ history: makeHistory(PORTFOLIO_HERO.minHistoryPoints) })}
        currency="USD"
      />,
    );
    assert.ok(screen.queryByText(copy.historyEmpty) === null);
    assert.ok(screen.getByRole("button", { name: "CSV" }));
  });
});
