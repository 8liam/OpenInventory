/* oxlint-disable typescript/no-floating-promises -- node:test registers suites synchronously */
import assert from "node:assert/strict";
import { describe, test } from "node:test";
import { MONTHLY_BARS } from "./monthly-bars.config";
import { render, screen } from "~test/ui";
import { MonthlyBars } from "./monthly-bars.component";

function months(count: number) {
  return Array.from({ length: count }, (_, index) => ({
    month: `${2020 + Math.floor(index / 12)}-${String((index % 12) + 1).padStart(2, "0")}`,
    count: index + 1,
  }));
}

describe("MonthlyBars", () => {
  test("offers every month's count in an accessible list", () => {
    const { container } = render(<MonthlyBars months={months(3)} />);
    const details = container.querySelector("details");
    assert.ok(details);
    assert.ok(screen.getByText(MONTHLY_BARS.summary));
    assert.equal(details.querySelectorAll("dt").length, 3);
    assert.equal(details.querySelectorAll("dd").length, 3);
  });

  test("shows only the latest maxMonths", () => {
    const { container } = render(<MonthlyBars months={months(MONTHLY_BARS.maxMonths + 6)} />);
    assert.equal(container.querySelectorAll("dt").length, MONTHLY_BARS.maxMonths);
  });

  test("the visual chart is hidden from assistive tech", () => {
    const { container } = render(<MonthlyBars months={months(3)} />);
    assert.equal(container.querySelector('[aria-hidden="true"]')?.tagName, "DIV");
  });

  test("an empty history renders without crashing", () => {
    const { container } = render(<MonthlyBars months={[]} />);
    assert.equal(container.querySelectorAll("dt").length, 0);
  });
});
