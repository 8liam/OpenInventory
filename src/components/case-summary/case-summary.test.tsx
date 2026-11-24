/* oxlint-disable typescript/no-floating-promises -- node:test registers suites synchronously */
import assert from "node:assert/strict";
import { describe, test } from "node:test";
import { COPY } from "~/lib/copy/copy.config";
import { formatDate, formatInteger } from "~/utils/format";
import { makeCaseStats } from "~test/fixtures";
import { render, screen } from "~test/ui";
import { CaseSummary } from "./case-summary.component";

const stats = COPY.cases.stats;

describe("CaseSummary", () => {
  test("cases show gold counts and cases to first gold, plus StatTrak", () => {
    render(<CaseSummary stats={makeCaseStats({ kind: "case", gold: 2, casesToFirstGold: 40, statTrak: 10 })} />);
    assert.ok(screen.getByText(stats.gold));
    assert.ok(screen.getByText(stats.toFirstGold));
    assert.ok(screen.getByText(formatInteger(40)));
    assert.ok(screen.getByText(stats.statTrak));
  });

  test("a missing count shows a dash", () => {
    render(<CaseSummary stats={makeCaseStats({ kind: "case", casesToFirstGold: null })} />);
    assert.ok(screen.getAllByText(COPY.common.empty).length >= 1);
  });

  test("other kinds show first and latest dates and no StatTrak", () => {
    const firstOpenedAt = Date.UTC(2021, 2, 3);
    render(<CaseSummary stats={makeCaseStats({ kind: "capsule", firstOpenedAt })} />);
    assert.ok(screen.getByText(stats.first));
    assert.ok(screen.getByText(stats.latest));
    assert.ok(screen.getByText(formatDate(firstOpenedAt)));
    assert.ok(screen.queryByText(stats.statTrak) === null);
  });

  test("souvenirs keep the StatTrak tile", () => {
    render(<CaseSummary stats={makeCaseStats({ kind: "souvenir" })} />);
    assert.ok(screen.getByText(stats.statTrak));
  });
});
