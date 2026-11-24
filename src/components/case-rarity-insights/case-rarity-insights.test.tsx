/* oxlint-disable typescript/no-floating-promises -- node:test registers suites synchronously */
import assert from "node:assert/strict";
import { describe, test } from "node:test";
import { COPY } from "~/lib/copy/copy.config";
import { makeCaseStats } from "~test/fixtures";
import { render, screen } from "~test/ui";
import { CaseRarityInsights } from "./case-rarity-insights.component";

describe("CaseRarityInsights", () => {
  test("lists each rarity with its streak", () => {
    const stats = makeCaseStats();
    render(<CaseRarityInsights stats={stats} />);
    for (const rarity of stats.caseRarities)
      assert.ok(screen.getAllByText(rarity.label).length >= 1);
    assert.ok(screen.getByText(COPY.cases.streaksTitle));
  });

  test("a rarity never pulled says so", () => {
    const base = makeCaseStats();
    const stats = makeCaseStats({
      caseRarities: base.caseRarities.map((rarity) =>
        rarity.key === "covert" ? { ...rarity, count: 0, hasDrop: false, sinceLast: 100 } : rarity,
      ),
    });
    render(<CaseRarityInsights stats={stats} />);
    assert.ok(screen.getByText(COPY.cases.noRecordedPull));
  });

  test("an uncertain streak is an upper bound with an explanation", () => {
    const base = makeCaseStats();
    const stats = makeCaseStats({
      caseRarities: base.caseRarities.map((rarity) =>
        rarity.key === "covert" ? { ...rarity, uncertain: true, sinceLast: 55 } : rarity,
      ),
    });
    const { container } = render(<CaseRarityInsights stats={stats} />);
    assert.ok(screen.getByText(COPY.cases.upperBound("55")));
    assert.ok(screen.getByText(COPY.cases.uncertainStreak));
    assert.equal(container.querySelectorAll("details").length, 1);
  });

  test("with no classified pulls there is no odds chart", () => {
    render(<CaseRarityInsights stats={makeCaseStats({ caseRarities: [], total: 5 })} />);
    assert.ok(screen.queryByRole("group") === null);
  });
});
